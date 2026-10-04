export interface PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface PaginatedResult<T> {
    items: T[];
    pagination: PaginationMeta;
}

export interface PaginationQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    role?: string;
    verification?: string;
    authProvider?: string;
    providerType?: string;
}
