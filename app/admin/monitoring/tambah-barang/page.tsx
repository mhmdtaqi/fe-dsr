"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";

const allowedRoles = ["staff"];

interface Lokasi {
  kode_lokasi: string;
  lokasi: string;
}

interface DataBarang {
  kode_barang: string;
  jenis_barang: string;
  merek: string;
}

interface BarangUnit {
  nup: string;
  kodeBarang: string;
  dataBarang: DataBarang;
}

export default function TambahBarangPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [formData, setFormData] = useState({
    barangCombined: "",
    kode_barang: "",
    jenis_barang: "",
    merek: "",
    nup: "",
    lokasi: "",
    status: "Tersedia",
    jurusan: "umum",
  });

  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [dataBarangList, setDataBarangList] = useState<DataBarang[]>([]);
  const [barangUnitList, setBarangUnitList] = useState<BarangUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace("/peminjaman");
      return;
    }

    // Fetch lokasi list
    const fetchLokasi = async () => {
      try {
        const res = await apiFetch("/lokasi", {}, token);
        setLokasiList(res.data || []);
      } catch (err: any) {
        console.error("Fetch lokasi error:", err);
      }
    };

    // Fetch data barang list
    const fetchDataBarang = async () => {
      try {
        const res = await apiFetch("/databarang", {}, token);
        setDataBarangList(res.data || []);
      } catch (err: any) {
        console.error("Fetch data barang error:", err);
      }
    };

    // Fetch barang unit list for NUP generation
    const fetchBarangUnits = async () => {
      try {
        const res = await apiFetch("/barangunit", {}, token);
        setBarangUnitList(res.data || []);
      } catch (err: any) {
        console.error("Fetch barangunit error:", err);
      }
    };

    fetchLokasi();
    fetchDataBarang();
    fetchBarangUnits();
  }, [router, token, user, clearAuthStore]);

  const parseCombined = (value: string) => {
    // Assume format "jenis - merek (kode)"
    const match = value.match(/^(.+?) - (.+?) \((.+?)\)$/);
    if (match) {
      const [, jenis, merek, kode] = match;
      return {
        jenis_barang: jenis.trim(),
        merek: merek.trim(),
        kode_barang: kode.trim(),
      };
    } else {
      // If not matching, generate kode from jenis and merek
      const parts = value.split(" - ");
      if (parts.length === 2) {
        const jenis = parts[0].trim();
        const merek = parts[1].trim();
        const kode = (jenis.slice(0, 3) + merek.slice(0, 3))
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");
        return { jenis_barang: jenis, merek, kode_barang: kode };
      } else {
        const jenis = value.trim();
        const kode = jenis
          .slice(0, 6)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");
        return { jenis_barang: jenis, merek: "", kode_barang: kode };
      }
    }
  };

  const getNextNup = (kode: string) => {
    const relevant = barangUnitList.filter((b) => b.nup.startsWith(kode));
    if (relevant.length === 0) return kode + "001";
    const numbers = relevant.map((b) => {
      const numStr = b.nup.slice(kode.length);
      return parseInt(numStr) || 0;
    });
    const max = Math.max(...numbers);
    return kode + (max + 1).toString().padStart(3, "0");
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "barangCombined") {
      const parsed = parseCombined(value);
      const nextNup = getNextNup(parsed.kode_barang);
      setFormData((prev) => ({
        ...prev,
        barangCombined: value,
        ...parsed,
        nup: nextNup,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let kodeBarangToUse = formData.kode_barang;

      // Check if kode_barang already exists
      const existingDataBarang = dataBarangList.find(
        (db) => db.kode_barang === formData.kode_barang
      );

      if (!existingDataBarang) {
        // Create new DataBarang
        const dataBarangRes = await apiFetch(
          "/databarang",
          {
            method: "POST",
            body: JSON.stringify({
              kode_barang: formData.kode_barang,
              jenis_barang: formData.jenis_barang,
              merek: formData.merek,
            }),
          },
          token!
        );

        if (!dataBarangRes.success) {
          throw new Error(
            dataBarangRes.message || "Failed to create data barang"
          );
        }
      }

      // Create BarangUnit
      const barangUnitRes = await apiFetch(
        "/barangunit",
        {
          method: "POST",
          body: JSON.stringify({
            nup: formData.nup,
            kodeBarang: kodeBarangToUse,
            lokasi: formData.lokasi,
            nikUser: user?.nik,
            status: formData.status,
            jurusan: formData.jurusan,
          }),
        },
        token!
      );

      if (!barangUnitRes.success) {
        throw new Error(
          barangUnitRes.message || "Failed to create barang unit"
        );
      }

      // Success, redirect back
      router.push("/admin/monitoring/semua-barang");
    } catch (err: any) {
      console.error("Submit error:", err);
      let errorMessage = err.message || "Terjadi kesalahan";
      if (err.data && err.data.errors) {
        errorMessage = err.data.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join(", ");
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <motion.div
        className="space-y-6 bg-slate-50 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/monitoring")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h1 className="text-xl font-semibold">Tambah Barang</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Data Barang</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="barangCombined">
                  Jenis Barang - Merek (Kode Barang)
                </Label>
                <Input
                  id="barangCombined"
                  value={formData.barangCombined}
                  onChange={(e) =>
                    handleInputChange("barangCombined", e.target.value)
                  }
                  placeholder="Contoh: Proyektor - Epson (PROJ) atau ketik baru"
                  required
                  list="barang_combined_list"
                />
                <datalist id="barang_combined_list">
                  {dataBarangList.map((db) => (
                    <option
                      key={db.kode_barang}
                      value={`${db.jenis_barang} - ${db.merek} (${db.kode_barang})`}
                    />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="nup">NUP (Otomatis)</Label>
                <Input
                  id="nup"
                  value={formData.nup}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="lokasi">Lokasi</Label>
                <select
                  id="lokasi"
                  value={formData.lokasi}
                  onChange={(e) => handleInputChange("lokasi", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih lokasi</option>
                  {lokasiList.map((lok) => (
                    <option key={lok.kode_lokasi} value={lok.kode_lokasi}>
                      {lok.lokasi}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="TidakTersedia">Tidak Tersedia</option>
                </select>
              </div>
              <div>
                <Label htmlFor="jurusan">Jurusan</Label>
                <select
                  id="jurusan"
                  value={formData.jurusan}
                  onChange={(e) => handleInputChange("jurusan", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="umum">Umum</option>
                  <option value="tif">TIF</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-1" />
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
