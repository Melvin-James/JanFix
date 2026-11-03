import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ArrowLeftRight, LogOut, RefreshCw } from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import { logoutUser, switchMode } from "../../../auth/services/authService";

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

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const handleSwitchToUserMode = async () => {
    if (isSwitching) return;
    setIsSwitching(true);
    setSwitchError(null);
    try {
      const response = await switchMode("USER");
      setUser(response.data.user);
      navigate("/home");
    } catch (err: unknown) {
      console.error("Failed to switch to user mode:", err);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
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

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
          <span className="size-2 rounded-full bg-blue-600" />
          Service Provider Workspace
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {switchError && (
          <span className="hidden md:inline text-xs text-red-600 font-medium">
            {switchError}
          </span>
        )}

        {/* Switch to User Mode Button */}
        <button
          type="button"
          onClick={handleSwitchToUserMode}
          disabled={isSwitching}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {isSwitching ? (
            <RefreshCw className="size-3.5 animate-spin text-blue-600" />
          ) : (
            <ArrowLeftRight className="size-3.5 text-blue-600" />
          )}
          <span>{isSwitching ? "Switching..." : "Switch to User Mode"}</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Info & Logout */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline text-xs font-medium text-slate-600 max-w-[140px] truncate">
            {user?.fullName ?? "Provider"}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
