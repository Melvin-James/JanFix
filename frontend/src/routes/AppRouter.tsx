import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import RegisterPage from "../features/auth/pages/RegisterPage";

import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";

import ProtectedRoute from "./ProtectedRoute";

import PublicRoute from "./PublicRoute";

import HomePage from "../pages/HomePage";

import ProviderOnboardingPage from "../pages/provider/ProviderOnboardingPage";

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

                    path="/provider/onboarding"

                    element={

                        <ProtectedRoute>

                            <ProviderOnboardingPage />

                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default AppRouter;