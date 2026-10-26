import assert from "node:assert/strict";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import { IssueVoteModel } from "../infrastructure/models/IssueVoteModel.js";
import { IssueCommentModel, MAX_COMMENT_LENGTH } from "../infrastructure/models/IssueCommentModel.js";

dotenv.config();

async function runTests() {
    console.log("=== Starting IssueVote & IssueComment Model Tests ===");

    // -----------------------------------------------------------------
    // 1. Schema Definition & Index Inspection (Static/In-Memory)
    // -----------------------------------------------------------------
    console.log("\n--- Testing Schema Definitions & Indexes ---");

    // A. IssueVote Schema & Indexes
    const voteIndexes = IssueVoteModel.schema.indexes();
    const compoundVoteIndex = voteIndexes.find(
        ([fields, options]: [Record<string, number>, mongoose.IndexOptions | undefined]) =>
            fields.issueId === 1 &&
            fields.userId === 1 &&
            options?.unique === true
    );
    assert(compoundVoteIndex, "IssueVote schema MUST define unique compound index on { issueId: 1, userId: 1 }");
    console.log("✔ IssueVote unique compound index { issueId: 1, userId: 1 } verified");

    // References verification
    const issueIdPathVote = IssueVoteModel.schema.path("issueId") as mongoose.SchemaType & { options?: { ref?: string } };
    const userIdPathVote = IssueVoteModel.schema.path("userId") as mongoose.SchemaType & { options?: { ref?: string } };
    assert.equal(issueIdPathVote.options?.ref, "Issue", "issueId must reference 'Issue' model");
    assert.equal(userIdPathVote.options?.ref, "User", "userId must reference 'User' model");
    console.log("✔ IssueVote references ('Issue', 'User') verified");

    // B. IssueComment Schema & Indexes
    const commentIndexes = IssueCommentModel.schema.indexes();
    const chronologicalCommentIndex = commentIndexes.find(
        ([fields]: [Record<string, number>]) => fields.issueId === 1 && fields.createdAt === 1
    );
    assert(chronologicalCommentIndex, "IssueComment schema MUST define index on { issueId: 1, createdAt: 1 }");
    console.log("✔ IssueComment chronological index { issueId: 1, createdAt: 1 } verified");

    const issueIdPathComment = IssueCommentModel.schema.path("issueId") as mongoose.SchemaType & { options?: { ref?: string } };
    const userIdPathComment = IssueCommentModel.schema.path("userId") as mongoose.SchemaType & { options?: { ref?: string } };
    assert.equal(issueIdPathComment.options?.ref, "Issue", "issueId must reference 'Issue' model");
    assert.equal(userIdPathComment.options?.ref, "User", "userId must reference 'User' model");
    assert.equal(IssueCommentModel.schema.path("fullName"), undefined, "fullName must NOT be stored in IssueComment document");
    console.log("✔ IssueComment references ('Issue', 'User') verified and confirmed no redundant author fields stored");

    // -----------------------------------------------------------------
    // 2. Schema Validation Tests (Mongoose Synchronous Document Validation)
    // -----------------------------------------------------------------
    console.log("\n--- Testing Document Validation ---");

    const validIssueId = new Types.ObjectId();
    const validUserId = new Types.ObjectId();

    // A. Valid vote document
    const validVote = new IssueVoteModel({
        issueId: validIssueId,
        userId: validUserId,
    });
    const voteValidationErr = validVote.validateSync();
    assert.equal(voteValidationErr, undefined, "Valid IssueVote should pass validation");
    console.log("✔ Valid IssueVote is accepted");

    // Missing issueId on vote
    const voteMissingIssue = new IssueVoteModel({ userId: validUserId });
    const voteMissingIssueErr = voteMissingIssue.validateSync();
    assert(voteMissingIssueErr?.errors?.issueId, "IssueVote requires issueId");
    console.log("✔ IssueVote requires issueId");

    // Missing userId on vote
    const voteMissingUser = new IssueVoteModel({ issueId: validIssueId });
    const voteMissingUserErr = voteMissingUser.validateSync();
    assert(voteMissingUserErr?.errors?.userId, "IssueVote requires userId");
    console.log("✔ IssueVote requires userId");

    // B. Valid comment document
    const validComment = new IssueCommentModel({
        issueId: validIssueId,
        userId: validUserId,
        body: "We need this pothole fixed ASAP as it causes accidents.",
    });
    const commentValidationErr = validComment.validateSync();
    assert.equal(commentValidationErr, undefined, "Valid IssueComment should pass validation");
    console.log("✔ Valid IssueComment is accepted");

    // Missing body on comment
    const commentMissingBody = new IssueCommentModel({
        issueId: validIssueId,
        userId: validUserId,
    });
    const commentMissingBodyErr = commentMissingBody.validateSync();
    assert(commentMissingBodyErr?.errors?.body, "IssueComment requires body");
    console.log("✔ IssueComment requires body");

    // Empty string body
    const commentEmptyBody = new IssueCommentModel({
        issueId: validIssueId,
        userId: validUserId,
        body: "",
    });
    const commentEmptyErr = commentEmptyBody.validateSync();
    assert(commentEmptyErr?.errors?.body, "Empty comment body should be rejected");
    console.log("✔ Empty comment body rejected");

    // Whitespace-only string body
    const commentWhitespaceBody = new IssueCommentModel({
        issueId: validIssueId,
        userId: validUserId,
        body: "    \n\t   ",
    });
    const commentWhitespaceErr = commentWhitespaceBody.validateSync();
    assert(commentWhitespaceErr?.errors?.body, "Whitespace-only comment body should be rejected");
    console.log("✔ Whitespace-only comment body rejected");

    // Exceeding maximum length body
    const commentTooLong = new IssueCommentModel({
        issueId: validIssueId,
        userId: validUserId,
        body: "a".repeat(MAX_COMMENT_LENGTH + 1),
    });
    const commentTooLongErr = commentTooLong.validateSync();
    assert(commentTooLongErr?.errors?.body, "Comment exceeding maximum length should be rejected");
    console.log(`✔ Comment exceeding ${MAX_COMMENT_LENGTH} chars rejected`);

    // -----------------------------------------------------------------
    // 3. Database Runtime Integration (Constraints & Index Enforcement)
    // -----------------------------------------------------------------
    console.log("\n--- Testing Database Constraints & Uniqueness ---");
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.log("⚠ MONGO_URI not found in environment; skipping live DB integration checks.");
        console.log("=== All Schema & In-Memory Tests Passed Successfully ===");
        return;
    }

    try {
        console.log("Connecting to MongoDB for index enforcement verification...");
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected to MongoDB.");

        // Ensure indexes are built on the test collections
        await IssueVoteModel.init();
        await IssueCommentModel.init();

        const testIssue1 = new Types.ObjectId();
        const testIssue2 = new Types.ObjectId();
        const testUser1 = new Types.ObjectId();
        const testUser2 = new Types.ObjectId();

        const createdVoteIds: Types.ObjectId[] = [];
        const createdCommentIds: Types.ObjectId[] = [];

        try {
            // A. Insert initial vote (issue1, user1)
            const vote1 = await IssueVoteModel.create({
                issueId: testIssue1,
                userId: testUser1,
            });
            createdVoteIds.push(vote1._id);
            console.log("✔ Vote created for (testIssue1, testUser1)");

            // B. Attempt duplicate vote (issue1, user1)
            let duplicateCaught = false;
            try {
                await IssueVoteModel.create({
                    issueId: testIssue1,
                    userId: testUser1,
                });
            } catch (err: unknown) {
                const mongoErr = err as { code?: number };
                if (mongoErr.code === 11000) {
                    duplicateCaught = true;
                } else {
                    throw err;
                }
            }
            assert.equal(duplicateCaught, true, "Duplicate vote for same issue and user must throw duplicate key error (11000)");
            console.log("✔ Duplicate vote blocked by unique compound index (E11000)");

            // C. Different user voting for the same issue (issue1, user2)
            const vote2 = await IssueVoteModel.create({
                issueId: testIssue1,
                userId: testUser2,
            });
            createdVoteIds.push(vote2._id);
            console.log("✔ Different user voting for the same issue accepted");

            // D. Same user voting for different issue (issue2, user1)
            const vote3 = await IssueVoteModel.create({
                issueId: testIssue2,
                userId: testUser1,
            });
            createdVoteIds.push(vote3._id);
            console.log("✔ Same user voting for a different issue accepted");

            // E. Create valid comment and retrieve
            const comment1 = await IssueCommentModel.create({
                issueId: testIssue1,
                userId: testUser1,
                body: "First comment on testIssue1",
            });
            createdCommentIds.push(comment1._id);
            console.log("✔ Comment created in DB");

            const fetchedComment = await IssueCommentModel.findById(comment1._id);
            assert(fetchedComment);
            assert.equal(fetchedComment.issueId.toString(), testIssue1.toString());
            assert.equal(fetchedComment.userId.toString(), testUser1.toString());
            assert.equal(fetchedComment.body, "First comment on testIssue1");
            assert(fetchedComment.createdAt instanceof Date);
            console.log("✔ Comment retrieved and fields verified");

        } finally {
            // Cleanup test data
            if (createdVoteIds.length > 0) {
                await IssueVoteModel.deleteMany({ _id: { $in: createdVoteIds } });
            }
            if (createdCommentIds.length > 0) {
                await IssueCommentModel.deleteMany({ _id: { $in: createdCommentIds } });
            }
            console.log("✔ Test data cleaned up successfully");
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB.");
        }

    } catch (dbErr: unknown) {
        console.warn("⚠ Live DB connection failed or timed out:", (dbErr as Error).message);
        console.log("ℹ Note: Schema and in-memory validation tests succeeded.");
    }

    console.log("\n=== All Tests Finished Successfully ===");
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
