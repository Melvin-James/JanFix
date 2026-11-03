import { useState, type ReactNode } from "react";
import ProviderFooter from "./ProviderFooter";
import ProviderHeader from "./ProviderHeader";
import ProviderSidebar from "./ProviderSidebar";

interface ProviderLayoutProps {
  children: ReactNode;
}

export default function ProviderLayout({ children }: ProviderLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <ProviderSidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <ProviderHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      />
      <main className="min-h-[calc(100vh-7.75rem)] md:ml-56 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <ProviderFooter />
    </div>
  );
}
