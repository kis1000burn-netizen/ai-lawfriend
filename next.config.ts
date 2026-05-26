import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { buildNextSecurityHeaderRules } from "./src/lib/security/http-security-headers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["playwright", "playwright-core"],
  eslint: {
    // Lint runs in predeploy:lint-test; skipping here avoids Netlify OOM during build.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Production build type-check excludes *.test.* to reduce Netlify memory use.
    tsconfigPath: "./tsconfig.build.json",
  },
  async headers() {
    return buildNextSecurityHeaderRules();
  },
};

export default nextConfig;
