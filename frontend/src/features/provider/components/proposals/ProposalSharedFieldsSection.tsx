import React from "react";
import { Users, Clock, AlertCircle } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProposalFormData } from "../../validations/proposalValidationSchema";

interface ProposalSharedFieldsSectionProps {
  register: UseFormRegister<ProposalFormData>;
  errors: FieldErrors<ProposalFormData>;
  isReadOnly?: boolean;
}

export const ProposalSharedFieldsSection: React.FC<ProposalSharedFieldsSectionProps> = ({
  register,
  errors,
  isReadOnly = false,
}) => {
  // Tomorrow's date in YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Proposal Logistics & Timeline
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Provide work capacity estimates and the anticipated kick-off date.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Expected Team Size */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Expected Team Size *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Users className="h-4 w-4" />
            </span>
            <input
              type="number"
              min="1"
              step="1"
              disabled={isReadOnly}
              placeholder="e.g. 4"
              {...register("estimatedTeamSize", { valueAsNumber: true })}
              className={`w-full rounded-lg border pl-10 pr-3.5 py-2.5 text-sm outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.estimatedTeamSize
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
          </div>
          {errors.estimatedTeamSize && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.estimatedTeamSize.message}</span>
            </p>
          )}
          <p className="mt-1 text-[11px] text-slate-400">
            Number of workers or volunteers executing the task.
          </p>
        </div>

        {/* Estimated Duration (Hours) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Estimated Duration (Hours) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Clock className="h-4 w-4" />
            </span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              disabled={isReadOnly}
              placeholder="e.g. 6"
              {...register("estimatedDurationHours", { valueAsNumber: true })}
              className={`w-full rounded-lg border pl-10 pr-3.5 py-2.5 text-sm outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.estimatedDurationHours
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
          </div>
          {errors.estimatedDurationHours && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.estimatedDurationHours.message}</span>
            </p>
          )}
          <p className="mt-1 text-[11px] text-slate-400">
            Total working hours required on-site.
          </p>
        </div>

        
      </div>
    </div>
  );
};

