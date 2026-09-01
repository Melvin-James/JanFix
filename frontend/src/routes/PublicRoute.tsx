import { Navigate }from "react-router-dom";

import {useAuthStore} from "../store/authStore";

import LoadingSpinner from "../components/LoadingSpinner";

import ProviderRedirect from "../features/provider/components/ProviderRedirect";

import type {ReactNode} from "react";

import { hasRole } from "../utils/auth";

interface PublicRouteProps {
  
  children: ReactNode;

}

function PublicRoute({ children }: PublicRouteProps) {

    const user =
        useAuthStore((state) => state.user);

    const isAuthLoading =
        useAuthStore((state) => state.isAuthLoading);

    if (isAuthLoading) {

        return <LoadingSpinner />;
    }

    if (!user) {

        return <>{children}</>;
    }

    if (hasRole(user, "ADMIN")) {

        return <Navigate to="/dashboard" replace />;
    }

    if (hasRole(user, "SERVICE_PROVIDER")) {

        return <ProviderRedirect />;
    }

    return <Navigate to="/home" replace />;
}

export default PublicRoute;