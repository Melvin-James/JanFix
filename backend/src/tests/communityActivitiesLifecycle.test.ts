import assert from "node:assert/strict";
import path from "node:path";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config();

import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import { ProviderType } from "../domain/enums/ProviderType.js";
import { ProposalStatus } from "../domain/enums/ProposalStatus.js";
import { ProposalFundingType } from "../domain/enums/ProposalFundingType.js";
import { ProposalWindowStatus } from "../domain/enums/ProposalWindowStatus.js";
import { NgoParticipationMode } from "../domain/enums/NgoParticipationMode.js";
import { Role } from "../domain/enums/Role.js";
import { AuthProvider } from "../domain/enums/AuthProvider.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";
import { ProviderStatus } from "../domain/enums/ProviderStatus.js";
import { IssueModel } from "../infrastructure/models/IssueModel.js";
import { CategoryModel } from "../infrastructure/models/CategoryModel.js";
import { ProposalModel } from "../infrastructure/models/ProposalModel.js";
import { UserModel } from "../infrastructure/models/UserModel.js";
import { ProposalRepository } from "../infrastructure/repositories/ProposalRepository.js";
import { IssueRepository } from "../infrastructure/repositories/IssueRepository.js";
import { UserRepository } from "../infrastructure/repositories/UserRepository.js";
import { NotificationRepository } from "../infrastructure/repositories/NotificationRepository.js";
import { ProposalSelectionRepository } from "../infrastructure/repositories/ProposalSelectionRepository.js";
import { SelectProposalUseCase } from "../application/use-cases/admin/SelectProposalUseCase.js";
import { GetIssueByIdUseCase } from "../application/use-cases/issue/GetIssueByIdUseCase.js";
import type { IStorageService } from "../application/services/IStorageService.js";

class MockStorageService implements IStorageService {
    async upload() {
        return { key: "mock-key", originalName: "file.jpg", mimeType: "image/jpeg", size: 1000, url: "https://example.com/file.jpg" };
    }
    async getPresignedUrl(key: string) {
        return `https://cdn.example.com/${key}`;
    }
    async delete() {}
}

