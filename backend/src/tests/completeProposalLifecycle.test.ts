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
import { ProposalFundingType } from "../domain/enums/ProposalFundingType.ts";
import { ProposalWindowStatus } from "../domain/enums/ProposalWindowStatus.ts";
import { NgoParticipationMode } from "../domain/enums/NgoParticipationMode.ts";
import { NotificationType } from "../domain/enums/NotificationType.ts";
import { Role } from "../domain/enums/Role.ts";
import { AuthProvider } from "../domain/enums/AuthProvider.ts";
import { AccountStatus } from "../domain/enums/AccountStatus.ts";
import { ApplicationStatus } from "../domain/enums/ApplicationStatus.ts";
import { ProviderStatus } from "../domain/enums/ProviderStatus.ts";
import { IssueModel } from "../infrastructure/models/IssueModel.ts";
import { CategoryModel } from "../infrastructure/models/CategoryModel.ts";
import { ProposalModel } from "../infrastructure/models/ProposalModel.ts";
import { NotificationModel } from "../infrastructure/models/NotificationModel.ts";
import { UserModel } from "../infrastructure/models/UserModel.ts";
import { ProposalRepository } from "../infrastructure/repositories/ProposalRepository.ts";
import { IssueRepository } from "../infrastructure/repositories/IssueRepository.ts";
import { UserRepository } from "../infrastructure/repositories/UserRepository.ts";
import { NotificationRepository } from "../infrastructure/repositories/NotificationRepository.ts";
import { ProposalSelectionRepository } from "../infrastructure/repositories/ProposalSelectionRepository.ts";
import { SelectProposalUseCase } from "../application/use-cases/admin/SelectProposalUseCase.ts";
import { SubmitProposalUseCase } from "../application/use-cases/provider/SubmitProposalUseCase.ts";
import { GetIssueByIdUseCase } from "../application/use-cases/issue/GetIssueByIdUseCase.ts";
import { GetNotificationsUseCase } from "../application/use-cases/notification/GetNotificationsUseCase.ts";
import { MarkNotificationAsReadUseCase } from "../application/use-cases/notification/MarkNotificationAsReadUseCase.ts";
import type { IStorageService } from "../application/services/IStorageService.ts";

