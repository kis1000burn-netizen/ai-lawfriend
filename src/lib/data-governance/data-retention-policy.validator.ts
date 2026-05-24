/**
 * Phase 19-A — Data retention registry validator (constitution enforcement).
 */
import {
  DATA_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19A,
  type DataRetentionConstitutionViolation,
  type DataRetentionPolicyEntry,
  type DataRetentionRegistryValidationResult,
  dataRetentionPolicyEntrySchema,
} from "./data-retention-policy.schema";
import {
  DATA_RETENTION_POLICY_REGISTRY,
  DATA_RETENTION_REQUIRED_PRISMA_MODELS,
} from "./data-retention-policy.registry";

const PRISMA_MODEL_PATTERN = /^model\s+(\w+)\s+\{/gm;

export function extractPrismaModelNames(schemaContent: string): Set<string> {
  const names = new Set<string>();
  for (const match of schemaContent.matchAll(PRISMA_MODEL_PATTERN)) {
    names.add(match[1]!);
  }
  return names;
}

function validateEntryConstitution(entry: DataRetentionPolicyEntry): DataRetentionConstitutionViolation[] {
  const violations: DataRetentionConstitutionViolation[] = [];

  if (entry.legalHoldDefault && entry.purgeEligible) {
    violations.push({
      prismaModel: entry.prismaModel,
      code: "LEGAL_HOLD_PURGE_CONFLICT",
      message: "legalHoldDefault and purgeEligible cannot both be true.",
    });
  }

  if (entry.disposition === "RETAIN_INDEFINITE" && entry.purgeEligible) {
    violations.push({
      prismaModel: entry.prismaModel,
      code: "INDEFINITE_PURGE_CONFLICT",
      message: "RETAIN_INDEFINITE entries must not be purgeEligible.",
    });
  }

  if (entry.disposition === "PURGE_AFTER_RETENTION" && entry.defaultRetentionDays == null) {
    violations.push({
      prismaModel: entry.prismaModel,
      code: "PURGE_WITHOUT_RETENTION_DAYS",
      message: "PURGE_AFTER_RETENTION requires defaultRetentionDays.",
    });
  }

  if (
    (entry.sensitivityTier === "PII" || entry.sensitivityTier === "LEGAL_SENSITIVE") &&
    !entry.redactionRequired
  ) {
    violations.push({
      prismaModel: entry.prismaModel,
      code: "SENSITIVE_REDACTION_REQUIRED",
      message: "PII and LEGAL_SENSITIVE tiers require redactionRequired.",
    });
  }

  if (
    (entry.sensitivityTier === "PII" ||
      entry.sensitivityTier === "LEGAL_SENSITIVE" ||
      entry.sensitivityTier === "OPERATIONS_LOG") &&
    !entry.exportRedactionRequired
  ) {
    violations.push({
      prismaModel: entry.prismaModel,
      code: "EXPORT_REDACTION_REQUIRED",
      message: "Sensitive tiers require exportRedactionRequired.",
    });
  }

  if (entry.sensitivityTier === "LEGAL_SENSITIVE" && entry.purgeEligible && !entry.crosswalkRef) {
    violations.push({
      prismaModel: entry.prismaModel,
      code: "LEGAL_SENSITIVE_PURGE_NEEDS_CROSSWALK",
      message: "LEGAL_SENSITIVE purgeEligible entries require crosswalkRef justification.",
    });
  }

  return violations;
}

export function validateDataRetentionRegistryConstitution(
  registry: readonly DataRetentionPolicyEntry[] = DATA_RETENTION_POLICY_REGISTRY,
): DataRetentionRegistryValidationResult {
  const violations: DataRetentionConstitutionViolation[] = [];
  const seen = new Map<string, number>();
  const duplicateModels: string[] = [];

  for (const raw of registry) {
    const parsed = dataRetentionPolicyEntrySchema.safeParse(raw);
    if (!parsed.success) {
      violations.push({
        prismaModel: raw.prismaModel ?? "UNKNOWN",
        code: "SCHEMA_INVALID",
        message: parsed.error.message,
      });
      continue;
    }

    const entry = parsed.data;
    const count = (seen.get(entry.prismaModel) ?? 0) + 1;
    seen.set(entry.prismaModel, count);
    if (count > 1) {
      duplicateModels.push(entry.prismaModel);
    }

    violations.push(...validateEntryConstitution(entry));
  }

  for (const required of DATA_RETENTION_REQUIRED_PRISMA_MODELS) {
    if (!seen.has(required)) {
      violations.push({
        prismaModel: required,
        code: "REQUIRED_MODEL_MISSING",
        message: `Required anchor model ${required} missing from registry.`,
      });
    }
  }

  return {
    ok: violations.length === 0 && duplicateModels.length === 0,
    violations,
    missingPrismaModels: [],
    duplicateModels: [...new Set(duplicateModels)],
  };
}

export function validateDataRetentionRegistryAgainstPrisma(
  schemaContent: string,
  registry: readonly DataRetentionPolicyEntry[] = DATA_RETENTION_POLICY_REGISTRY,
): DataRetentionRegistryValidationResult {
  const constitution = validateDataRetentionRegistryConstitution(registry);
  const prismaModels = extractPrismaModelNames(schemaContent);
  const missingPrismaModels: string[] = [];

  for (const entry of registry) {
    if (!prismaModels.has(entry.prismaModel)) {
      missingPrismaModels.push(entry.prismaModel);
    }
  }

  const prismaViolations = missingPrismaModels.map((model) => ({
    prismaModel: model,
    code: "PRISMA_MODEL_NOT_FOUND" as const,
    message: `Registry entry ${model} not found in prisma/schema.prisma.`,
  }));

  return {
    ok:
      constitution.ok &&
      missingPrismaModels.length === 0 &&
      DATA_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19A === true,
    violations: [...constitution.violations, ...prismaViolations],
    missingPrismaModels,
    duplicateModels: constitution.duplicateModels,
  };
}

export function assertDataRetentionRegistryValid(schemaContent: string): void {
  const result = validateDataRetentionRegistryAgainstPrisma(schemaContent);
  if (result.ok) {
    return;
  }
  const summary = result.violations.map((v) => `${v.prismaModel}: ${v.message}`).join("; ");
  throw new Error(`Data retention registry constitution failed: ${summary}`);
}
