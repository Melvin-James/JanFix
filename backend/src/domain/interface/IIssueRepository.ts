import type { Issue } from "../entities/Issue.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";
import type { IssueStatus } from "../enums/IssueStatus.js";
import type { IssueVisibility } from "../enums/IssueVisibility.js";

export interface IssueFilters {
    status?: IssueStatus | string;
    visibility?: IssueVisibility | string;
    category?: string;
    search?: string;
}

export interface IIssueRepository {
    create(issue: Partial<Issue>): Promise<Issue>;
    findById(id: string): Promise<Issue | null>;
    findByUserId(
        userId: string,
        page: number,
        pageSize: number,
        filters?: IssueFilters
    ): Promise<PaginatedResult<Issue>>;
    findAllPaginated(
        page: number,
        pageSize: number,
        filters?: IssueFilters
    ): Promise<PaginatedResult<Issue>>;
    update(id: string, data: Partial<Issue>): Promise<Issue | null>;
}
