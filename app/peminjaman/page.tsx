"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

type Peminjaman = any; // sesuaikan dengan tipe BE
type Barang = any;
type Lokasi = any;

export default function PeminjamanPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [data, setData] = useState<Peminjaman[]>([]);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [activeTab, setActiveTab] = useState<'barang' | 'lokasi' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    if (user.role !== "civitas_faste") {
      router.replace("/admin");
      return;
    }

    const load = async () => {
      try {
        const peminjamanRes = await apiFetch("/peminjaman", {}, token);
        setData(peminjamanRes.data ?? peminjamanRes);

        const barangRes = await apiFetch("/barangunit/available-for-peminjaman", {}, token);
        setBarangList(barangRes.data ?? barangRes);

        const lokasiRes = await apiFetch("/lokasi", {}, token);
        setLokasiList(lokasiRes.data ?? lokasiRes);
      } catch (err: any) {
        console.error("LOAD DATA ERROR", err);
        setError(err.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, token, user, clearAuthStore]);

  const handleSelectLokasi = (l: Lokasi) => {
    if (selectedBarang) {
      router.push(`/peminjaman/buat?type=items&nup=${selectedBarang.nup}&kodeLokasi=${l.kode_lokasi}`);
    } else {
      router.push(`/peminjaman/buat?type=location&kodeLokasi=${l.kode_lokasi}`);
    }
  };

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold">Peminjaman Saya</h1>
          </div>
          <Button
            onClick={() => router.push("/peminjaman/buat")}
            size="sm"
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buat Peminjaman
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada peminjaman.</p>
        ) : (
          <div className="overflow-x-auto rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2">ID</th>
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
                    <td className="px-3 py-2">{p.Agenda}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">{p.verifikasi}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => router.push(`/peminjaman/${p.id}`)}
                        className="text-xs text-slate-900 underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <button onClick={() => setActiveTab(activeTab === 'barang' ? null : 'barang')} className="w-full text-left font-semibold text-lg">Card Barang</button>
            {activeTab === 'barang' && (
              <div className="mt-4">
                {selectedBarang && (
                  <div className="mb-4 p-2 bg-blue-50 border rounded">
                    <p className="text-sm">Barang Terpilih: {selectedBarang.nup} - {selectedBarang.dataBarang?.jenis_barang}</p>
                    <button onClick={() => setSelectedBarang(null)} className="text-xs text-red-600 underline">Batal Pilih</button>
                  </div>
                )}
                {barangList.length === 0 ? (
                  <p className="text-sm text-slate-500">Tidak ada data barang.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {barangList.map((b: any) => (
                      <div key={b.nup} className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm ${selectedBarang?.nup === b.nup ? 'ring-2 ring-blue-500' : ''}`}>
                        <h3 className="font-medium text-slate-900">{b.nup}</h3>
                        <p className="text-sm text-slate-600">Jenis: {b.dataBarang?.jenis_barang}</p>
                        <p className="text-sm text-slate-600">Merek: {b.dataBarang?.merek}</p>
                        <p className="text-sm text-slate-600">Status: {b.status}</p>
                        <Button onClick={() => { setSelectedBarang(b); setActiveTab('lokasi'); }} size="sm" className="mt-2">Pilih</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <button onClick={() => setActiveTab(activeTab === 'lokasi' ? null : 'lokasi')} className="w-full text-left font-semibold text-lg">Card Lokasi</button>
            {activeTab === 'lokasi' && (
              <div className="mt-4">
                {lokasiList.length === 0 ? (
                  <p className="text-sm text-slate-500">Tidak ada data lokasi.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lokasiList.map((l: any) => (
                      <div key={l.kode_lokasi} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <h3 className="font-medium text-slate-900">{l.kode_lokasi}</h3>
                        <p className="text-sm text-slate-600">Lokasi: {l.lokasi}</p>
                        <p className="text-sm text-slate-600">Status: {l.status}</p>
                        <Button onClick={() => handleSelectLokasi(l)} size="sm" className="mt-2">{selectedBarang ? 'Pinjam Barang di Lokasi Ini' : 'Pinjam Lokasi'}</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
