/**
 * Product Phase 33-A — Trust center content sections SSOT.
 */
import type { TrustCenterContentPackResult } from "./trust-center-content.schema";

export const TRUST_CENTER_CONTENT_REGISTRY_MARKER_PHASE33A =
  "phase33a-trust-center-content-registry" as const;

export const PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG = "public-trust-launch-001" as const;

type TrustCenterSection = Omit<TrustCenterContentPackResult["sections"][number], "published">;

export const TRUST_CENTER_SECTIONS: TrustCenterSection[] = [
  { sectionId: "DATA_SECURITY", label: "Data security overview (Phase 32-A)", required: true },
  { sectionId: "PRIVACY_POLICY", label: "Privacy and data protection (Phase 32-B)", required: true },
  { sectionId: "UPTIME_SLA", label: "Uptime and SLA summary (Phase 28-C)", required: true },
  { sectionId: "SUBPROCESSORS", label: "Subprocessor list (Phase 32-D)", required: true },
  { sectionId: "INCIDENT_RESPONSE", label: "Incident response summary (Phase 18)", required: true },
  {
    sectionId: "COMPLIANCE_STATUS",
    label: "Compliance readiness status — no certification claim (Phase 32-E)",
    required: true,
  },
];
