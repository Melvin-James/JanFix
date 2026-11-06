import React from "react";
import { Building2, HandCoins, Users2, MessageCircle, AlertCircle } from "lucide-react";
import type { UseFormWatch, UseFormSetValue, FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProposalFormData } from "../../validations/proposalValidationSchema";

interface NgoProposalFieldsSectionProps {
  watch: UseFormWatch<ProposalFormData>;
  setValue: UseFormSetValue<ProposalFormData>;
  register: UseFormRegister<ProposalFormData>;
  errors: FieldErrors<ProposalFormData>;
  isReadOnly?: boolean;
}

export const NgoProposalFieldsSection: React.FC<NgoProposalFieldsSectionProps> = ({
  watch,
  setValue,
  register,
  errors,
  isReadOnly = false,
}) => {
  const requiresFunding = watch("requiresFunding");
  const participationMode = watch("participationMode");
  const requiresCommunityChat = watch("requiresCommunityChat");

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-2 text-indigo-950 font-semibold text-base sm:text-lg border-b border-indigo-100/80 pb-4">
        <Building2 className="h-5 w-5 text-indigo-600" />
        <h2>Non-Governmental Organization (NGO) Considerations</h2>
      </div>

      <div className="space-y-6">
        {/* Toggle 1: Funding Request */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <HandCoins className="h-4 w-4 text-indigo-600" />
            <span>Do you need funding for this issue from JanFix? *</span>
          </label>
          <p className="text-xs text-slate-500">
            Note: The budget breakdown above always reflects the total estimated project cost. If you select &quot;No&quot;, your NGO will self-fund or sponsor the implementation.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setValue("requiresFunding", true, { shouldValidate: true })}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed ${
                requiresFunding === true
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Yes, JanFix Funding Requested
            </button>
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setValue("requiresFunding", false, { shouldValidate: true })}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed ${
                requiresFunding === false
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              No, Self-Funded by NGO
            </button>
          </div>
          {errors.requiresFunding && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.requiresFunding.message}</span>
            </p>
          )}
        </div>

        {/* Toggle 2: Participation Mode */}
        <div className="space-y-2 border-t border-indigo-100/60 pt-5">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users2 className="h-4 w-4 text-indigo-600" />
            <span>Execution Team & Community Participation Mode *</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setValue("participationMode", "TEAM_ONLY", { shouldValidate: true })}
              className={`p-4 rounded-xl text-left border transition-all cursor-pointer disabled:cursor-not-allowed ${
                participationMode === "TEAM_ONLY"
                  ? "bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                  : "bg-white/70 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="block text-sm font-semibold text-slate-900">
                Team Only
              </span>
              <span className="block text-xs text-slate-500 mt-1">
                The civic task will be executed exclusively by your internal staff and registered volunteers.
              </span>
            </button>

            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setValue("participationMode", "OPEN_COMMUNITY", { shouldValidate: true })}
              className={`p-4 rounded-xl text-left border transition-all cursor-pointer disabled:cursor-not-allowed ${
                participationMode === "OPEN_COMMUNITY"
                  ? "bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                  : "bg-white/70 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="block text-sm font-semibold text-slate-900">
                Open for Community Participation
              </span>
              <span className="block text-xs text-slate-500 mt-1">
                Community volunteers from JanFix will be invited to join and assist on-site.
              </span>
            </button>
          </div>
          {errors.participationMode && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.participationMode.message}</span>
            </p>
          )}

          {participationMode === "OPEN_COMMUNITY" && (
            <div className="mt-4 p-4 rounded-lg bg-white border border-indigo-100 space-y-1.5 max-w-sm">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Expected Community Volunteers Capacity *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                disabled={isReadOnly}
                placeholder="e.g. 15"
                {...register("expectedParticipants", { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50"
              />
              {errors.expectedParticipants && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.expectedParticipants.message}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Toggle 3: Community Chat Preference */}
        <div className="space-y-2 border-t border-indigo-100/60 pt-5">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-indigo-600" />
            <span>Do you request a dedicated community coordination chat? *</span>
          </label>
          <p className="text-xs text-slate-500">
            Enables future-facing civic discussion channels between your organization and local residents.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setValue("requiresCommunityChat", true, { shouldValidate: true })}
              className={`px-5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed ${
                requiresCommunityChat === true
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Yes, Enable Chat
            </button>
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setValue("requiresCommunityChat", false, { shouldValidate: true })}
              className={`px-5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed ${
                requiresCommunityChat === false
                  ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              No Chat Needed
            </button>
          </div>
          {errors.requiresCommunityChat && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.requiresCommunityChat.message}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

