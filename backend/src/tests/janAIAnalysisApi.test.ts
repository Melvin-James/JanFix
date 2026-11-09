import assert from "node:assert/strict";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import type { Response } from "express";
import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import { Role } from "../domain/enums/Role.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";
import { AuthProvider } from "../domain/enums/AuthProvider.js";
import { CommentClassification } from "../domain/enums/CommentClassification.js";
import { AIOverallClassification } from "../domain/enums/AIOverallClassification.js";
import { AIAnalysisStatus } from "../domain/enums/AIAnalysisStatus.js";
import { calculateCommunitySupportScore } from "../application/services/communitySupportScoreCalculator.js";
import { IssueModel } from "../infrastructure/models/IssueModel.js";
import { UserModel } from "../infrastructure/models/UserModel.js";
import { CategoryModel } from "../infrastructure/models/CategoryModel.js";
import { IssueCommentModel } from "../infrastructure/models/IssueCommentModel.js";
import { IssueAIAnalysisModel } from "../infrastructure/models/IssueAIAnalysisModel.js";
import { IssueRepository } from "../infrastructure/repositories/IssueRepository.js";
import { IssueAIAnalysisRepository } from "../infrastructure/repositories/IssueAIAnalysisRepository.js";
import { AnalyzeIssueCommentsUseCase } from "../application/use-cases/admin/AnalyzeIssueCommentsUseCase.js";
import { GetIssueAIAnalysisUseCase } from "../application/use-cases/admin/GetIssueAIAnalysisUseCase.js";
import { AdminController } from "../presentation/controllers/admin/AdminController.js";
import type { IIssueAIService, AICommentInput, IssueAIAnalysisResult } from "../domain/interface/IIssueAIService.js";
import type { AuthRequest } from "../shared/types/AuthRequest.js";
import ApiError from "../shared/utils/apiError.js";

dotenv.config();

// Mock AI service for controlled test execution
class MockIssueAIService implements IIssueAIService {
    public mockResponse: IssueAIAnalysisResult | null = null;
    public callCount = 0;
    public lastPassedComments: AICommentInput[] = [];

    async analyzeCommunityComments(
        _issueTitle: string,
        _issueDescription: string | undefined,
        comments: AICommentInput[]
    ): Promise<IssueAIAnalysisResult> {
        this.callCount++;
        this.lastPassedComments = comments;

        if (this.mockResponse) {
            return this.mockResponse;
        }

        return {
            summary: "Community consensus indicates observed civic disruption in the area.",
            classifications: comments.map((c) => ({
                commentId: c.id,
                classification: CommentClassification.SUPPORTS_REPORT,
                explanation: "Corroborates civic issue",
            })),
            modelUsed: "mock-gemini",
        };
    }
}

