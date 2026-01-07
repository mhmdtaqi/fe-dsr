"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save, X, Search } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

interface BarangDetail {
  nup: string;
  kodeBarang: string;
  lokasi: string;
  nikUser: string;
  status: string;
  jurusan: string;
  createdAt: string;
  dataBarang: {
    kode_barang: string;
    jenis_barang: string;
    merek: string;
  };
  dataLokasi: {
    kode_lokasi: string;
    lokasi: string;
    status: string;
    jurusan: string;
  };
  user: {
    nik: string;
    nama: string;
    email: string;
  };
  peminjamanItems: any[];
  monitoring: any[];
}

export default function DetailBarangPage() {
  const params = useParams();
  const nup = params.nup as string;
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();

  const [data, setData] = useState<BarangDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form Edit
  const [formData, setFormData] = useState({
    lokasi: "",
    status: "",
    jurusan: "",
    createdAt: "",
  });

  // State Search (Hanya untuk Monitoring)
  const [monitoringSearch, setMonitoringSearch] = useState("");

  // Options for Dropdown
  const [options, setOptions] = useState({
    lokasi: [] as { kode_lokasi: string; lokasi: string }[],
  });

  // Monitoring Form
  const [showMonitoringForm, setShowMonitoringForm] = useState(false);
  const [monitoringForm, setMonitoringForm] = useState({
    waktu: new Date().toISOString().slice(0, 16),
    plt: "",
    kondisiBarang: "",
    lokasiBarang: "",
    lokasiTambahan: "",
    foto: null as File | null,
    keterangan: "",
  });
  const [submittingMonitoring, setSubmittingMonitoring] = useState(false);

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
        const res = await apiFetch(`/barangunit/${nup}`, {}, token!);
        setData(res.data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (nup) {
      fetchData();
    }
  }, [nup, token, user, clearAuth, router]);

  useEffect(() => {
    if (data) {
      setFormData({
        lokasi: data.lokasi,
        status: data.status,
        jurusan: data.jurusan,
        createdAt: new Date(data.createdAt).toISOString().slice(0, 16),
      });
    }
  }, [data]);

  // --- Logic Filtering Data (Hanya Monitoring) ---
  const getFilteredMonitoring = () => {
    if (!data?.monitoring) return [];
    return data.monitoring.filter((mon) => {
      const query = monitoringSearch.toLowerCase();
      return (
        mon.plt.toLowerCase().includes(query) ||
        mon.kondisiBarang.toLowerCase().includes(query) ||
        (mon.keterangan || "").toLowerCase().includes(query)
      );
    });
  };

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setEditMode(false);
    if (data) {
      setFormData({
        lokasi: data.lokasi,
        status: data.status,
        jurusan: data.jurusan,
        createdAt: new Date(data.createdAt).toISOString().slice(0, 16),
      });
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const updateData: any = {};
      if (formData.lokasi !== data.lokasi) updateData.lokasi = formData.lokasi;
      if (formData.status !== data.status) updateData.status = formData.status;
      if (formData.jurusan !== data.jurusan) updateData.jurusan = formData.jurusan;
      if (formData.createdAt !== new Date(data.createdAt).toISOString().slice(0, 16))
        updateData.createdAt = new Date(formData.createdAt);

      if (Object.keys(updateData).length > 0) {
        const res = await apiFetch(`/barangunit/${nup}`, { method: "PUT", body: JSON.stringify(updateData) }, token!);
        setData(res.data);
      }
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleMonitoringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitoringForm.foto) {
      setError("Foto wajib diupload");
      return;
    }

    setSubmittingMonitoring(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nupBarang", nup);
      formDataToSend.append("waktu", new Date(monitoringForm.waktu).toISOString());
      formDataToSend.append("plt", monitoringForm.plt);
      formDataToSend.append("kondisiBarang", monitoringForm.kondisiBarang);
      if (monitoringForm.lokasiBarang) formDataToSend.append("lokasiBarang", monitoringForm.lokasiBarang);
      if (monitoringForm.lokasiTambahan) formDataToSend.append("lokasiTambahan", monitoringForm.lokasiTambahan);
      formDataToSend.append("foto", monitoringForm.foto);
      if (monitoringForm.keterangan) formDataToSend.append("keterangan", monitoringForm.keterangan);

      const res = await fetch(`${API_BASE_URL}/monitoring`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Failed to submit monitoring");

      const updatedRes = await apiFetch(`/barangunit/${nup}`, {}, token!);
      setData(updatedRes.data);

      setMonitoringForm({
        waktu: new Date().toISOString().slice(0, 16),
        plt: user?.nama || "",
        kondisiBarang: "",
        lokasiBarang: "",
        lokasiTambahan: "",
        foto: null,
        keterangan: "",
      });
      setShowMonitoringForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to submit monitoring");
    } finally {
      setSubmittingMonitoring(false);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const lokasiRes = await apiFetch("/lokasi", {}, token!);
        setOptions({ lokasi: lokasiRes.data || [] });
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchOptions();
  }, [token]);

  useEffect(() => {
    if (user?.nama) {
      setMonitoringForm((prev) => ({ ...prev, plt: user.nama }));
    }
  }, [user?.nama]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Data tidak ditemukan</div>;

  const filteredMonitoring = getFilteredMonitoring();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <motion.div className="space-y-6 bg-slate-50 p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
            <h1 className="text-xl font-semibold">Detail Barang - {data.nup}</h1>
          </div>
          {!editMode && user?.role === "staff" ? (
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

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Info Utama */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Informasi Barang Unit</h2>
            <div className="space-y-2">
              <div><strong>NUP:</strong> {data.nup}</div>
              <div>
                <Label htmlFor="status">Status</Label>
                {editMode ? (
                  <select id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 border rounded">
                    <option value="Tersedia">Tersedia</option>
                    <option value="TidakTersedia">Tidak Tersedia</option>
                  </select>
                ) : <div><Badge variant={data.status === 'Tersedia' ? 'default' : 'destructive'}>{data.status}</Badge></div>}
              </div>
              <div>
                <Label htmlFor="jurusan">Jurusan</Label>
                {editMode ? (
                  <select id="jurusan" value={formData.jurusan} onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })} className="w-full p-2 border rounded">
                    <option value="umum">Umum</option>
                    <option value="tif">TIF</option>
                  </select>
                ) : <div className="capitalize">{data.jurusan}</div>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Detail Spesifikasi</h2>
            <div className="space-y-2">
              <div><strong>Kode Barang:</strong> {data.dataBarang?.kode_barang || "-"}</div>
              <div><strong>Jenis:</strong> {data.dataBarang?.jenis_barang || "-"}</div>
              <div><strong>Merek:</strong> {data.dataBarang?.merek || "-"}</div>
              <div><strong>Lokasi Saat Ini:</strong> {data.dataLokasi?.lokasi || "-"}</div>
            </div>
          </div>
        </div>

        {/* Riwayat Peminjaman Section (TANPA SEARCH) */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-medium">Riwayat Peminjaman</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {data.peminjamanItems && data.peminjamanItems.length > 0 ? data.peminjamanItems.map((item: any, index: number) => (
              <div key={index} className="border-b pb-2 last:border-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>ID:</strong> #{item.peminjaman?.id}</div>
                    <div>
                        <strong>Status:</strong> <Badge variant="outline" className="text-xs">{item.peminjaman?.status}</Badge> 
                        <span className="mx-2">|</span>
                        <strong>Verif:</strong> {item.peminjaman?.verifikasi}
                    </div>
                    <div><strong>Mulai:</strong> {item.peminjaman?.waktuMulai ? new Date(item.peminjaman.waktuMulai).toLocaleString() : "-"}</div>
                    <div><strong>Selesai:</strong> {item.peminjaman?.waktuSelesai ? new Date(item.peminjaman.waktuSelesai).toLocaleString() : "-"}</div>
                </div>
              </div>
            )) : <div className="text-slate-500 text-sm">Tidak ada riwayat peminjaman.</div>}
          </div>
        </div>

        {/* Monitoring Form Button */}
        {user?.role === "staff" && "staff_prodi" && (
           <div className="bg-white p-6 rounded-lg shadow space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Monitoring Barang</h2>
                <Button variant="outline" size="sm" onClick={() => setShowMonitoringForm(!showMonitoringForm)}>
                  {showMonitoringForm ? "Tutup Form" : "Tambah Monitoring"}
                </Button>
             </div>
             {showMonitoringForm && (
               <form onSubmit={handleMonitoringSubmit} className="space-y-4 border p-4 rounded-md bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Waktu</Label>
                      <Input type="datetime-local" value={monitoringForm.waktu} onChange={e => setMonitoringForm({...monitoringForm, waktu: e.target.value})} required />
                    </div>
                    <div>
                      <Label>PLT</Label>
                      <Input value={monitoringForm.plt} onChange={e => setMonitoringForm({...monitoringForm, plt: e.target.value})} required />
                    </div>
                  </div>
                  <div>
                    <Label>Kondisi</Label>
                    <select className="w-full p-2 border rounded" value={monitoringForm.kondisiBarang} onChange={e => setMonitoringForm({...monitoringForm, kondisiBarang: e.target.value})} required>
                       <option value="">Pilih Kondisi</option>
                       <option value="baik">Baik</option>
                       <option value="rusak_ringan">Rusak Ringan</option>
                       <option value="rusak_berat">Rusak Berat</option>
                    </select>
                  </div>
                  <div>
                    <Label>Foto Bukti</Label>
                    <Input type="file" accept="image/*" onChange={e => setMonitoringForm({...monitoringForm, foto: e.target.files?.[0] || null})} required />
                  </div>
                  <div>
                    <Label>Keterangan</Label>
                    <textarea className="w-full p-2 border rounded" rows={2} value={monitoringForm.keterangan} onChange={e => setMonitoringForm({...monitoringForm, keterangan: e.target.value})} />
                  </div>
                  <Button type="submit" disabled={submittingMonitoring}>{submittingMonitoring ? 'Mengirim...' : 'Kirim Laporan'}</Button>
               </form>
             )}
           </div>
        )}

        {/* Riwayat Monitoring Section (DENGAN SEARCH) */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-medium">Riwayat Monitoring</h2>
                <div className="relative w-full sm:w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Cari PLT / Kondisi..." 
                        className="pl-9 h-9"
                        value={monitoringSearch}
                        onChange={(e) => setMonitoringSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
               {filteredMonitoring.length > 0 ? filteredMonitoring.map((mon: any, index: number) => (
                  <div key={index} className="border rounded-md p-3 text-sm flex flex-col gap-1 hover:bg-slate-50">
                     <div className="flex justify-between font-medium">
                        <span>{new Date(mon.waktu).toLocaleString()}</span>
                        <Badge variant="secondary">{mon.kondisiBarang}</Badge>
                     </div>
                     <div className="text-slate-600">PLT: {mon.plt}</div>
                     {mon.keterangan && <div className="text-slate-500 italic">"{mon.keterangan}"</div>}
                     {mon.foto && <a href={mon.foto} target="_blank" className="text-blue-600 text-xs hover:underline mt-1 block">Lihat Foto</a>}
                  </div>
               )) : <div className="text-slate-500 text-center py-4">Tidak ada data monitoring.</div>}
            </div>
        </div>

      </motion.div>
    </div>
  );
}
