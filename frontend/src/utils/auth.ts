import type { AuthUser } from "../features/auth/types/authUser";
import type { UserRole } from "../types/user";

export const hasRole = (
    user: AuthUser,
    role: UserRole
): boolean => {
    return user.roles.includes(role);
};