"use client";

import { motion } from "framer-motion";
import { ArrowRight, Boxes } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Konten utama */}
      <main className="flex-1">
        <motion.section
          className="max-w-5xl mx-auto px-4 py-10 sm:py-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-emerald-50 px-4 py-1 text-[11px] text-emerald-700 border border-emerald-200">
            <Boxes className="w-3 h-3" />
            <span>Sistem Digital Pengelolaan BMN FASTe</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-[0.2em] uppercase mb-6">
            Sistem Pengelolaan BMN FASTe
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-slate-700">
            Sistem ini dikembangkan untuk mempermudah dan menertibkan proses
            peminjaman, penempatan, dan pemantauan Barang Milik Negara (BMN)
            di lingkungan Fakultas Sains dan Teknologi UIN Sultan Syarif Kasim Riau.
            Melalui platform terintegrasi ini, civitas akademika dapat mengajukan
            peminjaman, memantau status aset, dan menyusun laporan dengan cara yang
            transparan, akuntabel, dan terdokumentasi.
          </p>

          <p className="text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-slate-700 mt-4">
            Sistem BMN FASTe hadir untuk mendukung kegiatan akademik yang tertib,
            efisien, dan berkelanjutan, tanpa bergantung pada pencatatan manual.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="flex items-center gap-2"
            >
              Masuk ke Sistem
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="mt-4">
              <h2 className="text-sm sm:text-base tracking-[0.3em] uppercase mb-2">
                Our Teams
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 max-w-md mx-auto">
                Dikelola oleh tim pengelola BMN dan pengembang sistem
                Fakultas Sains dan Teknologi untuk memastikan pengelolaan aset
                yang tertib dan profesional.
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
