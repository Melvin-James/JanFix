import { Bell, HelpCircle, Menu, X } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../../store/authStore";

import { logoutUser } from "../../auth/services/authService";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function AdminHeader({ sidebarOpen, onToggleSidebar }: AdminHeaderProps) {

  const navigate = useNavigate();

    const clearAuth = useAuthStore(
        state => state.clearAuth
    );


   const handleLogout = async () => {
  
          try {
  
              await logoutUser();
  
              clearAuth();
  
              navigate("/login");
  
          } catch (error) {
  
              console.error(error);
  
          }
      };
  

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:ml-56 md:px-6">
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 md:hidden"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
      >
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
        </button>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Help"
        >
          <HelpCircle className="size-5" />
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="hidden text-right sm:block">
          <button
                        type="button"
                        onClick={handleLogout}
                        className="
                            rounded-md
                            border
                            border-slate-300
                            px-3
                            py-1.5
                            text-sm
                            font-medium
                            text-slate-700
                            hover:bg-slate-100
                        "
                    >
                        Logout
                    </button>
        </div>
      </div>
    </header>
  );
}