async function runTests() {
    console.log("=== JanFix Community Activities Lifecycle & Separation of Concerns Test ===");

    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    await CategoryModel.init();
    await UserModel.init();
    await ProposalModel.init();
    await IssueModel.init();

    const mockStorage = new MockStorageService();
    const proposalRepo = new ProposalRepository();
    const issueRepo = new IssueRepository();
    const userRepo = new UserRepository();
    const notifRepo = new NotificationRepository();
    const selectionRepo = new ProposalSelectionRepository();

    const selectProposalUseCase = new SelectProposalUseCase(
        selectionRepo,
        proposalRepo,
        issueRepo,
        notifRepo
    );

    const getIssueByIdUseCase = new GetIssueByIdUseCase(
        issueRepo,
        mockStorage,
        proposalRepo,
        userRepo
    );

    const createdCategoryIds: Types.ObjectId[] = [];
    const createdUserIds: Types.ObjectId[] = [];
    const createdIssueIds: Types.ObjectId[] = [];
    const createdProposalIds: Types.ObjectId[] = [];

    try {
        // Setup Category
        const categoryDoc = await CategoryModel.create({
            name: `Civic Cleanliness ${Date.now()}`,
            description: "Category for community civic activities",
            isActive: true,
        });
        createdCategoryIds.push(categoryDoc._id);

        const reporterId = new Types.ObjectId();
        const ngoUserId = new Types.ObjectId();
        const contractorId = new Types.ObjectId();

        // Setup Reporter User
        await UserModel.create({
            _id: reporterId,
            fullName: "Civic Activist Reporter",
            email: `reporter_${Date.now()}@janfix.org`,
            password: "hashedpassword123",
            authProvider: AuthProvider.LOCAL,
            accountStatus: AccountStatus.ACTIVE,
            activeMode: "USER",
            isVerified: true,
            roles: [Role.USER],
        });
        createdUserIds.push(reporterId);

        // Setup NGO Provider 1
        await UserModel.create({
            _id: ngoUserId,
            fullName: "Green Earth Foundation",
            email: `green_ngo_${Date.now()}@ngo.org`,
            password: "hashedpassword123",
            authProvider: AuthProvider.LOCAL,
            accountStatus: AccountStatus.ACTIVE,
            activeMode: "SERVICE_PROVIDER",
            isVerified: true,
            roles: [Role.SERVICE_PROVIDER],
            providerProfile: {
                identity: {
                    providerType: ProviderType.NGO,
                    providerName: "Green Earth Foundation",
                },
                providerStatus: ProviderStatus.ACTIVE,
            },
        });
        createdUserIds.push(ngoUserId);

        // Setup Contractor Provider 2
        await UserModel.create({
            _id: contractorId,
            fullName: "Alpha Civic Works",
            email: `alpha_${Date.now()}@contractor.com`,
            password: "hashedpassword123",
            authProvider: AuthProvider.LOCAL,
            accountStatus: AccountStatus.ACTIVE,
            activeMode: "SERVICE_PROVIDER",
            isVerified: true,
            roles: [Role.SERVICE_PROVIDER],
            providerProfile: {
                identity: {
                    providerType: ProviderType.INDIVIDUAL,
                    providerName: "Alpha Civic Works",
                },
                providerStatus: ProviderStatus.ACTIVE,
            },
        });
        createdUserIds.push(contractorId);

        console.log("✓ Test setup completed: Created Category, Users, and Providers.");

        // =========================================================================
        // TEST 1: Issue creation defaults isCommunityIssue to false
        // =========================================================================
        console.log("\n[Test 1] Issue creation defaults isCommunityIssue to false");
        const issueDoc1 = await IssueModel.create({
            createdBy: reporterId,
            title: "Pothole Repair on Main Street",
            description: "Large road hazards needing resurfacing.",
            category: categoryDoc._id,
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "Main Street 101, City Center",
                coordinates: { latitude: 12.9716, longitude: 77.5946 },
            },
            status: IssueStatus.VERIFIED,
            proposalDeadlineAt: new Date(Date.now() - 10000), // Deadline passed
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        createdIssueIds.push(issueDoc1._id);

        assert.equal(issueDoc1.isCommunityIssue, false, "New issue must default isCommunityIssue to false");
        const mappedIssue1 = await issueRepo.findById(issueDoc1._id.toString());
        assert(mappedIssue1, "Issue must exist");
        assert.equal(mappedIssue1.isCommunityIssue, false, "Repository must return isCommunityIssue = false");
        console.log("  ✓ Issue defaults isCommunityIssue to false in DB and Domain entity");

        // =========================================================================
        // TEST 2: Select Proposal with TEAM_ONLY mode -> isCommunityIssue remains false
        // =========================================================================
        console.log("\n[Test 2] Select Proposal with TEAM_ONLY mode -> isCommunityIssue remains false");
        const proposalTeamOnly = await ProposalModel.create({
            issueId: issueDoc1._id,
            providerId: ngoUserId,
            providerType: ProviderType.NGO,
            status: ProposalStatus.SUBMITTED,
            fundingType: ProposalFundingType.COMMUNITY_FUNDING,
            issueSnapshot: { title: issueDoc1.title, description: issueDoc1.description },
            estimatedTeamSize: 4,
            estimatedDurationHours: 12,
            budgetItems: [{ heading: "Materials", amountPaise: 400000 }],
            totalBudgetPaise: 400000,
            executionRoadmap: [{ heading: "Resurfacing", description: "Paving asphalt", startTime: "08:00", endTime: "16:00", order: 1 }],
            ngoDetails: {
                requiresFunding: true,
                participationMode: NgoParticipationMode.TEAM_ONLY,
                requiresCommunityChat: false,
            },
            submittedAt: new Date(),
        });
        createdProposalIds.push(proposalTeamOnly._id);

        const selectResultTeamOnly = await selectProposalUseCase.execute(
            issueDoc1._id.toString(),
            proposalTeamOnly._id.toString()
        );

        assert.equal(selectResultTeamOnly.isCommunityIssue, false, "TEAM_ONLY proposal must result in isCommunityIssue: false");
        const issueAfterTeamOnly = await IssueModel.findById(issueDoc1._id);
        assert.equal(issueAfterTeamOnly?.isCommunityIssue, false, "Database issue must have isCommunityIssue: false");
        console.log("  ✓ TEAM_ONLY proposal selected preserves isCommunityIssue: false");

        // =========================================================================
        // TEST 3: Select Proposal with OPEN_COMMUNITY mode -> isCommunityIssue becomes true (Community Funded)
        // =========================================================================
        console.log("\n[Test 3] Select Proposal with OPEN_COMMUNITY mode (Community Funded) -> isCommunityIssue becomes true");
        const issueDoc2 = await IssueModel.create({
            createdBy: reporterId,
            title: "Park Cleanliness & Tree Planting Drive",
            description: "Community greening and litter removal in public park.",
            category: categoryDoc._id,
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "Central Park Road",
                coordinates: { latitude: 12.9720, longitude: 77.5950 },
            },
            status: IssueStatus.VERIFIED,
            proposalDeadlineAt: new Date(Date.now() - 10000),
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        createdIssueIds.push(issueDoc2._id);

        const proposalOpenCommunity = await ProposalModel.create({
            issueId: issueDoc2._id,
            providerId: ngoUserId,
            providerType: ProviderType.NGO,
            status: ProposalStatus.SUBMITTED,
            fundingType: ProposalFundingType.COMMUNITY_FUNDING,
            issueSnapshot: { title: issueDoc2.title, description: issueDoc2.description },
            estimatedTeamSize: 6,
            estimatedDurationHours: 8,
            budgetItems: [{ heading: "Saplings & Tools", amountPaise: 250000 }],
            totalBudgetPaise: 250000,
            executionRoadmap: [{ heading: "Volunteer Planting", description: "Hands-on planting session", startTime: "09:00", endTime: "13:00", order: 1 }],
            ngoDetails: {
                requiresFunding: true,
                participationMode: NgoParticipationMode.OPEN_COMMUNITY,
                expectedParticipants: 25,
                requiresCommunityChat: true,
            },
            submittedAt: new Date(),
        });
        createdProposalIds.push(proposalOpenCommunity._id);

        const selectResultOpen = await selectProposalUseCase.execute(
            issueDoc2._id.toString(),
            proposalOpenCommunity._id.toString()
        );

        assert.equal(selectResultOpen.isCommunityIssue, true, "OPEN_COMMUNITY proposal must result in isCommunityIssue: true");
        assert.equal(selectResultOpen.issueStatus, IssueStatus.FUNDRAISING, "Community funding proposal transitions to FUNDRAISING");
        const issueAfterOpen = await IssueModel.findById(issueDoc2._id);
        assert.equal(issueAfterOpen?.isCommunityIssue, true, "Database issue must have isCommunityIssue: true");
        console.log("  ✓ OPEN_COMMUNITY proposal atomically set isCommunityIssue: true on issue in FUNDRAISING status");

        // =========================================================================
        // TEST 4: Separation of Concerns: NGO_OWN_FUNDING with OPEN_COMMUNITY -> isCommunityIssue: true & PLANNED
        // =========================================================================
        console.log("\n[Test 4] NGO_OWN_FUNDING with OPEN_COMMUNITY -> isCommunityIssue: true & PLANNED");
        const issueDoc3 = await IssueModel.create({
            createdBy: reporterId,
            title: "Beach Cleanup Drive",
            description: "Weekend beach plastic recovery with volunteer citizens.",
            category: categoryDoc._id,
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "Marina Beachfront",
                coordinates: { latitude: 13.0475, longitude: 80.2824 },
            },
            status: IssueStatus.VERIFIED,
            proposalDeadlineAt: new Date(Date.now() - 10000),
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        createdIssueIds.push(issueDoc3._id);

        const proposalNgoOwnOpen = await ProposalModel.create({
            issueId: issueDoc3._id,
            providerId: ngoUserId,
            providerType: ProviderType.NGO,
            status: ProposalStatus.SUBMITTED,
            fundingType: ProposalFundingType.NGO_OWN_FUNDING, // Own-funded!
            issueSnapshot: { title: issueDoc3.title, description: issueDoc3.description },
            estimatedTeamSize: 10,
            estimatedDurationHours: 6,
            budgetItems: [],
            totalBudgetPaise: 0,
            executionRoadmap: [{ heading: "Beach Cleanup", description: "Trash collection", startTime: "07:00", endTime: "12:00", order: 1 }],
            ngoDetails: {
                requiresFunding: false,
                participationMode: NgoParticipationMode.OPEN_COMMUNITY, // Open participation!
                expectedParticipants: 50,
                requiresCommunityChat: true,
            },
            submittedAt: new Date(),
        });
        createdProposalIds.push(proposalNgoOwnOpen._id);

        const selectResultNgoOwn = await selectProposalUseCase.execute(
            issueDoc3._id.toString(),
            proposalNgoOwnOpen._id.toString()
        );

        assert.equal(selectResultNgoOwn.isCommunityIssue, true, "NGO own-funded with OPEN_COMMUNITY must have isCommunityIssue: true");
        assert.equal(selectResultNgoOwn.issueStatus, IssueStatus.PLANNED, "NGO own-funded transitions to PLANNED");
        const issueAfterNgoOwn = await IssueModel.findById(issueDoc3._id);
        assert.equal(issueAfterNgoOwn?.isCommunityIssue, true, "Database issue must have isCommunityIssue: true");
        console.log("  ✓ Separation of Concerns verified: NGO Own-Funded issue is correctly flagged as a Community Activity!");

        // =========================================================================
        // TEST 5: Feed Listing Filtering with isCommunityIssue = true
        // =========================================================================
        console.log("\n[Test 5] Query Feed Issues with isCommunityIssue: true");
        const communityFeed = await issueRepo.findFeedIssues(1, 20, { isCommunityIssue: true });
        
        assert(communityFeed.items.length >= 2, "Should return at least our 2 open community issues");
        for (const item of communityFeed.items) {
            assert.equal(item.isCommunityIssue, true, "All items in community activities feed must have isCommunityIssue: true");
        }

        // Verify issue 1 (TEAM_ONLY) is NOT in the community activities feed
        const containsIssue1 = communityFeed.items.some((i) => i.id === issueDoc1._id.toString());
        assert.equal(containsIssue1, false, "Issue with TEAM_ONLY must NOT appear in community activities feed");

        // Verify issues 2 and 3 ARE in the community activities feed
        const containsIssue2 = communityFeed.items.some((i) => i.id === issueDoc2._id.toString());
        const containsIssue3 = communityFeed.items.some((i) => i.id === issueDoc3._id.toString());
        assert.equal(containsIssue2, true, "Issue 2 (OPEN_COMMUNITY) must appear in community activities feed");
        assert.equal(containsIssue3, true, "Issue 3 (OPEN_COMMUNITY NGO own) must appear in community activities feed");
        console.log("  ✓ Feed query with isCommunityIssue: true strictly excludes non-community issues and returns only open community activities");

        // =========================================================================
        // TEST 6: GetIssueByIdUseCase includes isCommunityIssue and Proposal NGO Details
        // =========================================================================
        console.log("\n[Test 6] GetIssueByIdUseCase details DTO includes isCommunityIssue");
        const issueDetails = await getIssueByIdUseCase.execute(issueDoc2._id.toString(), reporterId.toString());
        assert.equal(issueDetails.isCommunityIssue, true, "IssueDetailsResponse must include isCommunityIssue: true");
        assert(issueDetails.selectedProposal, "Must include selectedProposal details");
        assert.equal(issueDetails.selectedProposal.ngoDetails?.participationMode, NgoParticipationMode.OPEN_COMMUNITY);
        assert.equal(issueDetails.selectedProposal.ngoDetails?.expectedParticipants, 25);
        console.log("  ✓ Issue details DTO returns isCommunityIssue: true and complete NGO participation details");

        console.log("\n=======================================================");
        console.log(">>> ALL 6 COMMUNITY ACTIVITIES TESTS PASSED! <<<");
        console.log("=======================================================\n");

    } finally {
        console.log("Cleaning up test database records...");
        if (createdProposalIds.length > 0) {
            await ProposalModel.deleteMany({ _id: { $in: createdProposalIds } });
        }
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
        console.log("Disconnected from MongoDB.");
    }
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
