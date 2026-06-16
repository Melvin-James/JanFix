import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import LoadingSpinner from "../components/LoadingSpinner";

interface RoleProtectedRouteProps {

    children: ReactNode;

    allowedRoles: string[];
}

function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {

    const accessToken = useAuthStore((state) => state.accessToken);

    const user = useAuthStore((state) => state.user);

    const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

    if (isAuthLoading) { return <LoadingSpinner /> }

    if (!accessToken || !user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        !allowedRoles.includes(
            user.role
        )
    ) {

        return (
            <Navigate
                to="/home"
                replace
            />
        );
    }

    return <>{children}</>;
}

export default RoleProtectedRoute;