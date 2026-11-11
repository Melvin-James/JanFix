import type { Response } from "express";
import type { PaginationMeta } from "../types/Pagination.js";
import { HttpStatusCode } from "../enums/HttpStatusCode.js";

/**
 * Standardized API response contract across JanFix backend.
 * Generic parameter T represents the payload data type.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: PaginationMeta;
    errors?: unknown;
    [key: string]: unknown;
}

export interface ApiSuccessResponse<T = unknown> extends ApiResponse<T> {
    success: true;
    data?: T;
    message?: string;
    pagination?: PaginationMeta;
}

export interface ApiErrorResponse extends ApiResponse<never> {
    success: false;
    message: string;
    errors?: unknown;
}

/**
 * Low-level response dispatcher.
 */
export function sendResponse<T>(
    res: Response,
    statusCode: number,
    payload: ApiResponse<T>
): void {
    res.status(statusCode).json(payload);
}

/**
 * Sends a standardized successful response.
 * Supports an optional backward-compatibility extra object to ensure
 * existing frontend consumers expecting specific root-level property names remain unbroken.
 */
export function sendSuccess<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = HttpStatusCode.OK,
    extra?: Record<string, unknown>
): void {
    const payload: ApiResponse<T> = {
        success: true,
        ...(message !== undefined && { message }),
        ...(data !== undefined && { data }),
        ...(extra && extra),
    };

    res.status(statusCode).json(payload);
}

/**
 * Sends a standardized paginated response.
 * Accepts items and pagination metadata, and populates both `data: items` and `[keyName]: items`
 * for 100% backward compatibility with legacy frontend callers.
 */
export function sendPaginated<T>(
    res: Response,
    items: T[],
    pagination: PaginationMeta,
    keyName?: string,
    statusCode: number = HttpStatusCode.OK,
    message?: string,
    extra?: Record<string, unknown>
): void {
    const payload: ApiResponse<T[]> = {
        success: true,
        ...(message !== undefined && { message }),
        data: items,
        pagination,
        ...(keyName ? { [keyName]: items } : {}),
        ...(extra && extra),
    };

    res.status(statusCode).json(payload);
}

/**
 * Sends a standardized error response.
 */
export function sendError(
    res: Response,
    message: string,
    statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
    errors?: unknown,
    extra?: Record<string, unknown>
): void {
    const payload: ApiErrorResponse = {
        success: false,
        message,
        ...(errors !== undefined && { errors }),
        ...(extra && extra),
    };

    res.status(statusCode).json(payload);
}

