"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserCircle2, ArrowLeft, LogOut, Settings2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

type UserProfile = {
  nik: string;
  nama: string;
  email: string;
  role: string;
};

const roleLabel: Record<string, string> = {
  civitas_faste: "Civitas FASTE",
  staff: "Staff",
  staff_prodi: "Staff Prodi",
  kepala_bagian_akademik: "Kepala Bagian Akademik",
};

export default function ProfilPage() {
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeUser) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    setUser({
      nik: storeUser.nik,
      nama: storeUser.nama,
      email: storeUser.email,
      role: storeUser.role,
    });
    setLoading(false);
  }, [router, storeUser, clearAuthStore]);

  if (loading) return <div className="p-6">Memuat...</div>;
  if (!user) return null;

  const backHref = "/peminjaman";

  const handleLogout = () => {
    clearAuthStore();
    router.replace("/login");
  };

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="max-w-xl mx-auto bg-white rounded shadow-sm p-6 space-y-4">
        <Header />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCircle2 className="w-6 h-6 text-slate-700" />
            <h1 className="text-xl font-semibold">Profil</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(backHref)}
            className="inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">NIK: </span>
            <span>{user.nik}</span>
          </div>
          <div>
            <span className="font-medium">Nama: </span>
            <span>{user.nama}</span>
          </div>
          <div>
            <span className="font-medium">Email: </span>
            <span>{user.email}</span>
          </div>
          <div>
            <span className="font-medium">Role: </span>
            <span>{roleLabel[user.role] ?? user.role}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Pengubahan data profil (nama, email, password) dapat dilakukan
          melalui halaman pengelolaan akun.
        </p>

        <div className="pt-3 border-t flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-1"
            onClick={() => router.push("/peminjaman/akun")}
          >
            <Settings2 className="w-4 h-4" />
            Kelola Akun
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-1 text-red-600 border-red-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
