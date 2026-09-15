// VerifyResetOtpPage.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  verifyResetOtpSchema,
  type VerifyResetOtpFormData,
} from "../validations/verifyResetOtpSchema";
import { verifyResetOtp } from "../services/authService";
import FormError from "../../../components/UI/FormError";

function VerifyResetOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyResetOtpSchema),
    shouldUnregister: true,
  });

  useEffect(() => {
    setValue("otp", otp.join(""));
  }, [otp, setValue]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    const newOtp = [...otp];
    pasted.split("").forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = () => {
    // Wire this to your resend service when ready
    setCanResend(false);
    setCountdown(30);
  };

  const onSubmit = async (data: VerifyResetOtpFormData) => {
    setServerError("");
    try {
      setLoading(true);

      const response = await verifyResetOtp({
        email,
        otp: data.otp,
      });

      const resetToken = response.data.resetToken;

      navigate("/reset-password", {
        state: { resetToken },
      });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setServerError(
          e.response?.data?.message || "Something went wrong"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-white">
      {/* Left side */}
      <section className="relative hidden w-1/2 lg:block">
        <img
          src="https://images.unsplash.com/photo-1695692929091-cdafc96ec082?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="City skyline"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white">
          <h1 className="text-3xl font-bold tracking-tight">JanFix</h1>
          <p className="mt-2 text-sm text-white/80">
            Reliable Civic Solutions for a Modern Community.
          </p>
        </div>
      </section>

      {/* Right side */}
      <section className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Verify Code
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter the 6-digit code sent to your email and set a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="otp-0"
                className="mb-3 block text-sm font-medium text-slate-700"
              >
                Verification Code
              </label>

              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="h-12 w-12 rounded-lg border border-slate-300 text-center text-lg font-semibold text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                ))}
              </div>

              <input type="hidden" {...register("otp")} />

              <div className="min-h-6 pt-1" aria-live="polite">

                {serverError && <FormError message={serverError} />}

              </div>

            </div>

            <button
              type="submit"
              disabled={loading || otp.some((d) => !d)}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Didn&apos;t receive a code?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-slate-400">
                  Resend OTP in 00:
                  {countdown.toString().padStart(2, "0")}
                </span>
              )}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default VerifyResetOtpPage;
