"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";

type FormState = {
  nama: string;
  email: string;
  password: string;
  role: string;
};

export default function EditUserPage() {
  const params = useParams();
  const nik = params.nik as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [form, setForm] = useState<FormState>({
    nama: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }
  }, [router, token, user, clearAuthStore]);

  useEffect(() => {
    if (!token || !nik) return;

    const fetchUser = async () => {
      try {
        setFetchLoading(true);
        const res = await apiFetch(`/auth/${nik}`, {}, token);
        const userData = res.data;
        setForm({
          nama: userData.nama || "",
          email: userData.email || "",
          password: "",
          role: userData.role || "",
        });
        // Kabag cannot edit Civitas accounts
        if (user?.role === "kepala_bagian_akademik" && userData.role === "civitas_faste") {
          setCanEdit(false);
        } else {
          setCanEdit(true);
        }
      } catch (err: any) {
        console.error("Fetch user error:", err);
        setError(err.message || "Failed to fetch user data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUser();
  }, [nik, token]);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        nama: form.nama,
        email: form.email,
        role: form.role,
      };
      if (form.password) {
        updateData.password = form.password;
      }

      await apiFetch(
        `/auth/${nik}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        },
        token
      );

      setMessage("User berhasil diperbarui.");
      setForm((f) => ({ ...f, password: "" }));
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui user.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="max-w-xl mx-auto bg-white rounded shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h1 className="text-xl font-semibold">Edit User</h1>
        </div>

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
        {!canEdit && (
          <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded px-3 py-2">
            Anda tidak diizinkan mengubah akun Civitas. Mode read-only.
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label>NIK</Label>
            <Input value={nik} disabled />
          </div>

          <div className="space-y-1">
            <Label>Nama</Label>
            <Input value={form.nama} onChange={handleChange("nama")} disabled={!canEdit} />
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-1">
            <Label>Role</Label>
            <select
              value={form.role}
              onChange={handleChange("role")}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="staff">Staff</option>
              <option value="staff_prodi">Staff Prodi</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label>Password baru (opsional)</Label>
            <Input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              disabled={!canEdit}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading || !canEdit}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
