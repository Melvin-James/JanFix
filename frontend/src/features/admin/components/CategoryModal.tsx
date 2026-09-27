import React, { useState } from "react";
import type { Category } from "../types/Category";

export interface CategoryModalProps {
  isOpen: boolean;
  categoryToEdit?: Category | null;
  onClose: () => void;
  onSave: (payload: { name: string; description: string }) => Promise<void>;
}

export function CategoryModal({
  isOpen,
  categoryToEdit,
  onClose,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState(categoryToEdit?.name ?? "");
  const [description, setDescription] = useState(categoryToEdit?.description ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [serverError, setServerError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setNameError("Category name is required");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!trimmedDescription) {
      setDescriptionError("Category description is required");
      hasError = true;
    } else {
      setDescriptionError("");
    }

    if (hasError) return;

    try {
      setIsSubmitting(true);
      setServerError("");
      await onSave({
        name: trimmedName,
        description: trimmedDescription,
      });
      onClose();
    } catch (err: unknown) {
      console.error("Failed to save category:", err);
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
      ) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Failed to save category. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(categoryToEdit);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Edit Category" : "Add New Category"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing
              ? "Update category details below."
              : "Enter details to create a new category."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {serverError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <div>
              <label
                htmlFor="categoryName"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                  if (serverError) setServerError("");
                }}
                placeholder="e.g. Plumbing, Electrical, Cleaning"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-600">{nameError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="categoryDescription"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="categoryDescription"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (descriptionError) setDescriptionError("");
                  if (serverError) setServerError("");
                }}
                placeholder="Describe what services belong to this category..."
                className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {descriptionError && (
                <p className="mt-1 text-xs text-red-600">{descriptionError}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                ? "Save Changes"
                : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;
