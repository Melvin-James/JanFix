import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  RefreshCw,
  Wrench,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import { logoutUser, switchMode } from "../../../auth/services/authService";
import toast from "react-hot-toast";

interface ProviderHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function ProviderHeader({
  sidebarOpen,
  onToggleSidebar,
}: ProviderHeaderProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const activeMode = useAuthStore((state) => state.activeMode);

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  


  const handleSwitchToUserMode = async () => {
    if (isSwitching) return;
    setIsSwitching(true);
    setSwitchError(null);
    try {
      const response = await switchMode("USER");
      setUser(response.data.user);
      toast.success("User mode activated");
      navigate("/home");
    } catch (err: unknown) {
      console.error("Failed to switch to user mode:", err);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Failed to switch mode.";
      setSwitchError(message || "Failed to switch mode.");
    } finally {
      setIsSwitching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearAuth();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:ml-56 md:px-6">
      {/* Left: Mobile Toggle & Workspace Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        >
          {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
      
        <div className="flex items-center gap-2">

          {/* Account Profile Icon & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              id="user-profile-menu-button"
              aria-label="User account menu"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 text-slate-700 hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-700 max-w-[120px] truncate">
                {user?.providerProfile?.identity?.providerName ?? "Provider"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-profile-menu-button"
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 z-50 focus:outline-none"
              >
                {/* Header Info */}
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.providerProfile?.identity?.providerName ?? "Provider"}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {user?.email ?? ""}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleProfileClick}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer"
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    <span>Profile</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSwitchToUserMode}
                    disabled={isSwitching}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors text-left cursor-pointer disabled:opacity-60"
                  >
                    {isSwitching ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <Wrench className="h-4 w-4 text-blue-600" />
                    )}
                    <span>
                      {isSwitching
                        ? "Switching Mode..."
                        : activeMode === "SERVICE_PROVIDER"
                          ? "Switch to User Mode"
                          : "Switch to Service Provider Mode"}
                    </span>
                  </button>

                  {switchError && (
                    <p className="px-4 py-1 text-xs text-red-600 leading-tight">
                      {switchError}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
