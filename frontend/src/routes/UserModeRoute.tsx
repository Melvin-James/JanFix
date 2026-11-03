import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";

interface UserModeRouteProps {
  children: ReactNode;
}

export default function UserModeRoute({ children }: UserModeRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const activeMode = useAuthStore((state) => state.activeMode);

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If in SERVICE_PROVIDER mode, redirect to appropriate provider workspace route
  if (activeMode === "SERVICE_PROVIDER") {
    const isActivated =
      Boolean(user.providerAccess?.isActivated) ||
      user.providerProfile?.status?.providerStatus === "ACTIVE";

    return (
      <Navigate
        to={isActivated ? "/provider/dashboard" : "/provider/activation"}
        replace
      />
    );
  }

  return <>{children}</>;
}
