import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";

interface ProviderModeRouteProps {
  children: ReactNode;
  allowInactive?: boolean;
}

export default function ProviderModeRoute({
  children,
  allowInactive = false,
}: ProviderModeRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const activeMode = useAuthStore((state) => state.activeMode);

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  // Must be logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Must be an approved provider
  const isApproved =
    Boolean(user.providerAccess?.isApproved) ||
    user.providerProfile?.status?.applicationStatus === "APPROVED";

  if (!isApproved) {
    return <Navigate to="/home" replace />;
  }

  // Must have activeMode === "SERVICE_PROVIDER"
  if (activeMode !== "SERVICE_PROVIDER") {
    return <Navigate to="/home" replace />;
  }

  const isActivated =
    Boolean(user.providerAccess?.isActivated) ||
    user.providerProfile?.status?.providerStatus === "ACTIVE";

  // If this is the activation gate page:
  if (allowInactive) {
    if (isActivated) {
      // Already activated -> go to provider dashboard
      return <Navigate to="/provider/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Standard provider workspace routes require an activated account
  if (!isActivated) {
    return <Navigate to="/provider/activation" replace />;
  }

  return <>{children}</>;
}
