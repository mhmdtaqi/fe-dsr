"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setAuthStore = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      console.log("LOGIN RESPONSE", res);

      const token =
        res.data?.accessToken ??
        res.accessToken ??
        res.token ??
        "";
      const user = res.data?.user ?? res.user;

      if (!token || !user) {
        throw new Error("Login gagal: response tidak lengkap");
      }

      // simpan ke zustand (persist -> otomatis ke localStorage)
      setAuthStore(token, {
        nik: user.nik,
        nama: user.nama,
        email: user.email,
        role: user.role,
      });

      if (user.role === "civitas_faste") {
        router.push("/peminjaman");
      } else {
        router.push("/admin/peminjaman");
      }
    } catch (err: any) {
      console.error("LOGIN ERROR", err);
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-8 mb-20 mt-20">
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white shadow-md rounded-lg p-6 space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <LogIn className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold text-slate-800 text-center">
              Masuk Sistem BMN FASTe
            </h1>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Masuk..." : "Masuk"}
          </Button>

          <p className="text-xs text-slate-600 text-center">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="underline"
            >
              Daftar
            </button>
          </p>
        </motion.form>
      </div>

      <Footer />
    </div>
  );
}
