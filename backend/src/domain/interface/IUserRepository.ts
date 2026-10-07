import type { User } from "../entities/User.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";

export interface ProviderApplicationFilters {
    search?: string | undefined;
    status?: string | undefined;
    providerType?: string | undefined;
}

export interface ServiceProviderFilters {
    search?: string | undefined;
    providerType?: string | undefined;
    status?: string | undefined;
}

export interface UserManagementFilters {
    search?: string | undefined;
    role?: string | undefined;
    verification?: string | undefined;
    authProvider?: string | undefined;
}


export interface IUserRepository {
    
    findByEmail(email: string): Promise<User | null>;

    create(user: User): Promise<User>;

    updateUser(user: User): Promise<User>;

    findById(id: string): Promise<User | null>;

    findUsersWithProviderApplications(): Promise<User[]>;

    findPaginatedProviderApplications(
        page: number,
        pageSize: number,
        filters?: ProviderApplicationFilters
    ): Promise<PaginatedResult<User>>;

    findApprovedServiceProviders(): Promise<User[]>;

    findPaginatedServiceProviders(
        page: number,
        pageSize: number,
        filters?: ServiceProviderFilters
    ): Promise<PaginatedResult<User>>;

    findUsersForManagement(): Promise<User[]>;

    findPaginatedUsersForManagement(
        page: number,
        pageSize: number,
        filters?: UserManagementFilters
    ): Promise<PaginatedResult<User>>;

}
