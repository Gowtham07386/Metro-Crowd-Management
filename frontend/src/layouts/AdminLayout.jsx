import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminNavbar from "@/components/admin/Navbar";
import ChatAssistant from "@/components/common/ChatAssistant";

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-app-gradient">
      <AdminSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminNavbar onOpenMobileMenu={() => setIsMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatAssistant />
    </div>
  );
}