dotenv.config();

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
    console.log("=== JanFix Complete Proposal Lifecycle & Notifications Test ===");

    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB Atlas.");

    await CategoryModel.init();
    await UserModel.init();
    await ProposalModel.init();
    await IssueModel.init();
    await NotificationModel.init();

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
    const submitProposalUseCase = new SubmitProposalUseCase(
        issueRepo,
        proposalRepo,
        userRepo
    );
    const getIssueByIdUseCase = new GetIssueByIdUseCase(
        issueRepo,
        mockStorage,
        proposalRepo,
        userRepo
    );
    const getNotificationsUseCase = new GetNotificationsUseCase(notifRepo);
    const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notifRepo);

    const createdCategory = await CategoryModel.create({
        name: `Lifecycle Cat ${Date.now()}`,
        description: "Test Category",
        isActive: true,
    });

    const reporterId = new Types.ObjectId();
    const ngoProviderId = new Types.ObjectId();
    const contractorProviderId = new Types.ObjectId();

    // Create mock reporter citizen user
    await UserModel.create({
        _id: reporterId,
        fullName: "Aarav Sharma",
        email: `reporter-${Date.now()}@example.com`,
        password: "hashedpassword123",
        roles: [Role.USER],
        activeMode: "USER",
        isVerified: true,
        authProvider: AuthProvider.LOCAL,
        accountStatus: AccountStatus.ACTIVE,
    });

    // Create mock active NGO user
    await UserModel.create({
        _id: ngoProviderId,
        fullName: "Green City NGO",
        email: `ngo-${Date.now()}@example.com`,
        password: "hashedpassword123",
        roles: [Role.SERVICE_PROVIDER],
        activeMode: "SERVICE_PROVIDER",
        isVerified: true,
        authProvider: AuthProvider.LOCAL,
        accountStatus: AccountStatus.ACTIVE,
        providerProfile: {
            identity: {
                providerType: ProviderType.NGO,
                providerName: "Green City Foundation",
            },
            documents: {
                profileImage: { key: "ngo-profile.jpg", originalName: "profile.jpg", mimeType: "image/jpeg", size: 500, url: "https://example.com/ngo.jpg" },
            },
            workPreferences: {},
            organizationProfile: {
                memberCount: 25,
            },
            status: {
                applicationStatus: ApplicationStatus.APPROVED,
                providerStatus: ProviderStatus.ACTIVE,
                submittedAt: new Date(),
            },
        },
    });

    // Create mock active Contractor user
    await UserModel.create({
        _id: contractorProviderId,
        fullName: "Metro Civics Contractor",
        email: `contractor-${Date.now()}@example.com`,
        password: "hashedpassword123",
        roles: [Role.SERVICE_PROVIDER],
        activeMode: "SERVICE_PROVIDER",
        isVerified: true,
        authProvider: AuthProvider.LOCAL,
        accountStatus: AccountStatus.ACTIVE,
        providerProfile: {
            identity: {
                providerType: ProviderType.INDIVIDUAL,
                providerName: "Metro Civics",
            },
            documents: {},
            workPreferences: {},
            status: {
                applicationStatus: ApplicationStatus.APPROVED,
                providerStatus: ProviderStatus.ACTIVE,
                submittedAt: new Date(),
            },
        },
    });

    const trackedIssues: Types.ObjectId[] = [];
    const trackedUsers = [reporterId, ngoProviderId, contractorProviderId];

    try {
        const now = new Date();
        const pastDeadline = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // -------------------------------------------------------------
        // Test 1: Submit NGO Own-Funded Proposal (no budget items, 0 budget)
        // -------------------------------------------------------------
        console.log("\n[Test 1] Submit NGO Own-Funded Proposal without budget items");
        const issue1 = await IssueModel.create({
            createdBy: reporterId,
            title: "Park Cleanup Lifecycle Test",
            description: "Overgrown weeds and trash in neighborhood park",
            category: createdCategory._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "Central Park, Sector 4",
                coordinates: { latitude: 12.9716, longitude: 77.5946 },
            },
            status: IssueStatus.VERIFIED,
            proposalOpenedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            proposalDeadlineAt: pastDeadline,
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        trackedIssues.push(issue1._id);

        const ngoProposal = await submitProposalUseCase.execute(
            issue1._id.toString(),
            ngoProviderId.toString(),
            {
                fundingType: ProposalFundingType.NGO_OWN_FUNDING,
                estimatedTeamSize: 10,
                estimatedDurationHours: 6,
                budgetItems: [], // No budget items required for NGO self-funding!
                executionRoadmap: [
                    {
                        heading: "Morning Cleanup",
                        description: "Clearing trash and weeds",
                        startTime: "09:00",
                        endTime: "12:00",
                    },
                    {
                        heading: "Afternoon Waste Sorting",
                        description: "Segregation and recycling",
                        startTime: "13:00",
                        endTime: "15:00",
                    },
                ],
                ngoDetails: {
                    requiresFunding: false,
                    participationMode: NgoParticipationMode.OPEN_COMMUNITY,
                    expectedParticipants: 30,
                    requiresCommunityChat: true,
                },
            },
            new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        );

        assert.equal(ngoProposal.fundingType, ProposalFundingType.NGO_OWN_FUNDING);
        assert.equal(ngoProposal.totalBudgetPaise, 0);
        assert.equal(ngoProposal.budgetItems.length, 0);
        console.log("  ✓ NGO Own-Funded proposal successfully submitted with 0 budget");

        // -------------------------------------------------------------
        // Test 2: Submit Community Funding Proposal for the same issue
        // -------------------------------------------------------------
        console.log("\n[Test 2] Submit Community-Funded Proposal by Contractor");
        const contractorProposal = await submitProposalUseCase.execute(
            issue1._id.toString(),
            contractorProviderId.toString(),
            {
                fundingType: ProposalFundingType.COMMUNITY_FUNDING,
                estimatedTeamSize: 4,
                estimatedDurationHours: 8,
                budgetItems: [
                    { heading: "Tools & Equipment", amountRupees: 5000 },
                    { heading: "Safety Gear", amountRupees: 2500 },
                ],
                executionRoadmap: [
                    {
                        heading: "Excavation and site clearance",
                        description: "Clearing heavy debris",
                        startTime: "08:00",
                        endTime: "16:00",
                    },
                ],
            },
            new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        );

        assert.equal(contractorProposal.fundingType, ProposalFundingType.COMMUNITY_FUNDING);
        assert.equal(contractorProposal.totalBudgetRupees, 7500);
        assert.equal(contractorProposal.totalBudgetPaise, 750000);
        console.log("  ✓ Contractor Community-Funded proposal submitted with 7,500 rupees budget");

        // -------------------------------------------------------------
        // Test 3: Select Contractor Proposal -> Issue moves to FUNDRAISING & 5% Platform Fee calculated
        // -------------------------------------------------------------
        console.log("\n[Test 3] Select Community Funding Proposal -> FUNDRAISING + 5% Platform Fee");
        const selectionResult = await selectProposalUseCase.execute(
            issue1._id.toString(),
            contractorProposal.id,
            now
        );

        assert.equal(selectionResult.issueStatus, IssueStatus.FUNDRAISING);
        assert.equal(selectionResult.selectedProposalStatus, ProposalStatus.SELECTED);
        assert(selectionResult.fundingSnapshot, "Funding snapshot must be present");
        assert.equal(selectionResult.fundingSnapshot.fundingType, ProposalFundingType.COMMUNITY_FUNDING);
        assert.equal(selectionResult.fundingSnapshot.providerBudgetPaise, 750000);
        // 5% of 750,000 paise = 37,500 paise (₹375)
        assert.equal(selectionResult.fundingSnapshot.platformFeePaise, 37500);
        assert.equal(selectionResult.fundingSnapshot.platformFeeRupees, 375);
        // Total funding target = 750,000 + 37,500 = 787,500 paise (₹7,875)
        assert.equal(selectionResult.fundingSnapshot.fundingTargetPaise, 787500);
        assert.equal(selectionResult.fundingSnapshot.fundingTargetRupees, 7875);
        console.log("  ✓ 5% JanFix fee verified (Budget: ₹7,500, Fee: ₹375, Target: ₹7,875)");

        // -------------------------------------------------------------
        // Test 4: Notification Delivery Verification
        // -------------------------------------------------------------
        console.log("\n[Test 4] Verify Notification Delivery for all parties");
        // Contractor (Selected Provider)
        const contractorNotifs = await getNotificationsUseCase.execute(contractorProviderId.toString());
        assert.equal(contractorNotifs.notifications.length, 1);
        assert.equal(contractorNotifs.notifications[0]!.type, NotificationType.PROPOSAL_SELECTED);
        assert.equal(contractorNotifs.unreadCount, 1);
        console.log("  ✓ Selected provider received PROPOSAL_SELECTED notification");

        // NGO (Unselected Provider)
        const ngoNotifs = await getNotificationsUseCase.execute(ngoProviderId.toString());
        assert.equal(ngoNotifs.notifications.length, 1);
        assert.equal(ngoNotifs.notifications[0]!.type, NotificationType.PROPOSAL_NOT_SELECTED);
        assert.equal(ngoNotifs.unreadCount, 1);
        console.log("  ✓ Unselected provider received PROPOSAL_NOT_SELECTED notification");

        // Reporter (Citizen)
        const reporterNotifs = await getNotificationsUseCase.execute(reporterId.toString());
        assert.equal(reporterNotifs.notifications.length, 1);
        assert.equal(reporterNotifs.notifications[0]!.type, NotificationType.REPORTER_PROPOSAL_SELECTED);
        assert.equal(reporterNotifs.unreadCount, 1);
        console.log("  ✓ Reporter received REPORTER_PROPOSAL_SELECTED notification");

        // Mark notification as read
        const notifId = contractorNotifs.notifications[0]!.id;
        await markNotificationAsReadUseCase.executeSingle(notifId, contractorProviderId.toString());
        const contractorNotifsAfterRead = await getNotificationsUseCase.execute(contractorProviderId.toString());
        assert.equal(contractorNotifsAfterRead.unreadCount, 0);
        assert.equal(contractorNotifsAfterRead.notifications[0]!.isRead, true);
        console.log("  ✓ Mark notification as read successfully updated unread count to 0");

        // -------------------------------------------------------------
        // Test 5: Public Issue Details & Privacy Protection
        // -------------------------------------------------------------
        console.log("\n[Test 5] Public Issue Details presentation and Privacy Checks");
        const publicIssueDetails = await getIssueByIdUseCase.execute(issue1._id.toString());
        assert(publicIssueDetails.selectedProposal, "Public selected proposal must be populated");
        assert(publicIssueDetails.selectedProvider, "Public selected provider must be populated");
        assert(publicIssueDetails.timelineEvents, "Timeline events must be populated");

        // Privacy assertion: Ensure no sensitive identity docs or private contact fields are exposed
        const providerDTO = publicIssueDetails.selectedProvider as unknown as Record<string, unknown>;
        assert.equal(providerDTO.identityProof, undefined, "identityProof must not be exposed");
        assert.equal(providerDTO.phone, undefined, "phone must not be exposed");
        assert.equal(providerDTO.address, undefined, "address must not be exposed");
        assert.equal(providerDTO.ngoRegistrationDocument, undefined, "ngo docs must not be exposed");
        console.log("  ✓ Sensitive fields (identityProof, phone, address, docs) strictly omitted from public DTO");

        // Timeline events assertion
        const timeline = publicIssueDetails.timelineEvents!;
        assert.equal(timeline.length, 5);
        assert.equal(timeline[0]!.status, IssueStatus.REPORTED);
        assert.equal(timeline[0]!.isCompleted, true);
        assert.equal(timeline[1]!.status, IssueStatus.VERIFIED);
        assert.equal(timeline[1]!.isCompleted, true);
        assert.equal(timeline[2]!.status, IssueStatus.FUNDRAISING);
        assert.equal(timeline[2]!.isCurrent, true);
        console.log("  ✓ Timeline correctly positioned at current stage (FUNDRAISING)");

        // -------------------------------------------------------------
        // Test 6: NGO Own-Funding Proposal Selection -> Issue moves to PLANNED (0 fee)
        // -------------------------------------------------------------
        console.log("\n[Test 6] Select NGO Own-Funded Proposal -> PLANNED + Zero Fees");
        const issue2 = await IssueModel.create({
            createdBy: reporterId,
            title: "Tree Planting Initiative",
            description: "Planting saplings along street avenue",
            category: createdCategory._id,
            images: [],
            visibility: IssueVisibility.PUBLIC,
            location: {
                address: "Green Avenue, Sector 9",
                coordinates: { latitude: 12.9720, longitude: 77.5950 },
            },
            status: IssueStatus.VERIFIED,
            proposalOpenedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            proposalDeadlineAt: pastDeadline,
            proposalWindowStatus: ProposalWindowStatus.OPEN,
        });
        trackedIssues.push(issue2._id);

        const ngoSelfFundedProposal = await submitProposalUseCase.execute(
            issue2._id.toString(),
            ngoProviderId.toString(),
            {
                fundingType: ProposalFundingType.NGO_OWN_FUNDING,
                estimatedTeamSize: 15,
                estimatedDurationHours: 10,
                budgetItems: [],
                executionRoadmap: [
                    {
                        heading: "Sapling Planting",
                        description: "Planting 100 tree saplings",
                        startTime: "07:00",
                        endTime: "17:00",
                    },
                ],
                ngoDetails: {
                    requiresFunding: false,
                    participationMode: NgoParticipationMode.OPEN_COMMUNITY,
                    expectedParticipants: 50,
                    requiresCommunityChat: false,
                },
            },
            new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        );

        const ngoSelectionResult = await selectProposalUseCase.execute(
            issue2._id.toString(),
            ngoSelfFundedProposal.id,
            now
        );

        assert.equal(ngoSelectionResult.issueStatus, IssueStatus.PLANNED);
        assert.equal(ngoSelectionResult.fundingSnapshot?.fundingType, ProposalFundingType.NGO_OWN_FUNDING);
        assert.equal(ngoSelectionResult.fundingSnapshot?.providerBudgetPaise, 0);
        assert.equal(ngoSelectionResult.fundingSnapshot?.platformFeePaise, 0);
        assert.equal(ngoSelectionResult.fundingSnapshot?.fundingTargetPaise, 0);
        console.log("  ✓ NGO Own-Funded selection transitions issue to PLANNED with 0 fee");

        // -------------------------------------------------------------
        // Test 7: Private Issue Protection Test
        // -------------------------------------------------------------
        console.log("\n[Test 7] Verify Private Issue Security Isolation");
        const privateIssue = await IssueModel.create({
            createdBy: reporterId,
            title: "Private Community Issue",
            description: "Gated community internal water supply",
            category: createdCategory._id,
            images: [],
            visibility: IssueVisibility.PRIVATE,
            location: {
                address: "Gated Villa 12",
                coordinates: { latitude: 12.9730, longitude: 77.5960 },
            },
            status: IssueStatus.FUNDRAISING,
        });
        trackedIssues.push(privateIssue._id);

        // Unauthorized user attempts to view private issue
        const unauthorizedUserId = new Types.ObjectId().toString();
        let forbiddenThrown = false;
        try {
            await getIssueByIdUseCase.execute(privateIssue._id.toString(), unauthorizedUserId, [Role.USER]);
        } catch (err: unknown) {
            const error = err as { statusCode?: number };
            if (error.statusCode === 403) {
                forbiddenThrown = true;
            }
        }
        assert(forbiddenThrown, "Unauthorized user must be forbidden (403) from accessing post-approval private issue");
        console.log("  ✓ Private issue access strictly blocked (403) for unauthorized users");

        // Authorized reporter CAN view
        const reporterView = await getIssueByIdUseCase.execute(privateIssue._id.toString(), reporterId.toString(), [Role.USER]);
        assert.equal(reporterView.id, privateIssue._id.toString());
        console.log("  ✓ Original reporter can view their own private issue");

        console.log("\n=======================================================");
        console.log(">>> ALL 7 LIFECYCLE, NOTIFICATION & PRIVACY TESTS PASSED! <<<");
        console.log("=======================================================\n");
    } finally {
        // Cleanup test documents
        if (trackedIssues.length > 0) {
            await IssueModel.deleteMany({ _id: { $in: trackedIssues } });
            await ProposalModel.deleteMany({ issueId: { $in: trackedIssues } });
            await NotificationModel.deleteMany({ issueId: { $in: trackedIssues } });
        }
        if (trackedUsers.length > 0) {
            await UserModel.deleteMany({ _id: { $in: trackedUsers } });
            await NotificationModel.deleteMany({ recipientId: { $in: trackedUsers } });
        }
        await CategoryModel.deleteOne({ _id: createdCategory._id });
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

runTests().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
