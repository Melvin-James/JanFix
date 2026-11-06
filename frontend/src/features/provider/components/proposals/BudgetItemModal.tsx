import { X, IndianRupee } from "lucide-react";
import type { BudgetItemFormData } from "../../validations/proposalValidationSchema";
import React, {useState, useEffect} from "react";
import { createPortal } from "react-dom";

interface BudgetItemModalProps {
  isOpen: boolean;
  initialData?: BudgetItemFormData | null;
  onSave: (item: BudgetItemFormData) => void;
  onClose: () => void;
}

export const BudgetItemModal: React.FC<BudgetItemModalProps> = ({
  isOpen,
  initialData,
  onSave,
  onClose,
}) => {
  const [heading, setHeading] = useState("");
  const [amountRupees, setAmountRupees] = useState("");
  const [errors, setErrors] = useState<{
    heading?: string;
    amountRupees?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setHeading(initialData.heading || "");
      setAmountRupees(String(initialData.amountRupees ?? ""));
    } else {
      setHeading("");
      setAmountRupees("");
    }

    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const parsedAmount = Number(amountRupees);

  const formattedPreview =
    amountRupees.trim() !== "" &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
        }).format(parsedAmount)
      : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedHeading = heading.trim();
    const numAmount = Number(amountRupees);

    const newErrors: {
      heading?: string;
      amountRupees?: string;
    } = {};

    if (!trimmedHeading) {
      newErrors.heading = "Budget item heading is required";
    } else if (trimmedHeading.length > 100) {
      newErrors.heading = "Heading cannot exceed 100 characters";
    }

    if (amountRupees.trim() === "" || !Number.isFinite(numAmount)) {
      newErrors.amountRupees = "Please enter a valid amount";
    } else if (numAmount <= 0) {
      newErrors.amountRupees = "Amount must be greater than 0";
    } else if (numAmount > 10000000) {
      newErrors.amountRupees = "Amount cannot exceed ₹1 Crore";
    } else if (
      amountRupees.includes(".") &&
      amountRupees.split(".")[1]!.length > 2
    ) {
      newErrors.amountRupees =
        "Amount can have at most two decimal places";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onSave({
      heading: trimmedHeading,
      amountRupees: numAmount,
    });

    onClose();
  };

  return createPortal (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {initialData ? "Edit Budget Item" : "Add Budget Item"}
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
              Item Heading / Expense Description *
            </label>

            <input
              type="text"
              placeholder="e.g. Raw materials, Equipment rental, Transport"
              value={heading}
              maxLength={100}
              onChange={(e) => {
                setHeading(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  heading: undefined,
                }));
              }}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all ${
                errors.heading
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />

            {errors.heading && (
              <p className="mt-1 text-xs text-red-600">
                {errors.heading}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Estimated Amount (INR) *
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <IndianRupee className="h-4 w-4" />
              </span>

              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountRupees}
                onChange={(e) => {
                  setAmountRupees(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    amountRupees: undefined,
                  }));
                }}
                className={`w-full rounded-lg border pl-10 pr-3.5 py-2.5 text-sm outline-none transition-all ${
                  errors.amountRupees
                    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                    : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
            </div>

            {errors.amountRupees && (
              <p className="mt-1 text-xs text-red-600">
                {errors.amountRupees}
              </p>
            )}

            {formattedPreview && !errors.amountRupees && (
              <p className="mt-1.5 text-xs text-emerald-600 font-medium">
                Preview: {formattedPreview}
              </p>
            )}
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
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};