import { forwardRef, type InputHTMLAttributes } from "react";
import FormError from "./FormError";

export interface FormFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className = "", ...inputProps }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          {...inputProps}
          ref={ref}
          className={`mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${className}`}
        />
        <FormError message={error} />
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;