import { useState, useEffect, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { getProviderProfile } from "../services/providerService";
import { getOnboardingRedirectPath } from "../utils/getOnboardingRedirectPath";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ErrorState from "../../../components/UI/ErrorState";
import { useAuthStore } from "../../../store/authStore";

function ProviderRedirect() {
  const user = useAuthStore((state) => state.user);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const isMountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isApproved =
        Boolean(user?.providerAccess?.isApproved) ||
        user?.providerProfile?.status?.applicationStatus === "APPROVED";

      if (isApproved) {
        const hasPayoutDetails = Boolean(
          user?.providerAccess?.hasPayoutDetails ||
          (user?.providerProfile?.payoutDetails?.accountHolderName &&
           user?.providerProfile?.payoutDetails?.upiId)
        );
        const isActivated =
          Boolean(user?.providerAccess?.isActivated) ||
          (user?.providerProfile?.status?.providerStatus === "ACTIVE" && hasPayoutDetails);

        if (isMountedRef.current) {
          setRedirectPath(isActivated ? "/provider/dashboard" : "/provider/activation");
        }
        return;
      }

      const response = await getProviderProfile();
      if (isMountedRef.current) {
        setRedirectPath(
          getOnboardingRedirectPath(
            response.provider.onboardingStatus
          )
        );
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const msg = err instanceof Error ? err.message : "Failed to load provider profile";
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchProfile();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchProfile]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ErrorState message={error} />
        <button
          type="button"
          onClick={() => {
            fetchProfile();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !redirectPath) {
    return <LoadingSpinner />;
  }

  return (
    <Navigate
      to={redirectPath}
      replace
    />
  );
}

export default ProviderRedirect;