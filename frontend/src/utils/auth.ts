import type { AuthUser } from "../features/auth/types/authUser";

export const hasRole = (

    user: AuthUser,

    role: string

) => {

    return user.roles.includes(role as any);

};