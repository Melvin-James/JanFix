import { useState, type ReactNode } from "react";

import AdminFooter from "./AdminFooter";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <AdminHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      />
      <main className="min-h-[calc(100vh-7.75rem)] md:ml-56">{children}</main>
      <AdminFooter />
    </div>
  );
}
