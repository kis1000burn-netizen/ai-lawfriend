import { NOINDEX_PATH_PREFIXES } from "./platform-content-protection.policy";

type HeaderPair = { key: string; value: string };

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob: https:",
    "worker-src 'self' blob:",
  ].join("; ");
}

export function buildBaseSecurityHeaders(): HeaderPair[] {
  const headers: HeaderPair[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  ];

  if (isProduction()) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}

export function buildNoIndexHeaders(): HeaderPair[] {
  return [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }];
}

export function pathnameRequiresNoIndex(pathname: string): boolean {
  return NOINDEX_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}

/** next.config headers() 규칙 */
export function buildNextSecurityHeaderRules(): { source: string; headers: HeaderPair[] }[] {
  const base = buildBaseSecurityHeaders();
  const noIndex = buildNoIndexHeaders();

  return [
    { source: "/:path*", headers: base },
    {
      source: "/api/:path*",
      headers: [...base, ...noIndex],
    },
    {
      source: "/uploads/:path*",
      headers: [...base, ...noIndex, { key: "Cache-Control", value: "no-store" }],
    },
    {
      source: "/dashboard/:path*",
      headers: [...base, ...noIndex],
    },
    {
      source: "/cases/:path*",
      headers: [...base, ...noIndex],
    },
    {
      source: "/lawyer/:path*",
      headers: [...base, ...noIndex],
    },
    {
      source: "/admin/:path*",
      headers: [...base, ...noIndex],
    },
  ];
}
