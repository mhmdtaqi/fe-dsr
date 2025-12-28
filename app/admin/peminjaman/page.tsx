"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCcw, 
  QrCode 
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Peminjaman = any;

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminPeminjamanPage() {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();

  const [data, setData] = useState<Peminjaman[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [verifFilter, setVerifFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 1. Load Data
  const loadData = async () => {
    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace("/peminjaman");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (verifFilter) params.set("verifikasi", verifFilter);

      const path = `/peminjaman${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await apiFetch(path, {}, token);
      let fetchedData = res.data ?? res;

      // Filter khusus staff_prodi (hanya lihat barang jurusan TIF)
      if (user.role === "staff_prodi") {
        fetchedData = fetchedData.filter((p: any) =>
          p.items?.some((item: any) => item.barangUnit?.jurusan === "tif")
        );
      }

      setData(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (err: any) {
      console.error("LOAD ERROR", err);
      toast.error("Gagal memuat data", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // --- ACTIONS ---
  const handleVerify = async (id: number, verifikasi: "diterima" | "ditolak") => {
    try {
      toast.loading("Memproses verifikasi...");
      await apiFetch(`/peminjaman/verify/${id}`, {
        method: "PUT",
        body: JSON.stringify({ verifikasi }),
      }, token!);
      toast.dismiss();
      toast.success(`Peminjaman ${verifikasi}`);
      loadData();
    } catch (err: any) {
      toast.dismiss();
      toast.error("Gagal verifikasi", { description: err.message });
    }
  };

  const handleActivate = async (id: number) => {
    try {
      toast.loading("Mengaktifkan peminjaman...");
      await apiFetch(`/peminjaman/activate/${id}`, { method: "PUT" }, token!);
      toast.dismiss();
      toast.success("Peminjaman Aktif");
      loadData();
    } catch (err: any) {
      toast.dismiss();
      toast.error("Gagal aktivasi", { description: err.message });
    }
  };

  const handleReturn = async (id: number) => {
    try {
      toast.loading("Menyelesaikan peminjaman...");
      await apiFetch(`/peminjaman/return/${id}`, { method: "PUT" }, token!);
      toast.dismiss();
      toast.success("Peminjaman Selesai & Barang Kembali");
      loadData();
    } catch (err: any) {
      toast.dismiss();
      toast.error("Gagal return", { description: err.message });
    }
  };

  const isStaffProdiItem = (jenis: string) => ["Proyektor", "Microphone", "Sound System"].includes(jenis);
  const showAksi = user?.role !== "kepala_bagian_akademik"; // Kabag hanya monitoring/verify, biasanya staff yg scan/aktifkan

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="w-6 h-6 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Peminjaman</h1>
        </div>

        {/* Filter Section */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
              <div className="space-y-1 w-full sm:w-auto">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-40 border rounded-md px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-slate-200 outline-none"
                >
                  <option value="">Semua Status</option>
                  <option value="booking">Booking</option>
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                  <option value="batal">Batal</option>
                </select>
              </div>

              <div className="space-y-1 w-full sm:w-auto">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Verifikasi</Label>
                <select
                  value={verifFilter}
                  onChange={(e) => setVerifFilter(e.target.value)}
                  className="w-full sm:w-40 border rounded-md px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-slate-200 outline-none"
                >
                  <option value="">Semua Verifikasi</option>
                  <option value="pending">Pending</option>
                  <option value="diterima">Diterima</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <Button type="submit" className="gap-2">
                <Filter className="w-4 h-4" /> Terapkan Filter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3 w-[50px]">ID</th>
                  <th className="px-4 py-3">Peminjam</th>
                  <th className="px-4 py-3">Agenda</th>
                  <th className="px-4 py-3">Items / Lokasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verifikasi</th>
                  {showAksi && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">Memuat data peminjaman...</td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Tidak ada data peminjaman yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  data.map((p) => {
                    const isStaffProdiLoan = p.items?.some((item: any) => isStaffProdiItem(item.barangUnit?.dataBarang?.jenis_barang));
                    const semuaBarangUmum = p.items?.every((item: any) => item.barangUnit?.jurusan === "umum");
                    const lokasiUmum = !p.kodeLokasi || p.lokasi?.jurusan === "umum";
                    const isUmumLoan = semuaBarangUmum && lokasiUmum;

                    // Permission Logic
                    const canVerify = 
                      (user?.role === "staff_prodi" && isStaffProdiLoan) ||
                      (user?.role === "kepala_bagian_akademik" && !isStaffProdiLoan) ||
                      (user?.role === "staff" && isUmumLoan);
                    
                    const canActivate = user?.role === "kepala_bagian_akademik" && !isStaffProdiLoan;
                    
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">#{p.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{p.user?.nama ?? "-"}</div>
                          <div className="text-xs text-slate-500">{p.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate" title={p.Agenda}>{p.Agenda}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px]">
                          {p.items?.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {p.items.map((i: any, idx: number) => (
                                <li key={idx} className="truncate">
                                  {i.barangUnit?.dataBarang?.jenis_barang} <span className="text-slate-400">({i.barangUnit?.dataBarang?.merek})</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>{p.lokasi?.lokasi || p.lokasiTambahan || "-"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">{p.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant="secondary" 
                            className={`capitalize ${
                              p.verifikasi === 'diterima' ? 'bg-emerald-100 text-emerald-700' :
                              p.verifikasi === 'ditolak' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {p.verifikasi || 'pending'}
                          </Badge>
                        </td>
                        {showAksi && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {/* --- TOMBOL VERIFIKASI --- */}
                              {p.status === 'booking' && (p.verifikasi === 'pending' || !p.verifikasi) && canVerify && (
                                <>
                                  <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleVerify(p.id, "diterima")}>
                                    <CheckCircle className="w-3 h-3 mr-1" /> Terima
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleVerify(p.id, "ditolak")}>
                                    <XCircle className="w-3 h-3 mr-1" /> Tolak
                                  </Button>
                                </>
                              )}

                              {/* --- TOMBOL AKTIVASI --- */}
                              {p.status === 'booking' && p.verifikasi === 'diterima' && canActivate && (
                                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => handleActivate(p.id)}>
                                  <Play className="w-3 h-3 mr-1" /> Aktifkan
                                </Button>
                              )}

                              {/* --- TOMBOL RETURN --- */}
                              {p.status === 'aktif' && canActivate && (
                                <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => handleReturn(p.id)}>
                                  <RotateCcw className="w-3 h-3 mr-1" /> Selesai
                                </Button>
                              )}

                              {/* --- TOMBOL SCAN --- */}
                              <Button size="sm" variant="outline" className="h-7 text-xs border-slate-300" onClick={() => router.push(`/admin/scan?kode=PINJAM-${p.id}`)}>
                                <QrCode className="w-3 h-3 mr-1" /> Scan
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
