import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      dns: { browser: "./empty.ts" },
      net: { browser: "./empty.ts" },
      tls: { browser: "./empty.ts" },
    },
    root: path.resolve(appDir, "./"),
  },
  serverExternalPackages: ["@prisma/client", "prisma"]
};

export default nextConfig;
