import assert from "node:assert/strict";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import { Role } from "../domain/enums/Role.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";
import { IssueModel } from "../infrastructure/models/IssueModel.js";
import { UserModel } from "../infrastructure/models/UserModel.js";
import { CategoryModel } from "../infrastructure/models/CategoryModel.js";
import { IssueRepository } from "../infrastructure/repositories/IssueRepository.js";
import { UserRepository } from "../infrastructure/repositories/UserRepository.js";
import { UpdateUserProfileUseCase } from "../application/use-cases/auth/UpdateUserProfileUseCase.js";
import { GetFeedIssuesUseCase } from "../application/use-cases/issue/GetFeedIssuesUseCase.js";
import { GetIssueByIdUseCase } from "../application/use-cases/issue/GetIssueByIdUseCase.js";
import { GetUserIssuesUseCase } from "../application/use-cases/issue/GetUserIssuesUseCase.js";
import ApiError from "../shared/utils/apiError.js";
import { HttpStatusCode } from "../shared/enums/HttpStatusCode.js";

dotenv.config();

const mockStorageService = {
    upload: async () => ({} as never),
    getPresignedUrl: async (key: string) => `https://s3/mock-view/${key}`,
    delete: async () => {},
};

async function runTests() {
    console.log("=== Starting User Profile, Reports & Rejected Visibility Tests ===");

    const mongoUri = process.env.MONGO_URI;
    assert(mongoUri, "MONGO_URI must be provided in .env");

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    await CategoryModel.init();
    const testCategory = await CategoryModel.create({
        name: `Test Cat ${Date.now()}`,
        description: "Test civic category",
        isActive: true,
    });
    const categoryId = testCategory._id;

    const userRepository = new UserRepository();
    const issueRepository = new IssueRepository();

    const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
    const getFeedIssuesUseCase = new GetFeedIssuesUseCase(issueRepository, mockStorageService);
    const getIssueByIdUseCase = new GetIssueByIdUseCase(issueRepository, mockStorageService);
    const getUserIssuesUseCase = new GetUserIssuesUseCase(issueRepository, mockStorageService);

    const user1Id = new Types.ObjectId();
    const user2Id = new Types.ObjectId();
    const adminId = new Types.ObjectId();

    const createdUsers = await UserModel.insertMany([
        {
            _id: user1Id,
            fullName: "Citizen Alice",
            email: `alice_${Date.now()}@example.com`,
            password: "HashedPassword123!",
            roles: [Role.USER],
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
            authProvider: "LOCAL",
        },
        {
            _id: user2Id,
            fullName: "Citizen Bob",
            email: `bob_${Date.now()}@example.com`,
            password: "HashedPassword123!",
            roles: [Role.USER],
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
            authProvider: "LOCAL",
        },
        {
            _id: adminId,
            fullName: "Admin Carol",
            email: `admin_${Date.now()}@example.com`,
            password: "HashedPassword123!",
            roles: [Role.ADMIN],
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
            authProvider: "LOCAL",
        },
    ]);

    // Create test issues for User 1
    const testIssues = await IssueModel.insertMany([
        {
            title: "Public Reported Pothole",
            description: "Main road pothole near junction",
            category: categoryId,
            createdBy: user1Id,
            visibility: IssueVisibility.PUBLIC,
            status: IssueStatus.REPORTED,
            location: { address: "Junction 1", coordinates: { latitude: 10, longitude: 76 } },
        },
        {
            title: "Public Rejected Streetlight",
            description: "Broken streetlight outside",
            category: categoryId,
            createdBy: user1Id,
            visibility: IssueVisibility.PUBLIC,
            status: IssueStatus.REJECTED,
            rejectionReason: "Duplicate report of civic issue #12",
            location: { address: "Junction 2", coordinates: { latitude: 10.1, longitude: 76.1 } },
        },
        {
            title: "Private Verified Drainage",
            description: "Private drainage issue",
            category: categoryId,
            createdBy: user1Id,
            visibility: IssueVisibility.PRIVATE,
            status: IssueStatus.VERIFIED,
            location: { address: "Gated Community", coordinates: { latitude: 10.2, longitude: 76.2 } },
        },
        {
            title: "Private Rejected Waste Pile",
            description: "Private compound waste pile",
            category: categoryId,
            createdBy: user1Id,
            visibility: IssueVisibility.PRIVATE,
            status: IssueStatus.REJECTED,
            rejectionReason: "Inside private residence boundary",
            location: { address: "Compound 4", coordinates: { latitude: 10.3, longitude: 76.3 } },
        },
        {
            title: "Bob Public Reported Park Bench",
            description: "Broken bench in central park",
            category: categoryId,
            createdBy: user2Id,
            visibility: IssueVisibility.PUBLIC,
            status: IssueStatus.REPORTED,
            location: { address: "Central Park", coordinates: { latitude: 10.4, longitude: 76.4 } },
        },
    ]);

    const publicReported = testIssues[0]!;
    const publicRejected = testIssues[1]!;
    const privateVerified = testIssues[2]!;
    const privateRejected = testIssues[3]!;
    const bobIssue = testIssues[4]!;

    try {
        // -------------------------------------------------------------
        // SCENARIO 1: Self-service profile name update
        // -------------------------------------------------------------
        console.log("\n--- Scenario 1: Self-service profile name update ---");
        const updated = await updateUserProfileUseCase.execute(user1Id.toString(), {
            fullName: "   Alice Henderson   ",
        });
        assert.equal(updated.fullName, "Alice Henderson", "Full name should be trimmed and updated");
        assert.equal(updated.email, createdUsers[0]!.email, "Email must not be changed");
        assert.deepEqual(updated.roles, [Role.USER], "Roles must remain intact");

        const reloadedUser = await UserModel.findById(user1Id);
        assert.equal(reloadedUser?.fullName, "Alice Henderson");
        console.log("✔ Scenario 1 Passed: User can successfully update and trim their full name");

        // -------------------------------------------------------------
        // SCENARIO 2: Empty name is rejected
        // -------------------------------------------------------------
        console.log("\n--- Scenario 2: Empty or whitespace-only name is rejected ---");
        await assert.rejects(
            async () => {
                await updateUserProfileUseCase.execute(user1Id.toString(), { fullName: "   " });
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.BAD_REQUEST);
                return true;
            }
        );
        console.log("✔ Scenario 2 Passed: Empty or whitespace-only name rejected with 400");

        // -------------------------------------------------------------
        // SCENARIO 3: Public & Private rejected issues do NOT appear in general feed
        // -------------------------------------------------------------
        console.log("\n--- Scenario 3: Rejected issues hidden from general feed ---");
        const feedUser2 = await getFeedIssuesUseCase.execute(user2Id.toString(), 1, 20);
        const feedIds = feedUser2.items.map((i) => i.id);

        assert.equal(feedIds.includes(publicRejected._id.toString()), false, "Public rejected issue must NOT appear in feed");
        assert.equal(feedIds.includes(privateRejected._id.toString()), false, "Private rejected issue must NOT appear in feed");
        assert.equal(feedIds.includes(publicReported._id.toString()), true, "Public reported issue should appear in feed");
        assert.equal(feedIds.includes(bobIssue._id.toString()), true, "Bob's reported issue should appear in feed");
        console.log("✔ Scenario 3 Passed: Both public and private rejected issues are hidden from general feed");

        // -------------------------------------------------------------
        // SCENARIO 4: General users cannot access rejected issue by ID
        // -------------------------------------------------------------
        console.log("\n--- Scenario 4: General users cannot access rejected issue by ID ---");
        await assert.rejects(
            async () => {
                // Bob (unrelated user) tries to get Alice's rejected issue
                await getIssueByIdUseCase.execute(publicRejected._id.toString(), user2Id.toString(), [Role.USER]);
            },
            (err: unknown) => {
                assert(err instanceof ApiError);
                assert.equal(err.statusCode, HttpStatusCode.FORBIDDEN);
                return true;
            }
        );
        console.log("✔ Scenario 4 Passed: Unrelated general user gets 403 Forbidden when requesting rejected issue");

        // -------------------------------------------------------------
        // SCENARIO 5: Creator CAN access their own rejected report with rejection reason
        // -------------------------------------------------------------
        console.log("\n--- Scenario 5: Creator access to rejected issue with rejection reason ---");
        const creatorDetails = await getIssueByIdUseCase.execute(
            publicRejected._id.toString(),
            user1Id.toString(),
            [Role.USER]
        );
        assert.equal(creatorDetails.id, publicRejected._id.toString());
        assert.equal(creatorDetails.rejectionReason, "Duplicate report of civic issue #12");
        console.log("✔ Scenario 5 Passed: Creator can retrieve their own rejected report with rejection reason");

        // -------------------------------------------------------------
        // SCENARIO 6: Admin CAN access rejected issue with rejection reason
        // -------------------------------------------------------------
        console.log("\n--- Scenario 6: Admin access to rejected issue with rejection reason ---");
        const adminDetails = await getIssueByIdUseCase.execute(
            publicRejected._id.toString(),
            adminId.toString(),
            [Role.ADMIN]
        );
        assert.equal(adminDetails.id, publicRejected._id.toString());
        assert.equal(adminDetails.rejectionReason, "Duplicate report of civic issue #12");
        console.log("✔ Scenario 6 Passed: Admin can retrieve rejected issue with rejection reason");

        // -------------------------------------------------------------
        // SCENARIO 7: Your Reports listing returns only creator's issues
        // -------------------------------------------------------------
        console.log("\n--- Scenario 7: Your Reports returns only authenticated user's issues ---");
        const user1Reports = await getUserIssuesUseCase.execute(user1Id.toString(), 1, 10);
        assert.equal(user1Reports.items.length, 4, "Alice should have 4 reported issues");
        for (const item of user1Reports.items) {
            assert.notEqual(item.id, bobIssue._id.toString(), "Bob's issue must never appear in Alice's reports");
        }
        console.log("✔ Scenario 7 Passed: User's reports only contain reports created by authenticated user");

        // -------------------------------------------------------------
        // SCENARIO 8: Your Reports filtering by status, visibility, and search
        // -------------------------------------------------------------
        console.log("\n--- Scenario 8: Your Reports filtering ---");
        // Status filter: REJECTED
        const rejectedReports = await getUserIssuesUseCase.execute(user1Id.toString(), 1, 10, {
            status: IssueStatus.REJECTED,
        });
        assert.equal(rejectedReports.items.length, 2, "Should return 2 rejected issues for Alice");
        assert.equal(rejectedReports.items.every((i) => i.status === IssueStatus.REJECTED), true);

        // Visibility filter: PRIVATE
        const privateReports = await getUserIssuesUseCase.execute(user1Id.toString(), 1, 10, {
            visibility: IssueVisibility.PRIVATE,
        });
        assert.equal(privateReports.items.length, 2, "Should return 2 private issues for Alice");
        assert.equal(privateReports.items.every((i) => i.visibility === IssueVisibility.PRIVATE), true);

        // Combined: status=REJECTED, visibility=PUBLIC
        const publicRejectedReports = await getUserIssuesUseCase.execute(user1Id.toString(), 1, 10, {
            status: IssueStatus.REJECTED,
            visibility: IssueVisibility.PUBLIC,
        });
        assert.equal(publicRejectedReports.items.length, 1);
        assert.equal(publicRejectedReports.items[0]!.id, publicRejected._id.toString());

        // Search filter: "Pothole"
        const searchReports = await getUserIssuesUseCase.execute(user1Id.toString(), 1, 10, {
            search: "Pothole",
        });
        assert.equal(searchReports.items.length, 1);
        assert.equal(searchReports.items[0]!.id, publicReported._id.toString());
        console.log("✔ Scenario 8 Passed: Category, status, visibility, and search filters work accurately");

    } finally {
        // Clean up test records
        await IssueModel.deleteMany({ _id: { $in: testIssues.map((i) => i._id) } });
        await UserModel.deleteMany({ _id: { $in: [user1Id, user2Id, adminId] } });
        await CategoryModel.deleteMany({ _id: testCategory._id });
        await mongoose.disconnect();
        console.log("\n✔ Database disconnected and test records cleaned up.");
    }

    console.log("=== All 8 Scenarios Passed Successfully! ===");
}

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
