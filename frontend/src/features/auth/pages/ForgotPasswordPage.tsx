// ForgotPasswordPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { forgotPassword } from "../services/authService";
import {
  forgotPasswordSchema,
  type ForgotPasswordData,
} from "../validations/forgotPasswordSchema";
import FormError from "../../../components/UI/FormError";

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
    <main className="flex min-h-screen bg-white">
      {/* Left image */}
      <section className="relative hidden min-h-screen w-1/2 overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1667753980421-68fdc8d8b509?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="A clean city road surrounded by modern buildings"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 p-8 text-white">
          <p className="text-3xl font-bold">JanFix</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/90">
            Empowering citizens to build smarter cities through real-time
            reporting and transparent governance.
          </p>
        </div>
      </section>

      {/* Right form */}
      <section className="flex min-h-screen w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-[430px] rounded-lg border border-slate-300 bg-slate-50 px-8 py-9 shadow-sm"
          noValidate
        >
          <header className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Reset Your Password
            </h1>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-slate-500">
              Enter your email to receive a one-time verification code.
            </p>
          </header>

          {/* Reserved space prevents layout movement */}
          <div className="mt-3 min-h-6" aria-live="polite">
            <p
              className={`text-center text-sm transition-colors ${
                serverError
                  ? "text-red-600"
                  : "select-none text-transparent"
              }`}
            >
              {serverError || "\u00A0"}
            </p>
          </div>

          <div className="mt-2">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@civic-email.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />

            {/* Reserved error height prevents the card from expanding */}
            <div className="min-h-6 pt-1" aria-live="polite">
              <FormError message={errors.email?.message as string} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
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
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
