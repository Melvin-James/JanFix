import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import RegisterPage from "../features/auth/pages/RegisterPage";

import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";

import ProtectedRoute from "./ProtectedRoute";

import PublicRoute from "./PublicRoute";

import HomePage from "../pages/HomePage";

import ProviderStep1Page from "../features/provider/pages/ProviderStep1Page";

import ProviderStep2Page from "../features/provider/pages/ProviderStep2Page";

import ProviderReviewPage from "../features/provider/pages/ProviderReviewPage";

import ProviderWelcomePage from "../features/provider/pages/ProviderWelcomePage";

import RoleProtectedRoute from "./RoleProtectedRoute";

function AppRouter() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<h1>JanFix</h1>}
                />

                <Route
                    path="/login"

                    element={

                        <PublicRoute>

                            <LoginPage />

                        </PublicRoute>
                    }
                />

                <Route
                    path="/register"
                    element={

                        <PublicRoute>

                            <RegisterPage />

                        </PublicRoute>

                    }
                />

                <Route
                    path="/verify-otp"
                    element={
                    
                        <PublicRoute>

                            <VerifyOtpPage />

                        </PublicRoute>

                    }
                />

                <Route

                    path="/home"

                    element={

                        <ProtectedRoute>

                            <HomePage />

                        </ProtectedRoute>
                    }
                />

                <Route

                    path="/provider/onboarding/step-1"

                    element={

                        <RoleProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>

                            <ProviderStep1Page />

                        </RoleProtectedRoute>
                    }
                />

                <Route

                    path="/provider/onboarding/step-2"

                    element={

                        <RoleProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>

                            <ProviderStep2Page />

                        </RoleProtectedRoute>
                    }
                />

                <Route

                    path="/provider/onboarding/review"

                    element={

                        <RoleProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>

                            <ProviderReviewPage />

                        </RoleProtectedRoute>
                    }
                />

                <Route

                    path="/provider/welcome"

                    element={

                        <RoleProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>

                            <ProviderWelcomePage />

                        </RoleProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default AppRouter;