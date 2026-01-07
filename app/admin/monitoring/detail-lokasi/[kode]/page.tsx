"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save, X, Search } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

interface LokasiDetail {
  kode_lokasi: string;
  lokasi: string;
  jurusan: string;
  status: string;
  barangUnit: any[];
  peminjamanP: any[];
}

export default function DetailLokasiPage() {
  const params = useParams();
  const kode = params.kode as string;
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();

  const [data, setData] = useState<LokasiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    lokasi: "",
    status: "",
    jurusan: "",
  });

  // Search State (Hanya untuk Barang Unit)
  const [barangSearch, setBarangSearch] = useState("");

  useEffect(() => {
    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace("/peminjaman");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/lokasi/${kode}`, {}, token!);
        setData(res.data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    if (kode) fetchData();
  }, [kode, token, user, clearAuth, router]);

  useEffect(() => {
    if (data) {
      setFormData({
        lokasi: data.lokasi,
        status: data.status,
        jurusan: data.jurusan,
      });
    }
  }, [data]);

  // Logic Filtering (Hanya untuk Barang)
  const getFilteredBarang = () => {
    if (!data?.barangUnit) return [];
    return data.barangUnit.filter((item) => {
        const query = barangSearch.toLowerCase();
        return (
            item.nup.toLowerCase().includes(query) ||
            item.dataBarang?.jenis_barang.toLowerCase().includes(query) ||
            item.dataBarang?.merek.toLowerCase().includes(query)
        );
    });
  };

  const handleEdit = () => setEditMode(true);
  
  const handleCancel = () => {
    setEditMode(false);
    if (data) setFormData({ lokasi: data.lokasi, status: data.status, jurusan: data.jurusan });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const updateData: any = {};
      if (formData.lokasi !== data.lokasi) updateData.lokasi = formData.lokasi;
      if (formData.status !== data.status) updateData.status = formData.status;
      if (formData.jurusan !== data.jurusan) updateData.jurusan = formData.jurusan;

      if (Object.keys(updateData).length > 0) {
        const res = await apiFetch(`/lokasi/${kode}`, { method: "PUT", body: JSON.stringify(updateData) }, token!);
        setData(res.data);
      }
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Data tidak ditemukan</div>;

  const filteredBarang = getFilteredBarang();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <motion.div className="space-y-6 bg-slate-50 p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
            <h1 className="text-xl font-semibold">Detail Lokasi - {data.kode_lokasi}</h1>
          </div>
          {!editMode && user?.role !== "kepala_bagian_akademik" ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
          ) : editMode && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}><X className="w-4 h-4 mr-1" /> Batal</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> {saving ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          )}
        </div>

        {/* Info Lokasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Informasi Lokasi</h2>
            <div className="space-y-2">
              <div><strong>Kode Lokasi:</strong> {data.kode_lokasi}</div>
              <div>
                <Label>Lokasi</Label>
                {editMode ? <Input value={formData.lokasi} onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })} /> : <div>{data.lokasi}</div>}
              </div>
              <div>
                <Label>Status</Label>
                {editMode ? (
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 border rounded">
                    <option value="dipinjam">Dipinjam</option>
                    <option value="tidakDipinjam">Tidak Dipinjam</option>
                    <option value="belumTersedia">Belum Tersedia</option>
                  </select>
                ) : <div><Badge variant={data.status === 'dipinjam' ? 'secondary' : 'default'}>{data.status}</Badge></div>}
              </div>
              <div>
                <Label>Jurusan</Label>
                {editMode ? (
                  <select value={formData.jurusan} onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })} className="w-full p-2 border rounded">
                    <option value="umum">Umum</option>
                    <option value="tif">TIF</option>
                  </select>
                ) : <div className="capitalize">{data.jurusan}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Barang Unit dengan Search */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-medium">Barang Unit di Lokasi Ini</h2>
                <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Cari NUP / Jenis / Merek..." 
                        className="pl-9 h-9"
                        value={barangSearch}
                        onChange={(e) => setBarangSearch(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredBarang.length > 0 ? filteredBarang.map((item: any, index: number) => (
                    <div key={index} className="border-b pb-2 last:border-0 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <div className="font-semibold">{item.dataBarang?.jenis_barang} - {item.dataBarang?.merek}</div>
                            <div className="text-xs text-slate-500">NUP: {item.nup}</div>
                        </div>
                        <Badge variant="outline">{item.status}</Badge>
                    </div>
                )) : <div className="text-center text-slate-500 py-4">Tidak ada barang yang cocok.</div>}
            </div>
        </div>

        {/* Tabel Riwayat Peminjaman Ruangan (TANPA SEARCH) */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Riwayat Peminjaman Ruangan</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {data.peminjamanP && data.peminjamanP.length > 0 ? data.peminjamanP.map((pem: any, index: number) => (
                    <div key={index} className="border-b pb-2 last:border-0">
                        <div className="flex justify-between">
                            <span className="font-semibold text-sm">#{pem.id} - {pem.user?.nama}</span>
                            <Badge className="text-xs" variant={pem.status === 'aktif' ? 'default' : 'secondary'}>{pem.status}</Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {pem.waktuMulai ? new Date(pem.waktuMulai).toLocaleString() : "-"} s/d {pem.waktuSelesai ? new Date(pem.waktuSelesai).toLocaleString() : "-"}
                        </div>
                    </div>
                )) : <div className="text-center text-slate-500 py-4">Tidak ada riwayat peminjaman.</div>}
            </div>
        </div>

      </motion.div>
    </div>
  );
}
