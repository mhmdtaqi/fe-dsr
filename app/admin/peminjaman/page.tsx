"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  QrCode,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Peminjaman = any;

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminPeminjamanPage() {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();

  const [rawData, setRawData] = useState<Peminjaman[]>([]);
  const [filteredData, setFilteredData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifFilter, setVerifFilter] = useState("all");

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
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = rawData;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const nama = (item.user?.nama ?? item.User?.nama ?? "").toLowerCase();
        const agenda = (item.Agenda ?? "").toLowerCase();
        return nama.includes(lower) || agenda.includes(lower);
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (verifFilter !== "all") {
      result = result.filter((item) => {
        const verif = item.verifikasi || item.status_verifikasi || "pending";
        return verif === verifFilter;
      });
    }

    setFilteredData(result);
  }, [searchTerm, statusFilter, verifFilter, rawData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/peminjaman`, {}, token || undefined);
      let fetchedData = res.data ?? res;
      fetchedData = Array.isArray(fetchedData) ? fetchedData : [];

      // Note: Backend sudah memfilter data berdasarkan Role.
      // Jadi data yang sampai sini harusnya sudah aman/relevan.

      setRawData(fetchedData);
      setFilteredData(fetchedData);
    } catch (err: any) {
      toast.error("Gagal memuat data", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number, verifikasi: "diterima" | "ditolak") => {
    try {
      toast.loading("Memproses verifikasi...");

      await apiFetch(
        `/peminjaman/verify/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ verifikasi }),
        },
        token || undefined
      );

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

      await apiFetch(
        `/peminjaman/activate/${id}`,
        { method: "PUT" },
        token || undefined
      );

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

      await apiFetch(
        `/peminjaman/return/${id}`,
        { method: "PUT" },
        token || undefined
      );

      toast.dismiss();
      toast.success("Peminjaman Selesai");
      loadData();
    } catch (err: any) {
      toast.dismiss();
      toast.error("Gagal return", { description: err.message });
    }
  };

  const showAksi = user?.role !== "kepala_bagian_akademik";

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="w-6 h-6 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Peminjaman</h1>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter Data
              </CardTitle>
              <Badge variant="secondary">{filteredData.length} Item</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:flex-1 space-y-1">
                <Label className="text-xs font-medium text-slate-500">Pencarian</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari agenda / peminjam..."
                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-48 space-y-1">
                <Label className="text-xs font-medium text-slate-500">Status Peminjaman</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="booking">Booking</option>
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                  <option value="batal">Batal</option>
                </select>
              </div>

              <div className="w-full md:w-48 space-y-1">
                <Label className="text-xs font-medium text-slate-500">Status Verifikasi</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                  value={verifFilter}
                  onChange={(e) => setVerifFilter(e.target.value)}
                >
                  <option value="all">Semua Verifikasi</option>
                  <option value="pending">Pending</option>
                  <option value="diterima">Diterima</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3 w-[60px]">ID</th>
                  <th className="px-4 py-3">Peminjam</th>
                  <th className="px-4 py-3">Agenda</th>
                  <th className="px-4 py-3">Items / Lokasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verifikasi</th>
                  {showAksi && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin h-6 w-6 text-slate-400" />
                        <span>Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <p className="font-medium text-slate-900">Tidak ada data ditemukan.</p>
                      <p className="text-xs">Coba sesuaikan filter pencarian Anda.</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((p) => {
                    // LOGIC BARU:
                    // Jika role staff_prodi, pasti bisa verify (karena backend sudah filter data miliknya)
                    // Jika role staff (umum), bisa verify semua (kecuali dibatasi backend)
                    // Jika kabag, bisa verify (tapi tombol verify dihapus di showAksi logic Anda, kabag hanya view?)
                    // * Koreksi: Kabag biasanya verify juga.

                    let canVerify = false;
                    if (user?.role === "staff_prodi") {
                      canVerify = true; // Sederhana: jika data muncul, berarti punya dia.
                    } else if (user?.role === "staff") {
                      canVerify = true;
                    } else if (user?.role === "kepala_bagian_akademik") {
                      canVerify = true;
                    }

                    // Aktivasi biasanya hanya staff/security/umum
                    // Tapi di logic Anda kabag bisa activate. Sesuaikan jika perlu.
                    const canActivate = true; 

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3 font-medium text-slate-700">#{p.id}</td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">
                            {p.user?.nama ?? p.User?.nama ?? "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {p.user?.email ?? p.User?.email ?? "-"}
                          </div>
                        </td>

                        <td className="px-4 py-3 max-w-[200px] truncate" title={p.Agenda}>
                          {p.Agenda}
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px]">
                          {p.items?.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {p.items.map((i: any, idx: number) => (
                                <li key={idx} className="truncate">
                                  {i.barangUnit?.dataBarang?.jenis_barang}{" "}
                                  <span className="text-slate-400">
                                    ({i.barangUnit?.dataBarang?.merek})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>{p.lokasi?.lokasi || p.lokasiTambahan || "-"}</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="capitalize font-normal text-slate-600 border-slate-300"
                          >
                            {p.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={`capitalize font-medium ${
                              p.verifikasi === "diterima"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : p.verifikasi === "ditolak"
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                          >
                            {p.verifikasi || "pending"}
                          </Badge>
                        </td>

                        {showAksi && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {p.status === "booking" &&
                                (p.verifikasi === "pending" || !p.verifikasi) &&
                                canVerify && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                      onClick={() => handleVerify(p.id, "diterima")}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" /> Terima
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 text-xs"
                                      onClick={() => handleVerify(p.id, "ditolak")}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" /> Tolak
                                    </Button>
                                  </>
                                )}

                              {p.status === "booking" &&
                                p.verifikasi === "diterima" &&
                                canActivate && (
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                    onClick={() => handleActivate(p.id)}
                                  >
                                    <Play className="w-3 h-3 mr-1" /> Aktifkan
                                  </Button>
                                )}

                              {p.status === "aktif" && canActivate && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                                  onClick={() => handleReturn(p.id)}
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" /> Selesai
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-slate-300"
                                onClick={() =>
                                  router.push(`/admin/scan?kode=PINJAM-${p.id}`)
                                }
                              >
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
