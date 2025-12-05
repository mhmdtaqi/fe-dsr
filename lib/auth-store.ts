// lib/auth-store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserInfo = {
  nik: string;
  nama: string;
  email: string;
  role: string;
};

type AuthState = {
  user: UserInfo | null;
  token: string | null;
  setAuth: (token: string | null, user: UserInfo | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: "dsr_auth", // key di localStorage
    }
  )
);
