import type { NextConfig } from "next";

const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    // nonaktifkan devtools baru
    nextScriptWorkers: false,
  },
};

export default nextConfig;
