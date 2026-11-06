import assert from "node:assert/strict";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import { Role } from "../domain/enums/Role.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";
import { ApplicationStatus } from "../domain/enums/ApplicationStatus.js";
import { ProviderStatus } from "../domain/enums/ProviderStatus.js";
import { ProviderType } from "../domain/enums/ProviderType.js";
import { ProposalStatus } from "../domain/enums/ProposalStatus.js";
import { ProposalWindowStatus } from "../domain/enums/ProposalWindowStatus.js";
import { NgoParticipationMode } from "../domain/enums/NgoParticipationMode.js";
import { IssueModel } from "../infrastructure/models/IssueModel.js";
import { UserModel } from "../infrastructure/models/UserModel.js";
import { CategoryModel } from "../infrastructure/models/CategoryModel.js";
import { ProposalModel } from "../infrastructure/models/ProposalModel.js";
import { IssueRepository } from "../infrastructure/repositories/IssueRepository.js";
import { UserRepository } from "../infrastructure/repositories/UserRepository.js";
import { ProposalRepository } from "../infrastructure/repositories/ProposalRepository.js";
import { SubmitProposalUseCase } from "../application/use-cases/provider/SubmitProposalUseCase.js";
import { GetProviderProposalUseCase } from "../application/use-cases/provider/GetProviderProposalUseCase.js";
import { UpdateProposalUseCase } from "../application/use-cases/provider/UpdateProposalUseCase.js";
import { WithdrawProposalUseCase } from "../application/use-cases/provider/WithdrawProposalUseCase.js";
import { GetProviderIssuesUseCase } from "../application/use-cases/provider/GetProviderIssuesUseCase.js";
import { GetProviderIssueDetailsUseCase } from "../application/use-cases/provider/GetProviderIssueDetailsUseCase.js";
import ApiError from "../shared/utils/apiError.js";

dotenv.config();

const mockStorageService = {
    upload: async () => ({} as never),
    getPresignedUrl: async (key: string) => `https://s3/mock-view/${key}`,
    delete: async () => {},
};

