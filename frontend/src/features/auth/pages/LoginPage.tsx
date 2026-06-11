// LoginPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../services/authService";
import { useAuthStore } from "../../../store/authStore";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
  return (
    <p className="min-h-[18px] text-xs text-red-500 leading-[18px]">
      {message || "\u00A0"}
    </p>
  );
}

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const setAuth = useAuthStore((state) => state.setAuth);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setServerError("");
      const response = await loginUser(data);
      const { accessToken, user } = response.data;

      setAuth(accessToken, user);


    } catch (err: any) {

      setServerError(err?.response?.data?.message || "Invalid email or password");

    } finally {

      setLoading(false);
      
    }
  };

  const handleGoogle = async () => {
    try {
      // await googleAuth();
    } catch (err) {
      console.error(err);
      setServerError("Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left visual */}
      <div
        className="hidden md:flex relative w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
        <div className="relative z-10 mt-auto p-10 text-white">
          <h2 className="text-3xl font-bold">JanFix</h2>
          <p className="mt-2 text-sm text-white/80 max-w-sm">
            Empowering citizens to build smarter cities through real-time
            reporting and transparent governance.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900">
            Fix Your City, Together.
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Log in to report issues, track progress, and be part of a
            transparent system that turns problems into action.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-1" noValidate>
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            {/* Server error — reserved height to prevent shift */}
            <p className="min-h-[18px] text-xs text-red-500 leading-[18px]">
              {serverError || "\u00A0"}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center gap-3 py-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                className="h-4 w-4"
              />
              Continue with Google
            </button>

            <p className="pt-4 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
