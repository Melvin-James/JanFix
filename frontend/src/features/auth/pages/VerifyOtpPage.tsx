// VerifyOtpPage.tsx
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

import { useForm } from "react-hook-form";

import { useLocation, useNavigate, Link } from "react-router-dom";

import { verifyOtp } from "../services/authService";

import { zodResolver } from "@hookform/resolvers/zod";

import { verifyOtpSchema } from "../validations/verifyOtpSchema";

type FormValues = { otp: string };

function VerifyOtpPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const email: string | undefined = location.state?.email;

    const { handleSubmit, setValue } = useForm<FormValues>({

        resolver:
            zodResolver(
                verifyOtpSchema
            ),

        defaultValues: {

            otp: "",
        },
    });

    const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string>("");
    const [secondsLeft, setSecondsLeft] = useState(30);

    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    // countdown for resend
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [secondsLeft]);

    // keep RHF value in sync
    useEffect(() => {
        setValue("otp", digits.join(""));
    }, [digits, setValue]);

    const focusInput = (i: number) => {
        const el = inputsRef.current[i];
        if (el) el.focus();
    };

    useEffect(() => {

        if (!email) {

            navigate("/register");
        }

    }, [email, navigate]);

    const handleChange = (i: number, value: string) => {
        const v = value.replace(/\D/g, "").slice(-1); // last typed digit only
        const next = [...digits];
        next[i] = v;
        setDigits(next);
        if (v && i < 5) focusInput(i + 1);
    };

    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[i]) {
                const next = [...digits];
                next[i] = "";
                setDigits(next);
            } else if (i > 0) {
                focusInput(i - 1);
            }
        } else if (e.key === "ArrowLeft" && i > 0) focusInput(i - 1);
        else if (e.key === "ArrowRight" && i < 5) focusInput(i + 1);
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const next = ["", "", "", "", "", ""];
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setDigits(next);
        focusInput(Math.min(pasted.length, 5));
    };

    const onSubmit = async (data: FormValues) => {
        setError("");
        try {
            setLoading(true);
            await verifyOtp({ email, otp: data.otp });
            navigate("/login");
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Invalid or expired code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (secondsLeft > 0 || resending) return;
        try {
            setResending(true);
            setError("");
            // await resendOtp({ email });
            await new Promise(resolve => setTimeout(resolve, 1500)); // Mock delay until implemented
            setDigits(["", "", "", "", "", ""]);
            setSecondsLeft(30);
            focusInput(0);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to resend code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* LEFT visual */}
            <div className="hidden md:flex md:w-1/2 relative">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80)",
                    }}
                />
                <div className="absolute inset-0 bg-blue-700/70 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 to-blue-900/60" />
                <div className="relative z-10 mt-auto p-10 text-white">
                    <h2 className="text-3xl font-semibold">JanFix</h2>
                    <p className="mt-2 max-w-sm text-sm text-white/80">
                        Empowering citizens to build smarter cities through real-time reporting and
                        transparent governance.
                    </p>
                </div>
            </div>

            {/* RIGHT form */}
            <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-12">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full max-w-md"
                    noValidate
                >
                    <h1 className="text-2xl font-bold text-gray-900">Verify Your Account</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        We&apos;ve sent a 6-digit code to{" "}
                        <span className="font-medium text-gray-700">{email || "your email"}</span>.
                        Enter it below to complete your registration.
                    </p>

                    <div className="mt-8">
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            Verification Code
                        </label>

                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                            {digits.map((d, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputsRef.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    value={d}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={handlePaste}
                                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg border border-gray-300 bg-white text-center text-xl font-semibold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            ))}
                        </div>

                        {/* reserved error line — keeps layout stable */}
                        <div className="min-h-[20px] mt-2 text-xs text-red-500">
                            {error || "\u00A0"}
                        </div>

                        <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-gray-500">Didn&apos;t receive code?</span>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={secondsLeft > 0 || resending}
                                className="font-semibold text-blue-600 disabled:text-blue-400 disabled:cursor-not-allowed"
                            >
                                {resending ? "Sending..." : "Resend OTP"}{" "}
                                <span className="text-gray-400 font-normal">
                                    {secondsLeft > 0 ? `(${secondsLeft}s)` : ""}
                                </span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Verifying..." : (
                            <>
                                Create Account
                                <span aria-hidden>→</span>
                            </>
                        )}
                    </button>

                    <div className="mt-6 border-t border-gray-200 pt-4 text-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <span aria-hidden>←</span> Back to Signup
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default VerifyOtpPage;
