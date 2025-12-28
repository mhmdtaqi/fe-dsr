"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Loader2,
  Activity,
  Users,
  Package,
  MapPin,
  Settings,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

// Komponen Kartu Menu
function MenuCard({ title, description, icon, onClick, variant = "default" }: any) {
  return (
    <motion.div
      className={`p-6 rounded-lg border bg-white cursor-pointer hover:shadow-md transition-shadow ${
        variant === "outline" ? "border-dashed border-slate-300" : "border-slate-200"
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${variant === "outline" ? "bg-slate-50" : "bg-sky-50"}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  
  // State Data
  const [rawData, setRawData] = useState<any[]>([]); // Data asli dari API
  const [filteredData, setFilteredData] = useState<any[]>([]); // Data hasil filter
  const [loading, setLoading] = useState(true);

  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    fetchPeminjaman();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // Effect untuk Filter Otomatis
  useEffect(() => {
    let result = rawData;

    // 1. Filter Search (Nama Peminjam atau Agenda)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.User?.nama?.toLowerCase().includes(lower) ||
          item.Agenda?.toLowerCase().includes(lower)
      );
    }

    // 2. Filter Status Verifikasi
    if (statusFilter !== "all") {
      result = result.filter((item) => {
        const verif = item.verifikasi || item.status_verifikasi || "pending";
        return verif === statusFilter;
      });
    }

    setFilteredData(result);
  }, [searchTerm, statusFilter, rawData]);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/peminjaman", {}, token!);
      const list = Array.isArray(res) ? res : res.data || [];
      setRawData(list);
      setFilteredData(list);
    } catch (error) {
      toast.error("Gagal memuat daftar peminjaman");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifikasi = async (id: number, status: "diterima" | "ditolak") => {
    try {
      toast.loading("Memproses...");
      await apiFetch(`/peminjaman/${id}/verifikasi`, {
        method: "PUT",
        body: JSON.stringify({ status_verifikasi: status }),
      }, token!);
      toast.dismiss();
      toast.success(`Berhasil ${status}`);
      fetchPeminjaman(); // Refresh Data
    } catch (error: any) {
      toast.dismiss();
      toast.error("Gagal verifikasi", { description: error.message });
    }
  };

  const renderCards = () => {
    if (!user) return null;
    const cards: any[] = [];
    const nav = (p: string) => router.push(p);

    if (user.role === "kepala_bagian_akademik") {
      cards.push(
        { title: "User Civitas", description: "Kelola user mahasiswa/dosen", icon: <Users className="w-5 h-5 text-sky-600" />, onClick: () => nav("/admin/monitoring/users-civitas") },
        { title: "Staff & Prodi", description: "Kelola akun staff", icon: <Users className="w-5 h-5 text-green-600" />, onClick: () => nav("/admin/monitoring/users-staff") },
        { title: "Laporan", description: "Rekap data peminjaman", icon: <FileText className="w-5 h-5 text-blue-600" />, onClick: () => nav("/admin/laporan"), variant: "outline" }
      );
    } else if (user.role === "staff") {
      cards.push(
        { title: "Data Barang", description: "Kelola inventaris barang", icon: <Package className="w-5 h-5 text-purple-600" />, onClick: () => nav("/admin/monitoring/semua-barang") },
        { title: "Data Lokasi", description: "Kelola ruangan/lokasi", icon: <MapPin className="w-5 h-5 text-orange-600" />, onClick: () => nav("/admin/monitoring/semua-lokasi") }
      );
    } else if (user.role === "staff_prodi") {
      cards.push(
        { title: "Proyektor", description: "Monitoring proyektor", icon: <Package className="w-5 h-5 text-red-600" />, onClick: () => nav("/admin/monitoring/proyektor") },
        { title: "Scan QR", description: "Verifikasi via QR", icon: <Settings className="w-5 h-5 text-gray-600" />, onClick: () => nav("/admin/scan"), variant: "outline" }
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <MenuCard {...c} />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div className="min-h-screen bg-slate-50 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama</h1>
          </div>
          <p className="text-slate-600">Halo {user?.nama}, selamat bekerja.</p>
        </div>

        {/* Menu Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800"><Activity className="w-5 h-5 text-sky-600" /> Akses Cepat</h2>
          {renderCards()}
        </div>

        {/* Tabel Section */}
        <Card>
          <CardHeader className="bg-white border-b px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Permintaan Peminjaman</CardTitle>
                <Badge variant="outline">{filteredData.length} Data</Badge>
            </div>
            
            {/* --- FILTER & SEARCH UI --- */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        placeholder="Cari nama / agenda..." 
                        className="pl-9 h-9 w-full sm:w-[200px]" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <select 
                        className="pl-9 h-9 w-full sm:w-[150px] border rounded-md text-sm bg-background px-3 py-1 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="diterima">Diterima</option>
                        <option value="ditolak">Ditolak</option>
                    </select>
                </div>
            </div>

          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : filteredData.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                  <p className="mb-1">Tidak ada data peminjaman.</p>
                  <p className="text-xs text-slate-400">Coba ubah filter pencarian Anda.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>Agenda</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const status = item.verifikasi || item.status_verifikasi || "pending";
                    const isPending = status === "pending" || !item.verifikasi;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">#{item.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.User?.nama || "User"}</span>
                            <span className="text-xs text-slate-500">{item.User?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">{item.Agenda}</TableCell>
                        <TableCell>
                            <Badge variant={status === 'diterima' ? 'default' : status === 'ditolak' ? 'destructive' : 'secondary'} className="capitalize">
                                {status || 'Pending'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" className="bg-emerald-600 h-8 text-xs hover:bg-emerald-700" onClick={() => handleVerifikasi(item.id, "diterima")}>
                                <CheckCircle className="w-3 h-3 mr-1" /> Terima
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 h-8 text-xs border-red-200 hover:bg-red-50" onClick={() => handleVerifikasi(item.id, "ditolak")}>
                                <XCircle className="w-3 h-3 mr-1" /> Tolak
                              </Button>
                            </div>
                          ) : <span className="text-xs text-slate-400 italic">Selesai</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
