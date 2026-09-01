import { useState, useEffect } from "react";

import { Navigate } from "react-router-dom";

import { getProviderProfile } from "../services/providerService";

import { getOnboardingRedirectPath } from "../utils/getOnboardingRedirectPath";

import LoadingSpinner from "../../../components/LoadingSpinner";

function ProviderRedirect() {

  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {

    const fetchProfile = async () => {

      const response = await getProviderProfile();

      setRedirectPath(
        getOnboardingRedirectPath(
          response.provider.onboardingStatus
        )
      );
    };

    fetchProfile();

  }, []);

  if (!redirectPath) {

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