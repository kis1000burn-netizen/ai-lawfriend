import { describe, expect, it } from "vitest";
import { validateLogoBrandingRegistry } from "@/lib/branding/aibeopchin-logo-validator";
import {
  getLogoModeConfig,
  resolveLogoMode,
  resolveLogoPresentation,
} from "@/lib/branding/aibeopchin-logo-runtime";

describe("aibeopchin-logo-runtime", () => {
  it("maps dashboard roles to expected modes", () => {
    expect(resolveLogoMode({ role: "client" })).toBe("thinking");
    expect(resolveLogoMode({ role: "lawyer" })).toBe("idle");
    expect(resolveLogoMode({ role: "admin" })).toBe("verified");
  });

  it("restricted overrides role mode", () => {
    expect(resolveLogoMode({ role: "admin", restricted: true })).toBe("restricted");
  });

  it("explicit mode wins when not restricted", () => {
    expect(resolveLogoMode({ role: "client", mode: "intro" })).toBe("intro");
  });

  it("exposes read-only mode config", () => {
    const config = getLogoModeConfig("thinking");
    expect(config.particles).toBe(true);
    expect(config.orbit).toBe(true);
  });

  it("downgrades motion when reducedMotion is set", () => {
    const presentation = resolveLogoPresentation({
      role: "client",
      reducedMotion: true,
    });

    expect(presentation.mode).toBe("thinking");
    expect(presentation.motion.particles).toBe(false);
    expect(presentation.motion.orbit).toBe(false);
  });

  it("passes branding registry validation", () => {
    expect(validateLogoBrandingRegistry()).toEqual([]);
  });
});
