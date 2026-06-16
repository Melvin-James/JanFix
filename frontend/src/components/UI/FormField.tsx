import type { InputHTMLAttributes } from "react";

import FormError from "./FormError";

interface FormFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {

  label: string;

  error?: string;
}

function FormField({

  label,

  error,

  ...inputProps

}: FormFieldProps) {

  return (

    <div>

      <label className="block text-sm font-medium text-slate-700">

        {label}

      </label>

      <input

        {...inputProps}

        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"

      />

      <FormError message={error} />

    </div>
  );
}

export default FormField;