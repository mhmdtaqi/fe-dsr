"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";

type Monitoring = any; // bisa diketik sesuai response BE

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminMonitoringPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [data, setData] = useState<Monitoring[]>([]);
  const [nupFilter, setNupFilter] = useState("");
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
      if (nupFilter) params.set("nup", nupFilter.trim());

      const path = `/monitoring${params.toString() ? `?${params.toString()}` : ""}`;

      const res = await apiFetch(path, {}, token);
      setData(res.data ?? res);
    } catch (err: any) {
      console.error("LOAD MONITORING ERROR", err);
      setError(err.message || "Gagal memuat data monitoring");
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

  if (loading) return <div className="p-6">Memuat monitoring...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <motion.div
        className="space-y-4 bg-slate-50 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2 ">
          <Activity className="w-5 h-5 text-sky-600" />
          <h1 className="text-xl font-semibold">Monitoring Kondisi Barang</h1>
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
            <Label className="font-medium text-slate-700">
              Filter NUP Barang
            </Label>
            <Input
              type="text"
              value={nupFilter}
              onChange={(e) => setNupFilter(e.target.value)}
              placeholder="Contoh: 123.456.789"
              className="w-56"
            />
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
                <th className="px-3 py-2">NUP</th>
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">Kondisi</th>
                <th className="px-3 py-2">Lokasi</th>
                <th className="px-3 py-2">PLT</th>
                <th className="px-3 py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m: any) => (
                <tr key={m.id} className="border-t">
                  <td className="px-3 py-2">{m.id}</td>
                  <td className="px-3 py-2">{m.nupBarang}</td>
                  <td className="px-3 py-2">
                    {new Date(m.waktu).toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2">{m.kondisiBarang}</td>
                  <td className="px-3 py-2">
                    {m.dataLokasi
                      ? `${m.dataLokasi.kode_lokasi} - ${m.dataLokasi.lokasi}`
                      : m.lokasiTambahan || "-"}
                  </td>
                  <td className="px-3 py-2">{m.plt}</td>
                  <td className="px-3 py-2">{m.keterangan || "-"}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-slate-500"
                    colSpan={7}
                  >
                    Tidak ada data monitoring.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
