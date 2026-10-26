import assert from "node:assert/strict";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import type { Response } from "express";
import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import type { Issue } from "../domain/entities/Issue.js";
import type { IIssueRepository } from "../domain/interface/IIssueRepository.js";
import { IssueCommentRepository } from "../infrastructure/repositories/IssueCommentRepository.js";
import { IssueCommentModel } from "../infrastructure/models/IssueCommentModel.js";
import UserModel from "../infrastructure/models/UserModel.js";
import { CreateIssueCommentUseCase } from "../application/use-cases/issue/CreateIssueCommentUseCase.js";
import { GetIssueCommentsUseCase } from "../application/use-cases/issue/GetIssueCommentsUseCase.js";
import { IssueController } from "../presentation/controllers/issue/IssueController.js";
import { createCommentValidator } from "../presentation/validators/issue/createCommentValidator.js";
import ApiError from "../shared/utils/apiError.js";
import { HttpStatusCode } from "../shared/enums/HttpStatusCode.js";
import type { AuthRequest } from "../shared/types/AuthRequest.js";
import { Role } from "../domain/enums/Role.js";
import { AuthProvider } from "../domain/enums/AuthProvider.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";

dotenv.config();

function createMockIssue(
    id: string,
    createdBy: string,
    visibility: IssueVisibility = IssueVisibility.PUBLIC,
    status: IssueStatus = IssueStatus.REPORTED,
    createdAt: Date = new Date()
): Issue {
    return {
        id,
        createdBy,
        title: "Pothole on Baker Street",
        description: "Deep pothole causing traffic issues",
        category: new Types.ObjectId().toString(),
        images: [],
        visibility,
        location: {
            address: "Baker Street, City",
            coordinates: { latitude: 12.9716, longitude: 77.5946 },
        },
        status,
        createdAt,
        updatedAt: createdAt,
    };
}

