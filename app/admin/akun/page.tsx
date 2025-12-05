// app/akun/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

type FormState = {
  nama: string;
  email: string;
  password: string;
  password_confirm: string;
};

export default function AkunPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [form, setForm] = useState<FormState>({
    nama: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      clearAuthStore();
      router.replace("/login");
      return;
    }
    setForm((f) => ({ ...f, nama: user.nama, email: user.email }));
  }, [user, token, router, clearAuthStore]);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password && form.password !== form.password_confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    if (!token) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(
        "/auth/akun", // BE: PUT /api/auth/akun
        {
          method: "PUT",
          body: JSON.stringify({
            nama: form.nama,
            email: form.email,
            password: form.password || undefined,
          }),
          headers: { "Content-Type": "application/json" },
        },
        token
      );
      setMessage("Akun berhasil diperbarui.");
      setForm((f) => ({ ...f, password: "", password_confirm: "" }));
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="max-w-xl mx-auto bg-white rounded shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold">Pengelolaan Akun</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label>Nama</Label>
            <Input value={form.nama} onChange={handleChange("nama")} />
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
            />
          </div>

          <div className="space-y-1">
            <Label>Password baru (opsional)</Label>
            <Input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
            />
          </div>

          <div className="space-y-1">
            <Label>Konfirmasi password baru</Label>
            <Input
              type="password"
              value={form.password_confirm}
              onChange={handleChange("password_confirm")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/profil")}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
