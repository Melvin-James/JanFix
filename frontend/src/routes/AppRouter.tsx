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

import ProviderOnboardingRoute from "./ProviderOnboardingRoute";

import ProviderWelcomePage from "../features/provider/pages/ProviderWelcomePage";

import ProviderSubmissionPage from "../features/provider/pages/ProviderSubmissionPage";

function AppRouter() {

    return (

        <BrowserRouter>

            <Routes>

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

                        <ProtectedRoute>

                            <ProviderOnboardingRoute step={1}>

                                <ProviderStep1Page />

                            </ProviderOnboardingRoute>

                        </ProtectedRoute>

                    }
                />

                <Route

                    path="/provider/onboarding/step-2"

                    element={
                        <ProtectedRoute>

                            <ProviderOnboardingRoute step={2}>

                                <ProviderStep2Page />

                            </ProviderOnboardingRoute>
                        </ProtectedRoute>

                    }
                />

                <Route

                    path="/provider/onboarding/review"

                    element={
                        <ProtectedRoute>

                            <ProviderOnboardingRoute step={3}>

                                <ProviderReviewPage />

                            </ProviderOnboardingRoute>
                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/provider/application-submitted"
                    element={
                        <ProtectedRoute>
                            <ProviderWelcomePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/provider/submission'

                    element={

                        <ProtectedRoute>

                            <ProviderSubmissionPage />

                        </ProtectedRoute>
                    }
                />


            </Routes>


        </BrowserRouter>
    );
}

export default AppRouter;