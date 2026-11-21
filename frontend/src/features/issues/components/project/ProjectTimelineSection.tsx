import React from "react";
import { CheckCircle2, CircleDot, Clock } from "lucide-react";
import type { IssueTimelineEvent } from "../../types/issue";

interface ProjectTimelineSectionProps {
  events?: IssueTimelineEvent[];
}

export const ProjectTimelineSection: React.FC<ProjectTimelineSectionProps> = ({
  events = [],
}) => {
  if (!events || events.length === 0) return null;

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Clock className="h-5 w-5 text-indigo-600" />
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Civic Project Lifecycle Timeline
        </h2>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => {
          const timestamp = formatTimestamp(evt.timestamp);
          return (
            <div key={idx} className="relative group">
              {/* Circle Marker */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white transition-colors ${
                  evt.isCompleted
                    ? "border-emerald-600 text-emerald-600"
                    : evt.isCurrent
                    ? "border-indigo-600 text-indigo-600 ring-4 ring-indigo-50"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                {evt.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 fill-emerald-600 text-white" />
                ) : evt.isCurrent ? (
                  <CircleDot className="h-4 w-4 fill-indigo-600 text-white animate-pulse" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Event Content */}
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-sm font-semibold ${
                      evt.isCurrent
                        ? "text-indigo-900"
                        : evt.isCompleted
                        ? "text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    {evt.title}
                  </h3>
                  {evt.isCurrent && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
                      Active Stage
                    </span>
                  )}
                  {timestamp && (
                    <span className="text-xs text-slate-400">• {timestamp}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  {evt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

