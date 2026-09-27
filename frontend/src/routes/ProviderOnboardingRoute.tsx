import { Navigate } from "react-router-dom";

import type { ReactNode } from "react";

import { useAuthStore } from "../store/authStore";

import { useProviderOnboardingStore } from "../features/provider/store/providerOnboardingStore";

import { ApplicationStatus } from "../features/provider/constants/applicationStatus";


interface ProviderOnboardingRouteProps{

    children: ReactNode;
    step: number;
}

function ProviderOnboardingRoute({children, step}: ProviderOnboardingRouteProps) {


    const draft = useProviderOnboardingStore(s => s.draft);

    const user = useAuthStore(
        state => state.user
    );

    const isAuthLoading = useAuthStore(
        state => state.isAuthLoading
    )

    if(isAuthLoading){
        return null;
    }

    const providerProfile = user?.providerProfile;
    const applicationStatus = providerProfile?.status?.applicationStatus;
    const isRejected = applicationStatus === ApplicationStatus.REJECTED;

    // Rejected providers are allowed into the onboarding flow for resubmission.
    // They enter via ProviderSubmissionPage → Resubmit button → step 2,
    // which hydrates the draft before navigating, so draft.providerType is set.
    if (providerProfile && !isRejected) {
        return(
            <Navigate
                to="/provider/application-submitted"
                replace
            />
        );
    }


    // Step 2: require providerType in draft (set by Step 1 for new providers,
    // or by ProviderSubmissionPage hydration for rejected providers).
    if (step === 2 && !draft.providerType) {

        return <Navigate
            to="/provider/onboarding/step-1"
        />

    }


    if (step === 3) {


        if (
            !draft.providerName ||
            !draft.identityProof
        ) {

            return <Navigate
                to="/provider/onboarding/step-2"
            />

        }

    }


    return children;


}


export default ProviderOnboardingRoute;