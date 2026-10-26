import { Link } from "react-router-dom";
import { User, Mail, Shield, Activity, Edit3, FileText, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import StatusBadge from "../../../components/UI/StatusBadge";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const isServiceProvider = user?.roles?.includes("SERVICE_PROVIDER") ?? false;
  const accountStatus = user?.accountStatus ?? (user?.isVerified ? "ACTIVE" : "PENDING");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information, roles, and account settings.
          </p>
        </div>

        <Link
          to="/profile/edit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Profile Overview Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Banner with Avatar */}
        <div className="relative bg-linear-to-r from-blue-600 to-indigo-700 px-6 pt-8 pb-12 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-md ring-4 ring-white/30">
              <User className="h-10 w-10" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{user?.fullName ?? "Citizen"}</h2>
              <p className="text-sm text-blue-100 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{user?.email ?? "No email provided"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Account Information
          </h3>

          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Full Name */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span>Full Name</span>
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-900">
                {user?.fullName ?? "Not specified"}
              </dd>
            </div>

            {/* Email Address */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>Email Address</span>
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="truncate">{user?.email ?? "Not specified"}</span>
                {user?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
              </dd>
            </div>

            {/* Account Status */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400" />
                <span>Account Status</span>
              </dt>
              <dd className="mt-2">
                <StatusBadge status={accountStatus} />
              </dd>
            </div>

            {/* Roles & Service Provider Status */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" />
                <span>Assigned Roles</span>
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5 items-center">
                {user?.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60"
                    >
                      {role === "SERVICE_PROVIDER" ? "Service Provider" : role}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">Citizen (Default)</span>
                )}
              </dd>
            </div>
          </dl>

          {/* Service Provider Mode Status Callout */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-start gap-3.5">
            <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Service Provider Capability:{" "}
                <span className={isServiceProvider ? "text-emerald-600" : "text-slate-500"}>
                  {isServiceProvider ? "Registered / Active" : "Citizen Account"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                {isServiceProvider
                  ? "Your account has registered service provider privileges for addressing community issues."
                  : "You are currently participating as a citizen reporter. Service provider onboarding is available via the provider portal."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation to Reports */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Your Civic Reports</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and monitor issues you have submitted to the JanFix community.
          </p>
        </div>
        <Link
          to="/profile/reports"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <FileText className="h-4 w-4 text-slate-500" />
          <span>View Your Reports</span>
        </Link>
      </div>
    </div>
  );
}

export default ProfilePage;
