import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { IssueCategorySelector } from "../components/IssueCategorySelector";
import { IssuePhotoUpload } from "../components/IssuePhotoUpload";
import { IssueLocationPicker } from "../components/IssueLocationPicker";
import { IssueVisibilitySelector } from "../components/IssueVisibilitySelector";
import type { UploadedFile } from "../../provider/types/uploadedFile";
import type { IssueLocation, IssueVisibility } from "../types/issue";
import { createIssue } from "../services/issueService";

export default function ReportIssuePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState<IssueVisibility>("PUBLIC");
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [location, setLocation] = useState<IssueLocation | null>({
    address: "MG Road, Ravipuram, Ernakulam, Kochi, Kerala 682016",
    coordinates: { latitude: 9.9674, longitude: 76.2848 },
    locality: "Ravipuram",
    city: "Kochi",
    state: "Kerala",
    postalCode: "682016",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Issue title is required";
    } else if (title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    } else if (title.trim().length > 150) {
      errors.title = "Title cannot exceed 150 characters";
    }

    if (!description.trim()) {
      errors.description = "Issue description is required";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!categoryId) {
      errors.categoryId = "Please select a category";
    }

    if (!location || !location.address.trim()) {
      errors.location = "Please provide an address or select a location in Kochi";
    } else if (
      !location.coordinates ||
      typeof location.coordinates.latitude !== "number" ||
      typeof location.coordinates.longitude !== "number"
    ) {
      errors.location = "Valid coordinates are required";
    }

    if (images.length > 5) {
      errors.images = "A maximum of 5 images is allowed";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;
    if (!location) return;

    try {
      setIsSubmitting(true);
      const res = await createIssue({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        visibility,
        images,
        location,
      });

      setSuccessMessage("Issue reported successfully! It is now recorded under REPORTED status.");

      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/home", { state: { reportedIssue: res.issue } });
      }, 1500);
    } catch (err: unknown) {
      console.error("Issue creation error:", err);
      let msg = "Failed to submit issue report. Please check your input and try again.";

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
        msg = err.response.data.message;
      }
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Citizen Reporting
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="border-b border-slate-200 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Report a Civic Issue
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Empower your community in Kochi by reporting local civic problems, waste accumulation, road damage, or drainage concerns.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {serverError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                <AlertCircle size={20} className="shrink-0 text-red-600" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Broken water pipe leaking on main road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {formErrors.title && (
                <p className="mt-1.5 text-xs text-red-600">{formErrors.title}</p>
              )}
            </div>

            {/* Category */}
            <IssueCategorySelector
              value={categoryId}
              onChange={(id) => {
                setCategoryId(id);
                if (formErrors.categoryId) {
                  setFormErrors((prev) => ({ ...prev, categoryId: "" }));
                }
              }}
              error={formErrors.categoryId}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Provide accurate details about the problem, such as how long it has persisted, potential hazards, and relevant surroundings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {formErrors.description && (
                <p className="mt-1.5 text-xs text-red-600">{formErrors.description}</p>
              )}
            </div>

            {/* Photo Upload */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <IssuePhotoUpload
                value={images}
                onChange={(newImgs) => setImages(newImgs)}
                maxPhotos={5}
              />
            </div>

            {/* Location Picker */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <IssueLocationPicker
                value={location}
                onChange={(newLoc) => {
                  setLocation(newLoc);
                  if (formErrors.location) {
                    setFormErrors((prev) => ({ ...prev, location: "" }));
                  }
                }}
                error={formErrors.location}
              />
            </div>

            {/* Visibility Selector */}
            <IssueVisibilitySelector
              value={visibility}
              onChange={(vis) => setVisibility(vis)}
            />

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
              <Link
                to="/home"
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSubmitting ? "Submitting Report..." : "Submit Issue Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
