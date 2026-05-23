import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

/** @param {string} relativePath */
function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required branding file: ${relativePath}`);
  }
}

function assertIncludes(relativePath, terms) {
  const content = readFile(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

const requiredFiles = [
  "src/lib/branding/aibeopchin-logo-runtime.ts",
  "src/lib/branding/aibeopchin-logo-validator.ts",
  "src/lib/branding/aibeopchin-logo-v2-mode-config.ts",
  "src/lib/branding/aibeopchin-logo-v2-role-mode.ts",
  "src/lib/branding/aibeopchin-logo-v2-motion-policy.ts",
  "src/lib/branding/aibeopchin-logo-runtime.test.ts",
  "src/components/branding/aibeopchin-logo-v2.tsx",
  "src/components/branding/aibeopchin-logo-v2-glyph.tsx",
  "src/components/branding/aibeopchin-logo-v2-particles.tsx",
  "src/components/branding/aibeopchin-logo-v2-orbit.tsx",
  "src/components/branding/aibeopchin-logo-rainbow-text.tsx",
  "src/lib/branding/aibeopchin-logo-rainbow.ts",
  "src/components/branding/aibeopchin-beop-kanji-logo.tsx",
  "src/lib/branding/aibeopchin-beop-strokes.ts",
  "src/lib/branding/aibeopchin-logo-celebrate.test.ts",
  "src/lib/branding/aibeopchin-logo-rainbow.test.ts",
  "src/components/branding/aibeopchin-logo-lockup.tsx",
  "src/lib/branding/aibeopchin-logo-celebrate.ts",
];

function main() {
  for (const file of requiredFiles) {
    assertFileExists(file);
  }

  assertIncludes("src/lib/branding/aibeopchin-logo-runtime.ts", [
    "resolveLogoMode",
    "resolveLogoPresentation",
    "getLogoModeConfig",
  ]);

  assertIncludes("src/lib/branding/aibeopchin-logo-validator.ts", [
    "validateLogoBrandingRegistry",
    "validateLogoModeConfigCompleteness",
    "validateLogoRoleModeCoverage",
  ]);

  assertIncludes("src/components/branding/aibeopchin-logo-v2.tsx", [
    "resolveLogoPresentation",
    "AibeopchinLogoV2Glyph",
    "AibeopchinLogoV2Particles",
    "AibeopchinLogoV2Orbit",
    "AibeopchinLogoRainbowText",
  ]);

  assertIncludes("src/lib/branding/aibeopchin-logo-rainbow.ts", [
    "AIBEOPCHIN_LOGO_RAINBOW_7",
    "pickRandomLogoRainbowColor",
  ]);

  assertIncludes("src/components/brand/aibeopchin-logo.tsx", [
    "AibeopchinLogoLockup",
    "AibeopchinLogoRainbowText",
  ]);

  assertIncludes("src/components/branding/aibeopchin-logo-lockup.tsx", [
    "AIBEOPCHIN_LOGO_CELEBRATE",
    "resolveBeopStrokeDrawDuration",
    "AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX",
    'surface === "header"',
    "transformOrigin",
    '"scaling"',
    '"spinning"',
    "pickRandomLogoRainbowColor",
    "rainbowCycleStroke",
  ]);

  assertIncludes("src/lib/branding/aibeopchin-logo-celebrate.ts", [
    "resolveLogoCelebrateLayout",
    "AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX",
    "celebrateScale",
  ]);

  assertIncludes("src/components/branding/aibeopchin-beop-kanji-logo.tsx", [
    "AIBEOPCHIN_BEOP_STROKES",
    "buildBeopLogoTransform",
    "rotateLeft180",
    "aibeop-beop-kanji-pop",
  ]);

  assertIncludes("src/components/dashboard/dashboard-living-header.tsx", [
    "AibeopchinLogoLockup",
    "AibeopchinLogoRainbowText",
  ]);

  console.log("[verify:aibeopchin-branding] Static registry checks passed");

  execSync(
    "npx vitest run src/lib/branding/aibeopchin-logo-runtime.test.ts src/lib/branding/aibeopchin-beop-strokes.test.ts src/lib/branding/aibeopchin-logo-celebrate.test.ts src/lib/branding/aibeopchin-logo-rainbow.test.ts",
    {
    stdio: "inherit",
    cwd: root,
    },
  );

  console.log("[verify:aibeopchin-branding] All checks passed");
}

main();
