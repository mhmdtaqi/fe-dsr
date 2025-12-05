"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

type PeminjamanDetail = any; // isi sesuai tipe BE

export default function PeminjamanDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [data, setData] = useState<PeminjamanDetail | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
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
        const id = Number(params.id);
        const res = await apiFetch(`/peminjaman/${id}`, {}, token);

        const detail =
          res.data?.peminjaman ?? res.data ?? res.peminjaman ?? res;
        setData(detail);

        const qr = res.data?.qrCode ?? res.qrCode ?? null;
        if (qr) setQrCode(qr);
      } catch (err: any) {
        console.error("DETAIL PEMINJAMAN ERROR", err);
        setError(err.message || "Gagal memuat detail peminjaman");
        if (err.message?.includes("tidak memiliki izin")) {
          clearAuthStore();
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, params.id, token, user, clearAuthStore]);

  if (loading) return <div className="p-6">Memuat...</div>;

  if (error)
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-red-600">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/peminjaman")}
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>
    );

  if (!data) return null;

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="max-w-3xl mx-auto bg-white rounded shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold">
              Detail Peminjaman #{data.id}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/peminjaman")}
            className="inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="space-y-1">
            <div>
              <span className="font-medium">Agenda: </span>
              <span>{data.Agenda}</span>
            </div>
            <div>
              <span className="font-medium">Status: </span>
              <span>{data.status}</span>
            </div>
            <div>
              <span className="font-medium">Verifikasi: </span>
              <span>{data.verifikasi}</span>
            </div>
            <div>
              <span className="font-medium">Waktu Mulai: </span>
              <span>
                {new Date(data.waktuMulai).toLocaleString("id-ID")}
              </span>
            </div>
            <div>
              <span className="font-medium">Waktu Selesai: </span>
              <span>
                {new Date(data.waktuSelesai).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-medium">Lokasi: </span>
              <span>
                {data.lokasi
                  ? `${data.lokasi.kode_lokasi} - ${data.lokasi.lokasi}`
                  : data.lokasiTambahan || "-"}
              </span>
            </div>

            <div>
              <span className="font-medium">Daftar Barang:</span>
              <ul className="list-disc list-inside text-xs mt-1">
                {data.items?.length ? (
                  data.items.map((item: any) => (
                    <li key={item.id}>
                      {item.barangUnit?.nup} -{" "}
                      {item.barangUnit?.dataBarang?.jenis_barang}
                    </li>
                  ))
                ) : (
                  <li>-</li>
                )}
              </ul>
            </div>

            {qrCode && (
              <div className="mt-2">
                <span className="font-medium block mb-1">
                  QR Code Peminjaman
                </span>
                <img
                  src={qrCode}
                  alt="QR Code Peminjaman"
                  className="border rounded p-2 bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
