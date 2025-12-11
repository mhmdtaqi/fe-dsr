"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setLoading(true);

    try {
      await apiFetch(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({ token, password }),
        }
      );

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("RESET PASSWORD ERROR", err);
      setError(err.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null; // Redirecting
  }

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
            <Lock className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold text-slate-800 text-center">
              Reset Password
            </h1>
          </div>

          <p className="text-sm text-slate-600 text-center">
            Masukkan password baru Anda.
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
              Password berhasil direset. Anda akan diarahkan ke halaman login...
            </p>
          )}

          <div className="space-y-1">
            <Label htmlFor="password">Password Baru</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full"
          >
            {loading ? "Mereset..." : "Reset Password"}
          </Button>

          <p className="text-xs text-slate-600 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="underline"
            >
              Kembali ke Login
            </button>
          </p>
        </motion.form>
      </div>

      <Footer />
    </div>
  );
}