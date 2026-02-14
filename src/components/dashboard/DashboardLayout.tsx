import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div
        className="transition-all duration-300"
        style={{ paddingLeft: sidebarCollapsed ? "5rem" : "16rem" }}
      >
        <Header />
        <main className="p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
