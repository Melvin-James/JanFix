import { useState } from "react";
import { Outlet } from "react-router-dom";
import ProfileNavbar from "./ProfileNavbar";
import ProfileSidebar from "./ProfileSidebar";
import MainFooter from "../../../components/layout/MainFooter";

export function ProfileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Profile Header/Navbar */}
      <ProfileNavbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Layout Container */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start gap-6 px-4 sm:px-6 py-6 sm:py-8">
        {/* Sidebar */}
        <ProfileSidebar
          open={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Reusable Footer */}
      <MainFooter />
    </div>
  );
}

export default ProfileLayout;
