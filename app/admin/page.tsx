"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminHome() {
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

    if (!allowedRoles.includes(user.role)) {
      router.replace("/peminjaman");
      return;
    }
  }, [router, token, user, clearAuthStore]);

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-slate-700" />
          <h1 className="text-xl font-semibold">Admin DSR</h1>
        </div>
        <p className="text-sm text-slate-600">
          Pilih menu di sidebar untuk mengelola daftar peminjaman, verifikasi,
          monitoring kondisi barang, atau melihat laporan peminjaman.
        </p>
      </div>
    </motion.div>
  );
}
