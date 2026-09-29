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
    [key: string]: any;
}
