import assert from "node:assert/strict";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import { Role } from "../domain/enums/Role.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";
import { ApplicationStatus } from "../domain/enums/ApplicationStatus.js";
import { ProviderStatus } from "../domain/enums/ProviderStatus.js";
import { IssueModel } from "../infrastructure/models/IssueModel.js";
import { UserModel } from "../infrastructure/models/UserModel.js";
import { CategoryModel } from "../infrastructure/models/CategoryModel.js";
import { IssueInterestModel } from "../infrastructure/models/IssueInterestModel.js";
import { IssueRepository } from "../infrastructure/repositories/IssueRepository.js";
import { UserRepository } from "../infrastructure/repositories/UserRepository.js";
import { IssueInterestRepository } from "../infrastructure/repositories/IssueInterestRepository.js";
import JwtService from "../infrastructure/services/JwtService.js";
import { SwitchModeUseCase } from "../application/use-cases/auth/SwitchModeUseCase.js";
import { ActivateProviderUseCase } from "../application/use-cases/provider/ActivateProviderUseCase.js";
import { GetProviderIssuesUseCase } from "../application/use-cases/provider/GetProviderIssuesUseCase.js";
import { ExpressIssueInterestUseCase } from "../application/use-cases/provider/ExpressIssueInterestUseCase.js";
import { requireMode, requireActiveProvider } from "../presentation/middlewares/authMiddleware.js";
import ApiError from "../shared/utils/apiError.js";
import { HttpStatusCode } from "../shared/enums/HttpStatusCode.js";

dotenv.config();

const mockStorageService = {
    upload: async () => ({} as never),
    getPresignedUrl: async (key: string) => `https://s3/mock-view/${key}`,
    delete: async () => {},
};

