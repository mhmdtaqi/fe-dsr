"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileSpreadsheet } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";

type VerifikasiFilter = "" | "pending" | "diterima" | "ditolak";

export default function LaporanPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [verifikasi, setVerifikasi] = useState<VerifikasiFilter>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }
    if (user.role !== "kepala_bagian_akademik") {
      router.replace("/admin/peminjaman");
    }
  }, [router, token, user, clearAuthStore]);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!token) throw new Error("Sesi login habis, silakan login ulang.");

      const params = new URLSearchParams();
      if (verifikasi) params.set("verifikasi", verifikasi);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const url = `${baseUrl}/laporan/peminjaman/export${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal mengunduh laporan");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "Laporan_Peminjaman_Selesai.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error("EXPORT LAPORAN ERROR", err);
      setError(err.message || "Gagal mengunduh laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <motion.div
        className="p-6 space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-semibold">Laporan Peminjaman</h1>
        </div>
        <p className="text-sm text-slate-600">
          Export data peminjaman yang sudah selesai ke file Excel, dengan filter
          status verifikasi dan rentang tanggal pembuatan.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <motion.form
          onSubmit={handleExport}
          className="bg-white border rounded p-4 space-y-4 text-sm max-w-xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="font-medium text-slate-700">
                Status Verifikasi
              </Label>
              <select
                value={verifikasi}
                onChange={(e) =>
                  setVerifikasi(e.target.value as VerifikasiFilter)
                }
                className="border rounded px-2 py-1 w-full"
              >
                <option value="">Semua</option>
                <option value="pending">pending</option>
                <option value="diterima">diterima</option>
                <option value="ditolak">ditolak</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="startDate" className="font-medium text-slate-700">
                Tanggal Mulai (createdAt)
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="endDate" className="font-medium text-slate-700">
                Tanggal Selesai (createdAt)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm disabled:opacity-60"
          >
            {loading ? "Mengunduh..." : "Export ke Excel"}
          </Button>
        </motion.form>
      </motion.div>
    </div>
  );
}
