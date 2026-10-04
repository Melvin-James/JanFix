import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

import { verifyOtp, resendOtp } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import OtpInput from "../../../components/UI/OtpInput";
import useCountdown from "../../../hooks/useCountdown";

function VerifyOtpPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Preserve email across accidental page refreshes
    const stateEmail = location.state?.email as string | undefined;
    const [email, setEmail] = useState<string>(() => {
        if (stateEmail) {
            sessionStorage.setItem("pending_otp_email", stateEmail);
            return stateEmail;
        }
        return sessionStorage.getItem("pending_otp_email") || "";
    });

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");

    const { secondsLeft, isRunning, start: startCountdown } = useCountdown(30);

    useEffect(() => {
        if (stateEmail) {
            setEmail(stateEmail);
            sessionStorage.setItem("pending_otp_email", stateEmail);
        }
    }, [stateEmail]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Email address is missing. Please go back to registration.");
            return;
        }

        if (otp.length < 6) {
            setError("Please enter the complete 6-digit verification code.");
            return;
        }

        try {
            setLoading(true);
            await verifyOtp({ email, otp });
            sessionStorage.removeItem("pending_otp_email");
            navigate("/login");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Invalid or expired code.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Verification failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (isRunning || resending) return;
        setError("");

        if (!email) {
            setError("Missing email address");
            return;
        }

        try {
            setResending(true);
            await resendOtp({ email, purpose: "VERIFY_ACCOUNT" });
            setOtp("");
            startCountdown(30);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Failed to resend code.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to resend code.");
            }
        } finally {
            setResending(false);
        }
    };

    return (
        <AuthLayout
            title="Verify Your Account"
            subtitle={`We've sent a 6-digit code to ${email || "your email"}. Enter it below to complete your registration.`}
            heroImage="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80"
        >
            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
                noValidate
            >
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-3">
                        Verification Code
                    </label>

                    <OtpInput
                        value={otp}
                        onChange={setOtp}
                        disabled={loading}
                    />

                    <div className="min-h-[20px] mt-2 text-xs text-red-500">
                        {error || "\u00A0"}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Didn&apos;t receive code?</span>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isRunning || resending}
                            className="font-semibold text-blue-600 disabled:text-blue-400 disabled:cursor-not-allowed hover:underline transition"
                        >
                            {resending ? "Sending..." : "Resend OTP"}{" "}
                            {isRunning && (
                                <span className="text-gray-400 font-normal">
                                    ({secondsLeft}s)
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? "Verifying..." : "Create Account →"}
                </button>

                <div className="border-t border-gray-200 pt-4 text-center">
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
                    >
                        <span>←</span> Back to Signup
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default VerifyOtpPage;
