import React, { useState } from "react";
import { Plus, Edit2, Trash2, IndianRupee, AlertCircle } from "lucide-react";
import { BudgetItemModal } from "./BudgetItemModal";
import type { BudgetItemFormData } from "../../validations/proposalValidationSchema";

interface BudgetBreakdownSectionProps {
  items: BudgetItemFormData[];
  onChange: (items: BudgetItemFormData[]) => void;
  error?: string;
  isReadOnly?: boolean;
}

export const BudgetBreakdownSection: React.FC<BudgetBreakdownSectionProps> = ({
  items,
  onChange,
  error,
  isReadOnly = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const totalBudget = items.reduce((sum, item) => sum + (item.amountRupees || 0), 0);

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

  const handleSaveModal = (savedItem: BudgetItemFormData) => {
    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = savedItem;
      onChange(updated);
    } else {
      onChange([...items, savedItem]);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base sm:text-lg">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            <h2>Budget Breakdown</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Itemize all anticipated costs required to execute this civic task (materials, transport, tools).
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex self-start sm:self-auto items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 text-emerald-600" />
            <span>Add Budget Item</span>
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
            No budget items added yet. Click &quot;Add Budget Item&quot; to begin your itemized estimate.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">#</th>
                <th scope="col" className="px-4 py-3">Expense Item</th>
                <th scope="col" className="px-4 py-3 text-right">Estimated Amount</th>
                {!isReadOnly && (
                  <th scope="col" className="px-4 py-3 text-right w-24">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 font-medium">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-900">
                    {item.heading}
                  </td>
                  <td className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-slate-800 font-mono">
                    {formatINR(item.amountRupees)}
                  </td>
                  {!isReadOnly && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(idx)}
                          title="Edit Item"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          title="Delete Item"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td colSpan={2} className="px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 uppercase">
                  Estimated Total
                </td>
                <td className="px-4 py-3 text-right text-sm sm:text-base font-bold text-emerald-700 font-mono">
                  {formatINR(totalBudget)}
                </td>
                {!isReadOnly && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {modalOpen && (
        <BudgetItemModal
          isOpen={modalOpen}
          initialData={editingIndex !== null ? items[editingIndex] : null}
          onSave={handleSaveModal}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

