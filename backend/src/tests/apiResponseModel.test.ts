import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Response } from "express";
import {
    sendSuccess,
    sendPaginated,
    sendError,
    type ApiResponse,
} from "../shared/response/ApiResponse.js";
import { HttpStatusCode } from "../shared/enums/HttpStatusCode.js";
import type { PaginationMeta } from "../shared/types/Pagination.js";

interface MockResponsePayload {
    statusCode: number;
    body: ApiResponse<unknown>;
}

function createMockResponse(): { res: Response; getCaptured: () => MockResponsePayload } {
    const state: MockResponsePayload = {
        statusCode: 200,
        body: { success: false },
    };

    const res = {
        status(code: number) {
            state.statusCode = code;
            return this;
        },
        json(payload: ApiResponse<unknown>) {
            state.body = payload;
            return this;
        },
    } as unknown as Response;

    return {
        res,
        getCaptured: () => state,
    };
}

describe("Centralized ApiResponse Model & Helper Functions", () => {
    it("sendSuccess sends standardized success payload with data and message", () => {
        const { res, getCaptured } = createMockResponse();
        const testUser = { id: "u-123", fullName: "Jane Doe" };

        sendSuccess(res, testUser, "User retrieved successfully", HttpStatusCode.OK);

        const captured = getCaptured();
        assert.equal(captured.statusCode, 200);
        assert.equal(captured.body.success, true);
        assert.equal(captured.body.message, "User retrieved successfully");
        assert.deepEqual(captured.body.data, testUser);
    });

    it("sendSuccess supports custom status code like 201 Created", () => {
        const { res, getCaptured } = createMockResponse();
        const testIssue = { id: "iss-1", title: "Broken water main" };

        sendSuccess(res, testIssue, "Issue created", HttpStatusCode.CREATED, { issue: testIssue });

        const captured = getCaptured();
        assert.equal(captured.statusCode, 201);
        assert.equal(captured.body.success, true);
        assert.equal(captured.body.message, "Issue created");
        assert.deepEqual(captured.body.data, testIssue);
        // Backward-compatible alias
        assert.deepEqual((captured.body as Record<string, unknown>).issue, testIssue);
    });

    it("sendSuccess works with undefined data (message-only success)", () => {
        const { res, getCaptured } = createMockResponse();

        sendSuccess(res, undefined, "Logged out successfully");

        const captured = getCaptured();
        assert.equal(captured.statusCode, 200);
        assert.equal(captured.body.success, true);
        assert.equal(captured.body.message, "Logged out successfully");
        assert.equal(captured.body.data, undefined);
    });

    it("sendPaginated sends data array, pagination meta, and backward-compatible alias key", () => {
        const { res, getCaptured } = createMockResponse();
        const items = [
            { id: "iss-1", title: "Pothole on Main St" },
            { id: "iss-2", title: "Streetlight not working" },
        ];
        const pagination: PaginationMeta = {
            page: 1,
            pageSize: 10,
            totalItems: 2,
            totalPages: 1,
        };

        sendPaginated(res, items, pagination, "issues", HttpStatusCode.OK);

        const captured = getCaptured();
        assert.equal(captured.statusCode, 200);
        assert.equal(captured.body.success, true);
        assert.deepEqual(captured.body.data, items);
        assert.deepEqual(captured.body.pagination, pagination);
        // 100% backward compatibility for legacy frontend callers accessing response.data.issues
        assert.deepEqual((captured.body as Record<string, unknown>).issues, items);
    });

    it("sendError sends standardized error payload with status code", () => {
        const { res, getCaptured } = createMockResponse();

        sendError(res, "Resource not found", HttpStatusCode.NOT_FOUND);

        const captured = getCaptured();
        assert.equal(captured.statusCode, 404);
        assert.equal(captured.body.success, false);
        assert.equal(captured.body.message, "Resource not found");
        assert.equal(captured.body.errors, undefined);
    });

    it("sendError includes errors details when provided", () => {
        const { res, getCaptured } = createMockResponse();
        const validationIssues = [{ field: "email", message: "Invalid email address" }];

        sendError(res, "Validation failed", HttpStatusCode.BAD_REQUEST, validationIssues);

        const captured = getCaptured();
        assert.equal(captured.statusCode, 400);
        assert.equal(captured.body.success, false);
        assert.equal(captured.body.message, "Validation failed");
        assert.deepEqual(captured.body.errors, validationIssues);
    });
});

