// RegisterPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerSchema, type RegisterFormData } from "../validations/registerSchema";
import { registerUser } from "../services/authService";
import axios from "axios";
import FormError from "../../../components/UI/FormError";


function RegisterPage() {

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({

    resolver: zodResolver(registerSchema),

    shouldUnregister: true,

  });


  const [loading, setLoading] = useState(false);

  const [serverError, setServerError] = useState("");

  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {

    setServerError("");

    try {

      setLoading(true);

      await registerUser(data);

      navigate("/verify-otp", { state: { email: data.email } });

    } catch (e) {

      if (axios.isAxiosError(e)) {

        setServerError(

          e.response?.data?.message ||

          "Something went wrong"
        );
      }
    } finally {

      setLoading(false);

    }

  };


  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left visual */}
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80"
          alt="City skyline"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative mt-auto p-10 text-white">
          <h2 className="text-3xl font-bold">JanFix</h2>
          <p className="mt-2 max-w-sm text-sm text-white/90">
            Empowering citizens to build a better tomorrow through transparent
            civic action and community maintenance.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900">
            Join the Movement for a Better City
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create your JanFix account to report issues, track solutions, and
            help improve your community.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <p
              className={`text-sm text-center transition-colors ${
                serverError ? "text-red-500" : "text-transparent select-none"
              }`}
            >
              {serverError || "\u00A0"}
            </p>

             <div>
              <label className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                {...register("fullName")}
                placeholder="John Doe"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <FormError message={errors.fullName?.message as string} />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                {...register("email")}
                placeholder="name@example.com"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <FormError message={errors.email?.message as string} />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPwd ? "text" : "password"}
                  {...register("password")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FormError message={errors.password?.message as string} />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                type={showPwd ? "text" : "password"}
                {...register("confirmPassword")}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <FormError message={errors.confirmPassword?.message as string} />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Continue"}
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              OR
              <div className="h-px flex-1 bg-slate-200" />
            </div>

             <button
              type="button"
              //   onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                className="h-4 w-4"
              />
              Continue with Google
            </button>


            <p className="mt-4 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-500">
                Login
              </a>
            </p>
          </form>

          

          <div className="mt-4 flex justify-center gap-5 text-xs text-slate-500">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Community Guidelines</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
