/**
 * Phase 19-B — Redaction registry validator (19-A tier alignment).
 */
import { getDataRetentionPolicyEntry } from "./data-retention-policy.registry";
import type { DataRedactionRegistryValidationResult } from "./data-redaction-policy.schema";
import { dataRedactionPolicyEntrySchema } from "./data-redaction-policy.schema";
import {
  DATA_REDACTION_POLICY_REGISTRY,
  DATA_REDACTION_REQUIRED_OUTPUT_PATHS,
} from "./data-redaction-policy.registry";

export const DATA_REDACTION_VALIDATOR_MARKER_PHASE19B =
  "phase19b-data-redaction-validator" as const;

export function validateDataRedactionRegistry(): DataRedactionRegistryValidationResult {
  const violations: DataRedactionRegistryValidationResult["violations"] = [];
  const seen = new Set<string>();

  for (const raw of DATA_REDACTION_POLICY_REGISTRY) {
    const parsed = dataRedactionPolicyEntrySchema.safeParse(raw);
    if (!parsed.success) {
      violations.push({
        outputPath: raw.outputPath ?? "UNKNOWN",
        code: "SCHEMA_INVALID",
        message: parsed.error.message,
      });
      continue;
    }

    const entry = parsed.data;
    if (seen.has(entry.outputPath)) {
      violations.push({
        outputPath: entry.outputPath,
        code: "DUPLICATE_OUTPUT_PATH",
        message: "Duplicate output path in registry.",
      });
    }
    seen.add(entry.outputPath);

    const retention = getDataRetentionPolicyEntry(entry.sourcePrismaModel);
    if (!retention) {
      violations.push({
        outputPath: entry.outputPath,
        code: "RETENTION_MODEL_MISSING",
        message: `sourcePrismaModel ${entry.sourcePrismaModel} not in 19-A registry.`,
      });
      continue;
    }

    if (retention.redactionRequired === false && entry.sensitivityTier !== "PUBLIC") {
      violations.push({
        outputPath: entry.outputPath,
        code: "RETENTION_REDACTION_MISMATCH",
        message: `${entry.sourcePrismaModel} requires redaction in 19-A but policy is weak.`,
      });
    }

    if (
      (entry.sensitivityTier === "PII" || entry.sensitivityTier === "LEGAL_SENSITIVE") &&
      !entry.surfaces.includes("EXPORT")
    ) {
      violations.push({
        outputPath: entry.outputPath,
        code: "SENSITIVE_EXPORT_SURFACE_MISSING",
        message: "PII/LEGAL_SENSITIVE paths must include EXPORT surface.",
      });
    }
  }

  for (const required of DATA_REDACTION_REQUIRED_OUTPUT_PATHS) {
    if (!seen.has(required)) {
      violations.push({
        outputPath: required,
        code: "REQUIRED_PATH_MISSING",
        message: `Required output path ${required} missing from registry.`,
      });
    }
  }

  return { ok: violations.length === 0, violations };
}

export function assertDataRedactionRegistryValid(): void {
  const result = validateDataRedactionRegistry();
  if (result.ok) return;
  const summary = result.violations.map((v) => `${v.outputPath}: ${v.message}`).join("; ");
  throw new Error(`Data redaction registry invalid: ${summary}`);
}
