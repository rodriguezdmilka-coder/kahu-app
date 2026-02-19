import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rzmlzedlzfxcmgaloczh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
