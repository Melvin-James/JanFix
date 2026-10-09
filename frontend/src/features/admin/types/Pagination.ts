export interface PaginationMeta {
    
    page: number;

    pageSize: number;

    totalItems: number;

    totalPages: number;

}

export interface PaginatedResponse<T> {
    
    items: T[];

    pagination: PaginationMeta;

}

export interface GetUsersParams {
    page: number;

    pageSize: number;

    search?: string;

    role?: string;

    verification?: string;

    authProvider?: string;
}