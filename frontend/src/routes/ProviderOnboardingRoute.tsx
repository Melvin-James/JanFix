import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import type { ReactNode } from "react";

import LoadingSpinner from "../components/LoadingSpinner";

import { getProviderProfile } from "../features/provider/services/providerService";

import { getOnboardingRedirectPath } from "../features/provider/utils/getOnboardingRedirectPath";

interface ProviderOnboardingRouteProps {

    children: ReactNode;

    requiredStatus: string;
}

function ProviderOnboardingRoute({

    children,

    requiredStatus,

}: ProviderOnboardingRouteProps) {

    const [loading, setLoading] =
        useState(true);

    const [allowed, setAllowed] =
        useState(false);

    const [redirectPath, setRedirectPath] =
        useState("");

    useEffect(() => {

        const checkStatus =
            async () => {

                try {

                    const response =
                        await getProviderProfile();

                    const currentStatus =
                        response.provider.onboardingStatus;

                    if (
                        currentStatus ===
                        requiredStatus
                    ) {

                        setAllowed(true);

                    } else {

                        setRedirectPath(
                            getOnboardingRedirectPath(
                                currentStatus
                            )
                        );
                    }

                } catch (error) {

                    console.error(error);
                } finally {

                    setLoading(false);
                }
            };

        checkStatus();

    }, [requiredStatus]);

    if (loading) {

        return <LoadingSpinner />;
    }

    if (!allowed) {

        return (
            <Navigate
                to={redirectPath}
                replace
            />
        );
    }

    return <>{children}</>;
}

export default ProviderOnboardingRoute;