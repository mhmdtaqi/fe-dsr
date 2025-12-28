"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

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
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const setAuthStore = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      console.log("LOGIN RESPONSE", res);

      const token = res.data?.accessToken ?? res.accessToken ?? res.token ?? "";
      const user = res.data?.user ?? res.user;

      if (!token || !user) {
        throw new Error("Respon server tidak valid.");
      }

      // Simpan Auth
      setAuthStore(token, {
        nik: user.nik,
        nama: user.nama,
        email: user.email,
        role: user.role,
        jurusan: user.jurusan,
      });

      toast.success(`Selamat datang, ${user.nama}!`);

      // --- LOGIC REDIRECT UPDATE ---
      if (user.role === "civitas_faste") {
        // User biasa ke halaman peminjaman saya
        router.replace("/peminjaman");
      } else {
        // Admin (Staff, Staff Prodi, Kabag) ke Dashboard Utama (Monitoring)
        router.replace("/admin/monitoring");
      }
      
    } catch (err: any) {
      console.error("LOGIN ERROR", err);
      toast.error("Login Gagal", {
        description: err.message || "Periksa kembali email dan password Anda.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      <LoadingOverlay isLoading={loading} message="Sedang memverifikasi..." />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-200 shadow-xl dark:border-slate-800">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <LogIn className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Masuk ke Sistem
              </CardTitle>
              <CardDescription className="text-slate-500">
                Masukkan kredensial akun BMN FASTE Anda
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email valid anda"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => router.push("/forgot-password")}
                      className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Masuk Sekarang"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center border-t border-slate-100 py-4 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Daftar akun baru
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
