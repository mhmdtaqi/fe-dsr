"use client";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ScanQrCode, FileSpreadsheet, User2, Menu, X, ClipboardList } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const adminRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isHydrated, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token || !user) { clearAuth(); router.replace("/login"); return; }
    if (!adminRoles.includes(user.role)) { router.replace("/peminjaman"); return; }
    apiFetch("/auth/me", {}, token).catch(() => { clearAuth(); router.replace("/login"); });
  }, [isHydrated, router, token, user, clearAuth]);

  if (!isHydrated) return <div className="min-h-screen flex items-center justify-center bg-slate-100">Loading...</div>;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const handleNav = (href: string) => { setMobileOpen(false); router.push(href); };

  const SidebarContent = (
    <>
      <div className="px-4 py-4 border-b border-slate-700">
        <h1 className="text-lg font-semibold">Admin DSR</h1>
        <p className="text-xs text-slate-400 mt-1">Panel Pengelolaan</p>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
        
        {/* DASHBOARD (Monitoring) */}
        <Button onClick={() => handleNav("/admin/monitoring")} variant={isActive("/admin/monitoring") ? "default" : "ghost"} size="sm" className="w-full justify-start gap-2">
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Button>

        {/* MENU PEMINJAMAN (Halaman Tabel Lengkap) */}
        <Button onClick={() => handleNav("/admin/peminjaman")} variant={isActive("/admin/peminjaman") ? "default" : "ghost"} size="sm" className="w-full justify-start gap-2">
          <ClipboardList className="w-4 h-4" /> Peminjaman
        </Button>

        {user && (user.role === "staff" || user.role === "staff_prodi") && (
          <Button onClick={() => handleNav("/admin/scan")} variant={isActive("/admin/scan") ? "default" : "ghost"} size="sm" className="w-full justify-start gap-2">
            <ScanQrCode className="w-4 h-4" /> Scan QR
          </Button>
        )}
        {user && user.role === "kepala_bagian_akademik" && (
          <Button onClick={() => handleNav("/admin/laporan")} variant={isActive("/admin/laporan") ? "default" : "ghost"} size="sm" className="w-full justify-start gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Laporan
          </Button>
        )}
        <Button onClick={() => handleNav("/admin/profil")} variant={isActive("/admin/profil") ? "default" : "ghost"} size="sm" className="w-full justify-start gap-2">
          <User2 className="w-4 h-4" /> Profil
        </Button>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Header />
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white md:hidden">
        <div className="text-sm font-semibold">Admin Panel</div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</Button>
      </div>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col">{SidebarContent}</aside>
        {mobileOpen && <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col md:hidden shadow-lg">{SidebarContent}</aside>}
        {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
