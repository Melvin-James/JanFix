import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, AlertCircle, Wrench } from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/provider/dashboard" },
  { label: "Issues", icon: AlertCircle, to: "/provider/issues" },
];

interface ProviderSidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export default function ProviderSidebar({ open, onNavigate }: ProviderSidebarProps) {
  const { pathname } = useLocation();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/20 md:hidden"
          onClick={onNavigate}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-slate-200 bg-slate-100 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none text-slate-900">JanFix</p>
            <p className="text-[11px] font-medium text-blue-600 mt-0.5">Service Provider</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Provider navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === "/provider/dashboard"
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(`${item.to}/`);

            const classes = `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/70"
            }`;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onNavigate}
                className={classes}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
