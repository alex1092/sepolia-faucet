import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
    NEXT_PUBLIC_MAX_ETH_AMOUNT: process.env.NEXT_PUBLIC_MAX_ETH_AMOUNT,
    NEXT_PUBLIC_COOLDOWN_MINUTES: process.env.NEXT_PUBLIC_COOLDOWN_MINUTES,
  },
};

export default nextConfig;
