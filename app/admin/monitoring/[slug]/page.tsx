"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Edit, Search, Filter } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

interface DataItem {
  [key: string]: any;
}

export default function MonitoringSubPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();

  // State Data
  const [rawData, setRawData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Search & Filter
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
  }, [router, token, user, clearAuth]);

  // 1. Fetch Data
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

        // Client-side filtering bawaan logic bisnis
        if (slug === "users-staff") {
          fetchedData = fetchedData.filter(
            (item: any) => item.role === "staff" || item.role === "staff_prodi"
          );
        } else if (slug === "proyektor") {
          fetchedData = fetchedData.filter(
            (item: any) =>
              item.dataBarang?.jenis_barang === "Proyektor" &&
              (user?.role !== "staff_prodi" || item.jurusan === "tif")
          );
        } else if (slug === "barang-non-proyektor") {
          fetchedData = fetchedData.filter(
            (item: any) => item.dataBarang?.jenis_barang !== "Proyektor"
          );
        }

        setRawData(fetchedData);
        setFilteredData(fetchedData); // Init filtered data
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, token, user?.role]);

  // 2. Logic Filter Frontend (Search + Status)
  useEffect(() => {
    let result = rawData;
    const lowerSearch = searchTerm.toLowerCase();

    // Filter berdasarkan Slug (Jenis Data)
    if (slug.includes("barang") || slug === "proyektor") {
      // --- LOGIC SEARCH BARANG ---
      if (searchTerm) {
        result = result.filter(
          (item) =>
            item.nup?.toLowerCase().includes(lowerSearch) ||
            item.dataBarang?.jenis_barang?.toLowerCase().includes(lowerSearch) ||
            item.dataBarang?.merek?.toLowerCase().includes(lowerSearch) ||
            item.dataLokasi?.lokasi?.toLowerCase().includes(lowerSearch)
        );
      }
      // --- LOGIC STATUS BARANG ---
      if (statusFilter !== "all") {
        result = result.filter((item) => 
            statusFilter === "Tersedia" ? item.status === "Tersedia" : item.status !== "Tersedia"
        );
      }

    } else if (slug.includes("lokasi")) {
      // --- LOGIC SEARCH LOKASI ---
      if (searchTerm) {
        result = result.filter(
          (item) =>
            item.kode_lokasi?.toLowerCase().includes(lowerSearch) ||
            item.lokasi?.toLowerCase().includes(lowerSearch)
        );
      }
      // --- LOGIC STATUS LOKASI ---
      if (statusFilter !== "all") {
        // Asumsi status lokasi: 'dipinjam', 'tidakDipinjam', 'belumTersedia'
        result = result.filter((item) => item.status === statusFilter);
      }

    } else if (slug.includes("users")) {
      // --- LOGIC SEARCH USER ---
      if (searchTerm) {
        result = result.filter(
          (item) =>
            item.nama?.toLowerCase().includes(lowerSearch) ||
            item.nik?.toLowerCase().includes(lowerSearch) ||
            item.email?.toLowerCase().includes(lowerSearch)
        );
      }
    }

    setFilteredData(result);
  }, [searchTerm, statusFilter, rawData, slug]);


  // --- Helper Functions ---
  const getTitle = () => {
    switch (slug) {
      case "users-civitas": return "Daftar User Civitas";
      case "users-staff": return "Daftar User Staff & Staff Prodi";
      case "semua-barang": return "Daftar Semua Barang";
      case "barang-non-proyektor": return "Daftar Barang (Non-Proyektor)";
      case "proyektor": return "Daftar Proyektor";
      case "semua-lokasi": return "Daftar Semua Lokasi";
      default: return "Data";
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
        return ["NUP", "Jenis Barang", "Merek", "Lokasi", "Status", "Detail"];
      case "semua-lokasi":
        return ["Kode Lokasi", "Lokasi", "Status", "Detail"];
      default:
        return [];
    }
  };

  const renderRow = (item: DataItem, index: number) => {
    switch (slug) {
      case "users-civitas":
      case "users-staff":
        return (
          <tr key={index} className="hover:bg-slate-50 transition-colors border-b last:border-0">
            <td className="px-4 py-3">{item.nik}</td>
            <td className="px-4 py-3 font-medium">{item.nama}</td>
            <td className="px-4 py-3 text-slate-600">{item.email}</td>
            <td className="px-4 py-3"><Badge variant="outline">{item.role}</Badge></td>
            {user?.role === "kepala_bagian_akademik" && slug === "users-staff" && (
              <td className="px-4 py-3">
                <Button size="sm" variant="outline" onClick={() => router.push(`/admin/akun/edit/${item.nik}`)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              </td>
            )}
          </tr>
        );
      case "semua-barang":
      case "barang-non-proyektor":
      case "proyektor":
        return (
          <tr key={index} className="hover:bg-slate-50 transition-colors border-b last:border-0">
            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.nup}</td>
            <td className="px-4 py-3">{item.dataBarang?.jenis_barang}</td>
            <td className="px-4 py-3">{item.dataBarang?.merek}</td>
            <td className="px-4 py-3 text-sm">{item.dataLokasi?.lokasi || "-"}</td>
            <td className="px-4 py-3">
                <Badge variant={item.status === 'Tersedia' ? 'default' : 'secondary'} className={item.status === 'Tersedia' ? 'bg-emerald-600' : ''}>
                    {item.status}
                </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="outline" onClick={() => router.push(`/admin/monitoring/detail-barang/${item.nup}`)}>
                Detail
              </Button>
            </td>
          </tr>
        );
      case "semua-lokasi":
        return (
          <tr key={index} className="hover:bg-slate-50 transition-colors border-b last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.kode_lokasi}</td>
            <td className="px-4 py-3 font-medium">{item.lokasi}</td>
            <td className="px-4 py-3">
                <Badge variant={item.status === 'tidakDipinjam' ? 'default' : 'secondary'} className={item.status === 'tidakDipinjam' ? 'bg-emerald-600' : ''}>
                    {item.status === 'tidakDipinjam' ? 'Kosong' : item.status}
                </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="outline" onClick={() => router.push(`/admin/monitoring/detail-lokasi/${item.kode_lokasi}`)}>
                Detail
              </Button>
            </td>
          </tr>
        );
      default:
        return null;
    }
  };

  const showTambahButton = () => {
    if (!user) return false;
    return user.role === "staff";
  };

  const getTambahButtonText = () => {
    if (slug === "proyektor" && user?.role === "staff_prodi") return "Tambah Proyektor";
    return "Tambah Data";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div>Loading...</div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <motion.div className="space-y-6 bg-slate-50 p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        
        {/* Header Section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/monitoring")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
          </Button>
          <h1 className="text-xl font-semibold">{getTitle()}</h1>
        </div>

        {/* --- Toolbar: Search, Filter & Add --- */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            
            {/* Search & Filter Group */}
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                {/* Input Search */}
                <div className="relative w-full sm:w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder={
                            slug.includes("users") ? "Cari Nama / NIK..." :
                            slug.includes("lokasi") ? "Cari Lokasi..." :
                            "Cari Barang / NUP..."
                        } 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter Dropdown (Kondisional) */}
                {(slug.includes("barang") || slug === "proyektor") && (
                    <div className="relative w-full sm:w-[150px]">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <select 
                            className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="Tersedia">Tersedia</option>
                            <option value="TidakTersedia">Tidak Tersedia</option>
                        </select>
                    </div>
                )}

                {slug.includes("lokasi") && (
                    <div className="relative w-full sm:w-[150px]">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <select 
                            className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="tidakDipinjam">Kosong</option>
                            <option value="dipinjam">Dipinjam</option>
                            <option value="belumTersedia">Belum Tersedia</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Tombol Tambah Data */}
            {showTambahButton() && (
                <Button onClick={() => {
                    if (slug === "semua-barang") router.push("/admin/monitoring/tambah-barang");
                    else if (slug === "semua-lokasi") router.push("/admin/monitoring/tambah-lokasi");
                }}>
                    <Plus className="w-4 h-4 mr-1" /> {getTambahButtonText()}
                </Button>
            )}
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    {getColumns().map((col) => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">
                        {col}
                    </th>
                    ))}
                    {user?.role === "kepala_bagian_akademik" && slug === "users-staff" && (
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">
                        Aksi
                    </th>
                    )}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredData.length > 0 ? (
                        filteredData.map((item, index) => renderRow(item, index))
                    ) : (
                        <tr>
                            <td colSpan={getColumns().length + 1} className="p-8 text-center text-slate-500">
                                Tidak ada data yang cocok dengan pencarian Anda.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
