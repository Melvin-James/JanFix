import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import axios from "axios";

import { registerSchema, type RegisterFormData } from "../validations/registerSchema";

import { registerUser } from "../services/authService";

import AuthLayout from "../components/AuthLayout";

import FormField from "../../../components/UI/FormField";

import PasswordField from "../components/PasswordField";

import GoogleAuthButton from "../components/GoogleAuthButton";

function RegisterPage() {
    
    const {
        
        register,
        
        handleSubmit,
        
        formState: { errors },
    
    } = useForm<RegisterFormData>({
        
        resolver: zodResolver(registerSchema),
        
        shouldUnregister: true,
    
    });

    const [loading, setLoading] = useState(false);
    
    const [serverError, setServerError] = useState("");
    
    const navigate = useNavigate();

    const onSubmit = async (data: RegisterFormData) => {

        setServerError("");
        
        try {

            setLoading(true);
            
            await registerUser(data);

            sessionStorage.setItem("pending_otp_email", data.email);

            navigate("/verify-otp");
        
        } catch (err: unknown) {
            
            if (axios.isAxiosError(err)) {
                
                setServerError(
                    
                    err.response?.data?.message || "Registration failed. Please try again."
                
                );
            
            } else if (err instanceof Error) {
                
                setServerError(err.message);
            
            } else {
                
                setServerError("Something went wrong");
            
            }
        
        } finally {
            
            setLoading(false);
        
        }
    
    };

    return (
        <AuthLayout
            title="Join the Movement for a Better City"
            subtitle="Create your JanFix account to report issues, track solutions, and help improve your community."
            heroImage="https://images.unsplash.com/photo-1694937502023-f5297fd89d36?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-[430px] rounded-lg border border-slate-300 bg-slate-50 px-8 py-9 shadow-sm"
                noValidate
            >
                <p
                    className={`text-sm text-center transition-colors ${
                        serverError ? "text-red-500" : "text-transparent select-none"
                    }`}
                >
                    {serverError || "\u00A0"}
                </p>

                <FormField
                    label="Full Name"
                    placeholder="John Doe"
                    error={errors.fullName?.message}
                    {...register("fullName")}
                />

                <FormField
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <PasswordField
                    label="Password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register("password")}
                />

                <PasswordField
                    label="Confirm Password"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? "Creating Account..." : "Continue"}
                </button>

                <GoogleAuthButton
                    onError={setServerError}
                    onLoadingChange={setLoading}
                />

                <p className="pt-4 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}

export default RegisterPage;
