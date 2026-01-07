"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Langsung redirect ke Dashboard Utama
    router.replace("/admin/monitoring");
  }, [router]);

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Memuat Dashboard...</p>
      </div>
    </div>
  );
}
