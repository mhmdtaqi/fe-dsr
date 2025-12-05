"use client";

import Image from "next/image";

export function Header() {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Image
          src="/logo-uin.png"   // file harus ada di /public/logo-uin.png
          alt="Logo FASTe"
          width={40}
          height={40}
          className="h-8 w-auto"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-sm sm:text-base tracking-wide">
            Sistem Pengelolaan BMN FASTE
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500">
            Fakultas Sains dan Teknologi UIN Sultan Syarif Kasim Riau
          </span>
        </div>
      </div>
    </header>
  );
}
