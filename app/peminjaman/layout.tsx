"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, User2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function PeminjamanLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }
    // hanya civitas
    if (user.role !== "civitas_faste") {
      router.replace("/admin");
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
        {/* Sidebar civitas */}
        <motion.aside
          className="w-64 bg-slate-900 text-slate-100 flex flex-col"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="px-4 py-4 border-b border-slate-700">
            <h1 className="text-lg font-semibold">DSR FASTe</h1>
            <p className="text-xs text-slate-400 mt-1">
              Panel peminjaman civitas
            </p>
            {user && (
              <p className="text-[11px] text-slate-400 mt-2">
                Masuk sebagai{" "}
                <span className="font-semibold">{user.nama}</span> (
                {user.role})
              </p>
            )}
          </div>

          <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
            <Button
              type="button"
              onClick={() => handleNav("/peminjaman")}
              variant={isActive("/peminjaman") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Peminjaman Saya
            </Button>

            <Button
              type="button"
              onClick={() => handleNav("/peminjaman/profil")}
              variant={isActive("/peminjaman/profil") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start gap-2"
            >
              <User2 className="w-4 h-4" />
              Profil
            </Button>
          </nav>
        </motion.aside>

        {/* Konten civitas */}
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
