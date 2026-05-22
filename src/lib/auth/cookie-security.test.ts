import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  authSessionCookieClearOptions,
  authSessionCookieSetOptions,
  isAuthCookieSecure,
} from "@/lib/auth/cookie-security";

const KEYS = ["AUTH_COOKIE_SECURE", "APP_BASE_URL", "NODE_ENV"] as const;

describe("cookie-security", () => {
  const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

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

  it("APP_BASE_URL 이 https:// 이면 secure true (명시 플래그 없을 때)", () => {
    delete process.env.AUTH_COOKIE_SECURE;
    process.env.APP_BASE_URL = "https://example.com";
    process.env.NODE_ENV = "development";
    expect(isAuthCookieSecure()).toBe(true);
  });

  it("APP_BASE_URL 이 http:// 이면 secure false (명시 플래그 없을 때)", () => {
    delete process.env.AUTH_COOKIE_SECURE;
    process.env.APP_BASE_URL = "http://localhost:3000";
    process.env.NODE_ENV = "production";
    expect(isAuthCookieSecure()).toBe(false);
  });

  it("AUTH_COOKIE_SECURE=false 이면 APP_BASE_URL 과 무관하게 false", () => {
    process.env.AUTH_COOKIE_SECURE = "false";
    process.env.APP_BASE_URL = "https://example.com";
    process.env.NODE_ENV = "production";
    expect(isAuthCookieSecure()).toBe(false);
  });

  it("AUTH_COOKIE_SECURE=true 이면 APP_BASE_URL 과 무관하게 true", () => {
    process.env.AUTH_COOKIE_SECURE = "true";
    process.env.APP_BASE_URL = "http://localhost:3000";
    process.env.NODE_ENV = "development";
    expect(isAuthCookieSecure()).toBe(true);
  });

  it("clear 옵션은 set 과 path·sameSite·secure·httpOnly 가 동일하고 maxAge 만 다름", () => {
    process.env.AUTH_COOKIE_SECURE = "false";
    process.env.APP_BASE_URL = "http://127.0.0.1:3000";
    process.env.NODE_ENV = "test";

    const setOpts = authSessionCookieSetOptions(3600);
    const clearOpts = authSessionCookieClearOptions();

    expect(setOpts.path).toBe(clearOpts.path);
    expect(setOpts.sameSite).toBe(clearOpts.sameSite);
    expect(setOpts.secure).toBe(clearOpts.secure);
    expect(setOpts.httpOnly).toBe(clearOpts.httpOnly);
    expect(setOpts.maxAge).toBe(3600);
    expect(clearOpts.maxAge).toBe(0);
  });
});
