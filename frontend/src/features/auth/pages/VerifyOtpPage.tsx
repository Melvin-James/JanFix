import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";

import { verifyOtpSchema, type VerifyOtpFormData } from "../validations/verifyOtpSchema";

import { verifyOtp, resendOtp } from "../services/authService";

import AuthLayout from "../components/AuthLayout";

import OtpInput from "../components/OtpInput";

import useCountdown from "../../../hooks/useCountdown";

function VerifyOtpPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

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

    } = useForm<VerifyOtpFormData>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: {
            otp: "",
        },
        mode: "onSubmit",
    });

    const otp = watch("otp");

    useEffect(() => {

        const pendingEmail = sessionStorage.getItem("pending_otp_email");
        
        if(!pendingEmail) {
            navigate("/register", {replace: true});
            return;
        }

        setEmail(pendingEmail);

        startCountdown(30);

    }, [email, navigate, startCountdown]);


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
                purpose: "VERIFY_ACCOUNT",
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


    const onSubmit = async (data: VerifyOtpFormData) => {
        try {
            setLoading(true);
            setServerError("");

            await verifyOtp({ email, otp: data.otp });

            sessionStorage.removeItem("pending_otp_email");

            navigate("/login");
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setServerError(
                    error.response?.data?.message ||
                    "Something went wrong."
                );
            } else if (error instanceof Error) {
                setServerError(error.message);
            } else {
                setServerError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    const validationError = errors.otp?.message;

    return (
        <AuthLayout
            title="Verify Code"
            subtitle={`We've sent a 6-digit code to ${email || "your email"}. Enter it below to complete verification`}
            heroImage="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80"
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                noValidate
            >

                <div>
                    <label className="mb-3 block text-xs font-medium text-gray-500">
                        Verification code
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

            </form>
        </AuthLayout>
    )
}

export default VerifyOtpPage;