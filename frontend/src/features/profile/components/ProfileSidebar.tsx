import { NavLink, useLocation } from "react-router-dom";
import { User, UserPen, FileText } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

interface ProfileSidebarProps {
  open: boolean;
  onNavigate: () => void;
}

const navItems = [
  { label: "Profile", icon: User, to: "/profile", end: true },
  { label: "Edit Profile", icon: UserPen, to: "/profile/edit", end: true },
  { label: "Your Reports", icon: FileText, to: "/profile/reports", end: false },
];

export function ProfileSidebar({ open, onNavigate }: ProfileSidebarProps) {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar navigation"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onNavigate}
        />
      )}

      {/* Sidebar container */}
      <aside
        aria-label="Profile navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl md:shadow-none transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:border-r md:bg-white md:rounded-xl md:border md:shadow-xs md:h-fit md:min-h-[460px] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User Mini Profile Card */}
        <div className="flex flex-col items-center border-b border-slate-100 p-6 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-inner">
            <User className="h-8 w-8" />
          </div>
          <h2 className="mt-3 font-semibold text-slate-900 line-clamp-1">
            {user?.fullName ?? "Citizen User"}
          </h2>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
            {user?.email ?? ""}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
            {user?.roles?.map((role) => (
              <span
                key={role}
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200/50"
              >
                {role === "SERVICE_PROVIDER" ? "Service Provider" : role}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 p-3.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.end
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`);

            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onNavigate}
                className={`flex h-10 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default ProfileSidebar;
