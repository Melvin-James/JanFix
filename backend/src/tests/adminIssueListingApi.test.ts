import assert from "node:assert/strict";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import type { Response } from "express";
import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import { Role } from "../domain/enums/Role.js";
import { AuthProvider } from "../domain/enums/AuthProvider.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";
import { IssueModel } from "../infrastructure/models/IssueModel.js";
import { IssueVoteModel } from "../infrastructure/models/IssueVoteModel.js";
import { IssueCommentModel } from "../infrastructure/models/IssueCommentModel.js";
import { CategoryModel } from "../infrastructure/models/CategoryModel.js";
import UserModel from "../infrastructure/models/UserModel.js";
import { IssueRepository } from "../infrastructure/repositories/IssueRepository.js";
import { IssueVoteRepository } from "../infrastructure/repositories/IssueVoteRepository.js";
import { IssueCommentRepository } from "../infrastructure/repositories/IssueCommentRepository.js";
import { GetReviewEligibleIssuesUseCase } from "../application/use-cases/admin/GetReviewEligibleIssuesUseCase.js";
import { AddIssueUpvoteUseCase } from "../application/use-cases/issue/AddIssueUpvoteUseCase.js";
import { CreateIssueCommentUseCase } from "../application/use-cases/issue/CreateIssueCommentUseCase.js";
import { AdminController } from "../presentation/controllers/admin/AdminController.js";
import type { IStorageService } from "../application/services/IStorageService.js";
import ApiError from "../shared/utils/apiError.js";
import { HttpStatusCode } from "../shared/enums/HttpStatusCode.js";
import type { AuthRequest } from "../shared/types/AuthRequest.js";
import {
    isIssueInteractionOpen,
    isIssueEligibleForReview,
    ISSUE_INTERACTION_WINDOW_MS,
} from "../shared/utils/issueEligibility.js";

dotenv.config();

const mockStorageService: IStorageService = {
    upload: async () => { throw new Error("Not implemented"); },
    getPresignedUrl: async (key: string) => `https://janfix-bucket.s3.amazonaws.com/${key}?signed=true&expires=900`,
    delete: async () => {},
};

