"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [nomorIT, setNomorIT] = useState("");
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const body = {
        nik,
        nomor_identitas_tunggal: nomorIT,
        email,
        password,
        nama,
      };

      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });

      console.log("REGISTER RESPONSE", res);

      setSuccess("Registrasi berhasil, silakan login.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      console.error("REGISTER ERROR", err);
      setError(err.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <UserPlus className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold text-slate-800 text-center">
              Daftar Akun BMN FASTe
            </h1>
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

          <div className="space-y-1">
            <Label htmlFor="nik">NIK</Label>
            <Input
              id="nik"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nomorIT">Nomor Identitas Tunggal</Label>
            <Input
              id="nomorIT"
              value={nomorIT}
              onChange={(e) => setNomorIT(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-500">
              Minimal 8 karakter dan mengandung huruf besar, huruf kecil, dan angka.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>

          <p className="text-xs text-slate-600 text-center">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="underline"
            >
              Login
            </button>
          </p>
        </motion.form>
      </div>

      <Footer />
    </div>
  );
}
