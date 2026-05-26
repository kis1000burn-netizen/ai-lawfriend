/**
 * Product Phase 60-E — Safe auto-fix allowlist SSOT.
 */
import type { BrainPatchPlan } from "./phase60d-patch-plan.schema";
import type { BrainSafeFixType } from "./phase60e-safe-auto-fix.schema";

export const PHASE60E_SAFE_AUTO_FIX_POLICY_MARKER =
  "phase60e-safe-auto-fix-policy-v1" as const;

export const PHASE60E_SAFE_FIX_TYPES: readonly BrainSafeFixType[] = [
  "DOCUMENT_CROSS_LINK",
  "NAVIGATOR_STATUS_SYNC",
  "PACKAGE_JSON_VERIFY_SCRIPT_REGISTER",
  "IMPORT_PATH_ALIGNMENT",
  "TEST_SNAPSHOT_MARKER",
  "TYPE_ALIGNMENT",
  "AUDIT_ONLY",
] as const;

export const PHASE60E_REVIEW_REQUIRED_PATTERNS = [
  /\.policy\.ts$/,
  /prisma\/schema\.prisma$/,
  /src\/app\/api\//,
  /legal-reliability/,
  /billing/,
  /tenant-entitlement/,
] as const;

export const PHASE60E_BLOCKED_PATTERNS = [
  /db:migrate/,
  /db:deploy/,
  /prisma\/migrations/,
  /\.env/,
  /secret/i,
] as const;

export function classifyPatchPlanRisk(plan: Pick<BrainPatchPlan, "filesToChange" | "proposedChanges">): BrainPatchPlan["riskLevel"] {
  const files = plan.filesToChange.join("\n");

  if (PHASE60E_BLOCKED_PATTERNS.some((pattern) => pattern.test(files))) {
    return "BLOCKED";
  }

  if (PHASE60E_REVIEW_REQUIRED_PATTERNS.some((pattern) => pattern.test(files))) {
    return "REVIEW_REQUIRED";
  }

  const safeDocOrMeta = plan.filesToChange.every((file) =>
    /^(docs\/|tools\/aibeopchin_navigator\.py|package\.json|README)/.test(file),
  );

  if (safeDocOrMeta) {
    return "SAFE";
  }

  return "REVIEW_REQUIRED";
}

export function inferSafeFixType(plan: BrainPatchPlan): BrainSafeFixType {
  if (plan.filesToChange.some((file) => file.includes("aibeopchin_navigator.py"))) {
    return "NAVIGATOR_STATUS_SYNC";
  }
  if (plan.filesToChange.some((file) => file === "package.json")) {
    return "PACKAGE_JSON_VERIFY_SCRIPT_REGISTER";
  }
  if (plan.filesToChange.every((file) => file.startsWith("docs/"))) {
    return "DOCUMENT_CROSS_LINK";
  }
  if (plan.filesToChange.some((file) => file.endsWith(".test.ts"))) {
    return "TEST_SNAPSHOT_MARKER";
  }
  return "AUDIT_ONLY";
}

export function canExecuteSafeAutoFix(plan: BrainPatchPlan): boolean {
  return plan.riskLevel === "SAFE" && plan.approved && plan.testPlan.length > 0 && plan.rollbackPlan.length > 0;
}
