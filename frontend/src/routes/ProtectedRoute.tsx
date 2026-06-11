import { Navigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";

import type { ReactNode } from "react";

interface ProtectedRouteProps {

    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {

    const accessToken = useAuthStore((state) => state.accessToken);

    const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

    if (isAuthLoading) {
        return <LoadingSpinner />;
    }

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;