import type { AibeopchinLogoV2Mode } from "@/components/branding/aibeopchin-logo-v2-types";
import {
  AIBEOPCHIN_LOGO_V2_MODE_CONFIG,
  type AibeopchinLogoV2ModeConfig,
} from "@/lib/branding/aibeopchin-logo-v2-mode-config";

export type AibeopchinLogoV2MotionPolicy = {
  effectiveMode: AibeopchinLogoV2Mode;
  particles: boolean;
  orbit: boolean;
  pulse: "none" | "soft" | "medium";
  draw: boolean;
  reveal: boolean;
  hoverScale: boolean;
};

function downgradePulse(
  pulse: AibeopchinLogoV2ModeConfig["pulse"],
): AibeopchinLogoV2ModeConfig["pulse"] {
  if (pulse === "medium") {
    return "soft";
  }

  if (pulse === "soft") {
    return "none";
  }

  return "none";
}

export function getAibeopchinLogoV2MotionPolicy({
  mode,
  reducedMotion,
}: {
  mode: AibeopchinLogoV2Mode;
  reducedMotion: boolean;
}): AibeopchinLogoV2MotionPolicy {
  const modeConfig = AIBEOPCHIN_LOGO_V2_MODE_CONFIG[mode];

  if (!reducedMotion) {
    return {
      effectiveMode: mode,
      particles: modeConfig.particles,
      orbit: modeConfig.orbit,
      pulse: modeConfig.pulse,
      draw: mode === "intro",
      reveal: mode !== "restricted",
      hoverScale: mode !== "restricted",
    };
  }

  if (mode === "intro") {
    return {
      effectiveMode: "idle",
      particles: false,
      orbit: false,
      pulse: "none",
      draw: false,
      reveal: false,
      hoverScale: false,
    };
  }

  return {
    effectiveMode: mode,
    particles: false,
    orbit: false,
    pulse: downgradePulse(modeConfig.pulse),
    draw: false,
    reveal: false,
    hoverScale: false,
  };
}
