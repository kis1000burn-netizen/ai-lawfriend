import { describe, expect, it } from "vitest";
import {
  buildBaseSecurityHeaders,
  pathnameRequiresNoIndex,
} from "./http-security-headers";

describe("http-security-headers", () => {
  it("includes baseline hardening headers", () => {
    const headers = buildBaseSecurityHeaders();
    expect(headers.some((h) => h.key === "Content-Security-Policy")).toBe(true);
    expect(headers.some((h) => h.key === "X-Frame-Options" && h.value === "DENY")).toBe(true);
    expect(headers.some((h) => h.key === "X-Content-Type-Options")).toBe(true);
  });

  it("marks sensitive paths as noindex", () => {
    expect(pathnameRequiresNoIndex("/api/auth/login")).toBe(true);
    expect(pathnameRequiresNoIndex("/uploads/cases/abc/file.pdf")).toBe(true);
    expect(pathnameRequiresNoIndex("/guide")).toBe(false);
  });
});
