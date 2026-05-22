import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sitemapLastModified } from "@/lib/sitemap-lastmod";

describe("sitemap-lastmod", () => {
  const key = "SITEMAP_LASTMOD_ISO";
  let prev: string | undefined;

  beforeEach(() => {
    prev = process.env[key];
  });

  afterEach(() => {
    if (prev === undefined) delete process.env[key];
    else process.env[key] = prev;
  });

  it("SITEMAP_LASTMOD_ISO 가 유효하면 해당 시각", () => {
    process.env[key] = "2026-05-07T12:00:00.000Z";
    expect(sitemapLastModified().toISOString()).toBe("2026-05-07T12:00:00.000Z");
  });

  it("SITEMAP_LASTMOD_ISO 가 비어 있으면 Date 인스턴스", () => {
    delete process.env[key];
    const d = sitemapLastModified();
    expect(d).toBeInstanceOf(Date);
    expect(Number.isNaN(d.getTime())).toBe(false);
  });

  it("SITEMAP_LASTMOD_ISO 가 잘못되면 현재에 가까운 값", () => {
    process.env[key] = "invalid";
    const d = sitemapLastModified();
    expect(Number.isNaN(d.getTime())).toBe(false);
  });
});
