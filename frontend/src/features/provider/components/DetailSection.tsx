import type React from "react";

export interface DetailSectionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  variant?: "default" | "card" | "admin";
  className?: string;
  children: React.ReactNode;
}

export function DetailSection({
  title,
  subtitle,
  icon,
  headerActions,
  variant = "default",
  className = "",
  children,
}: DetailSectionProps) {
  // If an icon is explicitly provided, render the provider icon-card style layout
  if (icon) {
    return (
      <section className={`rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            {title && (
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900">{title}</h2>
                {headerActions}
              </div>
            )}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            <div className={title || subtitle ? "mt-4" : ""}>{children}</div>
          </div>
        </div>
      </section>
    );
  }

  // If variant is 'card' without an icon, render card layout with title at top without header divider
  if (variant === "card") {
    return (
      <section className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
        {title && (
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {headerActions}
          </div>
        )}
        <div className={title ? "mt-4" : ""}>{children}</div>
      </section>
    );
  }

  // Default / admin style with header divider line
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {headerActions}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

export default DetailSection;
