import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import LoadingSpinner from "../components/LoadingSpinner";

import ProviderRedirect from "../features/provider/components/ProviderRedirect";

import type { ReactNode } from "react";

import { hasRole } from "../utils/auth";

interface PublicRouteProps {
  
  children: ReactNode;

}

function PublicRoute({ children }: PublicRouteProps) {

    const user =
        useAuthStore((state) => state.user);

    const isAuthLoading =
        useAuthStore((state) => state.isAuthLoading);

    const activeMode =
        useAuthStore((state) => state.activeMode);

    const location = useLocation();

    if (isAuthLoading) {

        return <LoadingSpinner />;
    }

    if (!user) {

        return <>{children}</>;
    }

    if (hasRole(user, "ADMIN")) {

        return <Navigate to="/admin" replace />;
    }

    if (activeMode === "SERVICE_PROVIDER") {

        return <ProviderRedirect />;
    }

    const state = location.state as { from?: { pathname?: string; search?: string } | string } | undefined;
    let target = "/home";
    if (state?.from) {
      if (typeof state.from === "string") {
        target = state.from;
      } else if (state.from.pathname) {
        target = `${state.from.pathname}${state.from.search || ""}`;
      }
    }

    return <Navigate to={target} replace />;
}

export default PublicRoute;