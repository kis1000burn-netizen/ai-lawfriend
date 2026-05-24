/**
 * Product Phase 26-B — Real tenant pilot setup steps SSOT.
 */
import type { RealTenantPilotSetupResult } from "./real-tenant-pilot-setup.schema";

export const REAL_TENANT_PILOT_SETUP_REGISTRY_MARKER_PHASE26B =
  "phase26b-real-tenant-pilot-setup-registry" as const;

export const REAL_TENANT_PILOT_DEFAULT_SLUG = "pilot-lawfirm-001" as const;

type PilotStep = Omit<RealTenantPilotSetupResult["steps"][number], "completed">;

export const REAL_TENANT_PILOT_STEPS: PilotStep[] = [
  {
    stepId: "provision-tenant",
    label: "Real tenant provision · legalName · billing contact",
    ownerRole: "PLATFORM_ADMIN",
    required: true,
    docPath: "docs/operations/AIBEOPCHIN_TENANT_ONBOARDING_RUNBOOK.md",
  },
  {
    stepId: "assign-pilot-owner",
    label: "Pilot OWNER · primary lawyer assignment",
    ownerRole: "PLATFORM_ADMIN",
    required: true,
  },
  {
    stepId: "configure-commercial-plan",
    label: "Commercial plan tier · pilot quota",
    ownerRole: "PLATFORM_ADMIN",
    required: true,
    docPath: "docs/operations/AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md",
  },
  {
    stepId: "pilot-case-seed",
    label: "Pilot case 1건 · real client consent",
    ownerRole: "PILOT_LAWYER",
    required: true,
  },
  {
    stepId: "live-messaging-opt-in",
    label: "Live messaging opt-in · Kakao/Email consent",
    ownerRole: "TENANT_ADMIN",
    required: true,
    docPath: "docs/operations/AIBEOPCHIN_REAL_MESSAGING_RUNBOOK.md",
  },
  {
    stepId: "pilot-kickoff",
    label: "Pilot kickoff · success criteria sign-off",
    ownerRole: "TENANT_OWNER",
    required: true,
  },
];
