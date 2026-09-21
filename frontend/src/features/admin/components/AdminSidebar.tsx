import { NavLink, useLocation } from "react-router-dom";
import {
//   Activity,
//   BarChart3,
//   ClipboardCheck,
  Wrench,
  FileText,
//   HandCoins,
  LayoutDashboard,
  Settings,
  Tags,
  Users,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Provider Applications", icon: FileText, to:"/admin/provider-applications" },
//   { label: "Proposals", icon: ClipboardCheck },
//   { label: "Activities", icon: Activity },
  { label: "Users", icon: Users },
  { label: "Service Providers", icon: Wrench },
//   { label: "Fund releases", icon: HandCoins },
//   { label: "Completion", icon: BarChart3 },
  { label: "Category", icon: Tags },
];

interface AdminSidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export default function AdminSidebar({ open, onNavigate }: AdminSidebarProps) {
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
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <div>
            <p className="text-xl font-bold text-slate-900">JanFix</p>
            <p className="text-[10px] text-slate-500">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Admin navigation">
          {navigation.map((item) => {

            const Icon = item.icon;

            const active = item.to ==="/admin" ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);

            const classes = `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-200/70"
            }`;
            return item.to ? (
              <NavLink key={item.label} to={item.to} onClick={onNavigate} className={classes}>
                <Icon className="size-4" />
                {item.label}
              </NavLink>
            ) : (
              <button key={item.label} type="button" className={`w-full text-left ${classes}`}>
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-200/70"
          >
            <Settings className="size-4" /> Settings
          </button>
          {/* <div className="mt-2 flex items-center gap-3 rounded-md bg-white/70 p-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              AU
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">Admin User</p>
              <p className="text-[10px] text-slate-500">Super Admin</p>
            </div>
          </div> */}
        </div>
      </aside>
    </>
  );
}
