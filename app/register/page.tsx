"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner"; // Pakai sonner untuk notifikasi

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export default function RegisterPage() {
  const router = useRouter();

  const [nik, setNik] = useState("");
  const [nomorIT, setNomorIT] = useState("");
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [jurusan, setJurusan] = useState("umum");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi sederhana
      if (password.length < 8) {
        throw new Error("Password minimal 8 karakter.");
      }

      const body = {
        nik,
        nomor_identitas_tunggal: nomorIT,
        email,
        password,
        nama,
        jurusan,
      };

      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });

      toast.success("Registrasi Berhasil!", {
        description: "Akun Anda telah dibuat. Silakan login.",
      });

      // Redirect setelah sukses
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      console.error("REGISTER ERROR", err);
      toast.error("Registrasi Gagal", {
        description: err.message || "Terjadi kesalahan saat mendaftar.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      <LoadingOverlay isLoading={loading} message="Mendaftarkan akun..." />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <Card className="border-slate-200 shadow-xl dark:border-slate-800">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <UserPlus className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Buat Akun Baru
              </CardTitle>
              <CardDescription className="text-slate-500">
                Lengkapi data diri untuk mengakses BMN FASTe
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Grid 2 Kolom untuk Identitas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nik">NIK / NIP</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="nik"
                        placeholder="Nomor Induk"
                        className="pl-9"
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomorIT">No. Identitas Tunggal</Label>
                    <div className="relative">
                      <BadgeCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="nomorIT"
                        placeholder="ID Tunggal"
                        className="pl-9"
                        value={nomorIT}
                        onChange={(e) => setNomorIT(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="nama"
                      placeholder="Nama sesuai identitas"
                      className="pl-9"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurusan">Jurusan</Label>
                  <select
                    id="jurusan"
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="umum">Umum</option>
                    <option value="tif">Teknik Informatika</option>
                    <option value="ti">Teknik Industri</option>
                    <option value="si">Sistem Informasi</option>
                    <option value="mt">Matematika Terapan</option>
                    <option value="te">Teknik Elektro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Institusi</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@uin-suska.ac.id"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Buat password kuat"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <AlertCircleIcon />
                    Minimal 8 karakter, kombinasi huruf & angka.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-2"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Daftar Sekarang"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center border-t border-slate-100 py-4 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Masuk di sini
                </button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

// Icon kecil manual untuk hint
function AlertCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
