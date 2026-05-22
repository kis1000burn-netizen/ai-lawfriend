import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isSearchIndexingBlocked } from "@/lib/site-indexing-policy";

const KEYS = [
  "ROBOTS_DISALLOW_ALL",
  "VERCEL_ENV",
  "NEXT_PUBLIC_APP_ENV",
] as const;

describe("site-indexing-policy", () => {
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

  it("ROBOTS_DISALLOW_ALL 가 true 면 차단", () => {
    process.env.ROBOTS_DISALLOW_ALL = "true";
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_APP_ENV;
    expect(isSearchIndexingBlocked()).toBe(true);
  });

  it("VERCEL_ENV 가 preview 이면 차단", () => {
    delete process.env.ROBOTS_DISALLOW_ALL;
    process.env.VERCEL_ENV = "preview";
    delete process.env.NEXT_PUBLIC_APP_ENV;
    expect(isSearchIndexingBlocked()).toBe(true);
  });

  it("VERCEL_ENV 가 development 이면 차단", () => {
    delete process.env.ROBOTS_DISALLOW_ALL;
    process.env.VERCEL_ENV = "development";
    delete process.env.NEXT_PUBLIC_APP_ENV;
    expect(isSearchIndexingBlocked()).toBe(true);
  });

  it("NEXT_PUBLIC_APP_ENV 가 staging 이면 차단", () => {
    delete process.env.ROBOTS_DISALLOW_ALL;
    delete process.env.VERCEL_ENV;
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    expect(isSearchIndexingBlocked()).toBe(true);
  });

  it("프로덕션 유사 설정이면 차단하지 않음", () => {
    delete process.env.ROBOTS_DISALLOW_ALL;
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_APP_ENV = "production";
    expect(isSearchIndexingBlocked()).toBe(false);
  });
});
