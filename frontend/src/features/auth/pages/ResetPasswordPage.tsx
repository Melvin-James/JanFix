// ResetPasswordPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../validations/resetPasswordSchema";
import { resetPassword } from "../services/authService";
import FormError from "../../../components/UI/FormError";

function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const resetToken: string | undefined = location.state?.resetToken;

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password");
    }
  }, [resetToken, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    shouldUnregister: true,
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError("");

    if (!resetToken) {
      navigate("/forgot-password");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      navigate("/login");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setServerError(e.response?.data?.message || "Something went wrong");
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
          src="https://images.unsplash.com/photo-1558026411-563830332bd8?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
              Reset Password
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("newPassword")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="min-h-6 pt-1" aria-live="polite">

                <FormError message={errors.newPassword?.message as string}/>

              </div>

              
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

               <div className="min-h-6 pt-1" aria-live="polite">

                    <FormError message={errors.confirmPassword?.message as string}/>

              </div>
              
            </div>

            {serverError && <FormError message={serverError} />}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <span aria-hidden="true">←</span>
              Back to Login
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}

export default ResetPasswordPage;
