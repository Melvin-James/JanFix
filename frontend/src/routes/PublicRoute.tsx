import { Navigate }from "react-router-dom";

import {useAuthStore} from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";

import type {ReactNode} from "react";

interface PublicRouteProps {
  
  children: ReactNode;

}

function PublicRoute({children}: PublicRouteProps) {

  const user =useAuthStore((state) => state.user);

  const isAuthLoading =
    useAuthStore((state) =>state.isAuthLoading);

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (user) {

    if (user.role === "USER") {

      return (

        <Navigate to="/home" replace/>

      );
    }

    if (user.role ==="SERVICE_PROVIDER") {

      return (

        <Navigate to="/provider/onboarding" replace/>

      );
    }

    return (

      <Navigate to="/dashboard" replace/>

    );
    
  }

  return <>{children}</>;
}

export default PublicRoute;