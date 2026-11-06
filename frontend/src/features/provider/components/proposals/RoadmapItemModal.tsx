import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import type { RoadmapItemFormData } from "../../validations/proposalValidationSchema";
import { createPortal } from "react-dom";

interface RoadmapItemModalProps {
  isOpen: boolean;
  initialData?: RoadmapItemFormData | null;
  onSave: (item: RoadmapItemFormData) => void;
  onClose: () => void;
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

export const RoadmapItemModal: React.FC<RoadmapItemModalProps> = ({
  isOpen,
  initialData,
  onSave,
  onClose,
}) => {
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [errors, setErrors] = useState<{
    heading?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setHeading(initialData.heading || "");
      setDescription(initialData.description || "");
      setStartTime(initialData.startTime || "08:00");
      setEndTime(initialData.endTime || "09:00");
    } else {
      setHeading("");
      setDescription("");
      setStartTime("08:00");
      setEndTime("09:00");
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newErrors: {
      heading?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
    } = {};

    const trimmedHeading = heading.trim();
    if (!trimmedHeading) {
      newErrors.heading = "Activity heading is required";
    } else if (trimmedHeading.length > 100) {
      newErrors.heading = "Heading cannot exceed 100 characters";
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      newErrors.description = "Activity description is required";
    } else if (trimmedDesc.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters";
    }

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!startTime || !timeRegex.test(startTime)) {
      newErrors.startTime = "Valid start time is required";
    }
    if (!endTime || !timeRegex.test(endTime)) {
      newErrors.endTime = "Valid end time is required";
    }

    if (!newErrors.startTime && !newErrors.endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const startMin = (sh ?? 0) * 60 + (sm ?? 0);
      const endMin = (eh ?? 0) * 60 + (em ?? 0);
      if (endMin <= startMin) {
        newErrors.endTime = "End time must be later than start time";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      heading: trimmedHeading,
      description: trimmedDesc,
      startTime,
      endTime,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {initialData ? "Edit Roadmap Activity" : "Add Roadmap Activity"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Activity Heading *
            </label>
            <input
              type="text"
              placeholder="e.g. Site preparation, Pipe replacement, Clean-up"
              value={heading}
              maxLength={100}
              onChange={(e) => {
                setHeading(e.target.value);
                setErrors((prev) => ({ ...prev, heading: undefined }));
              }}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all ${
                errors.heading
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
            {errors.heading && (
              <p className="mt-1 text-xs text-red-600">{errors.heading}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrors((prev) => ({ ...prev, startTime: undefined, endTime: undefined }));
                }}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.startTime
                    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                    : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setErrors((prev) => ({ ...prev, endTime: undefined }));
                }}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.endTime
                    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                    : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>

          {startTime && endTime && !errors.startTime && !errors.endTime && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/70 border border-blue-100 p-2.5 rounded-lg">
              <Clock className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>
                Schedule Slot: <strong>{formatTo12Hour(startTime)} – {formatTo12Hour(endTime)}</strong>
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Activity Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe what specific tasks will be performed during this window..."
              value={description}
              maxLength={1000}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all ${
                errors.description
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-right text-[11px] text-slate-400">
              {description.length} / 1000 characters
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

