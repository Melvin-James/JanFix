import { Navigate } from "react-router-dom";

import type {ReactNode} from "react";

import { useAuthStore } from "../store/authStore";

interface ProviderRouteProps{
    children: ReactNode;
}

function ProviderRoute({
    children
}: ProviderRouteProps) {

    const user = useAuthStore(
        state => state.user
    )

    const isAuthLoading = useAuthStore(
        state => state.isAuthLoading
    )

    if(isAuthLoading){
        return null;
    }

    if(!user?.providerProfile){
        return(
            <Navigate
                to="/home"
                replace
            />
        )
    }

    return children;

}

export default ProviderRoute;