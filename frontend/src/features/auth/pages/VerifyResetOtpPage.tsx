import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";

import {verifyResetOtpSchema, type VerifyResetOtpFormData,} from "../validations/verifyResetOtpSchema";

import {verifyResetOtp, resendOtp,} from "../services/authService";

import AuthLayout from "../components/AuthLayout";

import OtpInput from "../components/OtpInput";

import useCountdown from "../../../hooks/useCountdown";

function VerifyResetOtpPage() {

    const location = useLocation();

    const navigate = useNavigate();

    const email = location.state?.email;

    const [loading, setLoading] = useState(false);

    const [resending, setResending] = useState(false);
    
    const [serverError, setServerError] = useState("");

    const {
        secondsLeft,
        isRunning,
        start: startCountdown,
    } = useCountdown(30);

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<VerifyResetOtpFormData>({
        resolver: zodResolver(verifyResetOtpSchema),
        defaultValues: {
            otp: "",
        },
        mode: "onSubmit",
    });

    const otp = watch("otp");

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleOtpChange = (value: string) => {
        setValue("otp", value, {
            shouldValidate: false,
            shouldDirty: true,
        });

        if (serverError) {
            setServerError("");
        }
    };

    const handleResend = async () => {
        if (!email || isRunning || resending) {
            return;
        }

        try {
            setResending(true);
            setServerError("");

            await resendOtp({
                email,
                purpose: "RESET_PASSWORD",
            });

            setValue("otp", "", {
                shouldValidate: false,
                shouldDirty: false,
            });

            startCountdown(30);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setServerError(
                    error.response?.data?.message ||
                    "Failed to resend code."
                );
            } else if (error instanceof Error) {
                setServerError(error.message);
            } else {
                setServerError("Failed to resend code.");
            }
        } finally {
            setResending(false);
        }
    };

    const onSubmit = async (data: VerifyResetOtpFormData) => {
        try {
            setLoading(true);
            setServerError("");

            const response = await verifyResetOtp({
                email,
                otp: data.otp,
            });

            const resetToken = response.data.resetToken;

            navigate("/reset-password", {
                state: { resetToken },
            });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setServerError(
                    error.response?.data?.message ||
                    "Something went wrong."
                );
            } else if (error instanceof Error) {
                setServerError(error.message);
            } else {
                setServerError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    const validationError = errors.otp?.message;

    return (
        <AuthLayout
            title="Verify Code"
            subtitle={`We've sent a 6-digit code to ${
                email || "your email"
            }. Enter it below to complete your reset.`}
            heroImage="https://images.unsplash.com/photo-1695692929091-cdafc96ec082?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfDB8fHx8fA%3D%3D"
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                noValidate
            >
                <div>
                    <label className="mb-3 block text-xs font-medium text-gray-500">
                        Verification Code
                    </label>

                    <OtpInput
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={loading}
                    />

                    <div className="mt-2 min-h-[20px] text-xs text-red-500">
                        {validationError || serverError || "\u00A0"}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                            Didn&apos;t receive code?
                        </span>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isRunning || resending}
                            className="font-semibold text-blue-600 transition hover:underline disabled:cursor-not-allowed disabled:text-blue-400"
                        >
                            {resending ? "Sending..." : "Resend OTP"}{" "}
                            {isRunning && (
                                <span className="font-normal text-gray-400">
                                    ({secondsLeft}s)
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? "Verifying..." : "Verify Code"}
                </button>

                <div className="border-t border-gray-200 pt-4 text-center">
                    <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-sm text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Forgot Password
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}

export default VerifyResetOtpPage;