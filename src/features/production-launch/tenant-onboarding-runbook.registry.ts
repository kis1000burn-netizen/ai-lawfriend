/**
 * Product Phase 25-B — Tenant onboarding steps SSOT.
 */
import type { TenantOnboardingRunbookResult } from "./tenant-onboarding-runbook.schema";

export const TENANT_ONBOARDING_RUNBOOK_REGISTRY_MARKER_PHASE25B =
  "phase25b-tenant-onboarding-runbook-registry" as const;

export const TENANT_ONBOARDING_DEFAULT_SLUG = "aibeopchin-demo" as const;

type OnboardingStep = TenantOnboardingRunbookResult["steps"][number] & { stepId: string };

export const TENANT_ONBOARDING_STEPS: Omit<OnboardingStep, "completed">[] = [
  {
    stepId: "create-tenant",
    label: "Tenant 생성 · slug/legalName/displayName",
    ownerRole: "PLATFORM_ADMIN",
    required: true,
    docPath: "docs/operations/AIBEOPCHIN_TENANT_ORGANIZATION_BASELINE_RUNBOOK.md",
  },
  {
    stepId: "assign-owner",
    label: "Tenant OWNER membership 부여",
    ownerRole: "PLATFORM_ADMIN",
    required: true,
  },
  {
    stepId: "configure-plan",
    label: "Plan tier · feature entitlement 설정",
    ownerRole: "PLATFORM_ADMIN",
    required: true,
    docPath: "docs/operations/AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md",
  },
  {
    stepId: "lawyer-seats",
    label: "LAWYER · STAFF seat membership",
    ownerRole: "TENANT_ADMIN",
    required: true,
  },
  {
    stepId: "messaging-consent",
    label: "의뢰인 알림 동의 · Kakao opt-in 확인",
    ownerRole: "TENANT_ADMIN",
    required: true,
    docPath: "docs/operations/AIBEOPCHIN_REAL_MESSAGING_RUNBOOK.md",
  },
  {
    stepId: "smoke-case",
    label: "Demo 사건 1건 · command center smoke",
    ownerRole: "TENANT_OWNER",
    required: false,
  },
];
