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

export interface GetProviderApplicationsParams {
    
    page: number;

    pageSize: number;
    
    search?: string;
    
    status?: string;
    
    providerType?: string;

}

export interface GetServiceProviderParams {

    page: number;
    
    pageSize: number;
    
    search?: string;
    
    providerType?: string;
    
    status?: string;

}

export interface GetCategoriesParams {
    page: number;
    pageSize: number;
    search?: string;
    status?: "ACTIVE" | "INACTIVE";
}