async function runTests() {
    console.log("=== Starting Service Provider Mode & Workspace Tests ===");

    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    await CategoryModel.init();
    await IssueInterestModel.init();

    const testCategory = await CategoryModel.create({
        name: `Test Cat ${Date.now()}`,
        description: "Test category for provider mode",
        isActive: true,
    });
    const categoryId = testCategory._id;

    const userRepository = new UserRepository();
    const issueRepository = new IssueRepository();
    const issueInterestRepository = new IssueInterestRepository();
    const jwtService = new JwtService();

    const switchModeUseCase = new SwitchModeUseCase(userRepository, jwtService);
    const activateProviderUseCase = new ActivateProviderUseCase(userRepository);
    const getProviderIssuesUseCase = new GetProviderIssuesUseCase(
        issueRepository,
        issueInterestRepository,
        mockStorageService
    );
    const expressIssueInterestUseCase = new ExpressIssueInterestUseCase(
        issueRepository,
        issueInterestRepository
    );

    const normalUserId = new Types.ObjectId();
    const pendingProviderUserId = new Types.ObjectId();
    const approvedInactiveUserId = new Types.ObjectId();
    const approvedActiveUserId = new Types.ObjectId();
    const revokedProviderUserId = new Types.ObjectId();

    await UserModel.insertMany([
        {
            _id: normalUserId,
            fullName: "Normal User",
            email: `normal_${Date.now()}@test.com`,
            password: "hashedpassword123",
            roles: [Role.USER],
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
        },
        {
            _id: pendingProviderUserId,
            fullName: "Pending Provider",
            email: `pending_${Date.now()}@test.com`,
            password: "hashedpassword123",
            roles: [Role.USER],
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
            providerProfile: {
                identity: {
                    providerType: "INDIVIDUAL",
                    providerName: "Pending Services",
                    responsiblePersonName: "Pending Provider",
                    address: "123 Street",
                    phone: "9876543210",
                },
                documents: {
                    identityProof: { key: "id.pdf", url: "https://id.pdf", size: 1024, mimeType: "application/pdf", originalName: "id.pdf" },
                },
                workPreferences: {
                    categoriesWillingToWork: [categoryId.toString()],
                },
                status: {
                    applicationStatus: ApplicationStatus.SUBMITTED,
                    submittedAt: new Date(),
                },
            },
        },
        {
            _id: approvedInactiveUserId,
            fullName: "Approved Inactive Provider",
            email: `approved_inactive_${Date.now()}@test.com`,
            password: "hashedpassword123",
            roles: [Role.USER],
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
            providerProfile: {
                identity: {
                    providerType: "INDIVIDUAL",
                    providerName: "Inactive Pro Services",
                    responsiblePersonName: "Approved Inactive",
                    address: "456 Street",
                    phone: "9876543211",
                },
                documents: {
                    identityProof: { key: "id2.pdf", url: "https://id2.pdf", size: 1024, mimeType: "application/pdf", originalName: "id2.pdf" },
                },
                workPreferences: {
                    categoriesWillingToWork: [categoryId.toString()],
                },
                status: {
                    applicationStatus: ApplicationStatus.APPROVED,
                    submittedAt: new Date(),
                    reviewedAt: new Date(),
                },
            },
        },
        {
            _id: approvedActiveUserId,
            fullName: "Approved Active Provider",
            email: `approved_active_${Date.now()}@test.com`,
            password: "hashedpassword123",
            roles: [Role.USER],
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
            providerProfile: {
                identity: {
                    providerType: "INDIVIDUAL",
                    providerName: "Active Pro Services",
                    responsiblePersonName: "Approved Active",
                    address: "789 Street",
                    phone: "9876543212",
                },
                documents: {
                    identityProof: { key: "id3.pdf", url: "https://id3.pdf", size: 1024, mimeType: "application/pdf", originalName: "id3.pdf" },
                },
                workPreferences: {
                    categoriesWillingToWork: [categoryId.toString()],
                },
                status: {
                    applicationStatus: ApplicationStatus.APPROVED,
                    providerStatus: ProviderStatus.ACTIVE,
                    submittedAt: new Date(),
                    reviewedAt: new Date(),
                },
            },
        },
        {
            _id: revokedProviderUserId,
            fullName: "Revoked Provider",
            email: `revoked_${Date.now()}@test.com`,
            password: "hashedpassword123",
            roles: [Role.USER],
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
            providerProfile: {
                identity: {
                    providerType: "INDIVIDUAL",
                    providerName: "Revoked Pro Services",
                    responsiblePersonName: "Revoked Provider",
                    address: "000 Street",
                    phone: "9876543213",
                },
                documents: {
                    identityProof: { key: "id4.pdf", url: "https://id4.pdf", size: 1024, mimeType: "application/pdf", originalName: "id4.pdf" },
                },
                workPreferences: {
                    categoriesWillingToWork: [categoryId.toString()],
                },
                status: {
                    applicationStatus: ApplicationStatus.REJECTED,
                    providerStatus: ProviderStatus.BLOCKED,
                    submittedAt: new Date(),
                    reviewedAt: new Date(),
                },
            },
        },
    ]);

    // Create Issues for visibility testing
    const publicVerifiedIssue = await IssueModel.create({
        title: "Public Verified Issue",
        description: "Community issue verified by admin",
        category: categoryId,
        createdBy: normalUserId,
        visibility: IssueVisibility.PUBLIC,
        status: IssueStatus.VERIFIED,
        location: {
            address: "Main Square",
            coordinates: { latitude: 9.9312, longitude: 76.2673 },
        },
        images: [{ key: "img1.jpg", url: "https://img1.jpg", size: 1024, mimeType: "image/jpeg", originalName: "img1.jpg" }],
    });

    const publicReportedIssue = await IssueModel.create({
        title: "Public Reported Issue",
        description: "Fresh community reported issue",
        category: categoryId,
        createdBy: normalUserId,
        visibility: IssueVisibility.PUBLIC,
        status: IssueStatus.REPORTED,
        location: {
            address: "Park Lane",
            coordinates: { latitude: 9.9320, longitude: 76.2680 },
        },
        images: [{ key: "img2.jpg", url: "https://img2.jpg", size: 1024, mimeType: "image/jpeg", originalName: "img2.jpg" }],
    });

    const privateIssue = await IssueModel.create({
        title: "Private Issue",
        description: "Confidential reporter issue",
        category: categoryId,
        createdBy: normalUserId,
        visibility: IssueVisibility.PRIVATE,
        status: IssueStatus.VERIFIED,
        location: {
            address: "Private Alley",
            coordinates: { latitude: 9.9330, longitude: 76.2690 },
        },
        images: [{ key: "img3.jpg", url: "https://img3.jpg", size: 1024, mimeType: "image/jpeg", originalName: "img3.jpg" }],
    });

    const rejectedIssue = await IssueModel.create({
        title: "Rejected Issue",
        description: "Disallowed rejected issue",
        category: categoryId,
        createdBy: normalUserId,
        visibility: IssueVisibility.PUBLIC,
        status: IssueStatus.REJECTED,
        location: {
            address: "Discarded Way",
            coordinates: { latitude: 9.9340, longitude: 76.2700 },
        },
        images: [{ key: "img4.jpg", url: "https://img4.jpg", size: 1024, mimeType: "image/jpeg", originalName: "img4.jpg" }],
    });

    try {
        // Test 1: Ineligible users cannot switch into SERVICE_PROVIDER mode
        console.log("Test 1: User without provider profile cannot switch to SERVICE_PROVIDER mode");
        await assert.rejects(
            async () => {
                await switchModeUseCase.execute(normalUserId.toString(), "SERVICE_PROVIDER");
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                assert(err.message.includes("Only approved service providers"));
                return true;
            }
        );

        console.log("Test 2: User with PENDING application cannot switch to SERVICE_PROVIDER mode");
        await assert.rejects(
            async () => {
                await switchModeUseCase.execute(pendingProviderUserId.toString(), "SERVICE_PROVIDER");
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                assert(err.message.includes("Only approved service providers"));
                return true;
            }
        );

        console.log("Test 3: User with REJECTED/REVOKED status cannot switch to SERVICE_PROVIDER mode");
        await assert.rejects(
            async () => {
                await switchModeUseCase.execute(revokedProviderUserId.toString(), "SERVICE_PROVIDER");
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );

        console.log("Test 4: Approved provider CAN switch into SERVICE_PROVIDER mode");
        const switchResult = await switchModeUseCase.execute(
            approvedInactiveUserId.toString(),
            "SERVICE_PROVIDER"
        );
        assert.equal(switchResult.activeMode, "SERVICE_PROVIDER");
        assert.equal(switchResult.isActivated, false);
        assert.equal(switchResult.user.providerAccess?.isApproved, true);
        assert.equal(switchResult.user.providerAccess?.isActivated, false);

        // Verify JWT token returned contains activeMode === "SERVICE_PROVIDER"
        const decodedToken = jwtService.verifyAccessToken(switchResult.accessToken) as {
            userId: string;
            activeMode: string;
        };
        assert.equal(decodedToken.activeMode, "SERVICE_PROVIDER");
        assert.equal(decodedToken.userId, approvedInactiveUserId.toString());

        console.log("Test 5: Approved provider can switch BACK to USER mode");
        const switchBackResult = await switchModeUseCase.execute(
            approvedInactiveUserId.toString(),
            "USER"
        );
        assert.equal(switchBackResult.activeMode, "USER");
        const decodedBackToken = jwtService.verifyAccessToken(switchBackResult.accessToken) as {
            activeMode: string;
        };
        assert.equal(decodedBackToken.activeMode, "USER");

        console.log("Test 6: Activation gate - Approved inactive provider can activate account");
        const activatedUser = await activateProviderUseCase.execute(approvedInactiveUserId.toString());
        assert.equal(activatedUser.providerAccess?.isActivated, true);

        // Verify now in switch mode, isActivated is true
        const switchActiveResult = await switchModeUseCase.execute(
            approvedInactiveUserId.toString(),
            "SERVICE_PROVIDER"
        );
        assert.equal(switchActiveResult.isActivated, true);

        console.log("Test 7: Route middleware - requireMode enforces active mode boundary");
        const reqUserMode = { user: { userId: "123", roles: ["USER"], activeMode: "USER" } } as never;
        const reqProviderMode = {
            user: { userId: "123", roles: ["USER"], activeMode: "SERVICE_PROVIDER" },
        } as never;

        // User mode calling requireMode("USER") -> succeeds
        let userModePassed = false;
        requireMode("USER")(reqUserMode, {} as never, () => {
            userModePassed = true;
        });
        assert.equal(userModePassed, true);

        // User mode calling requireMode("SERVICE_PROVIDER") -> throws 403
        assert.throws(
            () => {
                requireMode("SERVICE_PROVIDER")(reqUserMode, {} as never, () => {});
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );

        // Provider mode calling requireMode("USER") -> throws 403
        assert.throws(
            () => {
                requireMode("USER")(reqProviderMode, {} as never, () => {});
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );

        console.log("Test 8: requireActiveProvider middleware blocks unactivated providers");
        const reqUnactivated = {
            user: { userId: approvedInactiveUserId.toString(), roles: ["USER"], activeMode: "SERVICE_PROVIDER" },
        } as never;

        // Temporarily reset providerStatus
        await UserModel.updateOne(
            { _id: approvedInactiveUserId },
            { $unset: { "providerProfile.status.providerStatus": 1 } }
        );

        let middlewareError: unknown = null;
        await new Promise<void>((resolve) => {
            requireActiveProvider(reqUnactivated, {} as never, (err?: unknown) => {
                middlewareError = err;
                resolve();
            });
        });
        assert(middlewareError instanceof ApiError);
        assert.equal((middlewareError as ApiError).statusCode, HttpStatusCode.FORBIDDEN);
        assert((middlewareError as ApiError).message.includes("must be activated"));

        // Re-activate and verify requireActiveProvider passes
        await UserModel.updateOne(
            { _id: approvedInactiveUserId },
            { $set: { "providerProfile.status.providerStatus": ProviderStatus.ACTIVE } }
        );
        let activePassed = false;
        await new Promise<void>((resolve) => {
            requireActiveProvider(reqUnactivated, {} as never, () => {
                activePassed = true;
                resolve();
            });
        });
        assert.equal(activePassed, true);

        console.log("Test 9: Provider issue listing enforces public & non-rejected rules");
        const providerIssues = await getProviderIssuesUseCase.execute(
            approvedActiveUserId.toString(),
            1,
            10
        );
        const issueIds = providerIssues.items.map((i) => i.id);

        // Public VERIFIED and Public REPORTED should be present
        assert(issueIds.includes(publicVerifiedIssue._id.toString()));
        assert(issueIds.includes(publicReportedIssue._id.toString()));

        // Private issue must NEVER be in provider feed
        assert(!issueIds.includes(privateIssue._id.toString()));

        // Rejected issue must NEVER be in provider feed
        assert(!issueIds.includes(rejectedIssue._id.toString()));

        console.log("Test 10: Express Interest records interest and prevents duplicates");
        const interestResult = await expressIssueInterestUseCase.execute(
            publicVerifiedIssue._id.toString(),
            approvedActiveUserId.toString()
        );
        assert.equal(interestResult.success, true);

        // Verify provider feed now reflects hasExpressedInterest === true
        const updatedIssues = await getProviderIssuesUseCase.execute(
            approvedActiveUserId.toString(),
            1,
            10
        );
        const interestedIssue = updatedIssues.items.find(
            (i) => i.id === publicVerifiedIssue._id.toString()
        );
        assert(interestedIssue);
        assert.equal(interestedIssue.hasExpressedInterest, true);

        // Duplicate submission should throw 409 Conflict
        await assert.rejects(
            async () => {
                await expressIssueInterestUseCase.execute(
                    publicVerifiedIssue._id.toString(),
                    approvedActiveUserId.toString()
                );
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.CONFLICT);
                assert(err.message.includes("already expressed interest"));
                return true;
            }
        );

        // Express interest on private or rejected issue must be rejected
        await assert.rejects(
            async () => {
                await expressIssueInterestUseCase.execute(
                    privateIssue._id.toString(),
                    approvedActiveUserId.toString()
                );
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );

        await assert.rejects(
            async () => {
                await expressIssueInterestUseCase.execute(
                    rejectedIssue._id.toString(),
                    approvedActiveUserId.toString()
                );
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );

        console.log("\n>>> ALL SERVICE PROVIDER MODE & WORKSPACE TESTS PASSED SUCCESSFULLY! <<<\n");
    } finally {
        // Cleanup test data
        console.log("Cleaning up test documents...");
        await CategoryModel.deleteOne({ _id: categoryId });
        await UserModel.deleteMany({
            _id: {
                $in: [
                    normalUserId,
                    pendingProviderUserId,
                    approvedInactiveUserId,
                    approvedActiveUserId,
                    revokedProviderUserId,
                ],
            },
        });
        await IssueModel.deleteMany({
            _id: {
                $in: [
                    publicVerifiedIssue._id,
                    publicReportedIssue._id,
                    privateIssue._id,
                    rejectedIssue._id,
                ],
            },
        });
        await IssueInterestModel.deleteMany({
            providerId: { $in: [approvedActiveUserId, approvedInactiveUserId] },
        });
        await mongoose.disconnect();
        console.log("Database disconnected.");
    }
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
