// ForgotPasswordPage.tsx
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";

import { forgotPassword } from "../services/authService";

import { forgotPasswordSchema, type ForgotPasswordData, } from "../validations/forgotPasswordSchema";

import AuthLayout from "../components/AuthLayout";

import FormField from "../../../components/UI/FormField";

function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    shouldUnregister: true,
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data: ForgotPasswordData) => {
    setServerError("");

    try {
      setLoading(true);
      await forgotPassword(data);

      navigate("/verify-reset-otp", {
        state: { email: data.email },
      });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setServerError(
          e.response?.data?.message || "Something went wrong",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a one-time verification code"
      heroImage="https://images.unsplash.com/photo-1667753980421-68fdc8d8b509?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    >
      <form onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-[430px] rounded-lg border border-slate-300 bg-slate-50 px-8 py-9 shadow-sm" noValidate
      >
        <p
          className={`text-sm text-center transition-colors ${serverError ? "text-red-500" : "text-transparent select-none"
            }`}
        >
          {serverError || "\u00A0"}
        </p>

        <FormField
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mx-auto mt-8 flex h-9 items-center justify-center gap-2 text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
        >
          <span aria-hidden="true">←</span>
          Back to Login
        </button>


      </form>
    </AuthLayout>
  )
}

export default ForgotPasswordPage;