async function runJanAITests() {
    console.log("=== Starting JanAI Community Comment Analysis Tests ===");

    // -------------------------------------------------------------------------
    // UNIT TESTS: Score Calculation Formula & Classification
    // -------------------------------------------------------------------------
    console.log("\n--- Part 1: Community Support Score Formula Unit Tests ---");

    // Case 1: 10 supporting, 0 challenging -> 100
    const score10_0 = calculateCommunitySupportScore([
        ...Array.from({ length: 10 }, (_, i) => ({
            commentId: `c${i}`,
            classification: CommentClassification.SUPPORTS_REPORT,
        })),
    ]);
    assert.equal(score10_0.score, 100);
    assert.equal(score10_0.overallClassification, AIOverallClassification.COMMUNITY_LEANING_SUPPORT);
    console.log("✔ Score 10 support / 0 challenge = 100 (COMMUNITY_LEANING_SUPPORT)");

    // Case 2: 8 supporting, 2 challenging -> 80 (formula: 50 + 50*(6/10) = 80)
    const score8_2 = calculateCommunitySupportScore([
        ...Array.from({ length: 8 }, (_, i) => ({
            commentId: `s${i}`,
            classification: CommentClassification.SUPPORTS_REPORT,
        })),
        ...Array.from({ length: 2 }, (_, i) => ({
            commentId: `ch${i}`,
            classification: CommentClassification.CHALLENGES_REPORT,
        })),
    ]);
    assert.equal(score8_2.score, 80);
    assert.equal(score8_2.overallClassification, AIOverallClassification.COMMUNITY_LEANING_SUPPORT);
    console.log("✔ Score 8 support / 2 challenge = 80 (COMMUNITY_LEANING_SUPPORT)");

    // Case 2B: 9 supporting, 1 challenging -> 90 (formula: 50 + 50*(8/10) = 90)
    const score9_1 = calculateCommunitySupportScore([
        ...Array.from({ length: 9 }, (_, i) => ({
            commentId: `s${i}`,
            classification: CommentClassification.SUPPORTS_REPORT,
        })),
        ...Array.from({ length: 1 }, (_, i) => ({
            commentId: `ch${i}`,
            classification: CommentClassification.CHALLENGES_REPORT,
        })),
    ]);
    assert.equal(score9_1.score, 90);
    assert.equal(score9_1.overallClassification, AIOverallClassification.COMMUNITY_LEANING_SUPPORT);
    console.log("✔ Score 9 support / 1 challenge = 90 (COMMUNITY_LEANING_SUPPORT)");

    // Case 3: 5 supporting, 5 challenging -> 50
    const score5_5 = calculateCommunitySupportScore([
        ...Array.from({ length: 5 }, (_, i) => ({
            commentId: `s${i}`,
            classification: CommentClassification.SUPPORTS_REPORT,
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
            commentId: `ch${i}`,
            classification: CommentClassification.CHALLENGES_REPORT,
        })),
    ]);
    assert.equal(score5_5.score, 50);
    assert.equal(score5_5.overallClassification, AIOverallClassification.MIXED_FEEDBACK);
    console.log("✔ Score 5 support / 5 challenge = 50 (MIXED_FEEDBACK)");

    // Case 4: 2 supporting, 8 challenging -> 20 (formula: 50 + 50*(-6/10) = 20)
    const score2_8 = calculateCommunitySupportScore([
        ...Array.from({ length: 2 }, (_, i) => ({
            commentId: `s${i}`,
            classification: CommentClassification.SUPPORTS_REPORT,
        })),
        ...Array.from({ length: 8 }, (_, i) => ({
            commentId: `ch${i}`,
            classification: CommentClassification.CHALLENGES_REPORT,
        })),
    ]);
    assert.equal(score2_8.score, 20);
    assert.equal(score2_8.overallClassification, AIOverallClassification.COMMUNITY_LEANING_CHALLENGE);
    console.log("✔ Score 2 support / 8 challenge = 20 (COMMUNITY_LEANING_CHALLENGE)");

    // Case 4B: 1 supporting, 9 challenging -> 10 (formula: 50 + 50*(-8/10) = 10)
    const score1_9 = calculateCommunitySupportScore([
        ...Array.from({ length: 1 }, (_, i) => ({
            commentId: `s${i}`,
            classification: CommentClassification.SUPPORTS_REPORT,
        })),
        ...Array.from({ length: 9 }, (_, i) => ({
            commentId: `ch${i}`,
            classification: CommentClassification.CHALLENGES_REPORT,
        })),
    ]);
    assert.equal(score1_9.score, 10);
    assert.equal(score1_9.overallClassification, AIOverallClassification.COMMUNITY_LEANING_CHALLENGE);
    console.log("✔ Score 1 support / 9 challenge = 10 (COMMUNITY_LEANING_CHALLENGE)");

    // Case 5: 0 supporting, 10 challenging -> 0
    const score0_10 = calculateCommunitySupportScore([
        ...Array.from({ length: 10 }, (_, i) => ({
            commentId: `ch${i}`,
            classification: CommentClassification.CHALLENGES_REPORT,
        })),
    ]);
    assert.equal(score0_10.score, 0);
    assert.equal(score0_10.overallClassification, AIOverallClassification.COMMUNITY_LEANING_CHALLENGE);
    console.log("✔ Score 0 support / 10 challenge = 0 (COMMUNITY_LEANING_CHALLENGE)");

    // Case 6: Neutral comments do not affect the formula
    const scoreWithNeutral = calculateCommunitySupportScore([
        ...Array.from({ length: 8 }, (_, i) => ({
            commentId: `s${i}`,
            classification: CommentClassification.SUPPORTS_REPORT,
        })),
        ...Array.from({ length: 2 }, (_, i) => ({
            commentId: `ch${i}`,
            classification: CommentClassification.CHALLENGES_REPORT,
        })),
        ...Array.from({ length: 15 }, (_, i) => ({
            commentId: `n${i}`,
            classification: CommentClassification.NEUTRAL,
        })),
    ]);
    assert.equal(scoreWithNeutral.score, 80, "Neutral comments must not participate in formula");
    assert.equal(scoreWithNeutral.neutralCount, 15);
    assert.equal(scoreWithNeutral.totalAnalyzed, 25);
    console.log("✔ Neutral comments excluded from mathematical formula");

    // Case 7: No meaningful stance data -> null score and INSUFFICIENT_DATA
    const scoreAllNeutral = calculateCommunitySupportScore([
        { commentId: "n1", classification: CommentClassification.NEUTRAL },
        { commentId: "n2", classification: CommentClassification.NEUTRAL },
    ]);
    assert.equal(scoreAllNeutral.score, null);
    assert.equal(scoreAllNeutral.overallClassification, AIOverallClassification.INSUFFICIENT_DATA);
    console.log("✔ Only neutral comments -> null score and INSUFFICIENT_DATA");

    // -------------------------------------------------------------------------
    // INTEGRATION TESTS: Database, Cutoff & API
    // -------------------------------------------------------------------------
    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("\nConnected to MongoDB.");

    await IssueAIAnalysisModel.init();
    await IssueCommentModel.init();
    await IssueModel.init();
    await UserModel.init();
    await CategoryModel.init();

    const createdUserIds: Types.ObjectId[] = [];
    const createdIssueIds: Types.ObjectId[] = [];
    const createdCategoryIds: Types.ObjectId[] = [];

    // Test Admin User
    const adminUser = await UserModel.create({
        fullName: "JanAI Admin",
        email: `janai.admin.${Date.now()}@janfix.test`,
        password: "hashedpassword123",
        roles: [Role.ADMIN, Role.USER],
        activeMode: "USER",
        accountStatus: AccountStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        isVerified: true,
    });
    createdUserIds.push(adminUser._id as Types.ObjectId);

    // Test Reporter User
    const reporterUser = await UserModel.create({
        fullName: "Civic Reporter",
        email: `civic.reporter.${Date.now()}@janfix.test`,
        password: "hashedpassword123",
        roles: [Role.USER],
        activeMode: "USER",
        accountStatus: AccountStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        isVerified: true,
    });
    createdUserIds.push(reporterUser._id as Types.ObjectId);

    // Test Commenter User
    const commenterUser = await UserModel.create({
        fullName: "Community Commenter",
        email: `commenter.${Date.now()}@janfix.test`,
        password: "hashedpassword123",
        roles: [Role.USER],
        activeMode: "USER",
        accountStatus: AccountStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        isVerified: true,
    });
    createdUserIds.push(commenterUser._id as Types.ObjectId);

    // Test Category
    const testCategory = await CategoryModel.create({
        name: `Civic Safety ${Date.now()}`,
        description: "Public safety and roads",
        isActive: true,
    });
    createdCategoryIds.push(testCategory._id as Types.ObjectId);

    const now = new Date();
    // Eligible issue: created 26 hours ago
    const time26HoursAgo = new Date(now.getTime() - 26 * 60 * 60 * 1000);
    // Young issue: created 2 hours ago
    const time2HoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const eligibleIssue = await IssueModel.create({
        createdBy: reporterUser._id,
        title: "Major Pothole on Market Road",
        description: "Dangerous pothole near the central vegetable market causing two-wheeler accidents.",
        category: testCategory._id,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: { address: "Market Road, Block 4", coordinates: { latitude: 12.9, longitude: 77.6 } },
        status: IssueStatus.REPORTED,
        createdAt: time26HoursAgo,
        updatedAt: time26HoursAgo,
    });
    createdIssueIds.push(eligibleIssue._id as Types.ObjectId);

    const youngIssue = await IssueModel.create({
        createdBy: reporterUser._id,
        title: "Broken Streetlight on Park Avenue",
        description: "Streetlight not working since yesterday.",
        category: testCategory._id,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: { address: "Park Avenue", coordinates: { latitude: 12.91, longitude: 77.61 } },
        status: IssueStatus.REPORTED,
        createdAt: time2HoursAgo,
        updatedAt: time2HoursAgo,
    });
    createdIssueIds.push(youngIssue._id as Types.ObjectId);

    // Cutoff for eligibleIssue is time26HoursAgo + 24 hours = 2 hours ago
    const _cutoffDate = new Date(time26HoursAgo.getTime() + 24 * 60 * 60 * 1000);

    // Valid Comment 1: Posted within 24h window (25 hours ago)
    const _comment1 = await IssueCommentModel.create({
        issueId: eligibleIssue._id,
        userId: commenterUser._id,
        body: "I drive through Market Road daily. The pothole is huge and very dangerous at night.",
        createdAt: new Date(time26HoursAgo.getTime() + 1 * 60 * 60 * 1000),
    });

    // Valid Comment 2: Posted within 24h window (24 hours ago)
    const _comment2 = await IssueCommentModel.create({
        issueId: eligibleIssue._id,
        userId: commenterUser._id,
        body: "Saw a scooter slip here yesterday afternoon.",
        createdAt: new Date(time26HoursAgo.getTime() + 2 * 60 * 60 * 1000),
    });

    // Invalid Comment 3: Posted AFTER 24h window (1 hour ago) -> MUST BE EXCLUDED FROM ANALYSIS
    const commentAfterCutoff = await IssueCommentModel.create({
        issueId: eligibleIssue._id,
        userId: commenterUser._id,
        body: "Comment posted after the 24-hour interaction period closed.",
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    });

    const issueRepository = new IssueRepository();
    const aiAnalysisRepository = new IssueAIAnalysisRepository();
    const mockAIService = new MockIssueAIService();

    const analyzeIssueCommentsUseCase = new AnalyzeIssueCommentsUseCase(
        issueRepository,
        aiAnalysisRepository,
        mockAIService
    );

    const getIssueAIAnalysisUseCase = new GetIssueAIAnalysisUseCase(
        issueRepository,
        aiAnalysisRepository,
        analyzeIssueCommentsUseCase
    );

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
        {} as never,
        {} as never,
        getIssueAIAnalysisUseCase,
        analyzeIssueCommentsUseCase
    );

    try {
        // ---------------------------------------------------------------------
        // TEST 1: Analysis cannot run before 24-hour interaction window ends
        // ---------------------------------------------------------------------
        console.log("\n--- Test 1: Analysis rejected for issues before 24-hour cutoff ---");
        await assert.rejects(
            async () => {
                await analyzeIssueCommentsUseCase.execute(youngIssue._id.toString(), now);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, 400);
                assert(err.message.includes("cannot run before the 24-hour"));
                return true;
            }
        );
        console.log("✔ Test 1 Passed: Under-24h issue correctly rejected with 400 Bad Request");

        // ---------------------------------------------------------------------
        // TEST 2: Analysis excludes comments posted after 24h cutoff
        // ---------------------------------------------------------------------
        console.log("\n--- Test 2: Comments posted after 24h cutoff are strictly excluded ---");
        const analysisResult = await analyzeIssueCommentsUseCase.execute(eligibleIssue._id.toString(), now);

        // Verify only 2 comments were sent to AI (commentAfterCutoff excluded)
        assert.equal(mockAIService.lastPassedComments.length, 2);
        assert.equal(mockAIService.lastPassedComments.some((c) => c.id === commentAfterCutoff._id.toString()), false);
        assert.equal(analysisResult.totalEligibleComments, 2);
        assert.equal(analysisResult.status, AIAnalysisStatus.COMPLETED);
        assert.equal(analysisResult.score, 100);
        assert.equal(analysisResult.overallClassification, AIOverallClassification.COMMUNITY_LEANING_SUPPORT);
        console.log("✔ Test 2 Passed: Comments after cutoff strictly excluded; 2 eligible comments analyzed");

        // ---------------------------------------------------------------------
        // TEST 3: Stored analysis retrieved without re-triggering AI service (Idempotency)
        // ---------------------------------------------------------------------
        console.log("\n--- Test 3: Idempotency & cached retrieval ---");
        const initialCallCount = mockAIService.callCount;
        const retrievedAnalysis = await getIssueAIAnalysisUseCase.execute(eligibleIssue._id.toString(), now);

        assert.equal(mockAIService.callCount, initialCallCount, "AI service must NOT be called again");
        assert.equal(retrievedAnalysis.id, analysisResult.id);
        assert.equal(retrievedAnalysis.score, 100);
        console.log("✔ Test 3 Passed: Analysis retrieved idempotently without duplicate AI invocation");

        // ---------------------------------------------------------------------
        // TEST 4: Issue without comments yields INSUFFICIENT_DATA and score: null
        // ---------------------------------------------------------------------
        console.log("\n--- Test 4: Issue with 0 comments produces INSUFFICIENT_DATA and score null ---");
        const emptyIssue = await IssueModel.create({
            createdBy: reporterUser._id,
            title: "Silent Issue Without Comments",
            description: "No community comments were posted on this issue.",
            category: testCategory._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: { address: "Quiet Lane", coordinates: { latitude: 12.8, longitude: 77.5 } },
            status: IssueStatus.REPORTED,
            createdAt: time26HoursAgo,
            updatedAt: time26HoursAgo,
        });
        createdIssueIds.push(emptyIssue._id as Types.ObjectId);

        const emptyAnalysis = await analyzeIssueCommentsUseCase.execute(emptyIssue._id.toString(), now);
        assert.equal(emptyAnalysis.status, AIAnalysisStatus.INSUFFICIENT_DATA);
        assert.equal(emptyAnalysis.score, null);
        assert.equal(emptyAnalysis.totalEligibleComments, 0);
        assert.equal(emptyAnalysis.overallClassification, AIOverallClassification.INSUFFICIENT_DATA);
        console.log("✔ Test 4 Passed: Zero comments correctly handled with INSUFFICIENT_DATA and null score");

        // ---------------------------------------------------------------------
        // TEST 5: AI failure does NOT change issue status (Issue remains REPORTED)
        // ---------------------------------------------------------------------
        console.log("\n--- Test 5: AI failure safety & issue status isolation ---");
        const failureIssue = await IssueModel.create({
            createdBy: reporterUser._id,
            title: "Issue for AI Failure Test",
            description: "Testing error handling when Gemini is unavailable.",
            category: testCategory._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: { address: "Fault Lane", coordinates: { latitude: 12.7, longitude: 77.4 } },
            status: IssueStatus.REPORTED,
            createdAt: time26HoursAgo,
            updatedAt: time26HoursAgo,
        });
        createdIssueIds.push(failureIssue._id as Types.ObjectId);

        await IssueCommentModel.create({
            issueId: failureIssue._id,
            userId: commenterUser._id,
            body: "Some comment to trigger AI.",
            createdAt: new Date(time26HoursAgo.getTime() + 1000),
        });

        // Set mock to throw
        const failingService: IIssueAIService = {
            analyzeCommunityComments: async () => {
                throw new Error("Simulated Gemini 503 Service Unavailable");
            },
        };
        const failingUseCase = new AnalyzeIssueCommentsUseCase(
            issueRepository,
            aiAnalysisRepository,
            failingService
        );

        const failedResult = await failingUseCase.execute(failureIssue._id.toString(), now);
        assert.equal(failedResult.status, AIAnalysisStatus.FAILED);
        assert(failedResult.errorMessage?.includes("Gemini 503"));
        assert.equal(failedResult.canTriggerAnalysis, true, "Failed analysis should be retryable");

        // Verify issue status in DB is STILL REPORTED
        const checkIssue = await IssueModel.findById(failureIssue._id);
        assert.equal(checkIssue?.status, IssueStatus.REPORTED, "Issue status must remain completely unaffected by AI failure");
        console.log("✔ Test 5 Passed: AI failure marked FAILED; issue status remained REPORTED");

        // ---------------------------------------------------------------------
        // TEST 6: Admin authorization enforcement on endpoints
        // ---------------------------------------------------------------------
        console.log("\n--- Test 6: Admin authorization enforcement ---");

        // Case A: Unauthenticated request -> 401
        const unauthReq = {
            user: undefined,
            params: { issueId: eligibleIssue._id.toString() },
        } as unknown as AuthRequest;

        await assert.rejects(
            async () => {
                await new Promise<void>((resolve, reject) => {
                    const mockRes = {} as Response;
                    adminController.getIssueAIAnalysis(unauthReq, mockRes, (err?: unknown) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, 401);
                return true;
            }
        );
        console.log("✔ Unauthenticated access rejected with 401 Unauthorized");

        // Case B: Non-admin user -> 403
        const nonAdminReq = {
            user: {
                id: commenterUser._id.toString(),
                email: commenterUser.email,
                roles: [Role.USER],
                activeMode: "USER",
            },
            params: { issueId: eligibleIssue._id.toString() },
        } as unknown as AuthRequest;

        await assert.rejects(
            async () => {
                await new Promise<void>((resolve, reject) => {
                    const mockRes = {} as Response;
                    adminController.getIssueAIAnalysis(nonAdminReq, mockRes, (err?: unknown) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, 403);
                return true;
            }
        );
        console.log("✔ Non-admin access rejected with 403 Forbidden");

        // Case C: Authorized admin request -> 200
        let responsePayload: unknown = null;
        let statusCode = 0;
        const adminReq = {
            user: {
                id: adminUser._id.toString(),
                email: adminUser.email,
                roles: [Role.ADMIN],
                activeMode: "USER",
            },
            params: { issueId: eligibleIssue._id.toString() },
        } as unknown as AuthRequest;

        await new Promise<void>((resolve, reject) => {
            const adminRes = {
                status: (code: number) => {
                    statusCode = code;
                    return {
                        json: (data: unknown) => {
                            responsePayload = data;
                            resolve();
                        },
                    };
                },
            } as unknown as Response;

            adminController.getIssueAIAnalysis(adminReq, adminRes, (err?: unknown) => {
                if (err) reject(err);
                else resolve();
            });
        });

        assert.equal(statusCode, 200);
        assert((responsePayload as { success: boolean; analysis: unknown }).success === true);
        console.log("✔ Authorized admin successfully retrieved analysis via controller");

        console.log("\n=== All 6 JanAI Backend Tests Passed Successfully! ===");
    } finally {
        // Clean up test documents
        console.log("\nCleaning up test documents...");
        if (createdIssueIds.length > 0) {
            await IssueAIAnalysisModel.deleteMany({ issueId: { $in: createdIssueIds } });
            await IssueCommentModel.deleteMany({ issueId: { $in: createdIssueIds } });
            await IssueModel.deleteMany({ _id: { $in: createdIssueIds } });
        }
        if (createdUserIds.length > 0) {
            await UserModel.deleteMany({ _id: { $in: createdUserIds } });
        }
        if (createdCategoryIds.length > 0) {
            await CategoryModel.deleteMany({ _id: { $in: createdCategoryIds } });
        }
        await mongoose.disconnect();
        console.log("Database disconnected.");
    }
}

runJanAITests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
