import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { siteOrigin } from "@/lib/site-origin";

const KEYS = ["APP_BASE_URL", "NEXT_PUBLIC_APP_URL", "VERCEL_URL"] as const;

describe("site-origin", () => {
  const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> =
    {};

  beforeEach(() => {
    for (const k of KEYS) {
      snapshot[k] = process.env[k];
    }
  });

  afterEach(() => {
    for (const k of KEYS) {
      const v = snapshot[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("APP_BASE_URL 이 최우선", () => {
    process.env.APP_BASE_URL = "https://primary.example.com/path/ignored";
    process.env.NEXT_PUBLIC_APP_URL = "https://secondary.example.com";
    process.env.VERCEL_URL = "preview.vercel.app";
    expect(siteOrigin()).toBe("https://primary.example.com");
  });

  it("APP_BASE_URL 없으면 NEXT_PUBLIC_APP_URL", () => {
    delete process.env.APP_BASE_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://public.example.com";
    delete process.env.VERCEL_URL;
    expect(siteOrigin()).toBe("https://public.example.com");
  });

  it("둘 다 없고 VERCEL_URL 만 있으면 https 로 감싼다", () => {
    delete process.env.APP_BASE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(siteOrigin()).toBe("https://my-app.vercel.app");
  });

  it("스킴 없는 호스트는 https 를 붙인다", () => {
    process.env.APP_BASE_URL = "example.com/foo";
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    expect(siteOrigin()).toBe("https://example.com");
  });

  it("전부 없으면 localhost", () => {
    delete process.env.APP_BASE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    expect(siteOrigin()).toBe("http://localhost:3000");
  });

  it("잘못된 URL 이면 localhost 로 폴백", () => {
    process.env.APP_BASE_URL = "not a url";
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    expect(siteOrigin()).toBe("http://localhost:3000");
  });
});
