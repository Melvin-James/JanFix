import React, { useState, useEffect } from "react";
import type { Category } from "../types/Category";
import { categorySchema, type CategoryFormData } from "../validations/categorySchema";

export interface CategoryModalProps {
  isOpen: boolean;
  categoryToEdit?: Category | null;
  onClose: () => void;
  onSave: (payload: CategoryFormData) => Promise<void>;
}

export function CategoryModal({
  isOpen,
  categoryToEdit,
  onClose,
  onSave,
}: CategoryModalProps) {
  
  const [name, setName] = useState("");

  const [description, setDescription] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(categoryToEdit?.name ?? "");
      setDescription(categoryToEdit?.description ?? "");
      setErrors({});
      setServerError("");
    }
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError("");

    // Validate using Zod
    const validationResult = categorySchema.safeParse({ name, description });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        description: fieldErrors.description?.[0],
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Pass the safely parsed and trimmed data
      await onSave(validationResult.data);
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
          <div className="space-y-4 px-6 py-5">
            <div className="min-h-5">
              {serverError && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {serverError}
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="categoryName" className="mb-1 block text-sm font-medium text-slate-700">
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  if (serverError) setServerError("");
                }}
                placeholder="e.g. Plumbing, Electrical, Cleaning"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="min-h-5">
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="categoryDescription" className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="categoryDescription"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                  if (serverError) setServerError("");
                }}
                placeholder="Describe what services belong to this category..."
                className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="min-h-5">
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>
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
                ? isEditing ? "Saving..." : "Creating..."
                : isEditing ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;