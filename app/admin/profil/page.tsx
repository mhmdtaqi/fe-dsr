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
  Building,
  Briefcase
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
  staff: "Staff Inventaris",
  staff_prodi: "Staff Program Studi",
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
    setLoading(true);
    setTimeout(() => {
        clearAuth();
        router.replace("/login");
    }, 500);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading || !user)
    return <LoadingOverlay isLoading={true} message="Memuat profil..." />;

  // Menentukan warna badge berdasarkan role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case "kepala_bagian_akademik": return "bg-purple-100 text-purple-700 hover:bg-purple-200";
        case "staff": return "bg-blue-100 text-blue-700 hover:bg-blue-200";
        case "staff_prodi": return "bg-orange-100 text-orange-700 hover:bg-orange-200";
        default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center p-4 bg-slate-50/50">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Tombol Kembali */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/dashboard")} // Arahkan ke dashboard admin
            className="pl-0 text-slate-600 hover:text-slate-900 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
          <span className="text-sm font-medium text-slate-500 hidden sm:block">Panel Admin</span>
        </div>

        <Card className="overflow-hidden shadow-lg border-slate-200 bg-white">
          {/* Header Card dengan Gradient Profesional */}
          <div className="h-32 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 relative">
             <div className="absolute inset-0 bg-white/5 pattern-grid-lg" />
          </div>

          <CardHeader className="relative px-8 pt-0 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 gap-5">
              {/* Avatar Circle */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white text-3xl font-bold text-slate-700 shadow-md z-10">
                {getInitials(user.nama)}
              </div>

              <div className="flex-1 text-center sm:text-left mb-1 space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">{user.nama}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
                    <div className="flex items-center text-sm text-slate-500">
                        <Mail className="w-3.5 h-3.5 mr-1" />
                        {user.email}
                    </div>
                </div>
              </div>
              
              <div className="mb-2">
                 <Badge variant="secondary" className={`${getRoleBadgeColor(user.role)} px-3 py-1`}>
                    {roleLabel[user.role] || user.role}
                 </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Informasi Detail</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NIK/NIP */}
              <div className="group flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-all">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Nomor Induk (NIP/NIK)</p>
                  <p className="font-semibold text-slate-900">{user.nik}</p>
                </div>
              </div>

              {/* Jurusan */}
              <div className="group flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-all">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Unit / Jurusan</p>
                  <p className="font-semibold text-slate-900">{jurusanLabels[user.jurusan] ?? user.jurusan}</p>
                </div>
              </div>

              {/* Status Akun */}
              <div className="group flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-all">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Status Akun</p>
                  <p className="font-semibold text-emerald-600 flex items-center gap-1">
                    Aktif & Terverifikasi
                  </p>
                </div>
              </div>

               {/* Role Teknis */}
               <div className="group flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-all">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-orange-50 text-orange-600 group-hover:bg-orange-100">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Level Akses</p>
                  <p className="font-semibold text-slate-900 capitalize">{user.role.replace(/_/g, " ")}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {user.role === "kepala_bagian_akademik" && (
                <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700 flex items-start gap-2">
                    <Building className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        <strong>Info Admin:</strong> Anda memiliki akses penuh untuk mengelola User Civitas dan Staff melalui menu "Kelola Akun".
                    </div>
                </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3 bg-slate-50 p-6 border-t border-slate-100">
            {user.role === "kepala_bagian_akademik" && (
              <Button
                className="flex-1 gap-2 bg-slate-800 hover:bg-slate-900 text-white"
                onClick={() => router.push("/admin/akun")}
              >
                <Settings className="h-4 w-4" />
                Kelola Akun Sistem
              </Button>
            )}

            <Button
              variant="destructive"
              className={`gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm ${user.role === 'kepala_bagian_akademik' ? 'w-auto px-6' : 'w-full'}`}
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
