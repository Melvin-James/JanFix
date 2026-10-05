import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import FormError from "../../../components/UI/FormError";

export interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
    ({ label, error, className = "", ...inputProps }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div>
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
                <div className="relative mt-2">
                    <input
                        {...inputProps}
                        ref={ref}
                        type={showPassword ? "text" : "password"}
                        className={`w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${className}`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                <FormError message={error} />
            </div>
        );
    }
);

PasswordField.displayName = "PasswordField";

export default PasswordField;
