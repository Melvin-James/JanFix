import { useEffect, useState } from "react";

import { useLocation, useNavigate} from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";

import { resetPasswordSchema, type ResetPasswordFormData, } from "../validations/resetPasswordSchema";

import { resetPassword } from "../services/authService";

import AuthLayout from "../components/AuthLayout";

import PasswordField from "../components/PasswordField";

function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const resetToken: string | undefined = location.state?.resetToken;

  const [loading, setLoading] = useState(false);
  
  const [serverError, setServerError] = useState("");

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
    <AuthLayout
      title="Reset Password"
      subtitle="Enter a new password to continue"
      heroImage="https://images.unsplash.com/photo-1558026411-563830332bd8?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    >

      <form onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-[430px] rounded-lg border border-slate-300 bg-slate-50 px-8 py-9 shadow-sm"
        noValidate
      >

        <p
          className={`text-sm text-center transition-colors ${serverError ? "text-red-500" : "text-transparent select-none"
            }`}
        >
          {serverError || "\u00A0"}
        </p>

        <PasswordField
          label="Password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register("newPassword")}
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
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>


      </form>

    </AuthLayout>
  )
}

export default ResetPasswordPage;
