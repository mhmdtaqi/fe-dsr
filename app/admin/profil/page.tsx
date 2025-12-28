"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  LogOut,
  Settings,
  Mail,
  CreditCard,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { jurusanLabels } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type UserProfile = {
  nik: string;
  nama: string;
  email: string;
  role: string;
  jurusan: string;
};

const roleLabel: Record<string, string> = {
  civitas_faste: "Civitas FASTE",
  staff: "Staff",
  staff_prodi: "Staff Prodi",
  kepala_bagian_akademik: "Kepala Bagian Akademik",
};

export default function ProfilPage() {
  const router = useRouter();
  const { user: storeUser, clearAuth } = useAuthStore();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeUser) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setUser({
      nik: storeUser.nik,
      nama: storeUser.nama,
      email: storeUser.email,
      role: storeUser.role,
      jurusan: storeUser.jurusan,
    });
    setLoading(false);
  }, [storeUser, router, clearAuth]);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading)
    return <LoadingOverlay isLoading={true} message="Memuat profil..." />;

  if (!user) return null;

  const backHref = "/peminjaman";

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Tombol Kembali */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Profil Saya
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(backHref)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </div>

        <Card className="overflow-hidden shadow-lg border-slate-200 dark:border-slate-800">
          {/* Header Card */}
          <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-teal-900" />

          <CardHeader className="relative px-6 pb-2">
            {/* Avatar Circle */}
            <div className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-2xl font-bold text-slate-600 shadow-md dark:border-slate-950 dark:bg-slate-800 dark:text-slate-300">
              {getInitials(user.nama)}
            </div>

            <div className="pt-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    {user.nama}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  {roleLabel[user.role] || user.role}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 py-6">
            <div className="grid gap-4">
              {/* NIK */}
              <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 dark:bg-slate-900">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Nomor Induk (NIK/NIP)
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {user.nik}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 dark:bg-slate-900">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Email Terdaftar
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Jurusan */}
              <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 dark:bg-slate-900">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Jurusan
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {jurusanLabels[user.jurusan] ?? user.jurusan}
                  </p>
                </div>
              </div>

              {/* Status Akun */}
              <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 dark:bg-slate-900">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Status Akun
                  </p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    Aktif & Terverifikasi
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <p className="text-center text-xs text-slate-400">
              {user.role === "kepala_bagian_akademik"
                ? "Ingin mengubah data? Silakan akses menu Kelola Akun di bawah."
                : "Ingin mengubah data? Silakan hubungi administrator."}
            </p>
          </CardContent>

          <CardFooter className="flex gap-3 bg-slate-50/50 p-6 dark:bg-slate-900/50">
            {user.role === "kepala_bagian_akademik" && (
              <Button
                className="flex-1 gap-2"
                variant="default"
                onClick={() => router.push("/admin/akun")}
              >
                <Settings className="h-4 w-4" />
                Kelola Akun
              </Button>
            )}

            <Button
              variant="destructive"
              className={`${user.role === "kepala_bagian_akademik" ? "flex-1" : "w-full"} gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40`}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
