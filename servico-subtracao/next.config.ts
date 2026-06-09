import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera uma saída "standalone" (server.js + apenas as dependências usadas),
  // o que permite uma imagem Docker final bem enxuta.
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
