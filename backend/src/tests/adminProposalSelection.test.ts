import assert from "node:assert/strict";
import path from "node:path";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config();
import { IssueStatus } from "../domain/enums/IssueStatus.ts";
import { IssueVisibility } from "../domain/enums/IssueVisibility.ts";
import { ProviderType } from "../domain/enums/ProviderType.ts";
import { ProposalStatus } from "../domain/enums/ProposalStatus.ts";
import { ProposalWindowStatus } from "../domain/enums/ProposalWindowStatus.ts";
import { IssueModel } from "../infrastructure/models/IssueModel.ts";
import { CategoryModel } from "../infrastructure/models/CategoryModel.ts";
import { ProposalModel } from "../infrastructure/models/ProposalModel.ts";
import { ProposalSelectionRepository } from "../infrastructure/repositories/ProposalSelectionRepository.ts";
import { SelectProposalUseCase } from "../application/use-cases/admin/SelectProposalUseCase.ts";
import ApiError from "../shared/utils/apiError.ts";
import { HttpStatusCode } from "../shared/enums/HttpStatusCode.ts";

async function runProposalSelectionTests() {
    console.log("=== Starting Admin Proposal Selection Tests ===");

    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB Atlas.");

    await CategoryModel.init();
    await ProposalModel.init();
    await IssueModel.init();

    const category = await CategoryModel.create({
        name: `Selection Test Cat ${Date.now()}`,
        description: "Category for proposal selection tests",
        isActive: true,
    });

    const proposalSelectionRepository = new ProposalSelectionRepository();
    const selectProposalUseCase = new SelectProposalUseCase(proposalSelectionRepository);

    const createdIssues: Types.ObjectId[] = [];
    const createdProposals: Types.ObjectId[] = [];

    try {
        const now = new Date();
        const pastDeadline = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
        const futureDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day in future

        // -------------------------------------------------------------
        // Test 1: Successful selection after deadline
        // -------------------------------------------------------------
        console.log("\n[Test 1] Successful selection after deadline");
        const issue1 = await IssueModel.create({
            createdBy: new Types.ObjectId(),
            title: "Road Repair Test 1",
            description: "Civic road repair issue",
            category: category._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "100 MG Road",
                coordinates: { latitude: 12.97, longitude: 77.59 },
            },
            status: IssueStatus.VERIFIED,
            proposalOpenedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            proposalDeadlineAt: pastDeadline,
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        createdIssues.push(issue1._id);

        const p1 = await ProposalModel.create({
            issueId: issue1._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.INDIVIDUAL,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: { title: issue1.title, description: issue1.description },
            estimatedTeamSize: 3,
            estimatedDurationHours: 12,
            budgetItems: [{ heading: "Materials", amountPaise: 500000 }],
            totalBudgetPaise: 500000,
            executionRoadmap: [
                { heading: "Patching", description: "Fill holes", startTime: "09:00", endTime: "17:00", order: 0 },
            ],
            submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        });
        createdProposals.push(p1._id);

        const p2 = await ProposalModel.create({
            issueId: issue1._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.VOLUNTEER_GROUP,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: { title: issue1.title, description: issue1.description },
            estimatedTeamSize: 5,
            estimatedDurationHours: 16,
            budgetItems: [{ heading: "Supplies", amountPaise: 400000 }],
            totalBudgetPaise: 400000,
            executionRoadmap: [
                { heading: "Labor", description: "Pavement repair", startTime: "08:00", endTime: "16:00", order: 0 },
            ],
            submittedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        });
        createdProposals.push(p2._id);

        const p3Withdrawn = await ProposalModel.create({
            issueId: issue1._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.INDIVIDUAL,
            status: ProposalStatus.WITHDRAWN,
            issueSnapshot: { title: issue1.title, description: issue1.description },
            estimatedTeamSize: 2,
            estimatedDurationHours: 8,
            budgetItems: [{ heading: "Tools", amountPaise: 200000 }],
            totalBudgetPaise: 200000,
            executionRoadmap: [
                { heading: "Survey", description: "Inspect site", startTime: "10:00", endTime: "14:00", order: 0 },
            ],
            submittedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            withdrawnAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        });
        createdProposals.push(p3Withdrawn._id);

        const selectionResult = await selectProposalUseCase.execute(
            issue1._id.toString(),
            p1._id.toString(),
            now
        );

        assert.strictEqual(selectionResult.selectedProposalId, p1._id.toString());
        assert.strictEqual(selectionResult.selectedProposalStatus, ProposalStatus.SELECTED);
        assert.strictEqual(selectionResult.proposalWindowStatus, ProposalWindowStatus.CLOSED);

        const refreshedP1 = await ProposalModel.findById(p1._id);
        const refreshedP2 = await ProposalModel.findById(p2._id);
        const refreshedP3 = await ProposalModel.findById(p3Withdrawn._id);
        const refreshedIssue1 = await IssueModel.findById(issue1._id);

        assert.strictEqual(refreshedP1?.status, ProposalStatus.SELECTED, "P1 must be SELECTED");
        assert.strictEqual(refreshedP2?.status, ProposalStatus.NOT_SELECTED, "P2 must be NOT_SELECTED");
        assert.strictEqual(refreshedP3?.status, ProposalStatus.WITHDRAWN, "P3 must remain WITHDRAWN");
        assert.strictEqual(refreshedIssue1?.selectedProposalId?.toString(), p1._id.toString());
        assert.strictEqual(refreshedIssue1?.proposalWindowStatus, ProposalWindowStatus.CLOSED);
        assert.strictEqual(refreshedIssue1?.status, IssueStatus.FUNDRAISING, "Issue status must transition to FUNDRAISING");
        assert(refreshedIssue1?.proposalSelectedAt, "proposalSelectedAt must be populated");
        console.log("Passed: Selected proposal became SELECTED, other became NOT_SELECTED, withdrawn stayed WITHDRAWN, issue updated.");

        // -------------------------------------------------------------
        // Test 2: Repeated selection on already selected issue is rejected (409)
        // -------------------------------------------------------------
        console.log("\n[Test 2] Repeated selection rejection (409)");
        await assert.rejects(
            async () => {
                await selectProposalUseCase.execute(issue1._id.toString(), p1._id.toString(), now);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.strictEqual(err.statusCode, HttpStatusCode.CONFLICT);
                return true;
            }
        );
        console.log("Passed: Repeated selection rejected with 409 CONFLICT.");

        // -------------------------------------------------------------
        // Test 3: Selection before deadline is rejected (400)
        // -------------------------------------------------------------
        console.log("\n[Test 3] Selection before deadline rejection (400)");
        const issueFuture = await IssueModel.create({
            createdBy: new Types.ObjectId(),
            title: "Future Deadline Issue",
            description: "Issue with deadline in future",
            category: category._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "200 Residency Road",
                coordinates: { latitude: 12.97, longitude: 77.59 },
            },
            status: IssueStatus.VERIFIED,
            proposalOpenedAt: now,
            proposalDeadlineAt: futureDeadline,
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        createdIssues.push(issueFuture._id);

        const pFuture = await ProposalModel.create({
            issueId: issueFuture._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.INDIVIDUAL,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: { title: issueFuture.title, description: issueFuture.description },
            estimatedTeamSize: 2,
            estimatedDurationHours: 6,
            budgetItems: [{ heading: "Labour", amountPaise: 300000 }],
            totalBudgetPaise: 300000,
            executionRoadmap: [
                { heading: "Work", description: "Repair", startTime: "09:00", endTime: "15:00", order: 0 },
            ],
            submittedAt: now,
        });
        createdProposals.push(pFuture._id);

        await assert.rejects(
            async () => {
                await selectProposalUseCase.execute(issueFuture._id.toString(), pFuture._id.toString(), now);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.strictEqual(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert(err.message.includes("deadline"));
                return true;
            }
        );
        console.log("Passed: Selection before deadline rejected with 400 BAD_REQUEST.");

        // -------------------------------------------------------------
        // Test 4: Missing deadline rejection (400)
        // -------------------------------------------------------------
        console.log("\n[Test 4] Missing deadline rejection (400)");
        const issueNoDeadline = await IssueModel.create({
            createdBy: new Types.ObjectId(),
            title: "No Deadline Issue",
            description: "Issue without deadline",
            category: category._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "300 Brigade Road",
                coordinates: { latitude: 12.97, longitude: 77.59 },
            },
            status: IssueStatus.VERIFIED,
        });
        createdIssues.push(issueNoDeadline._id);

        const pNoDeadline = await ProposalModel.create({
            issueId: issueNoDeadline._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.INDIVIDUAL,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: { title: issueNoDeadline.title, description: issueNoDeadline.description },
            estimatedTeamSize: 1,
            estimatedDurationHours: 4,
            budgetItems: [{ heading: "Labour", amountPaise: 100000 }],
            totalBudgetPaise: 100000,
            executionRoadmap: [
                { heading: "Fix", description: "Fix issue", startTime: "10:00", endTime: "14:00", order: 0 },
            ],
            submittedAt: now,
        });
        createdProposals.push(pNoDeadline._id);

        await assert.rejects(
            async () => {
                await selectProposalUseCase.execute(issueNoDeadline._id.toString(), pNoDeadline._id.toString(), now);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.strictEqual(err.statusCode, HttpStatusCode.BAD_REQUEST);
                return true;
            }
        );
        console.log("Passed: Missing deadline rejected with 400 BAD_REQUEST.");

        // -------------------------------------------------------------
        // Test 5: Cancelled window rejection (400)
        // -------------------------------------------------------------
        console.log("\n[Test 5] Cancelled window rejection (400)");
        const issueCancelled = await IssueModel.create({
            createdBy: new Types.ObjectId(),
            title: "Cancelled Window Issue",
            description: "Issue with cancelled window",
            category: category._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "400 Church St",
                coordinates: { latitude: 12.97, longitude: 77.59 },
            },
            status: IssueStatus.VERIFIED,
            proposalDeadlineAt: pastDeadline,
            proposalWindowStatus: ProposalWindowStatus.CANCELLED,
        });
        createdIssues.push(issueCancelled._id);

        const pCancelled = await ProposalModel.create({
            issueId: issueCancelled._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.INDIVIDUAL,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: { title: issueCancelled.title, description: issueCancelled.description },
            estimatedTeamSize: 1,
            estimatedDurationHours: 4,
            budgetItems: [{ heading: "Labour", amountPaise: 100000 }],
            totalBudgetPaise: 100000,
            executionRoadmap: [
                { heading: "Fix", description: "Fix issue", startTime: "10:00", endTime: "14:00", order: 0 },
            ],
            submittedAt: now,
        });
        createdProposals.push(pCancelled._id);

        await assert.rejects(
            async () => {
                await selectProposalUseCase.execute(issueCancelled._id.toString(), pCancelled._id.toString(), now);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.strictEqual(err.statusCode, HttpStatusCode.BAD_REQUEST);
                assert(err.message.includes("cancelled"));
                return true;
            }
        );
        console.log("Passed: Cancelled window rejected with 400 BAD_REQUEST.");

        // -------------------------------------------------------------
        // Test 6: Non-VERIFIED issue rejection (400)
        // -------------------------------------------------------------
        console.log("\n[Test 6] Non-VERIFIED issue rejection (400)");
        const issueReported = await IssueModel.create({
            createdBy: new Types.ObjectId(),
            title: "Reported Status Issue",
            description: "Issue in REPORTED status",
            category: category._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "500 Indiranagar",
                coordinates: { latitude: 12.97, longitude: 77.59 },
            },
            status: IssueStatus.REPORTED,
            proposalDeadlineAt: pastDeadline,
        });
        createdIssues.push(issueReported._id);

        const pReported = await ProposalModel.create({
            issueId: issueReported._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.INDIVIDUAL,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: { title: issueReported.title, description: issueReported.description },
            estimatedTeamSize: 1,
            estimatedDurationHours: 4,
            budgetItems: [{ heading: "Labour", amountPaise: 100000 }],
            totalBudgetPaise: 100000,
            executionRoadmap: [
                { heading: "Fix", description: "Fix issue", startTime: "10:00", endTime: "14:00", order: 0 },
            ],
            submittedAt: now,
        });
        createdProposals.push(pReported._id);

        await assert.rejects(
            async () => {
                await selectProposalUseCase.execute(issueReported._id.toString(), pReported._id.toString(), now);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.strictEqual(err.statusCode, HttpStatusCode.BAD_REQUEST);
                return true;
            }
        );
        console.log("Passed: Non-VERIFIED issue rejected with 400 BAD_REQUEST.");

        // -------------------------------------------------------------
        // Test 7: Proposal belonging to another issue rejection (404)
        // -------------------------------------------------------------
        console.log("\n[Test 7] Proposal belonging to another issue rejection (404)");
        const issueOther = await IssueModel.create({
            createdBy: new Types.ObjectId(),
            title: "Other Issue",
            description: "Different issue",
            category: category._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "600 Koramangala",
                coordinates: { latitude: 12.93, longitude: 77.62 },
            },
            status: IssueStatus.VERIFIED,
            proposalDeadlineAt: pastDeadline,
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        createdIssues.push(issueOther._id);

        await assert.rejects(
            async () => {
                // pReported belongs to issueReported, not issueOther
                await selectProposalUseCase.execute(issueOther._id.toString(), pReported._id.toString(), now);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.strictEqual(err.statusCode, HttpStatusCode.NOT_FOUND);
                return true;
            }
        );
        console.log("Passed: Proposal mismatch rejected with 404 NOT_FOUND.");

        // -------------------------------------------------------------
        // Test 8: Withdrawn proposal selection rejection (409)
        // -------------------------------------------------------------
        console.log("\n[Test 8] Withdrawn proposal selection rejection (409)");
        await assert.rejects(
            async () => {
                await selectProposalUseCase.execute(issue1._id.toString(), p3Withdrawn._id.toString(), now);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.strictEqual(err.statusCode, HttpStatusCode.CONFLICT);
                return true;
            }
        );
        console.log("Passed: Withdrawn proposal selection rejected with 409 CONFLICT.");

        // -------------------------------------------------------------
        // Test 9: Concurrency protection (two simultaneous selections on same issue)
        // -------------------------------------------------------------
        console.log("\n[Test 9] Concurrency protection (2 simultaneous selections)");
        const issueConcurrent = await IssueModel.create({
            createdBy: new Types.ObjectId(),
            title: "Concurrency Test Issue",
            description: "Issue for concurrent selection test",
            category: category._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "700 Whitefield",
                coordinates: { latitude: 12.96, longitude: 77.74 },
            },
            status: IssueStatus.VERIFIED,
            proposalDeadlineAt: pastDeadline,
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        createdIssues.push(issueConcurrent._id);

        const pConcA = await ProposalModel.create({
            issueId: issueConcurrent._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.INDIVIDUAL,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: { title: issueConcurrent.title, description: issueConcurrent.description },
            estimatedTeamSize: 2,
            estimatedDurationHours: 6,
            budgetItems: [{ heading: "Labour", amountPaise: 200000 }],
            totalBudgetPaise: 200000,
            executionRoadmap: [
                { heading: "Fix", description: "Fix issue", startTime: "10:00", endTime: "14:00", order: 0 },
            ],
            submittedAt: now,
        });
        createdProposals.push(pConcA._id);

        const pConcB = await ProposalModel.create({
            issueId: issueConcurrent._id,
            providerId: new Types.ObjectId(),
            providerType: ProviderType.VOLUNTEER_GROUP,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: { title: issueConcurrent.title, description: issueConcurrent.description },
            estimatedTeamSize: 4,
            estimatedDurationHours: 8,
            budgetItems: [{ heading: "Materials", amountPaise: 300000 }],
            totalBudgetPaise: 300000,
            executionRoadmap: [
                { heading: "Repair", description: "Full repair", startTime: "09:00", endTime: "17:00", order: 0 },
            ],
            submittedAt: now,
        });
        createdProposals.push(pConcB._id);

        const results = await Promise.allSettled([
            selectProposalUseCase.execute(issueConcurrent._id.toString(), pConcA._id.toString(), now),
            selectProposalUseCase.execute(issueConcurrent._id.toString(), pConcB._id.toString(), now),
        ]);

        const fulfilled = results.filter((r) => r.status === "fulfilled");
        const rejected = results.filter((r) => r.status === "rejected");

        assert.strictEqual(fulfilled.length, 1, "Exactly one concurrent selection must succeed");
        assert.strictEqual(rejected.length, 1, "Exactly one concurrent selection must be rejected");

        const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
        assert(rejectedReason instanceof ApiError);
        assert.strictEqual(rejectedReason.statusCode, HttpStatusCode.CONFLICT);

        const finalIssue = await IssueModel.findById(issueConcurrent._id);
        const finalPConcA = await ProposalModel.findById(pConcA._id);
        const finalPConcB = await ProposalModel.findById(pConcB._id);

        const selectedCount = [finalPConcA?.status, finalPConcB?.status].filter(
            (s) => s === ProposalStatus.SELECTED
        ).length;
        const notSelectedCount = [finalPConcA?.status, finalPConcB?.status].filter(
            (s) => s === ProposalStatus.NOT_SELECTED
        ).length;

        assert.strictEqual(selectedCount, 1, "Exactly one proposal must be SELECTED");
        assert.strictEqual(notSelectedCount, 1, "Exactly one proposal must be NOT_SELECTED");
        assert(finalIssue?.selectedProposalId, "Issue must have a selectedProposalId");
        console.log("Passed: Concurrency protection guaranteed exactly one winner, concurrent request failed with 409.");

        console.log("\n=== ALL ADMIN PROPOSAL SELECTION TESTS PASSED! ===");
    } finally {
        // Clean up test data
        if (createdProposals.length > 0) {
            await ProposalModel.deleteMany({ _id: { $in: createdProposals } });
        }
        if (createdIssues.length > 0) {
            await IssueModel.deleteMany({ _id: { $in: createdIssues } });
        }
        await CategoryModel.deleteOne({ _id: category._id });
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

runProposalSelectionTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});

