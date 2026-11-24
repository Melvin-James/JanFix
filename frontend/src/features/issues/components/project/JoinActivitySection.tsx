import React from "react";
import { Users, Calendar, Clock, HandHeart, Info, CheckCircle2 } from "lucide-react";
import type { Issue } from "../../types/issue";

export interface JoinActivitySectionProps {
  issue: Issue;
}

export const JoinActivitySection: React.FC<JoinActivitySectionProps> = ({ issue }) => {
  // Only render when isCommunityIssue is true
  if (!issue.isCommunityIssue) {
    return null;
  }

  const proposal = issue.selectedProposal;
  const expectedParticipants = proposal?.ngoDetails?.expectedParticipants;
  const estimatedHours = proposal?.estimatedDurationHours;

  return (
    <div className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50/70 via-white to-teal-50/50 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-emerald-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Community Activity & Volunteering
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                <span>Open Community</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              This civic initiative has been designated for open community participation. Local citizens and volunteers are invited to collaborate on-the-ground.
            </p>
          </div>
        </div>

        {/* Action Button (Placeholder) */}
        <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600/60 px-4 py-2.5 text-sm font-semibold text-white cursor-not-allowed shadow-2xs"
            title="Volunteer registration will open as the execution date approaches"
          >
            <HandHeart className="h-4 w-4" />
            <span>Join as Volunteer</span>
          </button>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/70 rounded-full px-2 py-0.5">
            Registration Coming Soon
          </span>
        </div>
      </div>

      {/* Activity Details Overview */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-emerald-100/80 bg-white/80 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>Target Participants</span>
          </div>
          <p className="mt-1.5 text-base font-bold text-slate-900">
            {expectedParticipants ? `${expectedParticipants} Volunteers` : "Open to All"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Community volunteer slots</p>
        </div>

        <div className="rounded-lg border border-emerald-100/80 bg-white/80 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>Estimated Duration</span>
          </div>
          <p className="mt-1.5 text-base font-bold text-slate-900">
            {estimatedHours ? `${estimatedHours} Hours` : "Half Day"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Hands-on community effort</p>
        </div>

        <div className="rounded-lg border border-emerald-100/80 bg-white/80 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Project Status</span>
          </div>
          <p className="mt-1.5 text-base font-bold text-slate-900">
            {issue.status}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Current execution phase</p>
        </div>
      </div>

      {/* Informational Callout */}
      <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-200/60 bg-emerald-50/50 p-3 text-xs text-emerald-800">
        <Info className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Community Volunteers Notice:</strong> On-site coordination details, task assignments, and volunteer check-in schedules will be published once the project transitions into execution. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default JoinActivitySection;
