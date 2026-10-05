// LoginPage.tsx
import { useForm } from "react-hook-form";

import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";

import { Link } from "react-router-dom";

import { loginUser } from "../services/authService";

import { useAuthStore } from "../../../store/authStore";

import { loginSchema, type LoginFormData } from "../validations/loginSchema";

import AuthLayout from "../components/AuthLayout";

import FormField from "../../../components/UI/FormField";

import PasswordField from "../components/PasswordField";

import GoogleAuthButton from "../components/GoogleAuthButton";

function LoginPage() {

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({

    resolver: zodResolver(loginSchema),

    defaultValues: { email: "", password: "" },

    mode: "onTouched",

  });

  const [loading, setLoading] = useState(false);


  const [serverError, setServerError] = useState<string>("");

  const setUser = useAuthStore((state) => state.setUser);

  const onSubmit = async (data: LoginFormData) => {

    try {

      setLoading(true);

      setServerError("");

      const response = await loginUser(data);

      const { user } = response.data;

      setUser(user);

    } catch (error: unknown) {

      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || "Invalid email or password");
      } else if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("Invalid email or password");
      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <AuthLayout
      title="Fix Your City, Together"
      subtitle="Log in to report issues, track progress, and be part of a
            transparent system that turns problems into action."
      heroImage="https://images.unsplash.com/photo-1695692929091-cdafc96ec082?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    >

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-[430px] rounded-lg border border-slate-300 bg-slate-50 px-8 py-9 shadow-sm"
        noValidate
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

        <PasswordField
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Link
          to="/forgot-password"
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >{loading ? "Logging in..." : "Login"}</button>

        <GoogleAuthButton
          onError={setServerError}
          onLoadingChange={setLoading}
        />

        <p className="pt-4 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

      </form>

    </AuthLayout>
  )
}

export default LoginPage;
