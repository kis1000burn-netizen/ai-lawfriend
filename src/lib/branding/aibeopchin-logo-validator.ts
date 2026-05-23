import type { AibeopchinLogoV2Mode } from "@/components/branding/aibeopchin-logo-v2-types";
import type { DashboardRole } from "@/lib/dashboard/dashboard-role-config";
import { AIBEOPCHIN_LOGO_V2_MODE_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-mode-config";
import { AIBEOPCHIN_LOGO_V2_ROLE_MODE } from "@/lib/branding/aibeopchin-logo-v2-role-mode";

const ALL_LOGO_MODES: AibeopchinLogoV2Mode[] = [
  "intro",
  "idle",
  "hover",
  "thinking",
  "verified",
  "restricted",
];

const ALL_DASHBOARD_ROLES: DashboardRole[] = ["client", "lawyer", "admin"];

/** CMB validator의 fail-closed 정적 검사와 동형 */
export function validateLogoModeConfigCompleteness(): string[] {
  const errors: string[] = [];

  for (const mode of ALL_LOGO_MODES) {
    const config = AIBEOPCHIN_LOGO_V2_MODE_CONFIG[mode];
    if (!config) {
      errors.push(`Missing logo mode config: ${mode}`);
      continue;
    }

    if (!config.label.trim()) {
      errors.push(`Empty label for logo mode: ${mode}`);
    }

    if (config.opacity < 0 || config.opacity > 1) {
      errors.push(`Invalid opacity for logo mode ${mode}: ${config.opacity}`);
    }
  }

  return errors;
}

export function validateLogoRoleModeCoverage(): string[] {
  const errors: string[] = [];

  for (const role of ALL_DASHBOARD_ROLES) {
    const mode = AIBEOPCHIN_LOGO_V2_ROLE_MODE[role];
    if (!mode) {
      errors.push(`Missing logo role mode for dashboard role: ${role}`);
      continue;
    }

    if (!AIBEOPCHIN_LOGO_V2_MODE_CONFIG[mode]) {
      errors.push(`Role ${role} maps to unknown logo mode: ${mode}`);
    }
  }

  return errors;
}

export function validateLogoBrandingRegistry(): string[] {
  return [
    ...validateLogoModeConfigCompleteness(),
    ...validateLogoRoleModeCoverage(),
  ];
}
