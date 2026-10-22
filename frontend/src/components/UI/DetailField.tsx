import type React from "react";

export interface DetailFieldProps {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  emptyText?: string;
  fullWidth?: boolean;
  className?: string;
}

export function DetailField({
  label,
  value,
  children,
  emptyText = "Not provided",
  fullWidth = false,
  className = "",
}: DetailFieldProps) {
  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <div className={`${fullWidth ? "col-span-full" : ""} ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm text-slate-900 font-normal">
        {children ?? (hasValue ? value : <span className="text-slate-400">{emptyText}</span>)}
      </div>
    </div>
  );
}

export default DetailField;
