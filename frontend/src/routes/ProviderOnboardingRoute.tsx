import { Navigate } from "react-router-dom";

import type { ReactNode } from "react";

import { useAuthStore } from "../store/authStore";

import { useProviderOnboardingStore } from "../features/provider/store/providerOnboardingStore";


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

    const hasProviderProfile = !!user?.providerProfile;


    if(hasProviderProfile){
        return(
            <Navigate
                to="/provider/application-submitted"
                replace
            />
        );
    }



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