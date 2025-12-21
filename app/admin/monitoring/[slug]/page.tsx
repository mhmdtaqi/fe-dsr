"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

interface DataItem {
  [key: string]: any;
}

export default function MonitoringSubPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, [router, token, user, clearAuthStore]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        let endpoint = "";
        let query = "";

        switch (slug) {
          case "users-civitas":
            endpoint = "/auth";
            query = "?role=civitas_faste";
            break;
          case "users-staff":
            endpoint = "/auth";
            // Fetch all and filter client-side for staff and staff_prodi
            break;
          case "semua-barang":
          case "barang-non-proyektor":
          case "proyektor":
            endpoint = "/barangunit";
            break;
          case "semua-lokasi":
            endpoint = "/lokasi";
            break;
          default:
            throw new Error("Invalid slug");
        }

        const res = await apiFetch(`${endpoint}${query}`, {}, token);
        let fetchedData = res.data || res;

        // Client-side filtering
        if (slug === "users-staff") {
          fetchedData = fetchedData.filter((item: any) =>
            item.role === "staff" || item.role === "staff_prodi"
          );
        } else if (slug === "proyektor") {
          fetchedData = fetchedData.filter((item: any) =>
            item.dataBarang?.jenis_barang === "Proyektor"
          );
        } else if (slug === "barang-non-proyektor") {
          fetchedData = fetchedData.filter((item: any) =>
            item.dataBarang?.jenis_barang !== "Proyektor"
          );
        }

        setData(fetchedData);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, token]);

  const getTitle = () => {
    switch (slug) {
      case "users-civitas":
        return "Daftar User Civitas";
      case "users-staff":
        return "Daftar User Staff & Staff Prodi";
      case "semua-barang":
        return "Daftar Semua Barang";
      case "barang-non-proyektor":
        return "Daftar Barang (Non-Proyektor)";
      case "proyektor":
        return "Daftar Proyektor";
      case "semua-lokasi":
        return "Daftar Semua Lokasi";
      default:
        return "Data";
    }
  };

  const getColumns = () => {
    switch (slug) {
      case "users-civitas":
      case "users-staff":
        return ["NIK", "Nama", "Email", "Role"];
      case "semua-barang":
      case "barang-non-proyektor":
      case "proyektor":
        return ["NUP", "Jenis Barang", "Merek", "Lokasi", "Status", "Status Booking"];
      case "semua-lokasi":
        return ["Kode Lokasi", "Lokasi", "Status", "Status Booking"];
      default:
        return [];
    }
  };

  const renderRow = (item: DataItem, index: number) => {
    switch (slug) {
      case "users-civitas":
      case "users-staff":
        return (
          <tr key={index}>
            <td className="px-4 py-2">{item.nik}</td>
            <td className="px-4 py-2">{item.nama}</td>
            <td className="px-4 py-2">{item.email}</td>
            <td className="px-4 py-2">{item.role}</td>
            {user?.role === "kepala_bagian_akademik" && slug === "users-staff" && (
              <td className="px-4 py-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/akun/edit/${item.nik}`)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit User
                </Button>
              </td>
            )}
          </tr>
        );
      case "semua-barang":
      case "barang-non-proyektor":
      case "proyektor":
        return (
          <tr key={index}>
            <td className="px-4 py-2">{item.nup}</td>
            <td className="px-4 py-2">{item.dataBarang?.jenis_barang}</td>
            <td className="px-4 py-2">{item.dataBarang?.merek}</td>
            <td className="px-4 py-2">{item.dataLokasi?.lokasi}</td>
            <td className="px-4 py-2">{item.status}</td>
            <td className="px-4 py-2">{item.peminjamanItems?.[0]?.peminjaman?.verifikasi || "-"}</td>
          </tr>
        );
      case "semua-lokasi":
        return (
          <tr key={index}>
            <td className="px-4 py-2">{item.kode_lokasi}</td>
            <td className="px-4 py-2">{item.lokasi}</td>
            <td className="px-4 py-2">{item.status}</td>
            <td className="px-4 py-2">{item.peminjamanP?.[0]?.verifikasi || "-"}</td>
          </tr>
        );
      default:
        return null;
    }
  };

  const showTambahButton = () => {
    if (!user) return false;
    if (user.role === "staff" || user.role === "staff_prodi") {
      return true;
    }
    return false;
  };

  const getTambahButtonText = () => {
    if (slug === "proyektor" && user?.role === "staff_prodi") {
      return "Tambah Proyektor";
    }
    return "Tambah Data";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold">{getTitle()}</h1>
        </div>

        {showTambahButton() && (
          <div className="flex justify-end">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              {getTambahButtonText()}
            </Button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {getColumns().map((col) => (
                  <th key={col} className="px-4 py-3 text-left font-medium text-slate-700">
                    {col}
                  </th>
                ))}
                {user?.role === "kepala_bagian_akademik" && slug === "users-staff" && (
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => renderRow(item, index))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Tidak ada data
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}