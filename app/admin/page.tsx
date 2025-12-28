"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

// Komponen UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminHome() {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  
  const [dataPeminjaman, setDataPeminjaman] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cek Role & Load Data
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
  }, [router, token, user, clearAuth]);

  // Fungsi Fetch Data Peminjaman (Semua Data)
  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      // Asumsi endpoint untuk admin melihat semua data adalah '/peminjaman/all' atau '/peminjaman' 
      // (tergantung backend kamu, kalau '/peminjaman' sudah return semua data buat admin, pakai itu)
      const res = await apiFetch("/peminjaman", {}, token!);
      const list = Array.isArray(res) ? res : res.data || [];
      setDataPeminjaman(list);
    } catch (error) {
      console.error("Gagal load data admin:", error);
      toast.error("Gagal memuat daftar peminjaman");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Verifikasi (Terima/Tolak)
  const handleVerifikasi = async (id: number, status: "diterima" | "ditolak") => {
    try {
      toast.loading("Memproses...");
      
      // Panggil API update status verifikasi
      // Pastikan endpoint backend kamu benar, misal: PUT /peminjaman/:id/verifikasi
      await apiFetch(`/peminjaman/${id}/verifikasi`, {
        method: "PUT",
        body: JSON.stringify({ status_verifikasi: status }), // Sesuaikan nama field body dgn backend
      }, token!);

      toast.dismiss();
      toast.success(`Peminjaman berhasil ${status}`);
      
      // Refresh data tabel
      fetchPeminjaman();

    } catch (error: any) {
      toast.dismiss();
      toast.error("Gagal memproses verifikasi", {
        description: error.message
      });
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
          </div>
          <p className="text-slate-600">
            Kelola persetujuan peminjaman barang dan ruangan.
          </p>
        </div>

        {/* Tabel Verifikasi */}
        <Card>
          <CardHeader className="bg-white border-b">
            <CardTitle>Daftar Permintaan Masuk</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-slate-400" />
              </div>
            ) : dataPeminjaman.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Tidak ada data peminjaman.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>Agenda</TableHead>
                    <TableHead>Tgl Pinjam</TableHead>
                    <TableHead>Status Saat Ini</TableHead>
                    <TableHead className="text-right">Aksi Verifikasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPeminjaman.map((item) => {
                    // Logic status badge
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
                        <TableCell className="max-w-[200px] truncate">{item.Agenda}</TableCell>
                        <TableCell>{new Date(item.tgl_pinjam).toLocaleDateString("id-ID")}</TableCell>
                        <TableCell>
                           <Badge 
                            variant={status === 'diterima' ? 'default' : status === 'ditolak' ? 'destructive' : 'secondary'}
                            className="capitalize"
                           >
                             {status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending ? (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleVerifikasi(item.id, "diterima")}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Terima
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleVerifikasi(item.id, "ditolak")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Tolak
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic pr-2">
                              Sudah diproses
                            </span>
                          )}
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
