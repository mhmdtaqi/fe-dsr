"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Plus,
  Package,
  MapPin,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

// Tipe Data (Sebaiknya disesuaikan dengan response API asli)
type Peminjaman = any;
type Barang = any;
type Lokasi = any;

export default function PeminjamanPage() {
  const router = useRouter();
  const { user, token, clearAuth: clearAuthStore } = useAuthStore();

  // State Data Utama
  const [historyData, setHistoryData] = useState<Peminjaman[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // State Data Katalog (Lazy Load)
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);

  // State Loading Katalog
  const [loadingBarang, setLoadingBarang] = useState(false);
  const [loadingLokasi, setLoadingLokasi] = useState(false);

  // Flag apakah data sudah pernah di-load (untuk caching)
  const [hasLoadedBarang, setHasLoadedBarang] = useState(false);
  const [hasLoadedLokasi, setHasLoadedLokasi] = useState(false);

  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("barang");

  // 1. Load History Peminjaman Saja di Awal
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

    const loadHistory = async () => {
      try {
        const res = await apiFetch(
          "/peminjaman",
          {},
          token ? token : undefined
        );
        // Pastikan kita mengambil array data yang benar
        const data = Array.isArray(res) ? res : res.data || [];
        setHistoryData(data);
      } catch (err: any) {
        console.error("LOAD HISTORY ERROR", err);
        setError(err.message || "Gagal memuat riwayat peminjaman");
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [router, token, user, clearAuthStore]);

  // 2. Fungsi Fetch Barang
  const fetchBarang = async () => {
    if (hasLoadedBarang || loadingBarang) return;

    setLoadingBarang(true);
    try {
      const res = await apiFetch(
        "/barangunit/available-for-peminjaman",
        {},
        token ? token : undefined
      );
      setBarangList(res.data ?? res);
      setHasLoadedBarang(true);
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : "Gagal memuat data barang.";
      toast.error("Gagal memuat barang", { description: msg });
    } finally {
      setLoadingBarang(false);
    }
  };

  // 3. Fungsi Fetch Lokasi
  const fetchLokasi = async () => {
    if (hasLoadedLokasi || loadingLokasi) return;

    setLoadingLokasi(true);
    try {
      const res = await apiFetch("/lokasi", {}, token || undefined);
      setLokasiList(res.data ?? res);
      setHasLoadedLokasi(true);
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : "Gagal memuat data lokasi.";
      toast.error("Gagal memuat lokasi", { description: msg });
    } finally {
      setLoadingLokasi(false);
    }
  };

  // 4. Effect untuk trigger fetch saat tab berubah
  useEffect(() => {
    if (activeTab === "barang") {
      fetchBarang();
    } else if (activeTab === "lokasi") {
      fetchLokasi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSelectLokasi = (l: Lokasi) => {
    if (selectedBarang) {
      router.push(
        `/peminjaman/buat?type=items&nup=${selectedBarang.nup}&kodeLokasi=${l.kode_lokasi}`
      );
    } else {
      router.push(`/peminjaman/buat?type=location&kodeLokasi=${l.kode_lokasi}`);
    }
  };

  // Helper function untuk warna badge status
  const getStatusBadgeVariant = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "diterima" || s === "approved" || s === "selesai") return "default"; // Hijau/Hitam
    if (s === "ditolak" || s === "rejected") return "destructive"; // Merah
    return "secondary"; // Abu-abu/Kuning (Pending)
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 dark:bg-slate-950">
      <LoadingOverlay
        isLoading={loadingHistory}
        message="Memuat dashboard..."
      />

      <motion.div
        className="mx-auto max-w-6xl space-y-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ClipboardList className="h-6 w-6" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Peminjaman Saya
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Kelola riwayat dan ajukan peminjaman baru.
            </p>
          </div>
          <Button
            onClick={() => router.push("/peminjaman/buat")}
            className="shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Buat Peminjaman
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Tabel Riwayat Peminjaman */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <CardTitle className="text-base font-medium">
              Riwayat Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {historyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
                <p>Belum ada riwayat peminjaman.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Agenda</TableHead>
                    <TableHead>Status Peminjaman</TableHead>
                    <TableHead>Status Verifikasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((p) => {
                    // Cek field verifikasi yang mungkin berbeda nama
                    const statusVerifikasi = p.verifikasi || p.status_verifikasi || p.approvalStatus;
                    const isPending = !statusVerifikasi || statusVerifikasi === 'pending';

                    return (
                      <TableRow key={p.id} className="group hover:bg-slate-50/80">
                        <TableCell className="font-medium text-slate-600">
                          #{p.id}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {p.Agenda}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(statusVerifikasi)}
                            className={`capitalize ${
                              isPending ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 hover:text-amber-800" : ""
                            }`}
                          >
                            {statusVerifikasi || "Menunggu Verifikasi"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/peminjaman/${p.id}`)}
                            className="h-8 text-xs underline-offset-4 hover:underline"
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Section Katalog */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Katalog Tersedia
          </h2>

          <Tabs
            defaultValue="barang"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="barang" className="gap-2">
                <Package className="h-4 w-4" /> Barang
              </TabsTrigger>
              <TabsTrigger value="lokasi" className="gap-2">
                <MapPin className="h-4 w-4" /> Lokasi
              </TabsTrigger>
            </TabsList>

            

            {/* Tab Content Barang */}
            <TabsContent value="barang" className="mt-4 min-h-[200px]">
              {loadingBarang ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin mb-2 text-slate-400" />
                  <p>Memuat data barang...</p>
                </div>
              ) : barangList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  Tidak ada data barang tersedia saat ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {barangList.map((b) => (
                    <Card
                      key={b.nup}
                      className={`transition-all hover:shadow-md ${
                        selectedBarang?.nup === b.nup
                          ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/30"
                          : ""
                      }`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-xs">
                            {b.nup}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {b.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-base mt-2 line-clamp-1">
                          {b.dataBarang?.jenis_barang}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {b.dataBarang?.merek}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab Content Lokasi */}
            <TabsContent value="lokasi" className="mt-4 min-h-[200px]">
              {loadingLokasi ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin mb-2 text-slate-400" />
                  <p>Memuat data lokasi...</p>
                </div>
              ) : lokasiList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  Tidak ada data lokasi tersedia.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lokasiList.map((l) => (
                    <Card key={l.kode_lokasi} className="transition-all hover:shadow-md">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-xs">
                            {l.kode_lokasi}
                          </Badge>
                          <Badge
                            className={l.status === "tersedia" ? "bg-emerald-500" : "bg-slate-500"}
                          >
                            {l.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-base mt-2 line-clamp-2 min-h-[3rem]">
                          {l.lokasi}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
