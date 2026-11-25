import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import LoadingSpinner from "../components/LoadingSpinner";

import type { ReactNode } from "react";

interface ProtectedRouteProps {

    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {

    const user = useAuthStore((state) => state.user);

    const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
    const location = useLocation();

    if (isAuthLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;