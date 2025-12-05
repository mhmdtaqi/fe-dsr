"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ScanQrCode,
  Activity,
  FileSpreadsheet,
  User2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

const adminRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    if (!adminRoles.includes(user.role)) {
      router.replace("/peminjaman");
    }
  }, [router, token, user, clearAuthStore]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleNav = (href: string) => {
    router.push(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <div className="flex flex-1">
        <motion.aside
          className="w-64 bg-slate-900 text-slate-100 flex flex-col"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="px-4 py-4 border-b border-slate-700">
            <h1 className="text-lg font-semibold">Admin DSR</h1>
            <p className="text-xs text-slate-400 mt-1">
              Panel pengelolaan BMN & peminjaman
            </p>
            {user && (
              <p className="text-[11px] text-slate-400 mt-2">
                Masuk sebagai{" "}
                <span className="font-semibold">{user.nama}</span> ({user.role})
              </p>
            )}
          </div>

          <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
            <Button
              type="button"
              onClick={() => handleNav("/admin/peminjaman")}
              variant={isActive("/admin/peminjaman") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Peminjaman
            </Button>

            {user && (user.role === "staff" || user.role === "staff_prodi") && (
              <Button
                type="button"
                onClick={() => handleNav("/admin/scan")}
                variant={isActive("/admin/scan") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                <ScanQrCode className="w-4 h-4" />
                Scan QR
              </Button>
            )}

            <Button
              type="button"
              onClick={() => handleNav("/admin/monitoring")}
              variant={isActive("/admin/monitoring") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Activity className="w-4 h-4" />
              Monitoring
            </Button>

            {user && user.role === "kepala_bagian_akademik" && (
              <Button
                type="button"
                onClick={() => handleNav("/admin/laporan")}
                variant={isActive("/admin/laporan") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Laporan
              </Button>
            )}

            <Button
              type="button"
              onClick={() => handleNav("/admin/profil")}
              variant={isActive("/admin/profil") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start gap-2"
            >
              <User2 className="w-4 h-4" />
              Profil
            </Button>
          </nav>
        </motion.aside>

        <motion.main
          className="flex-1 p-4 md:p-6 overflow-x-hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>

      <Footer />
    </div>
  );
}