async function runProposalTests() {
    console.log("=== Starting Proposal Submission & Lifecycle Tests ===");

    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    await CategoryModel.init();
    await ProposalModel.init();
    await IssueModel.init();
    await UserModel.init();

    const category = await CategoryModel.create({
        name: `Proposal Test Cat ${Date.now()}`,
        description: "Category for proposal tests",
        isActive: true,
    });

    const issueRepository = new IssueRepository();
    const userRepository = new UserRepository();
    const proposalRepository = new ProposalRepository();

    const submitProposalUseCase = new SubmitProposalUseCase(
        issueRepository,
        proposalRepository,
        userRepository
    );
    const getProviderProposalUseCase = new GetProviderProposalUseCase(proposalRepository);
    const updateProposalUseCase = new UpdateProposalUseCase(issueRepository, proposalRepository);
    const withdrawProposalUseCase = new WithdrawProposalUseCase(issueRepository, proposalRepository);
    const getProviderIssuesUseCase = new GetProviderIssuesUseCase(
        issueRepository,
        proposalRepository,
        mockStorageService
    );
    const getProviderIssueDetailsUseCase = new GetProviderIssueDetailsUseCase(
        issueRepository,
        proposalRepository,
        mockStorageService
    );

    // 1. Create a verified issue with open proposal window
    const now = new Date();
    const deadline = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const verifiedIssueDoc = await IssueModel.create({
        createdBy: new Types.ObjectId(),
        title: "Pothole on Main Road",
        description: "Deep pothole causing traffic obstruction",
        category: category._id,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: {
            address: "123 Main St",
            coordinates: { latitude: 12.9716, longitude: 77.5946 },
        },
        status: IssueStatus.VERIFIED,
        proposalOpenedAt: now,
        proposalDeadlineAt: deadline,
        proposalWindowStatus: ProposalWindowStatus.OPEN,
    });
    const verifiedIssueId = verifiedIssueDoc._id.toString();

    // 2. Create an unverified issue (REPORTED)
    const reportedIssueDoc = await IssueModel.create({
        createdBy: new Types.ObjectId(),
        title: "Unverified Issue",
        description: "Needs community review",
        category: category._id,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: {
            address: "456 Oak Rd",
            coordinates: { latitude: 12.9716, longitude: 77.5946 },
        },
        status: IssueStatus.REPORTED,
    });
    const reportedIssueId = reportedIssueDoc._id.toString();

    // 3. Create an active Individual Provider User
    const individualUser = await UserModel.create({
        fullName: "Ramesh Sharma",
        email: `ramesh_${Date.now()}@test.com`,
        password: "hashedPassword123",
        roles: [Role.USER, Role.SERVICE_PROVIDER],
        accountStatus: AccountStatus.ACTIVE,
        providerProfile: {
            identity: {
                providerType: ProviderType.INDIVIDUAL,
                providerName: "Ramesh Services",
                phone: "9876543210",
            },
            status: {
                applicationStatus: ApplicationStatus.APPROVED,
                providerStatus: ProviderStatus.ACTIVE,
            },
        },
    });
    const individualId = individualUser._id.toString();

    // 4. Create an active NGO Provider User
    const ngoUser = await UserModel.create({
        fullName: "Green Earth NGO",
        email: `ngo_${Date.now()}@test.com`,
        password: "hashedPassword123",
        roles: [Role.USER, Role.SERVICE_PROVIDER],
        accountStatus: AccountStatus.ACTIVE,
        providerProfile: {
            identity: {
                providerType: ProviderType.NGO,
                providerName: "Green Earth Organization",
                phone: "9876543211",
            },
            status: {
                applicationStatus: ApplicationStatus.APPROVED,
                providerStatus: ProviderStatus.ACTIVE,
            },
        },
    });
    const ngoId = ngoUser._id.toString();

    console.log("Setting up tests...");

    // Test 1: Ineligible Issue (REPORTED status) must be rejected
    await assert.rejects(
        async () => {
            await submitProposalUseCase.execute(reportedIssueId, individualId, {
                estimatedTeamSize: 2,
                estimatedDurationHours: 6,
                expectedStartDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                budgetItems: [{ heading: "Tools", amountRupees: 500 }],
                executionRoadmap: [
                    {
                        heading: "Prep",
                        description: "Prepare tools",
                        startTime: "09:00",
                        endTime: "10:00",
                    },
                ],
            });
        },
        (err: unknown) => {
            assert(err instanceof ApiError);
            assert.strictEqual(err.statusCode, 400);
            assert(err.message.includes("verified issues"));
            return true;
        },
        "Should reject proposal for non-verified issue"
    );
    console.log("✓ Test 1 Passed: Rejected non-verified issue");

    // Test 2: Overlapping Roadmap intervals must be rejected
    await assert.rejects(
        async () => {
            await submitProposalUseCase.execute(verifiedIssueId, individualId, {
                estimatedTeamSize: 3,
                estimatedDurationHours: 5,
                expectedStartDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                budgetItems: [{ heading: "Tar & Gravel", amountRupees: 2500 }],
                executionRoadmap: [
                    {
                        heading: "Paving",
                        description: "Paving road",
                        startTime: "08:00",
                        endTime: "10:30",
                    },
                    {
                        heading: "Compaction",
                        description: "Compacting surface",
                        startTime: "10:00", // Overlaps with 10:30!
                        endTime: "12:00",
                    },
                ],
            });
        },
        (err: unknown) => {
            assert(err instanceof ApiError);
            assert.strictEqual(err.statusCode, 400);
            assert(err.message.includes("conflict") || err.message.includes("overlaps"));
            return true;
        },
        "Should reject overlapping roadmap intervals"
    );
    console.log("✓ Test 2 Passed: Rejected overlapping roadmap intervals");

    // Test 3: Valid Individual Proposal submission
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString();
    const proposalRes = await submitProposalUseCase.execute(verifiedIssueId, individualId, {
        estimatedTeamSize: 4,
        estimatedDurationHours: 8,
        expectedStartDate: futureDate,
        budgetItems: [
            { heading: "Cold Mix Asphalt", amountRupees: 8000 },
            { heading: "Transportation", amountRupees: 1500.5 },
        ],
        executionRoadmap: [
            {
                heading: "Site Prep & Barricading",
                description: "Set up safety cones and clear debris",
                startTime: "08:00",
                endTime: "09:30",
            },
            {
                heading: "Asphalt Laying",
                description: "Fill pothole with asphalt and compact",
                startTime: "09:30",
                endTime: "13:00",
            },
        ],
    });

    assert.strictEqual(proposalRes.status, ProposalStatus.SUBMITTED);
    assert.strictEqual(proposalRes.providerType, ProviderType.INDIVIDUAL);
    assert.strictEqual(proposalRes.totalBudgetPaise, 950050); // 8000*100 + 1500.5*100
    assert.strictEqual(proposalRes.totalBudgetRupees, 9500.5);
    assert.strictEqual(proposalRes.budgetItems.length, 2);
    assert.strictEqual(proposalRes.executionRoadmap.length, 2);
    console.log("✓ Test 3 Passed: Individual proposal submitted and total budget calculated");

    // Test 4: Duplicate Submission must be rejected with Conflict (409)
    await assert.rejects(
        async () => {
            await submitProposalUseCase.execute(verifiedIssueId, individualId, {
                estimatedTeamSize: 4,
                estimatedDurationHours: 8,
                expectedStartDate: futureDate,
                budgetItems: [{ heading: "Asphalt", amountRupees: 5000 }],
                executionRoadmap: [
                    {
                        heading: "Repair",
                        description: "Repair",
                        startTime: "08:00",
                        endTime: "12:00",
                    },
                ],
            });
        },
        (err: unknown) => {
            assert(err instanceof ApiError);
            assert.strictEqual(err.statusCode, 409);
            return true;
        },
        "Should reject duplicate proposal submission"
    );
    console.log("✓ Test 4 Passed: Rejected duplicate proposal submission");

    // Test 5: Retrieve own proposal
    const retrieved = await getProviderProposalUseCase.execute(verifiedIssueId, individualId);
    assert(retrieved !== null);
    assert.strictEqual(retrieved.id, proposalRes.id);
    assert.strictEqual(retrieved.totalBudgetRupees, 9500.5);
    console.log("✓ Test 5 Passed: Successfully retrieved own proposal");

    // Test 6: Update own proposal before deadline
    const updated = await updateProposalUseCase.execute(verifiedIssueId, individualId, {
        estimatedDurationHours: 10,
        budgetItems: [
            { heading: "Cold Mix Asphalt", amountRupees: 9000 },
            { heading: "Transportation", amountRupees: 2000 },
        ],
    });
    assert.strictEqual(updated.estimatedDurationHours, 10);
    assert.strictEqual(updated.totalBudgetRupees, 11000);
    assert.strictEqual(updated.totalBudgetPaise, 1100000);
    console.log("✓ Test 6 Passed: Successfully updated proposal before deadline");

    // Test 7: NGO Proposal with conditional fields
    const ngoProposal = await submitProposalUseCase.execute(verifiedIssueId, ngoId, {
        estimatedTeamSize: 5,
        estimatedDurationHours: 6,
        expectedStartDate: futureDate,
        budgetItems: [{ heading: "Supplies", amountRupees: 12000 }],
        executionRoadmap: [
            {
                heading: "Community Repair",
                description: "Work with volunteer group",
                startTime: "09:00",
                endTime: "15:00",
            },
        ],
        ngoDetails: {
            requiresFunding: false,
            participationMode: NgoParticipationMode.OPEN_COMMUNITY,
            expectedParticipants: 20,
            requiresCommunityChat: true,
        },
    });

    assert.strictEqual(ngoProposal.providerType, ProviderType.NGO);
    assert(ngoProposal.ngoDetails !== undefined);
    assert.strictEqual(ngoProposal.ngoDetails.requiresFunding, false);
    assert.strictEqual(ngoProposal.ngoDetails.participationMode, "OPEN_COMMUNITY");
    assert.strictEqual(ngoProposal.ngoDetails.expectedParticipants, 20);
    assert.strictEqual(ngoProposal.ngoDetails.requiresCommunityChat, true);
    console.log("✓ Test 7 Passed: NGO proposal with conditional fields accepted");

    // Test 8: Provider Issue Listing reflects proposal counts and hasSubmittedProposal
    const providerListing = await getProviderIssuesUseCase.execute(individualId, 1, 10);
    const issueInFeed = providerListing.items.find((i) => i.id === verifiedIssueId);
    assert(issueInFeed !== undefined);
    assert.strictEqual(issueInFeed.hasSubmittedProposal, true);
    assert.strictEqual(issueInFeed.proposalCount, 2); // 1 Individual + 1 NGO
    console.log("✓ Test 8 Passed: Provider feed shows proposalCount = 2 and hasSubmittedProposal = true");

    // Test 9: Provider Issue Details reflects proposalCount and hasSubmittedProposal
    const issueDetails = await getProviderIssueDetailsUseCase.execute(verifiedIssueId, individualId);
    assert.strictEqual(issueDetails.hasSubmittedProposal, true);
    assert.strictEqual(issueDetails.proposalCount, 2);
    console.log("✓ Test 9 Passed: Issue details shows proposalCount = 2 and hasSubmittedProposal = true");

    // Test 10: Withdraw proposal
    const withdrawRes = await withdrawProposalUseCase.execute(verifiedIssueId, individualId);
    assert.strictEqual(withdrawRes.success, true);

    const postWithdrawDetails = await getProviderIssueDetailsUseCase.execute(verifiedIssueId, individualId);
    assert.strictEqual(postWithdrawDetails.hasSubmittedProposal, false);
    assert.strictEqual(postWithdrawDetails.proposalCount, 1); // Only NGO proposal remains active
    console.log("✓ Test 10 Passed: Withdrawn proposal excluded from count and active state");

    // Test 11: Resubmission of withdrawn proposal updates and reactivates it
    const resubmitted = await submitProposalUseCase.execute(verifiedIssueId, individualId, {
        estimatedTeamSize: 6,
        estimatedDurationHours: 12,
        expectedStartDate: futureDate,
        budgetItems: [{ heading: "Final Asphalt Materials", amountRupees: 10000 }],
        executionRoadmap: [
            {
                heading: "Full Day Repair",
                description: "Complete repair",
                startTime: "07:00",
                endTime: "16:00",
            },
        ],
    });
    assert.strictEqual(resubmitted.id, proposalRes.id); // Same record ID!
    assert.strictEqual(resubmitted.status, ProposalStatus.SUBMITTED);
    assert.strictEqual(resubmitted.totalBudgetRupees, 10000);

    const postResubmitDetails = await getProviderIssueDetailsUseCase.execute(verifiedIssueId, individualId);
    assert.strictEqual(postResubmitDetails.hasSubmittedProposal, true);
    assert.strictEqual(postResubmitDetails.proposalCount, 2);
    console.log("✓ Test 11 Passed: Resubmitted proposal reactivates existing document without duplicates");

    // Test 12: Expired Deadline rejects submission
    const expiredIssueDoc = await IssueModel.create({
        createdBy: new Types.ObjectId(),
        title: "Expired Window Issue",
        description: "Window passed",
        category: category._id,
        images: [],
        visibility: IssueVisibility.PUBLIC,
        location: {
            address: "789 Pine St",
            coordinates: { latitude: 12.9716, longitude: 77.5946 },
        },
        status: IssueStatus.VERIFIED,
        proposalOpenedAt: new Date(Date.now() - 86400000 * 10),
        proposalDeadlineAt: new Date(Date.now() - 86400000 * 5), // Closed 5 days ago
        proposalWindowStatus: ProposalWindowStatus.CLOSED,
    });

    await assert.rejects(
        async () => {
            await submitProposalUseCase.execute(expiredIssueDoc._id.toString(), individualId, {
                estimatedTeamSize: 2,
                estimatedDurationHours: 4,
                expectedStartDate: futureDate,
                budgetItems: [{ heading: "Tools", amountRupees: 1000 }],
                executionRoadmap: [
                    {
                        heading: "Repair",
                        description: "Repair",
                        startTime: "09:00",
                        endTime: "12:00",
                    },
                ],
            });
        },
        (err: unknown) => {
            assert(err instanceof ApiError);
            assert.strictEqual(err.statusCode, 400);
            assert(err.message.includes("closed"));
            return true;
        },
        "Should reject proposal for expired proposal window"
    );
    console.log("✓ Test 12 Passed: Rejected proposal for expired proposal window");

    // Cleanup
    await ProposalModel.deleteMany({ issueId: { $in: [verifiedIssueDoc._id, reportedIssueDoc._id, expiredIssueDoc._id] } });
    await IssueModel.deleteMany({ _id: { $in: [verifiedIssueDoc._id, reportedIssueDoc._id, expiredIssueDoc._id] } });
    await UserModel.deleteMany({ _id: { $in: [individualUser._id, ngoUser._id] } });
    await CategoryModel.deleteOne({ _id: category._id });
    await mongoose.disconnect();

    console.log("=== All 12 Proposal Tests Passed Successfully! ===");
}

runProposalTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});

