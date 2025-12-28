"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type FormState = {
  nama: string;
  email: string;
  password: string;
  password_confirm: string;
};

export default function AkunPage() {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  const backHref = "/peminjaman/profil";

  const [form, setForm] = useState<FormState>({
    nama: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      clearAuth();
      router.replace("/login");
      return;
    }
    setForm((f) => ({ ...f, nama: user.nama, email: user.email }));
  }, [user, token, router, clearAuth]);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Password jika diisi
    if (form.password || form.password_confirm) {
      if (form.password !== form.password_confirm) {
        toast.error("Validasi Gagal", {
          description: "Konfirmasi password tidak cocok.",
        });
        return;
      }
      if (form.password.length < 8) {
        toast.error("Validasi Gagal", {
          description: "Password minimal 8 karakter.",
        });
        return;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        toast.error("Validasi Gagal", {
          description:
            "Password harus mengandung huruf besar, huruf kecil, dan angka.",
        });
        return;
      }
    }

    if (!token) return;

    setLoading(true);
    try {
      await apiFetch(
        "/auth/akun",
        {
          method: "PUT",
          body: JSON.stringify({
            nama: form.nama,
            email: form.email,
            password: form.password || undefined,
          }),
          headers: { "Content-Type": "application/json" },
        },
        token
      );

      toast.success("Berhasil", {
        description: "Data akun berhasil diperbarui.",
      });

      // Reset field password
      setForm((f) => ({ ...f, password: "", password_confirm: "" }));

      // Balik ke profil setelah sukses
      router.push(backHref);
    } catch (err: any) {
      toast.error("Gagal", {
        description: err.message || "Gagal memperbarui akun.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(backHref);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950">
      <LoadingOverlay isLoading={loading} message="Menyimpan perubahan..." />

      <motion.div
        className="w-full max-w-2xl space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Pengaturan Akun
            </h1>
            <p className="text-sm text-slate-500">
              Kelola informasi profil dan keamanan akun Anda.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <Tabs defaultValue="profil" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profil">Profil Umum</TabsTrigger>
            <TabsTrigger value="keamanan">Keamanan (Password)</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            {/* Tab Profil */}
            <TabsContent value="profil">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>
                    Perbarui nama lengkap dan email institusi Anda di sini.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="nama"
                        value={form.nama}
                        onChange={handleChange("nama")}
                        className="pl-9"
                        placeholder="Nama Anda"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        className="pl-9"
                        placeholder="email@uin-suska.ac.id"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50">
                  <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Tab Keamanan */}
            <TabsContent value="keamanan">
              <Card>
                <CardHeader>
                  <CardTitle>Ganti Password</CardTitle>
                  <CardDescription>
                    Kosongkan jika tidak ingin mengubah password. Password
                    minimal 8 karakter dan harus mengandung huruf besar, huruf
                    kecil, serta angka.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pass">Password Baru</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="pass"
                        type="password"
                        value={form.password}
                        onChange={handleChange("password")}
                        className="pl-9"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pass_conf">Konfirmasi Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="pass_conf"
                        type="password"
                        value={form.password_confirm}
                        onChange={handleChange("password_confirm")}
                        className="pl-9"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50">
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="destructive"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </motion.div>
    </div>
  );
}
