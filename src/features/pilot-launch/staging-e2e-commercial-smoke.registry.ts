/**
 * Product Phase 26-A — Staging E2E commercial smoke scenarios SSOT.
 */
import type { StagingE2eCommercialSmokeResult } from "./staging-e2e-commercial-smoke.schema";

export const STAGING_E2E_COMMERCIAL_SMOKE_REGISTRY_MARKER_PHASE26A =
  "phase26a-staging-e2e-commercial-smoke-registry" as const;

type SmokeScenario = Omit<
  StagingE2eCommercialSmokeResult["scenarios"][number],
  "passed" | "notes"
>;

export const STAGING_E2E_COMMERCIAL_SMOKE_SCENARIOS: SmokeScenario[] = [
  {
    scenarioId: "TENANT_SIGNUP",
    label: "Tenant signup · plan entitlement",
    required: true,
    verifyScript: "verify:aibeopchin-tenant-rc",
  },
  {
    scenarioId: "CASE_CREATE",
    label: "Case create · lifecycle baseline",
    required: true,
    verifyScript: "verify:canonical-sources",
  },
  {
    scenarioId: "AI_INTERVIEW",
    label: "AI interview · question-set engine",
    required: true,
    verifyScript: "verify:aibeopchin-ai-quality-rc",
  },
  {
    scenarioId: "DOCUMENT_GENERATION",
    label: "Document generation · template trace",
    required: true,
    verifyScript: "verify:aibeopchin-legal-document-intelligence-rc",
  },
  {
    scenarioId: "CLIENT_NOTIFICATION",
    label: "Client notification · real messaging",
    required: true,
    verifyScript: "verify:aibeopchin-real-messaging-rc",
  },
  {
    scenarioId: "BILLING_METER",
    label: "Billing meter · usage ledger",
    required: true,
    verifyScript: "verify:aibeopchin-tenant-phase22d",
  },
];
