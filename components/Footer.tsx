"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 pt-4 pb-4">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between text-xs sm:text-sm">
        <div className="space-y-1 flex">
          <Image
                    src="/logo-uin.png"   // file harus ada di /public/logo-uin.png
                    alt="Logo FASTe"
                    width={40}
                    height={40}
                    className="h-8 w-auto"
                  />
          <div className="flex flex-col ml-2">
          <p className="font-semibold tracking-wide">
            FAKULTAS SAINS DAN TEKNOLOGI
          </p>
          <p className="text-slate-300">
            Universitas Islam Negeri Sultan Syarif Kasim Riau
          </p>
        </div>
        </div>

        <div className="space-y-1 text-slate-300">
          <p className="font-semibold text-slate-100">Contact Us</p>
          <p>Jl. H. R. Soebrantas No. 155 KM 15 Panam, Pekanbaru, Riau</p>
          <p>Email: faste@uin-suska.ac.id</p>
          <p>Telp: +62 813-9876-2745</p>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 text-[11px] text-slate-400 text-center">
          Sistem Informasi Pengelolaan BMN FASTE &copy; {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