async function runTests() {
    console.log("=== Starting Phase 3: Issue Comments Backend API Tests ===");

    const creatorId = new Types.ObjectId().toString();
    const commenter1Id = new Types.ObjectId().toString();
    const commenter2Id = new Types.ObjectId().toString();
    const unauthorizedUserId = new Types.ObjectId().toString();

    const publicIssueId = new Types.ObjectId().toString();
    const secondPublicIssueId = new Types.ObjectId().toString();
    const privateApprovedIssueId = new Types.ObjectId().toString();
    const expiredIssueId = new Types.ObjectId().toString();

    // Created 25 hours ago to test 24h deadline
    const expiredCreatedAt = new Date(Date.now() - 25 * 60 * 60 * 1000);

    const issuesMap = new Map<string, Issue>();
    issuesMap.set(
        publicIssueId,
        createMockIssue(publicIssueId, creatorId, IssueVisibility.PUBLIC, IssueStatus.REPORTED, new Date())
    );
    issuesMap.set(
        secondPublicIssueId,
        createMockIssue(secondPublicIssueId, creatorId, IssueVisibility.PUBLIC, IssueStatus.REPORTED, new Date())
    );
    issuesMap.set(
        privateApprovedIssueId,
        createMockIssue(privateApprovedIssueId, creatorId, IssueVisibility.PRIVATE, IssueStatus.VERIFIED, new Date())
    );
    issuesMap.set(
        expiredIssueId,
        createMockIssue(expiredIssueId, creatorId, IssueVisibility.PUBLIC, IssueStatus.REPORTED, expiredCreatedAt)
    );

    const mockIssueRepository: IIssueRepository = {
        findById: async (id: string) => issuesMap.get(id) || null,
        create: async () => { throw new Error("Not implemented"); },
        findByUserId: async () => { throw new Error("Not implemented"); },
        findAllPaginated: async () => { throw new Error("Not implemented"); },
        findFeedIssues: async () => { throw new Error("Not implemented"); },
        findReviewEligibleIssues: async () => { throw new Error("Not implemented"); },
        update: async () => { throw new Error("Not implemented"); },
        updateStatusIfEligible: async () => { throw new Error("Not implemented"); },
    };

    // -------------------------------------------------------------
    // LIVE DB SETUP FOR PERSISTENCE & POPULATION
    // -------------------------------------------------------------
    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    await IssueCommentModel.init();
    await UserModel.init();

    // Create real test users to verify author population and field filtering
    await UserModel.create({
        _id: new Types.ObjectId(commenter1Id),
        fullName: "Jane Citizen",
        email: `janecitizen_${Date.now()}@test.com`,
        password: "SuperSecretHashedPassword123",
        roles: [Role.USER],
        isVerified: true,
        authProvider: AuthProvider.LOCAL,
        accountStatus: AccountStatus.ACTIVE,
    });

    await UserModel.create({
        _id: new Types.ObjectId(commenter2Id),
        fullName: "John Resident",
        email: `johnresident_${Date.now()}@test.com`,
        password: "AnotherSuperSecretPassword456",
        roles: [Role.USER],
        isVerified: true,
        authProvider: AuthProvider.LOCAL,
        accountStatus: AccountStatus.ACTIVE,
    });

    const issueCommentRepository = new IssueCommentRepository();
    const createIssueCommentUseCase = new CreateIssueCommentUseCase(mockIssueRepository, issueCommentRepository);
    const getIssueCommentsUseCase = new GetIssueCommentsUseCase(mockIssueRepository, issueCommentRepository);

    const issueController = new IssueController(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        createIssueCommentUseCase,
        getIssueCommentsUseCase
    );

    try {
        // Clean up any stale comments for test issues
        await IssueCommentModel.deleteMany({
            issueId: {
                $in: [
                    new Types.ObjectId(publicIssueId),
                    new Types.ObjectId(secondPublicIssueId),
                    new Types.ObjectId(privateApprovedIssueId),
                    new Types.ObjectId(expiredIssueId),
                ],
            },
        });

        // -------------------------------------------------------------
        // SCENARIO 1: Authenticated user can create valid comment during allowed period
        // -------------------------------------------------------------
        console.log("\n--- Scenario 1: Authenticated user creates valid comment during allowed period ---");
        const comment1 = await createIssueCommentUseCase.execute(
            publicIssueId,
            commenter1Id,
            "This pothole has been here for weeks and is damaging cars!"
        );
        assert(comment1.id, "Comment must have an ID");
        assert.equal(comment1.issueId, publicIssueId);
        assert.equal(comment1.body, "This pothole has been here for weeks and is damaging cars!");
        assert(comment1.createdAt instanceof Date);
        console.log("✔ Scenario 1 Passed: Comment created successfully with timestamps and expected body");

        // -------------------------------------------------------------
        // SCENARIO 2: Saved comment references correct issue and authenticated user
        // -------------------------------------------------------------
        console.log("\n--- Scenario 2: Saved comment references correct issue and authenticated user in DB ---");
        const persistedComment = await IssueCommentModel.findById(comment1.id);
        assert(persistedComment, "Comment document must exist in MongoDB");
        assert.equal(persistedComment.issueId.toString(), publicIssueId);
        assert.equal(persistedComment.userId.toString(), commenter1Id);
        assert.equal(persistedComment.body, "This pothole has been here for weeks and is damaging cars!");
        // Verify no duplicate author name stored in the raw document
        const rawObject = persistedComment.toObject() as unknown as Record<string, unknown>;
        assert.equal(rawObject.fullName, undefined, "Raw comment document MUST NOT duplicate author fullName");
        assert.equal(rawObject.authorName, undefined, "Raw comment document MUST NOT duplicate authorName");
        console.log("✔ Scenario 2 Passed: Persisted document references correct issue & user without duplicating name");

        // -------------------------------------------------------------
        // SCENARIO 3: Create response includes correct full name and does not expose private user data
        // -------------------------------------------------------------
        console.log("\n--- Scenario 3: Response contains safe display info and excludes private data ---");
        assert.equal(comment1.author.id, commenter1Id);
        assert.equal(comment1.author.fullName, "Jane Citizen");
        assert.equal((comment1 as unknown as Record<string, unknown>).email, undefined, "Comment response must not have email");
        assert.equal((comment1 as unknown as Record<string, unknown>).password, undefined, "Comment response must not have password");
        assert.equal((comment1.author as unknown as Record<string, unknown>).email, undefined, "Author must not expose email");
        assert.equal((comment1.author as unknown as Record<string, unknown>).password, undefined, "Author must not expose password");
        console.log("✔ Scenario 3 Passed: Safe author fullName populated, private user fields omitted");

        // -------------------------------------------------------------
        // SCENARIO 4: Unauthenticated users cannot create or retrieve comments
        // -------------------------------------------------------------
        console.log("\n--- Scenario 4: Unauthenticated requests rejected with 401 Unauthorized ---");
        let unauthCreateStatusCode = 0;
        let unauthCreateBody: Record<string, unknown> = {};
        const mockResCreate = {
            status(code: number) {
                unauthCreateStatusCode = code;
                return this;
            },
            json(data: Record<string, unknown>) {
                unauthCreateBody = data;
                return this;
            },
        } as unknown as Response;

        const unauthReqCreate = {
            user: undefined,
            params: { issueId: publicIssueId },
            body: { body: "Attempting unauthenticated comment" },
        } as unknown as AuthRequest;

        await issueController.createComment(unauthReqCreate, mockResCreate, () => {});
        assert.equal(unauthCreateStatusCode, HttpStatusCode.UNAUTHORIZED);
        assert.equal(unauthCreateBody.success, false);

        let unauthGetStatusCode = 0;
        let unauthGetBody: Record<string, unknown> = {};
        const mockResGet = {
            status(code: number) {
                unauthGetStatusCode = code;
                return this;
            },
            json(data: Record<string, unknown>) {
                unauthGetBody = data;
                return this;
            },
        } as unknown as Response;

        const unauthReqGet = {
            user: undefined,
            params: { issueId: publicIssueId },
            query: {},
        } as unknown as AuthRequest;

        await issueController.getComments(unauthReqGet, mockResGet, () => {});
        assert.equal(unauthGetStatusCode, HttpStatusCode.UNAUTHORIZED);
        assert.equal(unauthGetBody.success, false);
        console.log("✔ Scenario 4 Passed: Unauthenticated POST and GET rejected with 401 Unauthorized");

        // -------------------------------------------------------------
        // SCENARIO 5: Empty, whitespace-only, and overlong comments are rejected
        // -------------------------------------------------------------
        console.log("\n--- Scenario 5: Empty, whitespace-only, and overlong comments rejected ---");
        // Empty comment
        await assert.rejects(
            async () => {
                await createIssueCommentUseCase.execute(publicIssueId, commenter1Id, "");
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.match(err.message, /empty/i);
                return true;
            }
        );

        // Whitespace-only comment
        await assert.rejects(
            async () => {
                await createIssueCommentUseCase.execute(publicIssueId, commenter1Id, "    \n\t   ");
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.match(err.message, /empty/i);
                return true;
            }
        );

        // Overlong comment (>1000 characters)
        const overlongBody = "A".repeat(1001);
        await assert.rejects(
            async () => {
                await createIssueCommentUseCase.execute(publicIssueId, commenter1Id, overlongBody);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.match(err.message, /1000/);
                return true;
            }
        );

        // Validator schema test
        const emptyValidation = createCommentValidator.safeParse({ body: "   " });
        assert.equal(emptyValidation.success, false, "createCommentValidator must reject whitespace-only");
        const overlongValidation = createCommentValidator.safeParse({ body: overlongBody });
        assert.equal(overlongValidation.success, false, "createCommentValidator must reject overlong body");
        console.log("✔ Scenario 5 Passed: Empty, whitespace-only, and >1000 char comments rejected with 400");

        // -------------------------------------------------------------
        // SCENARIO 6: Malformed and nonexistent issue IDs handled correctly
        // -------------------------------------------------------------
        console.log("\n--- Scenario 6: Malformed and nonexistent issue IDs handled ---");
        // Malformed ID on create
        await assert.rejects(
            async () => {
                await createIssueCommentUseCase.execute("invalid-id-xyz", commenter1Id, "Test text");
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.equal(err.message, "Invalid issue ID format");
                return true;
            }
        );

        // Nonexistent ID on create
        const nonexistentId = new Types.ObjectId().toString();
        await assert.rejects(
            async () => {
                await createIssueCommentUseCase.execute(nonexistentId, commenter1Id, "Test text");
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.NOT_FOUND);
                assert.equal(err.message, "Issue not found");
                return true;
            }
        );

        // Malformed ID on get
        await assert.rejects(
            async () => {
                await getIssueCommentsUseCase.execute("invalid-id-xyz", commenter1Id);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.equal(err.message, "Invalid issue ID format");
                return true;
            }
        );

        // Nonexistent ID on get
        await assert.rejects(
            async () => {
                await getIssueCommentsUseCase.execute(nonexistentId, commenter1Id);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.NOT_FOUND);
                assert.equal(err.message, "Issue not found");
                return true;
            }
        );
        console.log("✔ Scenario 6 Passed: Malformed ID gives 400; nonexistent ID gives 404");

        // -------------------------------------------------------------
        // SCENARIO 7: Pagination returns correct page and metadata
        // -------------------------------------------------------------
        console.log("\n--- Scenario 7: Pagination returns correct page and metadata ---");
        // Add more comments for publicIssueId
        await createIssueCommentUseCase.execute(publicIssueId, commenter2Id, "Second comment by John");
        await createIssueCommentUseCase.execute(publicIssueId, commenter1Id, "Third comment by Jane");

        // Page 1 with pageSize 2
        const page1Result = await getIssueCommentsUseCase.execute(publicIssueId, commenter1Id, 1, 2);
        assert.equal(page1Result.items.length, 2);
        assert.equal(page1Result.pagination.page, 1);
        assert.equal(page1Result.pagination.pageSize, 2);
        assert.equal(page1Result.pagination.totalItems, 3);
        assert.equal(page1Result.pagination.totalPages, 2);

        // Page 2 with pageSize 2
        const page2Result = await getIssueCommentsUseCase.execute(publicIssueId, commenter1Id, 2, 2);
        assert.equal(page2Result.items.length, 1);
        assert.equal(page2Result.pagination.page, 2);
        assert.equal(page2Result.pagination.pageSize, 2);
        assert.equal(page2Result.pagination.totalItems, 3);
        assert.equal(page2Result.pagination.totalPages, 2);

        // Controller test for invalid pagination queries
        let pageError: ApiError | undefined;
        try {
            const badReq = {
                user: { userId: commenter1Id },
                params: { issueId: publicIssueId },
                query: { page: "0" },
            } as unknown as AuthRequest;
            await issueController.getComments(badReq, {} as Response, (err?: unknown) => {
                if (err instanceof ApiError) pageError = err;
            });
        } catch (e) {
            if (e instanceof ApiError) pageError = e;
        }
        assert(pageError, "Invalid page must trigger ApiError");
        assert.equal(pageError.statusCode, HttpStatusCode.BAD_REQUEST);

        console.log("✔ Scenario 7 Passed: Pagination returns accurate pages, items, and metadata");

        // -------------------------------------------------------------
        // SCENARIO 8: Comments are ordered oldest first (chronological order)
        // -------------------------------------------------------------
        console.log("\n--- Scenario 8: Comments are ordered oldest first (chronological) ---");
        const allCommentsResult = await getIssueCommentsUseCase.execute(publicIssueId, commenter1Id, 1, 10);
        assert.equal(allCommentsResult.items.length, 3);
        const item0 = allCommentsResult.items[0];
        const item1 = allCommentsResult.items[1];
        const item2 = allCommentsResult.items[2];
        assert(item0 && item1 && item2);
        assert.equal(item0.body, "This pothole has been here for weeks and is damaging cars!");
        assert.equal(item1.body, "Second comment by John");
        assert.equal(item2.body, "Third comment by Jane");
        assert(
            new Date(item0.createdAt).getTime() <= new Date(item1.createdAt).getTime(),
            "Comment 0 must be created before or equal to Comment 1"
        );
        assert(
            new Date(item1.createdAt).getTime() <= new Date(item2.createdAt).getTime(),
            "Comment 1 must be created before or equal to Comment 2"
        );
        console.log("✔ Scenario 8 Passed: Comments strictly ordered chronologically (oldest first)");

        // -------------------------------------------------------------
        // SCENARIO 9: Comments are scoped to requested issue
        // -------------------------------------------------------------
        console.log("\n--- Scenario 9: Comments are scoped strictly to the requested issue ---");
        const secondIssueComments = await getIssueCommentsUseCase.execute(secondPublicIssueId, commenter1Id, 1, 10);
        assert.equal(secondIssueComments.items.length, 0, "Second issue must have 0 comments");
        assert.equal(secondIssueComments.pagination.totalItems, 0);

        // Add a comment to second issue
        await createIssueCommentUseCase.execute(secondPublicIssueId, commenter1Id, "Comment for second issue");
        const secondIssueAfter = await getIssueCommentsUseCase.execute(secondPublicIssueId, commenter1Id, 1, 10);
        assert.equal(secondIssueAfter.items.length, 1);
        const secItem0 = secondIssueAfter.items[0];
        assert(secItem0);
        assert.equal(secItem0.body, "Comment for second issue");

        // Check publicIssueId again to confirm isolation
        const firstIssueAfter = await getIssueCommentsUseCase.execute(publicIssueId, commenter1Id, 1, 10);
        assert.equal(firstIssueAfter.items.length, 3, "First issue still has exactly 3 comments");
        console.log("✔ Scenario 9 Passed: Comments strictly isolated to respective issue IDs");

        // -------------------------------------------------------------
        // SCENARIO 10: Approved private issue comments are inaccessible to unauthorized users
        // -------------------------------------------------------------
        console.log("\n--- Scenario 10: Approved private issue comments inaccessible to unauthorized users ---");
        // Unauthorized non-creator attempts to comment
        await assert.rejects(
            async () => {
                await createIssueCommentUseCase.execute(
                    privateApprovedIssueId,
                    unauthorizedUserId,
                    "Unauthorized comment attempt"
                );
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                assert.equal(err.message, "You do not have permission to view this private issue");
                return true;
            }
        );

        // Unauthorized non-creator attempts to retrieve comments
        await assert.rejects(
            async () => {
                await getIssueCommentsUseCase.execute(privateApprovedIssueId, unauthorizedUserId);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                assert.equal(err.message, "You do not have permission to view this private issue");
                return true;
            }
        );

        // Authorized creator CAN comment on private approved issue
        const creatorPrivateComment = await createIssueCommentUseCase.execute(
            privateApprovedIssueId,
            creatorId,
            "Creator comment on private issue"
        );
        assert.equal(creatorPrivateComment.body, "Creator comment on private issue");

        // Authorized creator CAN read comments on private approved issue
        const creatorReadPrivate = await getIssueCommentsUseCase.execute(privateApprovedIssueId, creatorId);
        assert.equal(creatorReadPrivate.items.length, 1);
        console.log("✔ Scenario 10 Passed: Unauthorized user gets 403 Forbidden; Creator has access");

        // -------------------------------------------------------------
        // SCENARIO 11: Authorized users can still read comments after the deadline
        // -------------------------------------------------------------
        console.log("\n--- Scenario 11: Authorized users can read comments after deadline ---");
        // Manually insert an existing comment on expired issue directly into DB
        await IssueCommentModel.create({
            issueId: new Types.ObjectId(expiredIssueId),
            userId: new Types.ObjectId(commenter1Id),
            body: "Historical comment made within initial 24h",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 10000),
        });

        const expiredComments = await getIssueCommentsUseCase.execute(expiredIssueId, commenter1Id);
        assert.equal(expiredComments.items.length, 1);
        const expItem0 = expiredComments.items[0];
        assert(expItem0);
        assert.equal(expItem0.body, "Historical comment made within initial 24h");
        console.log("✔ Scenario 11 Passed: Existing comments can still be retrieved after the 24h deadline");

        // -------------------------------------------------------------
        // SCENARIO 12: New comments rejected at and after the deadline
        // -------------------------------------------------------------
        console.log("\n--- Scenario 12: New comments rejected after 24h deadline ---");
        await assert.rejects(
            async () => {
                await createIssueCommentUseCase.execute(
                    expiredIssueId,
                    commenter1Id,
                    "Late comment attempt after 24 hours"
                );
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.equal(err.message, "The 24-hour interaction window for this issue has closed");
                return true;
            }
        );
        console.log("✔ Scenario 12 Passed: New comments strictly rejected after 24h window expires");

        // -------------------------------------------------------------
        // SCENARIO 13: User ID in request body cannot impersonate another commenter
        // -------------------------------------------------------------
        console.log("\n--- Scenario 13: Client-supplied userId in body cannot impersonate another commenter ---");
        let controllerResStatusCode = 0;
        let controllerResBody: { success?: boolean; comment?: { author?: { id?: string; fullName?: string } } } = {};
        const impersonationReq = {
            user: { userId: commenter1Id }, // Authenticated as Jane Citizen
            params: { issueId: publicIssueId },
            body: {
                body: "Legitimate comment text",
                userId: commenter2Id, // Attempting to impersonate John Resident
                author: { id: commenter2Id, fullName: "Fake Admin" },
            },
        } as unknown as AuthRequest;

        await new Promise<void>((resolve, reject) => {
            const resWrapper = {
                status(code: number) {
                    controllerResStatusCode = code;
                    return this;
                },
                json(data: typeof controllerResBody) {
                    controllerResBody = data;
                    resolve();
                    return this;
                },
            } as unknown as Response;

            issueController.createComment(impersonationReq, resWrapper, (err?: unknown) => {
                if (err) reject(err);
                else resolve();
            });
        });

        assert.equal(controllerResStatusCode, HttpStatusCode.CREATED);
        assert.equal(controllerResBody.success, true);
        assert.equal(
            controllerResBody.comment?.author?.id,
            commenter1Id,
            "Author ID must strictly come from req.user.userId"
        );
        assert.equal(
            controllerResBody.comment?.author?.fullName,
            "Jane Citizen",
            "Author fullName must strictly resolve from authenticated user record"
        );
        console.log("✔ Scenario 13 Passed: Client cannot spoof author info via request body");

    } finally {
        // Clean up test data
        await IssueCommentModel.deleteMany({
            issueId: {
                $in: [
                    new Types.ObjectId(publicIssueId),
                    new Types.ObjectId(secondPublicIssueId),
                    new Types.ObjectId(privateApprovedIssueId),
                    new Types.ObjectId(expiredIssueId),
                ],
            },
        });
        await UserModel.deleteMany({
            _id: { $in: [new Types.ObjectId(commenter1Id), new Types.ObjectId(commenter2Id)] },
        });
        await mongoose.disconnect();
        console.log("\n✔ Database disconnected and test records cleaned up.");
    }

    console.log("=== All 13 Scenarios Passed Successfully! ===");
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
