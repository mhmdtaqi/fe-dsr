"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardPen, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Lokasi = { kode_lokasi: string; lokasi: string };
type Barang = {
  nup: string;
  status: string;
  dataBarang: { jenis_barang: string; merek: string };
};

export default function BuatPeminjamanPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [kodeLokasi, setKodeLokasi] = useState("");
  const [lokasiTambahan, setLokasiTambahan] = useState("");
  const [noHp, setNoHp] = useState("");
  const [agenda, setAgenda] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [nupText, setNupText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        const lokasiRes = await apiFetch("/lokasi/available", {}, token);
        setLokasiList(lokasiRes.data ?? lokasiRes);

        const barangRes = await apiFetch(
          "/barangunit/available-for-peminjaman",
          {},
          token
        );
        setBarangList(barangRes.data ?? barangRes);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal memuat data awal");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, token, user, clearAuthStore]);

  const addNup = (nup: string) => {
    setNupText((prev) => {
      const list = prev
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (list.includes(nup)) return prev;
      return list.length === 0 ? nup : `${prev.trim()}, ${nup}`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const rawNups = nupText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (rawNups.length === 0) {
        setError("Minimal 1 NUP barang harus diisi");
        setSubmitting(false);
        return;
      }

      const payload: any = {
        no_hp: noHp,
        Agenda: agenda,
        waktuMulai,
        waktuSelesai,
        barangList: rawNups,
      };

      if (kodeLokasi) payload.kodeLokasi = kodeLokasi;
      if (lokasiTambahan) payload.lokasiTambahan = lokasiTambahan;

      const res = await apiFetch(
        "/peminjaman",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token
      );

      console.log("CREATE PEMINJAMAN RESPONSE", res);
      const created = res.data?.peminjaman ?? res.peminjaman ?? res;
      const id = created.id;
      setSuccess("Peminjaman berhasil dibuat.");
      if (id) {
        router.push(`/peminjaman/${id}`);
      }
    } catch (err: any) {
      console.error("CREATE PEMINJAMAN ERROR", err);
      setError(err.message || "Gagal membuat peminjaman");
    } finally {
      setSubmitting(false);
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
      <div className="max-w-3xl mx-auto bg-white rounded shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardPen className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold">Buat Peminjaman</h1>
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

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
            {success}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label>Lokasi (pilih salah satu)</Label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={kodeLokasi}
              onChange={(e) => setKodeLokasi(e.target.value)}
            >
              <option value="">Pilih lokasi</option>
              {lokasiList.map((l) => (
                <option key={l.kode_lokasi} value={l.kode_lokasi}>
                  {l.kode_lokasi} - {l.lokasi}
                </option>
              ))}
            </select>
            <Input
              type="text"
              placeholder="Lokasi tambahan (opsional)"
              className="mt-2"
              value={lokasiTambahan}
              onChange={(e) => setLokasiTambahan(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>No HP</Label>
            <Input
              type="tel"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Agenda</Label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Waktu Mulai</Label>
              <Input
                type="datetime-local"
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Waktu Selesai</Label>
              <Input
                type="datetime-local"
                value={waktuSelesai}
                onChange={(e) => setWaktuSelesai(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Daftar NUP Barang (pisahkan dengan koma)</Label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Contoh: 4.1, 27.1, 28.1"
              value={nupText}
              onChange={(e) => setNupText(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-500">
              Masukkan NUP yang ingin dipinjam, atau pilih dari daftar barang
              tersedia di bawah.
            </p>

            {barangList.length > 0 && (
              <div className="mt-2 max-h-52 overflow-y-auto border rounded p-2 space-y-1 text-xs">
                {barangList.map((b) => (
                  <button
                    key={b.nup}
                    type="button"
                    onClick={() => addNup(b.nup)}
                    className="w-full text-left px-2 py-1 rounded hover:bg-slate-100"
                  >
                    <span className="font-mono text-[11px]">{b.nup}</span> —{" "}
                    {b.dataBarang.jenis_barang} ({b.dataBarang.merek})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/peminjaman")}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting} size="sm">
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
