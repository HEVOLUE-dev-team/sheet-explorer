import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serveur autonome (.next/standalone) pour une image Docker légère.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  // Le badge de développement masquait le bas du rail des bases.
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
