import React from "react";
import { Users, Clock, CalendarRange, IndianRupee, MessageCircle, HeartHandshake } from "lucide-react";
import type { PublicSelectedProposal } from "../../types/issue";

interface ProjectProposalDetailsSectionProps {
  proposal?: PublicSelectedProposal;
}

export const ProjectProposalDetailsSection: React.FC<ProjectProposalDetailsSectionProps> = ({
  proposal,
}) => {
  if (!proposal) return null;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isNgoOwnFunding = proposal.fundingType === "NGO_OWN_FUNDING";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <CalendarRange className="h-5 w-5 text-blue-600" />
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Selected Execution Plan & Roadmap
        </h2>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Deployment Team</span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {proposal.estimatedTeamSize} {proposal.estimatedTeamSize === 1 ? "Person" : "People"}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Estimated Duration</span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {proposal.estimatedDurationHours} Hours
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <IndianRupee className="h-4 w-4 text-emerald-600" />
            <span>Budget Type</span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {isNgoOwnFunding ? "NGO Self-Funded" : formatINR(proposal.totalBudgetRupees)}
          </p>
        </div>
      </div>

      {/* NGO Community Considerations (if applicable) */}
      {proposal.ngoDetails && (
        <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-purple-900">
            <HeartHandshake className="h-4 w-4 text-purple-600" />
            <span>NGO Community Engagement Settings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-purple-800 pt-1">
            <p>
              Participation Mode:{" "}
              <strong className="font-semibold">
                {proposal.ngoDetails.participationMode === "OPEN_COMMUNITY"
                  ? `Open to Citizen Volunteers (${proposal.ngoDetails.expectedParticipants || "unlimited"} spots)`
                  : "NGO Core Team Only"}
              </strong>
            </p>
            <p className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              Community Discussion Chat:{" "}
              <strong className="font-semibold">
                {proposal.ngoDetails.requiresCommunityChat ? "Requested / Active" : "Not Requested"}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Execution Roadmap Timetable */}
      {proposal.executionRoadmap && proposal.executionRoadmap.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Day Schedule & Milestones
          </h3>
          <div className="space-y-2.5">
            {proposal.executionRoadmap.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs font-mono font-bold text-indigo-700 shrink-0">
                  {item.startTime} - {item.endTime}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {item.heading}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Budget (only for community funding) */}
      {!isNgoOwnFunding && proposal.budgetItems && proposal.budgetItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Itemized Expense Breakdown
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-2.5">#</th>
                  <th scope="col" className="px-4 py-2.5">Item / Task</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {proposal.budgetItems.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="px-4 py-2.5 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{item.heading}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                      {formatINR(item.amountRupees)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50 font-bold">
                <tr>
                  <td colSpan={2} className="px-4 py-2.5 text-slate-800">Total Provider Budget</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-700">
                    {formatINR(proposal.totalBudgetRupees)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

