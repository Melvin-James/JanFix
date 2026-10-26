import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Shield, Activity, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { updateProfile } from "../services/profileService";
import { editProfileSchema } from "../validations/editProfileSchema";
import StatusBadge from "../../../components/UI/StatusBadge";
import type { UserRole } from "../../../types/user";

export function EditProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountStatus = user?.accountStatus ?? (user?.isVerified ? "ACTIVE" : "PENDING");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate with Zod
    const validation = editProfileSchema.safeParse({ fullName });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid full name");
      return;
    }

    const trimmedName = validation.data.fullName;

    // Check if unchanged
    if (trimmedName === user?.fullName) {
      setSuccessMessage("No changes made to your full name");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateProfile({ fullName: trimmedName });

      if (response.success && response.data?.user && user) {
        // Update Zustand auth store so Navbar and Profile page update instantly
        setUser({
          ...user,
          fullName: response.data.user.fullName,
          roles: response.data.user.roles as UserRole[],
          isVerified: response.data.user.isVerified,
          accountStatus: (response.data.user.accountStatus as "ACTIVE" | "BLOCKED") ?? user.accountStatus,
        });

        setSuccessMessage("Your profile name has been successfully updated!");
        // Re-sync local input with clean trimmed name
        setFullName(response.data.user.fullName);
      }
    } catch (err: unknown) {
      const serverMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update profile. Please check your connection and try again.";
      setError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Profile</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Update your display name while keeping your account secure.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 animate-in fade-in"
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 animate-in fade-in"
        >
          <span className="font-semibold">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Edit Form Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section (Read-Only) */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-inner">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Profile Avatar</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard citizen avatar (profile image upload is managed via official channels).
              </p>
            </div>
          </div>

          {/* Editable: Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-slate-700"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={isSubmitting}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
            />
            <p className="text-xs text-slate-500">
              Only letters and spaces. Minimum 3 characters, maximum 50.
            </p>
          </div>

          {/* Read-Only: Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700"
            >
              Email Address <span className="text-xs font-normal text-slate-400">(Read-only)</span>
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                readOnly
                disabled
                value={user?.email ?? ""}
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none cursor-not-allowed"
              />
              <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">
              Your registered email address is verified and cannot be altered here.
            </p>
          </div>

          {/* Read-Only: Account Status & Roles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-slate-400" /> Account Status
              </p>
              <StatusBadge status={accountStatus} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-slate-400" /> Assigned Roles
              </p>
              <div className="flex flex-wrap gap-1">
                {user?.roles?.map((r) => (
                  <span
                    key={r}
                    className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;
