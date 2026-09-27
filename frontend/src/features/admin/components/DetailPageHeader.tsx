import type React from "react";

export interface DetailPageHeaderProps {
  title: string;
  description?: string;
  backText: string;
  onBack: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function DetailPageHeader({
  title,
  description,
  backText,
  onBack,
  actions,
  className = "",
}: DetailPageHeaderProps) {
  return (
    <div className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {backText}
        </button>

        <h1 className="text-2xl font-semibold text-slate-900">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export default DetailPageHeader;
