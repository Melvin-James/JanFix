import { useState } from "react";

import { X, AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

import type { UploadedFile } from "../../provider/types/uploadedFile";

import type { Issue, IssueLocation, IssueVisibility } from "../types/issue";

import { IssueCategorySelector } from "./IssueCategorySelector";

import { IssuePhotoUpload } from "./IssuePhotoUpload";

import { IssueLocationPicker } from "./IssueLocationPicker";

import { IssueVisibilitySelector } from "./IssueVisibilitySelector";

import { createIssue } from "../services/issueService";

import { issueFormSchema } from "../validations/issueSchema";
import FormField from "../../../components/UI/FormField";
import FormError from "../../../components/UI/FormError";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdIssue: Issue) => void;
}

export function ReportIssueModal({
  isOpen,
  onClose,
  onSuccess,
}: ReportIssueModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState<IssueVisibility | null>(null);
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [location, setLocation] = useState<IssueLocation | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const clearFieldError = (field: string) => {
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const result = issueFormSchema.safeParse({
      title: title.trim(),
      description: description.trim(),
      categoryId: categoryId.trim(),
      visibility,
      images,
      location,
    });

    if (result.success) {
      setFormErrors({});
      return result.data;
    }

    const errors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "form");

      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }

    setFormErrors(errors);
    return null;
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    const validatedData = validateForm();

    if (!validatedData) return;

    try {
      setIsSubmitting(true);

      const res = await createIssue(validatedData);

      setSuccessMessage("Issue reported successfully!");

      onSuccess?.(res.issue);

      window.setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error("Issue creation error:", err);
      setServerError(
        "We couldn't submit your report. Please review your information and try again."
      );
    } finally {
      if (!successMessage) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative my-8 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Report a Civic Issue</h2>
            <p className="text-xs text-slate-500">
              Provide details and photo evidence to help authorities and volunteers take action.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {serverError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Title */}
          <FormField
            label="Issue Title *"
            placeholder="e.g. Broken streetlight on 4th Cross Road"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearFieldError("title");
            }}
            error={formErrors.title}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="e.g. Unable to access public space"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearFieldError("description");
              }}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <FormError message={formErrors.description} />
          </div>

          {/* Category */}
          <div>
            <IssueCategorySelector
              value={categoryId}
              onChange={(id) => {
                setCategoryId(id);
                clearFieldError("categoryId");
              }}
            />
            <FormError message={formErrors.categoryId} />
          </div>

          {/* Photo Upload */}
          <div>
            <IssuePhotoUpload
              value={images}
              onChange={(uploadedImages) => {
                setImages(uploadedImages);

                // Clear the image validation error after an upload.
                clearFieldError("images");
              }}
              maxPhotos={5}
            />

            <FormError message={formErrors.images} />
          </div>

          {/* Location Picker */}
          <div>
            <IssueLocationPicker
              value={location}
              onChange={(selectedLocation) => {
                setLocation(selectedLocation);
                clearFieldError("location");
              }}
            />
            <FormError message={formErrors.location} />
          </div>

          {/* Visibility */}
          <div>
            <IssueVisibilitySelector
              value={visibility}
              onChange={(selectedVisibility) => {
                setVisibility(selectedVisibility);
                clearFieldError("visibility");
              }}
            />
            <FormError message={formErrors.visibility} />
          </div>



          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Submitting Report...
                </>
              ) : (
                "Submit Issue Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
