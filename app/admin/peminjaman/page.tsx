"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Label } from "@/components/ui/label";

type Peminjaman = any; // ketikkan sesuai response BE bila perlu

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminPeminjamanPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [data, setData] = useState<Peminjaman[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [verifFilter, setVerifFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace("/peminjaman");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (verifFilter) params.set("verifikasi", verifFilter);

      const path = `/peminjaman${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const res = await apiFetch(path, {}, token);
      setData(res.data ?? res);
    } catch (err: any) {
      console.error("LOAD ADMIN PEMINJAMAN ERROR", err);
      setError(err.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadData();
  };

  const handleVerify = async (id: number, verifikasi: "diterima" | "ditolak") => {
    if (!token || !user) return;
    if (!["staff_prodi", "kepala_bagian_akademik"].includes(user.role)) return;

    try {
      await apiFetch(
        `/peminjaman/verify/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ verifikasi }),
        },
        token
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi");
    }
  };

  const handleActivate = async (id: number) => {
    if (!token || !user) return;
    if (!["staff", "staff_prodi"].includes(user.role)) return;

    try {
      await apiFetch(
        `/peminjaman/activate/${id}`,
        {
          method: "PUT",
        },
        token
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal mengaktifkan");
    }
  };

  const handleReturn = async (id: number) => {
    if (!token || !user) return;
    if (!["staff", "staff_prodi"].includes(user.role)) return;

    try {
      await apiFetch(
        `/peminjaman/return/${id}`,
        {
          method: "PUT",
        },
        token
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal mengembalikan");
    }
  };

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <motion.div
        className="min-h-screen bg-slate-50 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold mb-2">Daftar Peminjaman</h1>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <motion.form
            onSubmit={handleFilter}
            className="flex flex-wrap gap-3 items-end bg-white rounded border p-3 text-sm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <div className="space-y-1">
              <Label className="font-medium text-slate-700">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">Semua</option>
                <option value="booking">booking</option>
                <option value="aktif">aktif</option>
                <option value="selesai">selesai</option>
                <option value="batal">batal</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-slate-700">Verifikasi</Label>
              <select
                value={verifFilter}
                onChange={(e) => setVerifFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">Semua</option>
                <option value="pending">pending</option>
                <option value="diterima">diterima</option>
                <option value="ditolak">ditolak</option>
              </select>
            </div>

            <Button type="submit" className="px-4 py-2 text-sm">
              Terapkan
            </Button>
          </motion.form>

          <div className="overflow-x-auto rounded border bg-white">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Peminjam</th>
                  <th className="px-3 py-2">Agenda</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Verifikasi</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.id}</td>
                    <td className="px-3 py-2">{p.user?.nama ?? "-"}</td>
                    <td className="px-3 py-2">{p.Agenda}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">{p.verifikasi}</td>
                    <td className="px-3 py-2 space-x-1">
                      {p.status === "booking" && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            className="px-2 py-1 bg-emerald-600 text-white"
                            onClick={() => handleVerify(p.id, "diterima")}
                          >
                            Terima
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="px-2 py-1 bg-red-600 text-white"
                            onClick={() => handleVerify(p.id, "ditolak")}
                          >
                            Tolak
                          </Button>
                        </>
                      )}

                      {p.status === "booking" && p.verifikasi === "diterima" && (
                        <Button
                          type="button"
                          size="sm"
                          className="px-2 py-1 bg-blue-600 text-white"
                          onClick={() => handleActivate(p.id)}
                        >
                          Aktifkan
                        </Button>
                      )}

                      {p.status === "aktif" && (
                        <Button
                          type="button"
                          size="sm"
                          className="px-2 py-1 bg-indigo-600 text-white"
                          onClick={() => handleReturn(p.id)}
                        >
                          Kembalikan
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        className="px-2 py-1 bg-slate-700 text-white text-xs"
                        onClick={() =>
                          router.push(`/admin/scan?kode=PINJAM-${p.id}`)
                        }
                      >
                        Scan
                      </Button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-slate-500"
                      colSpan={6}
                    >
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
