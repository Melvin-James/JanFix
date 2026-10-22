import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CreateIssueUseCase } from "../application/use-cases/issue/CreateIssueUseCase.js";
import { GetIssueByIdUseCase } from "../application/use-cases/issue/GetIssueByIdUseCase.js";
import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";
import { AuthProvider } from "../domain/enums/AuthProvider.js";
import { Role } from "../domain/enums/Role.js";
import type { IIssueRepository } from "../domain/interface/IIssueRepository.js";
import type { ICategoryRepository } from "../domain/interface/ICategoryRepository.js";
import type { IUserRepository } from "../domain/interface/IUserRepository.js";
import type { Issue } from "../domain/entities/Issue.js";
import type { Category } from "../domain/entities/Category.js";
import type { User } from "../domain/entities/User.js";

// In-memory repositories for verification
function createMockRepos() {
    const issues: Issue[] = [];
    const categories: Category[] = [
        {
            id: "cat-1",
            name: "Waste Management",
            description: "Garbage and public cleanliness",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "cat-inactive",
            name: "Inactive Category",
            description: "Disabled category",
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    const users: User[] = [
        {
            id: "user-1",
            fullName: "John Doe",
            email: "john@example.com",
            roles: [Role.USER],
            isVerified: true,
            authProvider: AuthProvider.LOCAL,
            accountStatus: AccountStatus.ACTIVE,
        },
        {
            id: "user-blocked",
            fullName: "Blocked User",
            email: "blocked@example.com",
            roles: [Role.USER],
            isVerified: true,
            authProvider: AuthProvider.LOCAL,
            accountStatus: AccountStatus.BLOCKED,
        },
    ];

    const issueRepo: IIssueRepository = {
        async create(data) {
            const newIssue: Issue = {
                id: `issue-${issues.length + 1}`,
                createdBy: data.createdBy!,
                title: data.title!,
                description: data.description!,
                category: data.category!,
                images: data.images || [],
                visibility: data.visibility || IssueVisibility.PUBLIC,
                location: data.location!,
                status: data.status || IssueStatus.REPORTED,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            issues.push(newIssue);
            return newIssue;
        },
        async findById(id) {
            return issues.find((i) => i.id === id) || null;
        },
        async findByUserId(userId, page, pageSize) {
            const filtered = issues.filter((i) => i.createdBy === userId);
            return {
                items: filtered.slice((page - 1) * pageSize, page * pageSize),
                pagination: {
                    page,
                    pageSize,
                    totalItems: filtered.length,
                    totalPages: 1,
                },
            };
        },
        async findAllPaginated(page, pageSize) {
            return {
                items: issues.slice((page - 1) * pageSize, page * pageSize),
                pagination: {
                    page,
                    pageSize,
                    totalItems: issues.length,
                    totalPages: 1,
                },
            };
        },
        async update(id, data) {
            const found = issues.find((i) => i.id === id);
            if (!found) return null;
            Object.assign(found, data);
            return found;
        },
    };

    const categoryRepo: ICategoryRepository = {
        async findById(id) {
            return categories.find((c) => c.id === id) || null;
        },
        async findByName(name) {
            return categories.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
        },
        async findAll() {
            return categories;
        },
        async findPaginated(page, pageSize) {
            return {
                items: categories.slice((page - 1) * pageSize, page * pageSize),
                pagination: { page, pageSize, totalItems: categories.length, totalPages: 1 },
            };
        },
        async create(c) {
            categories.push(c);
            return c;
        },
        async update(id, data) {
            const cat = categories.find((c) => c.id === id);
            if (!cat) return null;
            Object.assign(cat, data);
            return cat;
        },
    };

    const userRepo: IUserRepository = {
        async findById(id) {
            return users.find((u) => u.id === id) || null;
        },
        async findByEmail(email) {
            return users.find((u) => u.email === email) || null;
        },
        async updateUser(u) {
            return u;
        },
        async create(u) {
            users.push(u as User);
            return u as User;
        },
        async findUsersWithProviderApplications() {
            return [];
        },
        async findPaginatedProviderApplications() {
            return { items: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 } };
        },
        async findApprovedServiceProviders() {
            return [];
        },
        async findPaginatedServiceProviders() {
            return { items: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 } };
        },
        async findUsersForManagement() {
            return users;
        },
        async findPaginatedUsersForManagement() {
            return { items: users, pagination: { page: 1, pageSize: 10, totalItems: 2, totalPages: 1 } };
        },
    };

    return { issueRepo, categoryRepo, userRepo, issues };
}

describe("Issue Creation & Retrieval Verification", () => {
    it("successfully creates a valid issue with REPORTED initial status", async () => {
        const { issueRepo, categoryRepo, userRepo } = createMockRepos();
        const useCase = new CreateIssueUseCase(issueRepo, categoryRepo, userRepo);

        const result = await useCase.execute({
            createdBy: "user-1",
            title: "Severe Pothole on MG Road",
            description: "Deep pothole causing traffic and minor bike skids near the junction.",
            categoryId: "cat-1",
            visibility: IssueVisibility.PUBLIC,
            images: [
                {
                    key: "issues/images/pothole-1.jpg",
                    url: "https://janfix-storage.s3.amazonaws.com/issues/images/pothole-1.jpg",
                    originalName: "pothole-1.jpg",
                    mimeType: "image/jpeg",
                    size: 1024 * 500,
                },
            ],
            location: {
                address: "MG Road, Ravipuram, Kochi",
                coordinates: { latitude: 9.9674, longitude: 76.2848 },
                locality: "Ravipuram",
                city: "Kochi",
            },
        });

        assert.equal(result.status, IssueStatus.REPORTED, "Status must always be REPORTED");
        assert.equal(result.createdBy, "user-1");
        assert.equal(result.category, "cat-1");
        assert.equal(result.images.length, 1);
        assert.equal(result.location.coordinates.latitude, 9.9674);
    });

    it("rejects issue creation when user is blocked", async () => {
        const { issueRepo, categoryRepo, userRepo } = createMockRepos();
        const useCase = new CreateIssueUseCase(issueRepo, categoryRepo, userRepo);

        await assert.rejects(
            async () => {
                await useCase.execute({
                    createdBy: "user-blocked",
                    title: "Blocked User Issue",
                    description: "This should fail because user is blocked.",
                    categoryId: "cat-1",
                    visibility: IssueVisibility.PUBLIC,
                    images: [],
                    location: {
                        address: "Kochi",
                        coordinates: { latitude: 9.9, longitude: 76.2 },
                    },
                });
            },
            { message: "Your account has been blocked. Please contact support" }
        );
    });

    it("rejects issue creation for inactive category", async () => {
        const { issueRepo, categoryRepo, userRepo } = createMockRepos();
        const useCase = new CreateIssueUseCase(issueRepo, categoryRepo, userRepo);

        await assert.rejects(
            async () => {
                await useCase.execute({
                    createdBy: "user-1",
                    title: "Inactive Category Issue",
                    description: "This should fail because category is inactive.",
                    categoryId: "cat-inactive",
                    visibility: IssueVisibility.PUBLIC,
                    images: [],
                    location: {
                        address: "Kochi",
                        coordinates: { latitude: 9.9, longitude: 76.2 },
                    },
                });
            },
            { message: "Selected category is currently inactive" }
        );
    });

    it("rejects images exceeding 5 photos", async () => {
        const { issueRepo, categoryRepo, userRepo } = createMockRepos();
        const useCase = new CreateIssueUseCase(issueRepo, categoryRepo, userRepo);

        const sixImages = Array(6).fill(null).map((_, i) => ({
            key: `issues/images/img-${i}.jpg`,
            url: `https://s3.amazonaws.com/issues/images/img-${i}.jpg`,
            originalName: `img-${i}.jpg`,
            mimeType: "image/jpeg",
            size: 1000,
        }));

        await assert.rejects(
            async () => {
                await useCase.execute({
                    createdBy: "user-1",
                    title: "Too Many Photos",
                    description: "This has 6 photos which violates limit.",
                    categoryId: "cat-1",
                    visibility: IssueVisibility.PUBLIC,
                    images: sixImages,
                    location: {
                        address: "Kochi",
                        coordinates: { latitude: 9.9, longitude: 76.2 },
                    },
                });
            },
            { message: "An issue can have a maximum of 5 images" }
        );
    });

    it("rejects unauthorized upload key prefixes", async () => {
        const { issueRepo, categoryRepo, userRepo } = createMockRepos();
        const useCase = new CreateIssueUseCase(issueRepo, categoryRepo, userRepo);

        await assert.rejects(
            async () => {
                await useCase.execute({
                    createdBy: "user-1",
                    title: "Malicious upload key",
                    description: "Testing fraudulent S3 key prefix.",
                    categoryId: "cat-1",
                    visibility: IssueVisibility.PUBLIC,
                    images: [
                        {
                            key: "provider/identity-proofs/fake.jpg",
                            url: "https://s3.amazonaws.com/fake.jpg",
                            originalName: "fake.jpg",
                            mimeType: "image/jpeg",
                            size: 1000,
                        },
                    ],
                    location: {
                        address: "Kochi",
                        coordinates: { latitude: 9.9, longitude: 76.2 },
                    },
                });
            },
            /Unauthorized upload key prefix/
        );
    });

    it("enforces visibility rules on retrieval", async () => {
        const { issueRepo, categoryRepo, userRepo } = createMockRepos();
        const createUseCase = new CreateIssueUseCase(issueRepo, categoryRepo, userRepo);
        const getUseCase = new GetIssueByIdUseCase(issueRepo);

        // Creator creates private issue
        const privateIssue = await createUseCase.execute({
            createdBy: "user-1",
            title: "Private Community Issue",
            description: "Private issue only for the reporter for now.",
            categoryId: "cat-1",
            visibility: IssueVisibility.PRIVATE,
            images: [],
            location: {
                address: "Kochi",
                coordinates: { latitude: 9.9, longitude: 76.2 },
            },
        });

        // Creator CAN view it
        const fetchedByCreator = await getUseCase.execute(privateIssue.id, "user-1");
        assert.equal(fetchedByCreator.id, privateIssue.id);

        // Another user CANNOT view it
        await assert.rejects(
            async () => {
                await getUseCase.execute(privateIssue.id, "user-other");
            },
            { message: "You do not have permission to view this private issue" }
        );
    });
});
