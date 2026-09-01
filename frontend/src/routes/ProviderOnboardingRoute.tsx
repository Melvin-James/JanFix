import { Navigate } from "react-router-dom";

import type { ReactNode } from "react";

import { useEffect, useState } from "react";

import { useProviderOnboardingStore } from "../features/provider/store/providerOnboardingStore";

import { getProviderProfile } from "../features/provider/services/providerService";

interface ProviderOnboardingRouteProps{

    children: ReactNode;
    step: number;
}

function ProviderOnboardingRoute({children, step}: ProviderOnboardingRouteProps) {


    const draft = useProviderOnboardingStore(s => s.draft);

    const [checkingProvider, setCheckingProvider] = useState(true);

    const [hasProviderProfile, setHasProviderProfile] = useState(false);

    useEffect(()=>{
        const checkProviderProfile = async() =>{
            try{
                await getProviderProfile();

                setHasProviderProfile(true);
            }catch(error: any){
                if(error.response?.status === 404){
                    setHasProviderProfile(false);
                }else{
                    console.error(
                        "Failed to check provider profile",
                        error
                    )
                }
            }finally{
                setCheckingProvider(false);
            }
        }
        checkProviderProfile();
    },[]);

    if(checkingProvider){
        return null;
    }

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