import React, { useState } from "react";
import { Plus, Edit2, Trash2, CalendarClock, AlertCircle, Clock } from "lucide-react";
import { RoadmapItemModal } from "./RoadmapItemModal";
import type { RoadmapItemFormData } from "../../validations/proposalValidationSchema";

interface ExecutionRoadmapSectionProps {
  items: RoadmapItemFormData[];
  onChange: (items: RoadmapItemFormData[]) => void;
  error?: string;
  isReadOnly?: boolean;
}

function formatTo12Hour(time24: string): string {
  if (!time24 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time24)) return time24;
  const parts = time24.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHour = hours % 12 || 12;
  return `${adjustedHour}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export const ExecutionRoadmapSection: React.FC<ExecutionRoadmapSectionProps> = ({
  items,
  onChange,
  error,
  isReadOnly = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleSaveModal = (savedItem: RoadmapItemFormData) => {
    let updated: RoadmapItemFormData[];
    if (editingIndex !== null) {
      updated = [...items];
      updated[editingIndex] = savedItem;
    } else {
      updated = [...items, savedItem];
    }

    // Chronologically sort by start time
    updated.sort((a, b) => {
      const [ah, am] = a.startTime.split(":").map(Number);
      const [bh, bm] = b.startTime.split(":").map(Number);
      return (ah ?? 0) * 60 + (am ?? 0) - ((bh ?? 0) * 60 + (bm ?? 0));
    });

    onChange(updated);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base sm:text-lg">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            <h2>Execution Roadmap & Daily Schedule</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Define the working day schedule timetable for executing this issue from start to finish.
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex self-start sm:self-auto items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 text-blue-600" />
            <span>Add Roadmap Activity</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
          <p className="text-xs text-slate-500">
            No roadmap activities defined yet. Click &quot;Add Roadmap Activity&quot; to establish your timetable.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center shrink-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                    {idx + 1}
                  </div>
                  {idx < items.length - 1 && (
                    <div className="w-0.5 h-10 bg-slate-200 my-1 hidden sm:block" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 font-mono shadow-2xs">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {formatTo12Hour(item.startTime)} – {formatTo12Hour(item.endTime)}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.heading}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap pt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(idx)}
                    title="Edit Activity"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-2xs transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(idx)}
                    title="Delete Activity"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <RoadmapItemModal
          isOpen={modalOpen}
          initialData={editingIndex !== null ? items[editingIndex] : null}
          onSave={handleSaveModal}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