async function runTests() {
    console.log("=== Starting Phase 4: Admin Issue Listing API Tests ===");

    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    await IssueModel.init();
    await IssueVoteModel.init();
    await IssueCommentModel.init();
    await CategoryModel.init();
    await UserModel.init();

    // Server clock baseline for testing (relative to real execution time)
    const serverNow = new Date();

    const adminUserId = new Types.ObjectId().toString();
    const regularUserId = new Types.ObjectId().toString();
    const reporterUserId = new Types.ObjectId().toString();

    const categoryId1 = new Types.ObjectId();
    const categoryId2 = new Types.ObjectId();

    const createdUserIds = [adminUserId, regularUserId, reporterUserId];
    const createdCategoryIds = [categoryId1, categoryId2];
    const createdIssueIds: Types.ObjectId[] = [];

    // Create test user and category records in database
    await UserModel.create([
        {
            _id: new Types.ObjectId(adminUserId),
            fullName: "Super Admin",
            email: `admin_${Date.now()}@janfix.org`,
            roles: [Role.ADMIN],
            isVerified: true,
            authProvider: AuthProvider.LOCAL,
            accountStatus: AccountStatus.ACTIVE,
        },
        {
            _id: new Types.ObjectId(regularUserId),
            fullName: "Regular Citizen",
            email: `citizen_${Date.now()}@janfix.org`,
            roles: [Role.USER],
            isVerified: true,
            authProvider: AuthProvider.LOCAL,
            accountStatus: AccountStatus.ACTIVE,
        },
        {
            _id: new Types.ObjectId(reporterUserId),
            fullName: "Reporter Citizen",
            email: `reporter_${Date.now()}@janfix.org`,
            roles: [Role.USER],
            isVerified: true,
            authProvider: AuthProvider.LOCAL,
            accountStatus: AccountStatus.ACTIVE,
        },
    ]);

    await CategoryModel.create([
        {
            _id: categoryId1,
            name: "Road Infrastructure",
            description: "Potholes and road damages",
            isActive: true,
        },
        {
            _id: categoryId2,
            name: "Sanitation",
            description: "Garbage and waste management",
            isActive: true,
        },
    ]);

    // Timestamps relative to serverNow using interaction window
    const timeYoung = new Date(serverNow.getTime() - ISSUE_INTERACTION_WINDOW_MS * 0.5); // Young (<window)
    const timeExactBoundary = new Date(serverNow.getTime() - ISSUE_INTERACTION_WINDOW_MS); // Exact boundary (=window)
    const timeOlder = new Date(serverNow.getTime() - ISSUE_INTERACTION_WINDOW_MS * 1.5); // Older (>window)
    const timeMuchOlder = new Date(serverNow.getTime() - ISSUE_INTERACTION_WINDOW_MS * 2); // Much older

    // Issue 1: Young issue (<window, reported) -> MUST BE EXCLUDED from review queue
    const youngIssue = await IssueModel.create({
        createdBy: new Types.ObjectId(reporterUserId),
        title: "Fresh Pothole on Market Road",
        description: "Formed this morning after heavy rain",
        category: categoryId1,
        images: [{ key: "issues/fresh-pothole.jpg", url: "https://old.url/1", originalName: "1.jpg", mimeType: "image/jpeg", size: 1024 }],
        visibility: IssueVisibility.PUBLIC,
        location: { address: "Market Road", coordinates: { latitude: 10.0, longitude: 76.0 } },
        status: IssueStatus.REPORTED,
        createdAt: timeYoung,
        updatedAt: timeYoung,
    });
    createdIssueIds.push(youngIssue._id as Types.ObjectId);

    // Issue 2: Exact boundary issue (exactly window duration, reported) -> MUST BE INCLUDED
    const boundaryIssue = await IssueModel.create({
        createdBy: new Types.ObjectId(reporterUserId),
        title: "Broken Streetlight on 5th Cross",
        description: "Reported exactly at interaction boundary",
        category: categoryId1,
        images: [{ key: "issues/broken-light.jpg", url: "https://old.url/2", originalName: "2.jpg", mimeType: "image/jpeg", size: 2048 }],
        visibility: IssueVisibility.PUBLIC,
        location: { address: "5th Cross Road", coordinates: { latitude: 10.1, longitude: 76.1 } },
        status: IssueStatus.REPORTED,
        createdAt: timeExactBoundary,
        updatedAt: timeExactBoundary,
    });
    createdIssueIds.push(boundaryIssue._id as Types.ObjectId);

    // Issue 3: Older issue (>window, reported) -> MUST BE INCLUDED
    const olderReportedIssue = await IssueModel.create({
        createdBy: new Types.ObjectId(reporterUserId),
        title: "Garbage Overflow at Bus Stop",
        description: "Heaps of waste piled up for days",
        category: categoryId2,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: { address: "Bus Stand", coordinates: { latitude: 10.2, longitude: 76.2 } },
        status: IssueStatus.REPORTED,
        createdAt: timeOlder,
        updatedAt: timeOlder,
    });
    createdIssueIds.push(olderReportedIssue._id as Types.ObjectId);

    // Issue 4: Older issue (>window, reported) -> MUST BE INCLUDED
    const olderReportedIssue2 = await IssueModel.create({
        createdBy: new Types.ObjectId(reporterUserId),
        title: "Damaged Water Pipe Leak",
        description: "Water pipe leaking clean water into storm drain",
        category: categoryId1,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: { address: "Pipe Lane", coordinates: { latitude: 10.3, longitude: 76.3 } },
        status: IssueStatus.REPORTED,
        createdAt: timeMuchOlder,
        updatedAt: timeMuchOlder,
    });
    createdIssueIds.push(olderReportedIssue2._id as Types.ObjectId);

    // Issue 5: Older issue (>window, approved/verified) -> MUST BE EXCLUDED from default pending review queue
    const olderVerifiedIssue = await IssueModel.create({
        createdBy: new Types.ObjectId(reporterUserId),
        title: "Already Verified Road Crater",
        description: "Admin already verified and approved this issue",
        category: categoryId1,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: { address: "Crater Way", coordinates: { latitude: 10.4, longitude: 76.4 } },
        status: IssueStatus.VERIFIED,
        createdAt: timeMuchOlder,
        updatedAt: timeMuchOlder,
    });
    createdIssueIds.push(olderVerifiedIssue._id as Types.ObjectId);

    // Issue 6: Older issue (>window, rejected) -> MUST BE EXCLUDED from default pending review queue
    const olderRejectedIssue = await IssueModel.create({
        createdBy: new Types.ObjectId(reporterUserId),
        title: "Duplicate Report Rejected",
        description: "Already rejected duplicate issue",
        category: categoryId2,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: { address: "Spam Road", coordinates: { latitude: 10.5, longitude: 76.5 } },
        status: IssueStatus.REJECTED,
        createdAt: timeMuchOlder,
        updatedAt: timeMuchOlder,
    });
    createdIssueIds.push(olderRejectedIssue._id as Types.ObjectId);

    // Issue 7: Verified Private Issue (>window, verified, private) -> Used for verified & visibility testing
    const olderVerifiedPrivateIssue = await IssueModel.create({
        createdBy: new Types.ObjectId(reporterUserId),
        title: "Verified Private Society Drainage Issue",
        description: "Private residential drainage issue verified by admin",
        category: categoryId1,
        images: [],
        visibility: IssueVisibility.PRIVATE,
        location: { address: "Private Society Gate 1", coordinates: { latitude: 10.6, longitude: 76.6 } },
        status: IssueStatus.VERIFIED,
        createdAt: timeMuchOlder,
        updatedAt: timeMuchOlder,
    });
    createdIssueIds.push(olderVerifiedPrivateIssue._id as Types.ObjectId);

    const issueRepository = new IssueRepository();
    const issueVoteRepository = new IssueVoteRepository();
    const issueCommentRepository = new IssueCommentRepository();

    const getReviewEligibleIssuesUseCase = new GetReviewEligibleIssuesUseCase(issueRepository, mockStorageService);
    const addIssueUpvoteUseCase = new AddIssueUpvoteUseCase(issueRepository, issueVoteRepository);
    const createIssueCommentUseCase = new CreateIssueCommentUseCase(issueRepository, issueCommentRepository);

    const adminController = new AdminController(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        getReviewEligibleIssuesUseCase,
        {} as never,
        {} as never
    );

    try {
        // -------------------------------------------------------------
        // SCENARIO 1: An issue younger than 24 hours is excluded from admin listing
        // -------------------------------------------------------------
        console.log("\n--- Scenario 1: Issue younger than 24 hours is excluded ---");
        const resYoung = await getReviewEligibleIssuesUseCase.execute(1, 20, undefined, serverNow);
        const youngFound = resYoung.items.some((i) => i.id === youngIssue._id.toString());
        assert.equal(youngFound, false, "Young issue (<24h) must NOT appear in review-eligible listing");
        console.log("✔ Scenario 1 Passed: Issue younger than 24 hours is strictly excluded");

        // -------------------------------------------------------------
        // SCENARIO 2: An issue becomes eligible exactly at the 24-hour boundary
        // -------------------------------------------------------------
        console.log("\n--- Scenario 2: Issue becomes eligible exactly at the 24-hour boundary ---");
        assert.equal(isIssueEligibleForReview(boundaryIssue.createdAt, serverNow), true);
        assert.equal(isIssueInteractionOpen(boundaryIssue.createdAt, serverNow), false);
        const boundaryFound = resYoung.items.some((i) => i.id === boundaryIssue._id.toString());
        assert.equal(boundaryFound, true, "Boundary issue (createdAt == serverNow - 24h) must be included");
        console.log("✔ Scenario 2 Passed: Issue at exact 24-hour boundary is eligible and included");

        // -------------------------------------------------------------
        // SCENARIO 3: Issues older than interaction window in pending status (REPORTED) are included
        // -------------------------------------------------------------
        console.log("\n--- Scenario 3: Older issues in pending statuses are included ---");
        const olderReportedFound = resYoung.items.some((i) => i.id === olderReportedIssue._id.toString());
        const olderReported2Found = resYoung.items.some((i) => i.id === olderReportedIssue2._id.toString());
        assert.equal(olderReportedFound, true, "Older reported issue must be included");
        assert.equal(olderReported2Found, true, "Older reported issue 2 must be included");
        console.log("✔ Scenario 3 Passed: Issues older than interaction window in pending review statuses are included");

        // -------------------------------------------------------------
        // SCENARIO 4: Approved (VERIFIED) and REJECTED issues are excluded
        // -------------------------------------------------------------
        console.log("\n--- Scenario 4: Approved (VERIFIED) and REJECTED issues are excluded ---");
        const verifiedFound = resYoung.items.some((i) => i.id === olderVerifiedIssue._id.toString());
        const rejectedFound = resYoung.items.some((i) => i.id === olderRejectedIssue._id.toString());
        assert.equal(verifiedFound, false, "Verified issue must NOT be returned");
        assert.equal(rejectedFound, false, "Rejected issue must NOT be returned");
        console.log("✔ Scenario 4 Passed: Completed/verified/rejected issues are excluded");

        // -------------------------------------------------------------
        // SCENARIO 5: Unauthenticated users cannot access admin listing
        // -------------------------------------------------------------
        console.log("\n--- Scenario 5: Unauthenticated user cannot access admin listing ---");
        let unauthStatusCode = 0;
        const unauthReq = {
            user: undefined,
            query: {},
        } as unknown as AuthRequest;

        await new Promise<void>((resolve) => {
            adminController.getReviewEligibleIssues(
                unauthReq,
                {
                    status(code: number) { unauthStatusCode = code; return this; },
                    json() { resolve(); return this; },
                } as unknown as Response,
                (err?: unknown) => {
                    if (err instanceof ApiError) unauthStatusCode = err.statusCode;
                    resolve();
                }
            );
        });
        assert.equal(unauthStatusCode, HttpStatusCode.UNAUTHORIZED);
        console.log("✔ Scenario 5 Passed: Unauthenticated request rejected with 401 Unauthorized");

        // -------------------------------------------------------------
        // SCENARIO 6: Non-admin authenticated user cannot access admin listing
        // -------------------------------------------------------------
        console.log("\n--- Scenario 6: Non-admin user cannot access admin listing ---");
        let nonAdminStatusCode = 0;
        const nonAdminReq = {
            user: { userId: regularUserId, roles: [Role.USER] },
            query: {},
        } as unknown as AuthRequest;

        await new Promise<void>((resolve) => {
            adminController.getReviewEligibleIssues(
                nonAdminReq,
                {
                    status(code: number) { nonAdminStatusCode = code; return this; },
                    json() { resolve(); return this; },
                } as unknown as Response,
                (err?: unknown) => {
                    if (err instanceof ApiError) nonAdminStatusCode = err.statusCode;
                    resolve();
                }
            );
        });
        assert.equal(nonAdminStatusCode, HttpStatusCode.FORBIDDEN);
        console.log("✔ Scenario 6 Passed: Non-admin request rejected with 403 Forbidden");

        // -------------------------------------------------------------
        // SCENARIO 7: Pagination returns correct records and metadata
        // -------------------------------------------------------------
        console.log("\n--- Scenario 7: Pagination returns correct records and metadata ---");
        // Eligible test issues are 3: olderUnderReview (48h), olderReported (30h), boundary (24h)
        const p1 = await getReviewEligibleIssuesUseCase.execute(1, 2, undefined, serverNow);
        assert.equal(p1.items.length, 2);
        assert.equal(p1.pagination.page, 1);
        assert.equal(p1.pagination.pageSize, 2);
        assert.equal(p1.pagination.totalItems >= 3, true);

        const p2 = await getReviewEligibleIssuesUseCase.execute(2, 2, undefined, serverNow);
        assert.equal(p2.items.length >= 1, true);
        assert.equal(p2.pagination.page, 2);

        // Verify oldest eligible first sort order
        const firstItem = p1.items[0];
        const secondItem = p1.items[1];
        assert(firstItem && secondItem);
        assert(
            new Date(firstItem.createdAt).getTime() <= new Date(secondItem.createdAt).getTime(),
            "Eligible issues must be sorted oldest first (createdAt: 1)"
        );
        console.log("✔ Scenario 7 Passed: Pagination and oldest-first sorting verified");

        // -------------------------------------------------------------
        // SCENARIO 8: Search and category filters cannot bypass eligibility condition
        // -------------------------------------------------------------
        console.log("\n--- Scenario 8: Search & category filters cannot bypass eligibility ---");
        // Search matching the young issue title: "Fresh Pothole"
        const searchRes = await getReviewEligibleIssuesUseCase.execute(1, 10, { search: "Fresh Pothole" }, serverNow);
        assert.equal(
            searchRes.items.some((i) => i.id === youngIssue._id.toString()),
            false,
            "Young issue must never be returned even when title matches search"
        );

        // Category filter matching young issue category
        const catRes = await getReviewEligibleIssuesUseCase.execute(1, 10, { category: categoryId1.toString() }, serverNow);
        assert.equal(
            catRes.items.some((i) => i.id === youngIssue._id.toString()),
            false,
            "Young issue must never be returned even when matching category filter"
        );
        console.log("✔ Scenario 8 Passed: Search and category filters cannot bypass 24h eligibility condition");

        // -------------------------------------------------------------
        // SCENARIO 9: Manipulated query parameters cannot return issues prematurely
        // -------------------------------------------------------------
        console.log("\n--- Scenario 9: Manipulated query parameters cannot bypass eligibility rules ---");
        // Attempting to query unsupported or obsolete status (e.g. UNDER_REVIEW)
        const fakeParamsRes = await getReviewEligibleIssuesUseCase.execute(
            1,
            10,
            { status: "UNDER_REVIEW" },
            serverNow
        );
        assert.equal(fakeParamsRes.items.length, 0, "Querying obsolete status UNDER_REVIEW must return 0 items");

        const fakeParams2 = await getReviewEligibleIssuesUseCase.execute(
            1,
            10,
            { status: "INVALID_STATUS" },
            serverNow
        );
        assert.equal(fakeParams2.items.length, 0, "Querying invalid status must return 0 items");
        console.log("✔ Scenario 9 Passed: Manipulated query parameters cannot expose ineligible issues");

        // -------------------------------------------------------------
        // SCENARIO 10: Vote and comment counts are correctly calculated
        // -------------------------------------------------------------
        console.log("\n--- Scenario 10: Vote and comment counts are correct ---");
        // Add 2 votes and 2 comments to olderReportedIssue
        await IssueVoteModel.create([
            { issueId: olderReportedIssue._id, userId: new Types.ObjectId(adminUserId) },
            { issueId: olderReportedIssue._id, userId: new Types.ObjectId(regularUserId) },
        ]);
        await IssueCommentModel.create([
            { issueId: olderReportedIssue._id, userId: new Types.ObjectId(adminUserId), body: "Admin remark on waste" },
            { issueId: olderReportedIssue._id, userId: new Types.ObjectId(regularUserId), body: "Citizen remark on waste" },
        ]);

        const countsRes = await getReviewEligibleIssuesUseCase.execute(1, 10, { search: "Garbage Overflow" }, serverNow);
        assert.equal(countsRes.items.length, 1);
        const item = countsRes.items[0];
        assert(item);
        assert.equal(item.upvoteCount, 2, "Upvote count must equal 2");
        assert.equal(item.commentCount, 2, "Comment count must equal 2");
        assert.equal(item.reporter.fullName, "Reporter Citizen");
        assert.equal(item.category.name, "Sanitation");
        console.log("✔ Scenario 10 Passed: Upvote and comment counts aggregated accurately with reporter details");

        // -------------------------------------------------------------
        // SCENARIO 11: Private S3 presigned image URL handling is preserved
        // -------------------------------------------------------------
        console.log("\n--- Scenario 11: Private S3 presigned image URL handling preserved ---");
        const imageRes = await getReviewEligibleIssuesUseCase.execute(1, 10, { search: "Broken Streetlight" }, serverNow);
        assert.equal(imageRes.items.length, 1);
        const imageItem = imageRes.items[0];
        assert(imageItem);
        assert(imageItem.images.length > 0, "Issue should have images");
        const firstImage = imageItem.images[0];
        assert(firstImage);
        assert.match(firstImage.url, /^https:\/\/janfix-bucket\.s3\.amazonaws\.com\//);
        assert.match(firstImage.url, /signed=true/);
        console.log("✔ Scenario 11 Passed: Presigned URLs generated securely for issue images");

        // -------------------------------------------------------------
        // SCENARIO 12: Upvote and comment APIs reject new interactions at and after 24 hours
        // -------------------------------------------------------------
        console.log("\n--- Scenario 12: Upvote and comment creation reject interactions after 24 hours ---");
        // olderReportedIssue was created 30 hours ago (well past the 24-hour interaction window)
        await assert.rejects(
            async () => {
                await addIssueUpvoteUseCase.execute(olderReportedIssue._id.toString(), reporterUserId);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                // When creator attempts upvote, self-upvote check triggers first or deadline triggers
                return true;
            }
        );

        // A non-creator attempting to upvote an expired issue
        const newVoterId = new Types.ObjectId().toString();
        await assert.rejects(
            async () => {
                await addIssueUpvoteUseCase.execute(olderReportedIssue._id.toString(), newVoterId);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.equal(err.message, "The 24-hour interaction window for this issue has closed");
                return true;
            }
        );

        // A user attempting to comment on an expired issue
        await assert.rejects(
            async () => {
                await createIssueCommentUseCase.execute(
                    olderReportedIssue._id.toString(),
                    newVoterId,
                    "Late comment attempt"
                );
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.equal(err.message, "The 24-hour interaction window for this issue has closed");
                return true;
            }
        );
        console.log("✔ Scenario 12 Passed: Both upvote and comment creation APIs reject interactions after deadline");

        // -------------------------------------------------------------
        // SCENARIO 13: Admin status filter 'status=VERIFIED' returns verified issues
        // -------------------------------------------------------------
        console.log("\n--- Scenario 13: Admin status filter 'status=VERIFIED' returns verified issues ---");
        const verifiedFilterRes = await getReviewEligibleIssuesUseCase.execute(
            1,
            10,
            { status: IssueStatus.VERIFIED },
            serverNow
        );
        const containsVerified = verifiedFilterRes.items.some((i) => i.id === olderVerifiedIssue._id.toString());
        assert.equal(containsVerified, true, "Verified issue must appear when VERIFIED filter is selected");
        const allItemsVerified = verifiedFilterRes.items.every((i) => i.status === IssueStatus.VERIFIED);
        assert.equal(allItemsVerified, true, "All items returned by VERIFIED filter must have VERIFIED status");
        console.log("✔ Scenario 13 Passed: Verified status filter correctly returns verified issues");

        // -------------------------------------------------------------
        // SCENARIO 14: Combining status=VERIFIED with visibility=PUBLIC and visibility=PRIVATE
        // -------------------------------------------------------------
        console.log("\n--- Scenario 14: Combining status=VERIFIED with visibility=PUBLIC and visibility=PRIVATE ---");
        const publicVerifiedRes = await getReviewEligibleIssuesUseCase.execute(
            1,
            10,
            { status: IssueStatus.VERIFIED, visibility: IssueVisibility.PUBLIC },
            serverNow
        );
        assert.equal(
            publicVerifiedRes.items.some((i) => i.id === olderVerifiedIssue._id.toString()),
            true,
            "Public verified issue must appear in public verified query"
        );
        assert.equal(
            publicVerifiedRes.items.some((i) => i.id === olderVerifiedPrivateIssue._id.toString()),
            false,
            "Private verified issue must NOT appear in public verified query"
        );

        const privateVerifiedRes = await getReviewEligibleIssuesUseCase.execute(
            1,
            10,
            { status: IssueStatus.VERIFIED, visibility: IssueVisibility.PRIVATE },
            serverNow
        );
        assert.equal(
            privateVerifiedRes.items.some((i) => i.id === olderVerifiedPrivateIssue._id.toString()),
            true,
            "Private verified issue must appear in private verified query"
        );
        assert.equal(
            privateVerifiedRes.items.some((i) => i.id === olderVerifiedIssue._id.toString()),
            false,
            "Public verified issue must NOT appear in private verified query"
        );
        console.log("✔ Scenario 14 Passed: Status and visibility filters combine accurately");

        // -------------------------------------------------------------
        // SCENARIO 15: AdminController parses visibility query parameter
        // -------------------------------------------------------------
        console.log("\n--- Scenario 15: AdminController parses visibility query parameter ---");
        let controllerResData: unknown;
        const controllerReq = {
            user: { userId: adminUserId, roles: [Role.ADMIN] },
            query: { status: "VERIFIED", visibility: "PRIVATE" },
        } as unknown as AuthRequest;
        await new Promise<void>((resolve, reject) => {
            adminController.getReviewEligibleIssues(
                controllerReq,
                {
                    status: () => ({
                        json: (d: unknown) => {
                            controllerResData = d;
                            resolve();
                        },
                    }),
                } as unknown as Response,
                (err?: unknown) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
        const parsedIssues = (controllerResData as { issues: { id: string; visibility: string }[] })?.issues || [];
        assert(parsedIssues.length > 0, "Should return at least 1 private verified issue");
        assert(parsedIssues.every((i) => i.visibility === "PRIVATE"), "All returned issues must be PRIVATE");
        console.log("✔ Scenario 15 Passed: AdminController successfully filters by visibility query param");

    } finally {
        // Clean up test database records
        await IssueModel.deleteMany({ _id: { $in: createdIssueIds } });
        await IssueVoteModel.deleteMany({ issueId: { $in: createdIssueIds } });
        await IssueCommentModel.deleteMany({ issueId: { $in: createdIssueIds } });
        await CategoryModel.deleteMany({ _id: { $in: createdCategoryIds } });
        await UserModel.deleteMany({ _id: { $in: createdUserIds.map((id) => new Types.ObjectId(id)) } });
        await mongoose.disconnect();
        console.log("\n✔ Database disconnected and test records cleaned up.");
    }

    console.log("=== All 12 Scenarios Passed Successfully! ===");
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
