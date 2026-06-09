import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Saída "standalone" para gerar uma imagem Docker enxuta.
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
