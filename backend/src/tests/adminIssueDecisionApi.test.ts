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
import { CategoryModel } from "../infrastructure/models/CategoryModel.js";
import UserModel from "../infrastructure/models/UserModel.js";
import { IssueRepository } from "../infrastructure/repositories/IssueRepository.js";
import { ApproveIssueUseCase } from "../application/use-cases/admin/ApproveIssueUseCase.js";
import { RejectIssueUseCase } from "../application/use-cases/admin/RejectIssueUseCase.js";
import { GetFeedIssuesUseCase } from "../application/use-cases/issue/GetFeedIssuesUseCase.js";
import { GetIssueByIdUseCase } from "../application/use-cases/issue/GetIssueByIdUseCase.js";
import { GetUserIssuesUseCase } from "../application/use-cases/issue/GetUserIssuesUseCase.js";
import { AdminController } from "../presentation/controllers/admin/AdminController.js";
import type { IStorageService } from "../application/services/IStorageService.js";
import ApiError from "../shared/utils/apiError.js";
import { HttpStatusCode } from "../shared/enums/HttpStatusCode.js";
import type { AuthRequest } from "../shared/types/AuthRequest.js";
import { rejectIssueSchema } from "../presentation/validators/admin/rejectIssueValidator.js";
import { ISSUE_INTERACTION_WINDOW_MS } from "../shared/utils/issueEligibility.js";

dotenv.config();

const mockStorageService: IStorageService = {
    upload: async () => { throw new Error("Not implemented"); },
    getPresignedUrl: async (key: string) => `https://janfix-bucket.s3.amazonaws.com/${key}?signed=true&expires=900`,
    delete: async () => {},
};

// Helper to create mock Express response
function createMockResponse() {
    const res = {
        statusCode: 200,
        data: null as unknown,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(payload: unknown) {
            this.data = payload;
            return this;
        },
    };
    return res as unknown as Response & { statusCode: number; data: unknown };
}

