"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  LogOut,
  Settings,
  User,
  Mail,
  Briefcase,
  CreditCard,
  Building2,
  GraduationCap
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { jurusanLabels } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

// --- Types ---
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
    setLoading(true);
    setTimeout(() => {
      clearAuth();
      router.replace("/login");
    }, 500);
  };

  if (loading || !user) {
    return <LoadingOverlay isLoading={true} message="Memuat profil..." />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-80px)] bg-slate-50/50">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Tombol Kembali */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/peminjaman")}
            className="pl-0 text-slate-500 hover:text-slate-900 hover:bg-transparent group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Dashboard
          </Button>
        </div>

        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
          <CardHeader className="pb-4 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Profil Saya
                </CardTitle>
                <CardDescription className="mt-1">
                  Informasi akun Civitas FASTE Anda.
                </CardDescription>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-1 pt-6 px-6">
            <SimpleInfoRow
              icon={<User className="w-4 h-4" />}
              label="Nama Lengkap"
              value={user.nama}
            />
            <Separator className="my-3 opacity-50" />

            <SimpleInfoRow
              icon={<CreditCard className="w-4 h-4" />}
              label="Nomor Induk (NIM/NIP)"
              value={user.nik}
            />
            <Separator className="my-3 opacity-50" />

            <SimpleInfoRow
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={user.email}
            />
            <Separator className="my-3 opacity-50" />

            <SimpleInfoRow
              icon={<GraduationCap className="w-4 h-4" />}
              label="Jurusan"
              value={jurusanLabels[user.jurusan] ?? user.jurusan}
            />
            <Separator className="my-3 opacity-50" />

            <SimpleInfoRow
              icon={<Building2 className="w-4 h-4" />}
              label="Role Akses"
              value={roleLabel[user.role] || user.role}
              isBadge
            />
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 bg-slate-50 px-6 py-4 mt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:flex-1 bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
              onClick={() => router.push("/peminjaman/akun")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan Akun
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 shadow-sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

// --- Komponen Baris Info (Re-usable) ---
function SimpleInfoRow({
  label,
  value,
  isBadge = false,
  icon,
}: {
  label: string;
  value: string;
  isBadge?: boolean;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 gap-1">
      <div className="flex items-center gap-2.5 text-slate-500">
        <div className="text-slate-400">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>

      {isBadge ? (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mt-1 sm:mt-0 w-fit">
          {value}
        </span>
      ) : (
        <span className="text-sm font-semibold text-slate-900 break-all sm:text-right pl-7 sm:pl-0">
          {value}
        </span>
      )}
    </div>
  );
}
