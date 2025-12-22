"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardPen, ArrowLeft, Clock, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner"; // Pakai sonner untuk notifikasi

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type Lokasi = { kode_lokasi: string; lokasi: string };
type Barang = {
  nup: string;
  status: string;
  dataBarang: { jenis_barang: string; merek: string };
};

function BuatPeminjamanClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, clearAuth: clearAuthStore } = useAuthStore();

  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [barangList, setBarangList] = useState<Barang[]>([]);

  // State Form
  const [loanType, setLoanType] = useState<"location" | "items">("location");
  const [kodeLokasi, setKodeLokasi] = useState("");
  const [lokasiTambahan, setLokasiTambahan] = useState("");
  const [noHp, setNoHp] = useState("");
  const [agenda, setAgenda] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");

  // State Barang Terpilih (NUP)
  const [selectedNups, setSelectedNups] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const allowedJenis = ["Proyektor", "Microphone", "Sound System"];

  // Filter barang sesuai jenis peminjaman
  const filteredBarangList =
    loanType === "location"
      ? barangList
      : barangList.filter((b) =>
          allowedJenis.includes(b.dataBarang?.jenis_barang)
        );

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
        const [lokasiRes, barangRes] = await Promise.all([
          apiFetch("/lokasi/available", {}, token),
          apiFetch("/barangunit/available-for-peminjaman", {}, token),
        ]);
        setLokasiList(lokasiRes.data ?? lokasiRes);
        setBarangList(barangRes.data ?? barangRes);
      } catch (err: any) {
        toast.error("Gagal memuat data", { description: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, token, user, clearAuthStore]);

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "location" || type === "items") setLoanType(type);

    const kode = searchParams.get("kodeLokasi");
    if (kode) setKodeLokasi(kode);

    const nup = searchParams.get("nup");
    if (nup) addNup(nup);
  }, [searchParams]);

  const addNup = (nup: string) => {
    if (!selectedNups.includes(nup)) {
      setSelectedNups((prev) => [...prev, nup]);
    }
  };

  const removeNup = (nup: string) => {
    setSelectedNups((prev) => prev.filter((item) => item !== nup));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);

    try {
      if (selectedNups.length === 0)
        throw new Error("Minimal 1 NUP barang harus dipilih");

      if (loanType === "items") {
        if (!kodeLokasi)
          throw new Error("Untuk peminjaman barang saja, lokasi wajib dipilih");
        if (lokasiTambahan)
          throw new Error("Barang saja tidak boleh isi lokasi tambahan");

        // Validasi jenis barang
        const selectedObjects = barangList.filter((b) =>
          selectedNups.includes(b.nup)
        );
        const invalid = selectedObjects.filter(
          (b) => !allowedJenis.includes(b.dataBarang?.jenis_barang)
        );
        if (invalid.length > 0)
          throw new Error(
            "Peminjaman barang saja hanya boleh: Proyektor/Sound System"
          );
      }

      let adjustedWaktuMulai = waktuMulai;
      let adjustedWaktuSelesai = waktuSelesai;

      // Auto-set tanggal untuk 'items' only (jika input cuma jam)
      if (loanType === "items" && !waktuMulai.includes("T")) {
        const now = new Date();
        const [startHours, startMinutes] = waktuMulai.split(":").map(Number);
        const [endHours, endMinutes] = waktuSelesai.split(":").map(Number);

        let startDate = new Date(now);
        startDate.setHours(startHours, startMinutes, 0, 0);

        // Jika waktu mulai sudah lewat, set ke besok
        if (startDate <= now) {
          startDate.setDate(startDate.getDate() + 1);
        }

        let endDate = new Date(startDate);
        endDate.setHours(endHours, endMinutes, 0, 0);

        // Jika waktu selesai <= mulai, set ke hari berikutnya
        if (endDate <= startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }

        adjustedWaktuMulai = startDate.toISOString();
        adjustedWaktuSelesai = endDate.toISOString();
      }

      const payload: any = {
        no_hp: noHp,
        Agenda: agenda,
        waktuMulai: adjustedWaktuMulai,
        waktuSelesai: adjustedWaktuSelesai,
        barangList: selectedNups,
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

      const createdId =
        res.data?.peminjaman?.id ?? res.peminjaman?.id ?? res.id;

      toast.success("Berhasil!", {
        description: "Peminjaman berhasil dibuat.",
      });

      if (createdId) router.push(`/peminjaman/${createdId}`);
      else router.push("/peminjaman");
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal membuat peminjaman", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null; // LoadingOverlay di handle parent atau global layout

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 dark:bg-slate-950">
      <LoadingOverlay
        isLoading={submitting}
        message="Sedang menyimpan peminjaman..."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              <ClipboardPen className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Buat Peminjaman
              </h1>
              <p className="text-sm text-slate-500">
                Isi formulir pengajuan baru
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/peminjaman")}
            className="hidden sm:flex"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-base">Detail Pengajuan</CardTitle>
            <CardDescription>
              Pastikan data yang diisi sudah benar.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form
              id="peminjaman-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Jenis Peminjaman - Radio Group */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Jenis Peminjaman
                </Label>
                <RadioGroup
                  value={loanType}
                  onValueChange={(v: "location" | "items") => setLoanType(v)}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div>
                    <RadioGroupItem
                      value="location"
                      id="loc"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="loc"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                    >
                      <span className="font-semibold">Lokasi & Barang</span>
                      <span className="text-xs text-muted-foreground mt-1 text-center">
                        Pinjam ruangan dan alat tambahan
                      </span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="items"
                      id="item"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="item"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                    >
                      <span className="font-semibold">Hanya Barang</span>
                      <span className="text-xs text-muted-foreground mt-1 text-center">
                        Pinjam alat (Proyektor/Sound) saja
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Lokasi Selection */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Lokasi{" "}
                    {loanType === "items" && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <Select value={kodeLokasi} onValueChange={setKodeLokasi}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Pilih Lokasi..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lokasiList.map((l) => (
                        <SelectItem key={l.kode_lokasi} value={l.kode_lokasi}>
                          {l.lokasi} ({l.kode_lokasi})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loanType === "location" && (
                  <div className="space-y-2">
                    <Label>Lokasi Tambahan (Opsional)</Label>
                    <Input
                      placeholder="Contoh: Koridor Lt.2"
                      value={lokasiTambahan}
                      onChange={(e) => setLokasiTambahan(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Kontak & Agenda */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Nomor HP / WA <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>
                    Agenda Kegiatan <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Deskripsikan kegiatan..."
                    className="resize-none"
                    rows={2}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Waktu */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Waktu Mulai
                  </Label>
                  <Input
                    type={loanType === "location" ? "datetime-local" : "time"}
                    value={waktuMulai}
                    onChange={(e) => setWaktuMulai(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Waktu Selesai
                  </Label>
                  <Input
                    type={loanType === "location" ? "datetime-local" : "time"}
                    value={waktuSelesai}
                    onChange={(e) => setWaktuSelesai(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Pilih Barang */}
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <Label className="text-base font-semibold">Pilih Barang</Label>

                {/* Input Select Barang */}
                <Select onValueChange={addNup}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Cari / Pilih Barang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBarangList.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">
                        Tidak ada barang tersedia
                      </div>
                    ) : (
                      filteredBarangList.map((b) => (
                        <SelectItem key={b.nup} value={b.nup}>
                          {b.nup} — {b.dataBarang.jenis_barang} (
                          {b.dataBarang.merek})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* List Barang Terpilih (Chips) */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedNups.length === 0 && (
                    <span className="text-xs text-slate-400 italic">
                      Belum ada barang dipilih.
                    </span>
                  )}
                  {selectedNups.map((nup) => (
                    <Badge
                      key={nup}
                      variant="secondary"
                      className="flex items-center gap-1 pl-2 pr-1 py-1 text-xs"
                    >
                      {nup}
                      <button
                        type="button"
                        onClick={() => removeNup(nup)}
                        className="ml-1 rounded-full p-0.5 hover:bg-slate-200 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/peminjaman")}
              type="button"
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="peminjaman-form"
              disabled={submitting}
              className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900"
            >
              {submitting ? "Menyimpan..." : "Kirim Pengajuan"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function BuatPeminjamanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Memuat...
        </div>
      }
    >
      <BuatPeminjamanClient />
    </Suspense>
  );
}