async function runTests() {
    console.log("=== Starting Phase 7A: Admin Issue Approval & Rejection API Tests ===");

    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    await IssueModel.init();
    await CategoryModel.init();
    await UserModel.init();

    const serverNow = new Date();
    const adminUserId = new Types.ObjectId().toString();
    const regularUserId = new Types.ObjectId().toString();
    const reporterUserId = new Types.ObjectId().toString();

    const createdIssueIds: Types.ObjectId[] = [];
    const createdCategoryIds: Types.ObjectId[] = [];
    const createdUserIds: Types.ObjectId[] = [];

    // Helper for creating test issues
    const createTestIssue = async (overrides: {
        title: string;
        description: string;
        status?: IssueStatus;
        visibility?: IssueVisibility;
        ageHours: number;
        createdBy?: string;
        hasImage?: boolean;
    }) => {
        const ageMs = (overrides.ageHours / 24) * ISSUE_INTERACTION_WINDOW_MS;
        const createdAt = new Date(serverNow.getTime() - ageMs);
        const issue = await IssueModel.create({
            createdBy: new Types.ObjectId(overrides.createdBy || reporterUserId),
            title: overrides.title,
            description: overrides.description,
            category: testCategory._id,
            status: overrides.status || IssueStatus.REPORTED,
            visibility: overrides.visibility || IssueVisibility.PUBLIC,
            location: {
                address: "MG Road, Bengaluru",
                locality: "Central",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560001",
                coordinates: { latitude: 12.9716, longitude: 77.5946 },
            },
            images: overrides.hasImage
                ? [
                      {
                          key: "issues/test-photo.jpg",
                          originalName: "test-photo.jpg",
                          mimeType: "image/jpeg",
                          size: 1024,
                          url: "https://janfix-bucket.s3.amazonaws.com/issues/test-photo.jpg",
                      },
                  ]
                : [],
            createdAt,
            updatedAt: createdAt,
        });

        createdIssueIds.push(issue._id as Types.ObjectId);
        return issue;
    };

    // 1. Seed users
    const adminUser = await UserModel.create({
        _id: new Types.ObjectId(adminUserId),
        fullName: "System Admin",
        email: `admin_${Date.now()}@janfix.org`,
        roles: [Role.ADMIN],
        authProvider: AuthProvider.LOCAL,
        accountStatus: AccountStatus.ACTIVE,
        isVerified: true,
    });
    createdUserIds.push(adminUser._id as Types.ObjectId);

    const regularUser = await UserModel.create({
        _id: new Types.ObjectId(regularUserId),
        fullName: "Community Member",
        email: `member_${Date.now()}@janfix.org`,
        roles: [Role.USER],
        authProvider: AuthProvider.LOCAL,
        accountStatus: AccountStatus.ACTIVE,
        isVerified: true,
    });
    createdUserIds.push(regularUser._id as Types.ObjectId);

    const reporterUser = await UserModel.create({
        _id: new Types.ObjectId(reporterUserId),
        fullName: "Issue Reporter",
        email: `reporter_${Date.now()}@janfix.org`,
        roles: [Role.USER],
        authProvider: AuthProvider.LOCAL,
        accountStatus: AccountStatus.ACTIVE,
        isVerified: true,
    });
    createdUserIds.push(reporterUser._id as Types.ObjectId);

    // 2. Seed test category
    const testCategory = await CategoryModel.create({
        name: `Road Safety ${Date.now()}`,
        description: "Potholes and road hazards",
        isActive: true,
    });
    createdCategoryIds.push(testCategory._id as Types.ObjectId);

    // 3. Instantiate repositories and use cases
    const issueRepository = new IssueRepository();
    const approveIssueUseCase = new ApproveIssueUseCase(issueRepository, mockStorageService);
    const rejectIssueUseCase = new RejectIssueUseCase(issueRepository, mockStorageService);
    const getFeedIssuesUseCase = new GetFeedIssuesUseCase(issueRepository, mockStorageService);
    const getIssueByIdUseCase = new GetIssueByIdUseCase(issueRepository, mockStorageService);
    const getUserIssuesUseCase = new GetUserIssuesUseCase(issueRepository, mockStorageService);

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
        {} as never,
        approveIssueUseCase,
        rejectIssueUseCase
    );

    try {
        // -------------------------------------------------------------
        // SCENARIO 1: Admin approval of an eligible issue
        // -------------------------------------------------------------
        console.log("\n--- Scenario 1: Admin approval of an eligible issue ---");
        const eligibleIssue = await createTestIssue({
            title: "Eligible Pothole on 100ft Road",
            description: "Deep crater causing traffic backup",
            ageHours: 25, // >24h old -> eligible
            hasImage: true,
        });

        const approveReq = {
            user: { userId: adminUserId, roles: [Role.ADMIN] },
            params: { issueId: eligibleIssue._id.toString() },
        } as unknown as AuthRequest;

        const approveRes = createMockResponse();
        await new Promise<void>((resolve, reject) => {
            approveRes.json = (body: unknown) => {
                approveRes.data = body;
                resolve();
                return approveRes;
            };
            adminController.approveIssue(approveReq, approveRes, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        assert.equal(approveRes.statusCode, 200, "Approval should return 200 OK");
        const approveData = approveRes.data as { success: boolean; message: string; issue: { status: string; images: { url: string }[] } };
        assert.equal(approveData.success, true);
        assert.equal(approveData.issue.status, IssueStatus.VERIFIED, "Issue status must be VERIFIED");
        assert(approveData.issue.images[0]?.url.includes("signed=true"), "Presigned S3 URL must be refreshed");

        // Verify in database
        const dbIssueApproved = await IssueModel.findById(eligibleIssue._id);
        assert.equal(dbIssueApproved?.status, IssueStatus.VERIFIED);
        assert.equal(dbIssueApproved?.rejectionReason, undefined, "Rejection reason must be undefined on approval");
        console.log("✔ Scenario 1 Passed: Admin successfully approved eligible issue to VERIFIED");

        // -------------------------------------------------------------
        // SCENARIO 2: Admin rejection with a valid reason
        // -------------------------------------------------------------
        console.log("\n--- Scenario 2: Admin rejection with a valid reason ---");
        const rejectableIssue = await createTestIssue({
            title: "Spam Issue Report",
            description: "Advertising private business",
            ageHours: 26,
            hasImage: true,
        });

        const validReason = "Issue is promotional advertising not relevant to civic infrastructure";
        const rejectReq = {
            user: { userId: adminUserId, roles: [Role.ADMIN] },
            params: { issueId: rejectableIssue._id.toString() },
            body: { rejectionReason: validReason },
        } as unknown as AuthRequest;

        const rejectRes = createMockResponse();
        await new Promise<void>((resolve, reject) => {
            rejectRes.json = (body: unknown) => {
                rejectRes.data = body;
                resolve();
                return rejectRes;
            };
            adminController.rejectIssue(rejectReq, rejectRes, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        assert.equal(rejectRes.statusCode, 200, "Rejection should return 200 OK");
        const rejectData = rejectRes.data as { success: boolean; issue: { status: string; rejectionReason: string } };
        assert.equal(rejectData.success, true);
        assert.equal(rejectData.issue.status, IssueStatus.REJECTED, "Issue status must be REJECTED");
        assert.equal(rejectData.issue.rejectionReason, validReason, "Returned DTO must contain rejectionReason");

        // Verify in database
        const dbIssueRejected = await IssueModel.findById(rejectableIssue._id);
        assert.equal(dbIssueRejected?.status, IssueStatus.REJECTED);
        assert.equal(dbIssueRejected?.rejectionReason, validReason, "Database must store rejectionReason");
        console.log("✔ Scenario 2 Passed: Admin successfully rejected eligible issue with stored reason");

        // -------------------------------------------------------------
        // SCENARIO 3: Rejection with missing, whitespace-only or overlong reason
        // -------------------------------------------------------------
        console.log("\n--- Scenario 3: Rejection with missing, whitespace-only or overlong reason ---");
        // Missing reason validation
        const missingParse = rejectIssueSchema.safeParse({});
        assert.equal(missingParse.success, false, "Missing rejectionReason should fail validation");

        // Whitespace-only reason validation
        const whitespaceParse = rejectIssueSchema.safeParse({ rejectionReason: "    \n\t   " });
        assert.equal(whitespaceParse.success, false, "Whitespace-only rejectionReason should fail validation");

        // Overlong reason validation (>1000 chars)
        const longReason = "a".repeat(1001);
        const overlongParse = rejectIssueSchema.safeParse({ rejectionReason: longReason });
        assert.equal(overlongParse.success, false, "Overlong rejectionReason (>1000) should fail validation");

        // Valid reason passes validation and trims
        const validParse = rejectIssueSchema.safeParse({ rejectionReason: "  Valid reason with whitespace padding  " });
        assert.equal(validParse.success, true);
        if (validParse.success) {
            assert.equal(validParse.data.rejectionReason, "Valid reason with whitespace padding");
        }
        console.log("✔ Scenario 3 Passed: Missing, whitespace-only, and overlong reasons rejected");

        // -------------------------------------------------------------
        // SCENARIO 4: Decisions attempted before the 24-hour window expires
        // -------------------------------------------------------------
        console.log("\n--- Scenario 4: Decisions attempted before 24-hour window expires ---");
        const youngIssue = await createTestIssue({
            title: "Brand New Issue (<24h)",
            description: "Still in community interaction window",
            ageHours: 2, // 2h old -> not eligible
        });

        // Attempt approve on young issue
        await assert.rejects(
            async () => {
                await approveIssueUseCase.execute(youngIssue._id.toString(), serverNow);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert(err.message.includes("24-hour"), "Error message must reference 24-hour rule");
                return true;
            },
            "Approving young issue before 24h must throw 400 Bad Request"
        );

        // Attempt reject on young issue
        await assert.rejects(
            async () => {
                await rejectIssueUseCase.execute(youngIssue._id.toString(), "Some reason", serverNow);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert(err.message.includes("24-hour"), "Error message must reference 24-hour rule");
                return true;
            },
            "Rejecting young issue before 24h must throw 400 Bad Request"
        );

        // Verify status in DB remains REPORTED
        const dbYoung = await IssueModel.findById(youngIssue._id);
        assert.equal(dbYoung?.status, IssueStatus.REPORTED, "Young issue status must remain REPORTED");
        console.log("✔ Scenario 4 Passed: Decisions blocked strictly before 24-hour window expires");

        // -------------------------------------------------------------
        // SCENARIO 5: Missing issues and malformed IDs
        // -------------------------------------------------------------
        console.log("\n--- Scenario 5: Missing issues and malformed IDs ---");
        const nonexistentId = new Types.ObjectId().toString();

        await assert.rejects(
            async () => {
                await approveIssueUseCase.execute(nonexistentId, serverNow);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.NOT_FOUND);
                return true;
            },
            "Nonexistent issue ID must throw 404 Not Found"
        );

        await assert.rejects(
            async () => {
                await approveIssueUseCase.execute("malformed-id-123", serverNow);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                return true;
            },
            "Malformed issue ID must throw 400 Bad Request"
        );
        console.log("✔ Scenario 5 Passed: Nonexistent and malformed issue IDs handled correctly");

        // -------------------------------------------------------------
        // SCENARIO 6: Already-decided issues and invalid status transitions
        // -------------------------------------------------------------
        console.log("\n--- Scenario 6: Already-decided issues and invalid status transitions ---");
        // Issue is already VERIFIED from Scenario 1
        await assert.rejects(
            async () => {
                await approveIssueUseCase.execute(eligibleIssue._id.toString(), serverNow);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert(err.message.toLowerCase().includes("already approved"));
                return true;
            },
            "Approving already approved issue must throw 400 Bad Request"
        );

        // Cannot reject already approved issue directly
        await assert.rejects(
            async () => {
                await rejectIssueUseCase.execute(eligibleIssue._id.toString(), "Changed mind", serverNow);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert(err.message.toLowerCase().includes("approved issues cannot be rejected"));
                return true;
            },
            "Rejecting already approved issue must throw 400 Bad Request"
        );

        // Issue is already REJECTED from Scenario 2
        await assert.rejects(
            async () => {
                await rejectIssueUseCase.execute(rejectableIssue._id.toString(), "Repeat rejection", serverNow);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert(err.message.toLowerCase().includes("already rejected"));
                return true;
            },
            "Rejecting already rejected issue must throw 400 Bad Request"
        );

        // Cannot approve already rejected issue directly
        await assert.rejects(
            async () => {
                await approveIssueUseCase.execute(rejectableIssue._id.toString(), serverNow);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert(err.message.toLowerCase().includes("rejected issues cannot be approved"));
                return true;
            },
            "Approving already rejected issue must throw 400 Bad Request"
        );
        console.log("✔ Scenario 6 Passed: Repeated and conflicting decisions blocked with appropriate errors");

        // -------------------------------------------------------------
        // SCENARIO 7: Conflicting concurrent approval and rejection requests
        // -------------------------------------------------------------
        console.log("\n--- Scenario 7: Conflicting concurrent approval/rejection requests ---");
        const raceIssue = await createTestIssue({
            title: "Race Condition Test Issue",
            description: "Simultaneous decisions by two administrators",
            ageHours: 30,
        });

        // Launch concurrent approval and rejection simultaneously
        const [raceApproveRes, raceRejectRes] = await Promise.allSettled([
            approveIssueUseCase.execute(raceIssue._id.toString(), serverNow),
            rejectIssueUseCase.execute(raceIssue._id.toString(), "Late concurrent rejection", serverNow),
        ]);

        const successfulCount = [raceApproveRes, raceRejectRes].filter((r) => r.status === "fulfilled").length;
        const rejectedCount = [raceApproveRes, raceRejectRes].filter((r) => r.status === "rejected").length;

        assert.equal(successfulCount, 1, "Exactly one concurrent decision must succeed");
        assert.equal(rejectedCount, 1, "The competing concurrent decision must be rejected");

        // Verify final DB state is consistent with whichever succeeded
        const dbRaceIssue = await IssueModel.findById(raceIssue._id);
        assert(
            dbRaceIssue?.status === IssueStatus.VERIFIED || dbRaceIssue?.status === IssueStatus.REJECTED,
            "Final issue status must be either VERIFIED or REJECTED"
        );
        console.log(`✔ Scenario 7 Passed: Atomic conditional update handled race condition (Final status: ${dbRaceIssue?.status})`);

        // -------------------------------------------------------------
        // SCENARIO 8: Existing visibility rules and rejection-reason privacy
        // -------------------------------------------------------------
        console.log("\n--- Scenario 8: Visibility rules and rejection-reason privacy ---");
        // 1. Rejected issue must NOT appear in public feed
        const feedResult = await getFeedIssuesUseCase.execute(regularUserId, 1, 10);
        const rejectedInFeed = feedResult.items.find((i) => i.id === rejectableIssue._id.toString());
        assert.equal(
            rejectedInFeed,
            undefined,
            "Public feed must NOT include rejected issues"
        );

        // 2. Creator viewing their own issue by ID DOES receive rejectionReason
        const creatorDetails = await getIssueByIdUseCase.execute(rejectableIssue._id.toString(), reporterUserId);
        assert.equal(
            creatorDetails.rejectionReason,
            validReason,
            "Creator viewing their rejected issue by ID must see rejectionReason"
        );

        // 3. Non-creator viewing rejected issue by ID is rejected with 403 Forbidden
        await assert.rejects(
            async () => {
                await getIssueByIdUseCase.execute(rejectableIssue._id.toString(), regularUserId);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );

        // 3b. Admin viewing rejected issue by ID can access details and sees rejectionReason
        const adminDetails = await getIssueByIdUseCase.execute(
            rejectableIssue._id.toString(),
            adminUserId,
            [Role.ADMIN]
        );
        assert.equal(
            adminDetails.rejectionReason,
            validReason,
            "Admin viewing rejected issue by ID must see rejectionReason"
        );

        // 4. Creator viewing their user issues list DOES receive rejectionReason
        const creatorUserIssues = await getUserIssuesUseCase.execute(reporterUserId, 1, 10);
        const rejectedInMyIssues = creatorUserIssues.items.find((i) => i.id === rejectableIssue._id.toString());
        if (rejectedInMyIssues) {
            assert.equal(
                rejectedInMyIssues.rejectionReason,
                validReason,
                "Creator viewing their user issues list must see rejectionReason"
            );
        }

        // 5. Approved private issue is inaccessible to non-creators
        const privateApproved = await createTestIssue({
            title: "Private Approved Issue",
            description: "Internal company campus issue",
            status: IssueStatus.VERIFIED,
            visibility: IssueVisibility.PRIVATE,
            ageHours: 40,
            createdBy: reporterUserId,
        });

        await assert.rejects(
            async () => {
                await getIssueByIdUseCase.execute(privateApproved._id.toString(), regularUserId);
            },
            (err: ApiError) => {
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            },
            "Non-creator cannot access approved private issue"
        );

        // Admin can access approved private issue and retrieve safe reporterName
        const adminPrivateAccess = await getIssueByIdUseCase.execute(
            privateApproved._id.toString(),
            adminUserId,
            [Role.ADMIN]
        );
        assert.equal(adminPrivateAccess.id, privateApproved._id.toString());
        assert.equal(adminPrivateAccess.reporterName, "Issue Reporter");
        assert.equal(adminPrivateAccess.visibility, IssueVisibility.PRIVATE);

        // Creator can also access and view reporterName
        const creatorPrivateAccess = await getIssueByIdUseCase.execute(
            privateApproved._id.toString(),
            reporterUserId
        );
        assert.equal(creatorPrivateAccess.reporterName, "Issue Reporter");

        console.log("✔ Scenario 8 Passed: Rejection-reason privacy, admin private issue access, and reporterName verified");

    } finally {
        // Cleanup test data
        console.log("\nCleaning up test records...");
        if (createdIssueIds.length > 0) {
            await IssueModel.deleteMany({ _id: { $in: createdIssueIds } });
        }
        if (createdCategoryIds.length > 0) {
            await CategoryModel.deleteMany({ _id: { $in: createdCategoryIds } });
        }
        if (createdUserIds.length > 0) {
            await UserModel.deleteMany({ _id: { $in: createdUserIds } });
        }
        await mongoose.disconnect();
        console.log("Database disconnected and test records cleaned up.");
    }

    console.log("\n=== All Phase 7A Tests Passed Successfully! ===");
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
