import assert from "node:assert/strict";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import type { Response } from "express";
import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import type { Issue } from "../domain/entities/Issue.js";
import type { IIssueRepository } from "../domain/interface/IIssueRepository.js";
import { IssueVoteRepository } from "../infrastructure/repositories/IssueVoteRepository.js";
import { IssueVoteModel } from "../infrastructure/models/IssueVoteModel.js";
import { AddIssueUpvoteUseCase } from "../application/use-cases/issue/AddIssueUpvoteUseCase.js";
import { RemoveIssueUpvoteUseCase } from "../application/use-cases/issue/RemoveIssueUpvoteUseCase.js";
import { GetIssueUpvoteStatusUseCase } from "../application/use-cases/issue/GetIssueUpvoteStatusUseCase.js";
import { IssueController } from "../presentation/controllers/issue/IssueController.js";
import ApiError from "../shared/utils/apiError.js";
import { HttpStatusCode } from "../shared/enums/HttpStatusCode.js";
import type { AuthRequest } from "../shared/types/AuthRequest.js";

dotenv.config();

function createMockIssue(
    id: string,
    createdBy: string,
    visibility: IssueVisibility = IssueVisibility.PUBLIC,
    status: IssueStatus = IssueStatus.REPORTED
): Issue {
    return {
        id,
        createdBy,
        title: "Test Road Defect",
        description: "Test description for civic issue",
        category: "507f1f77bcf86cd799439001",
        images: [],
        visibility,
        location: {
            address: "Main Road, Kochi",
            coordinates: { latitude: 9.9312, longitude: 76.2673 },
        },
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

async function runTests() {
    console.log("=== Starting Phase 2: Issue Upvote Backend API Tests ===");

    const creatorId = new Types.ObjectId().toString();
    const user1Id = new Types.ObjectId().toString();
    const user2Id = new Types.ObjectId().toString();
    const user3Id = new Types.ObjectId().toString();

    const publicIssueId = new Types.ObjectId().toString();
    const privateApprovedIssueId = new Types.ObjectId().toString();

    const issuesMap = new Map<string, Issue>();
    issuesMap.set(publicIssueId, createMockIssue(publicIssueId, creatorId, IssueVisibility.PUBLIC, IssueStatus.REPORTED));
    issuesMap.set(
        privateApprovedIssueId,
        createMockIssue(privateApprovedIssueId, creatorId, IssueVisibility.PRIVATE, IssueStatus.VERIFIED)
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
    // LIVE DB SETUP FOR CONCURRENCY & INDEX VERIFICATION
    // -------------------------------------------------------------
    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    await IssueVoteModel.init();
    const issueVoteRepository = new IssueVoteRepository();

    const addIssueUpvoteUseCase = new AddIssueUpvoteUseCase(mockIssueRepository, issueVoteRepository);
    const removeIssueUpvoteUseCase = new RemoveIssueUpvoteUseCase(mockIssueRepository, issueVoteRepository);
    const getIssueUpvoteStatusUseCase = new GetIssueUpvoteStatusUseCase(mockIssueRepository, issueVoteRepository);

    const issueController = new IssueController(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        addIssueUpvoteUseCase,
        removeIssueUpvoteUseCase,
        getIssueUpvoteStatusUseCase,
        {} as never,
        {} as never
    );

    try {
        // Clean up any stale votes for our test issues
        await IssueVoteModel.deleteMany({
            issueId: { $in: [new Types.ObjectId(publicIssueId), new Types.ObjectId(privateApprovedIssueId)] },
        });

        // -------------------------------------------------------------
        // SCENARIO 1: Authenticated user successfully upvotes an eligible issue
        // -------------------------------------------------------------
        console.log("\n--- Scenario 1: Authenticated user upvotes issue ---");
        const res1 = await addIssueUpvoteUseCase.execute(publicIssueId, user1Id);
        assert.equal(res1.hasUpvoted, true);
        assert.equal(res1.upvoteCount, 1);
        console.log("✔ Scenario 1 Passed: Vote registered successfully (count = 1, hasUpvoted = true)");

        // -------------------------------------------------------------
        // SCENARIO 2: Repeated upvote requests do not create duplicate records
        // -------------------------------------------------------------
        console.log("\n--- Scenario 2: Repeated upvote requests (idempotency) ---");
        const res2 = await addIssueUpvoteUseCase.execute(publicIssueId, user1Id);
        assert.equal(res2.hasUpvoted, true);
        assert.equal(res2.upvoteCount, 1);
        const totalDocsUser1 = await IssueVoteModel.countDocuments({
            issueId: new Types.ObjectId(publicIssueId),
            userId: new Types.ObjectId(user1Id),
        });
        assert.equal(totalDocsUser1, 1, "Duplicate record MUST NOT be created in database");
        console.log("✔ Scenario 2 Passed: Repeated vote call is idempotent without creating duplicate records");

        // -------------------------------------------------------------
        // SCENARIO 3: Concurrent duplicate upvote attempts do not create duplicates
        // -------------------------------------------------------------
        console.log("\n--- Scenario 3: Concurrent duplicate upvote attempts ---");
        const concurrentResults = await Promise.all([
            addIssueUpvoteUseCase.execute(publicIssueId, user2Id),
            addIssueUpvoteUseCase.execute(publicIssueId, user2Id),
            addIssueUpvoteUseCase.execute(publicIssueId, user2Id),
            addIssueUpvoteUseCase.execute(publicIssueId, user2Id),
        ]);
        concurrentResults.forEach((r) => {
            assert.equal(r.hasUpvoted, true);
        });
        const totalDocsUser2 = await IssueVoteModel.countDocuments({
            issueId: new Types.ObjectId(publicIssueId),
            userId: new Types.ObjectId(user2Id),
        });
        assert.equal(totalDocsUser2, 1, "Under concurrent requests, exactly 1 vote record must exist for user2");
        const countAfterUser2 = await issueVoteRepository.countByIssueId(publicIssueId);
        assert.equal(countAfterUser2, 2, "Total upvote count should be 2 (user1 + user2)");
        console.log("✔ Scenario 3 Passed: Concurrent upvote race conditions handled gracefully by unique compound index");

        // -------------------------------------------------------------
        // SCENARIO 4: A user cannot upvote their own issue
        // -------------------------------------------------------------
        console.log("\n--- Scenario 4: User cannot upvote own issue ---");
        await assert.rejects(
            async () => {
                await addIssueUpvoteUseCase.execute(publicIssueId, creatorId);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.equal(err.message, "You cannot upvote your own issue");
                return true;
            }
        );
        console.log("✔ Scenario 4 Passed: Creator self-upvote rejected with 400 Bad Request");

        // -------------------------------------------------------------
        // SCENARIO 5: Unauthenticated request is rejected by controller
        // -------------------------------------------------------------
        console.log("\n--- Scenario 5: Unauthenticated request rejection ---");
        let unauthStatusCode = 0;
        let unauthBody: Record<string, unknown> = {};
        const mockRes = {
            status(code: number) {
                unauthStatusCode = code;
                return this;
            },
            json(data: Record<string, unknown>) {
                unauthBody = data;
                return this;
            },
        } as unknown as Response;

        const unauthReq = {
            user: undefined,
            params: { issueId: publicIssueId },
        } as unknown as AuthRequest;

        await issueController.addUpvote(unauthReq, mockRes, () => {});
        assert.equal(unauthStatusCode, HttpStatusCode.UNAUTHORIZED);
        assert.equal(unauthBody.success, false);
        console.log("✔ Scenario 5 Passed: Unauthenticated request rejected with 401 Unauthorized");

        // -------------------------------------------------------------
        // SCENARIO 6: Malformed and nonexistent issue IDs
        // -------------------------------------------------------------
        console.log("\n--- Scenario 6: Malformed and nonexistent issue IDs ---");
        // Malformed ID
        await assert.rejects(
            async () => {
                await addIssueUpvoteUseCase.execute("malformed-not-an-objectid", user3Id);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.equal(err.message, "Invalid issue ID format");
                return true;
            }
        );

        // Nonexistent valid ID
        const nonexistentId = new Types.ObjectId().toString();
        await assert.rejects(
            async () => {
                await addIssueUpvoteUseCase.execute(nonexistentId, user3Id);
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
        // SCENARIO 7: Unauthorized user cannot interact with approved private issue
        // -------------------------------------------------------------
        console.log("\n--- Scenario 7: Approved private issue authorization ---");
        await assert.rejects(
            async () => {
                await addIssueUpvoteUseCase.execute(privateApprovedIssueId, user1Id);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                assert.equal(err.message, "You do not have permission to view this private issue");
                return true;
            }
        );

        await assert.rejects(
            async () => {
                await removeIssueUpvoteUseCase.execute(privateApprovedIssueId, user1Id);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );

        await assert.rejects(
            async () => {
                await getIssueUpvoteStatusUseCase.execute(privateApprovedIssueId, user1Id);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );
        console.log("✔ Scenario 7 Passed: Non-creator completely forbidden from approved private issue (POST, DELETE, GET)");

        // -------------------------------------------------------------
        // SCENARIO 8: User can remove own vote but cannot remove another's vote
        // -------------------------------------------------------------
        console.log("\n--- Scenario 8: User removes own vote ---");
        const removeRes1 = await removeIssueUpvoteUseCase.execute(publicIssueId, user1Id);
        assert.equal(removeRes1.hasUpvoted, false);
        assert.equal(removeRes1.upvoteCount, 1, "Count should be 1 after user1 removes vote");

        const user2StillVoted = await issueVoteRepository.hasUserVoted(publicIssueId, user2Id);
        assert.equal(user2StillVoted, true, "User2's vote must remain intact");
        console.log("✔ Scenario 8 Passed: User1 vote removed; User2 vote remains unaffected");

        // -------------------------------------------------------------
        // SCENARIO 9: Repeated removal requests behave predictably
        // -------------------------------------------------------------
        console.log("\n--- Scenario 9: Repeated removal requests ---");
        const removeResAgain = await removeIssueUpvoteUseCase.execute(publicIssueId, user1Id);
        assert.equal(removeResAgain.hasUpvoted, false);
        assert.equal(removeResAgain.upvoteCount, 1);
        console.log("✔ Scenario 9 Passed: Repeated remove vote call safely returns hasUpvoted: false and current count");

        // -------------------------------------------------------------
        // SCENARIO 10: Upvote counts and current user's vote state
        // -------------------------------------------------------------
        console.log("\n--- Scenario 10: Retrieve upvote state and count ---");
        const user2Status = await getIssueUpvoteStatusUseCase.execute(publicIssueId, user2Id);
        assert.equal(user2Status.hasUpvoted, true);
        assert.equal(user2Status.upvoteCount, 1);

        const user1Status = await getIssueUpvoteStatusUseCase.execute(publicIssueId, user1Id);
        assert.equal(user1Status.hasUpvoted, false);
        assert.equal(user1Status.upvoteCount, 1);

        const user3Status = await getIssueUpvoteStatusUseCase.execute(publicIssueId, user3Id);
        assert.equal(user3Status.hasUpvoted, false);
        assert.equal(user3Status.upvoteCount, 1);
        console.log("✔ Scenario 10 Passed: Upvote counts and per-user vote states verified");

        // -------------------------------------------------------------
        // SCENARIO 11: Removal allowed regardless of timestamp / deadline
        // -------------------------------------------------------------
        console.log("\n--- Scenario 11: Vote removal allowed after any elapsed duration ---");
        const removeResUser2 = await removeIssueUpvoteUseCase.execute(publicIssueId, user2Id);
        assert.equal(removeResUser2.hasUpvoted, false);
        assert.equal(removeResUser2.upvoteCount, 0);
        console.log("✔ Scenario 11 Passed: Existing votes can always be removed while issue is accessible");

        // -------------------------------------------------------------
        // SCENARIO 12: Adding an upvote after interaction window expires is rejected
        // -------------------------------------------------------------
        console.log("\n--- Scenario 12: Add upvote after expiry is rejected ---");
        const expiredIssueId = new Types.ObjectId().toString();
        const expiredIssue = createMockIssue(expiredIssueId, creatorId, IssueVisibility.PUBLIC, IssueStatus.REPORTED);
        // Created 10 minutes ago (> 1 minute interaction window)
        expiredIssue.createdAt = new Date(Date.now() - 10 * 60 * 1000);
        issuesMap.set(expiredIssueId, expiredIssue);

        await assert.rejects(
            async () => {
                await addIssueUpvoteUseCase.execute(expiredIssueId, user1Id);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert.match(err.message, /interaction window.*closed/i);
                return true;
            }
        );
        console.log("✔ Scenario 12 Passed: Adding upvote after expiry is rejected with 400 Bad Request");

        // -------------------------------------------------------------
        // SCENARIO 13: Removing one's own existing upvote after expiry succeeds
        // -------------------------------------------------------------
        console.log("\n--- Scenario 13: Remove own upvote after expiry succeeds ---");
        // Simulate that user1 had voted before expiry
        await issueVoteRepository.addVote(expiredIssueId, user1Id);
        const countBeforeRemove = await issueVoteRepository.countByIssueId(expiredIssueId);
        assert.equal(countBeforeRemove, 1);

        const removeExpiredRes = await removeIssueUpvoteUseCase.execute(expiredIssueId, user1Id);
        assert.equal(removeExpiredRes.hasUpvoted, false);
        assert.equal(removeExpiredRes.upvoteCount, 0);
        console.log("✔ Scenario 13 Passed: Removing own upvote after expiry succeeds and decrements count to 0");

        // -------------------------------------------------------------
        // SCENARIO 14: User cannot remove another user's upvote
        // -------------------------------------------------------------
        console.log("\n--- Scenario 14: User cannot remove another user's upvote ---");
        await issueVoteRepository.addVote(expiredIssueId, user2Id);
        assert.equal(await issueVoteRepository.hasUserVoted(expiredIssueId, user2Id), true);

        // User1 attempts to remove vote on expiredIssueId (where only user2 voted)
        const unauthRemoveRes = await removeIssueUpvoteUseCase.execute(expiredIssueId, user1Id);
        assert.equal(unauthRemoveRes.hasUpvoted, false);
        // User2's vote is unaffected and count remains 1
        assert.equal(unauthRemoveRes.upvoteCount, 1);
        assert.equal(await issueVoteRepository.hasUserVoted(expiredIssueId, user2Id), true);
        console.log("✔ Scenario 14 Passed: User1 removal attempt does not affect User2's existing vote");

    } finally {
        // Cleanup test data
        await IssueVoteModel.deleteMany({
            issueId: { $in: [new Types.ObjectId(publicIssueId), new Types.ObjectId(privateApprovedIssueId)] },
        });
        await mongoose.disconnect();
        console.log("\n✔ Database disconnected and test records cleaned up.");
    }

    console.log("=== All 14 Scenarios Passed Successfully! ===");
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
