/**
 * Phase 19-B — Data redaction service (19-A tier → operational output paths).
 */
import { maskEmail, maskPhone } from "@/features/illegal-lending/illegal-lending-mask";
import type { DataSensitivityTier } from "./data-retention-policy.schema";
import { getDataRetentionPolicyEntry } from "./data-retention-policy.registry";
import type {
  DataRedactionAudience,
  DataRedactionContext,
  DataRedactionOutputPath,
  DataRedactionPolicyEntry,
  DataRedactionResult,
  DataRedactionSurface,
} from "./data-redaction-policy.schema";
import {
  DATA_REDACTION_LEGAL_SENSITIVE_PLACEHOLDER,
  DATA_REDACTION_PII_PLACEHOLDER,
  DATA_REDACTION_PLACEHOLDER,
} from "./data-redaction-policy.schema";
import { getDataRedactionPolicyEntry } from "./data-redaction-policy.registry";

export const DATA_REDACTION_SERVICE_MARKER_PHASE19B =
  "phase19b-data-redaction-service-output-paths" as const;

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g;

function placeholderForTier(tier: DataSensitivityTier): string {
  if (tier === "LEGAL_SENSITIVE") return DATA_REDACTION_LEGAL_SENSITIVE_PLACEHOLDER;
  if (tier === "PII") return DATA_REDACTION_PII_PLACEHOLDER;
  return DATA_REDACTION_PLACEHOLDER;
}

function shouldSkipRedaction(context: DataRedactionContext): boolean {
  if (context.audience === "LEGAL_WORKSPACE") {
    return (
      context.outputPath === "LITIGATION_EXTRACTED_TEXT" ||
      context.outputPath === "CASE_INTELLIGENCE_SNAPSHOT"
    );
  }
  return false;
}

function matchesForbiddenKey(key: string, patterns: string[]): boolean {
  const keyLower = key.toLowerCase();
  return patterns.some((pattern) => {
    if (/[^a-zA-Z0-9_]/.test(pattern)) {
      return new RegExp(pattern, "i").test(key);
    }
    return keyLower === pattern.toLowerCase();
  });
}

function scrubString(value: string, entry: DataRedactionPolicyEntry): string {
  let next = value;
  if (entry.maxStringLength === 0) {
    return placeholderForTier(entry.sensitivityTier);
  }
  next = next.replace(EMAIL_PATTERN, (m) => maskEmail(m));
  next = next.replace(PHONE_PATTERN, (m) => maskPhone(m));
  if (entry.maxStringLength != null && next.length > entry.maxStringLength) {
    next = `${next.slice(0, entry.maxStringLength)}…${placeholderForTier(entry.sensitivityTier)}`;
  }
  return next;
}

function redactUnknown(value: unknown, entry: DataRedactionPolicyEntry, applied: string[]): unknown {
  if (value == null) return value;

  if (typeof value === "string") {
    applied.push("string");
    return scrubString(value, entry);
  }

  if (Array.isArray(value)) {
    applied.push("array");
    return value.map((item) => redactUnknown(item, entry, applied));
  }

  if (typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  const allowlist = entry.allowedKeyAllowlist
    ? new Set(entry.allowedKeyAllowlist)
    : null;
  const output: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(record)) {
    if (matchesForbiddenKey(key, entry.forbiddenKeyPatterns)) {
      applied.push(`forbidden:${key}`);
      output[key] = placeholderForTier(entry.sensitivityTier);
      continue;
    }

    if (allowlist && !allowlist.has(key)) {
      applied.push(`denylist:${key}`);
      output[key] = placeholderForTier(entry.sensitivityTier);
      continue;
    }

    if (entry.contentFieldPaths?.includes(key)) {
      applied.push(`contentField:${key}`);
      output[key] = placeholderForTier(entry.sensitivityTier);
      continue;
    }

    output[key] = redactUnknown(child, entry, applied);
  }

  return output;
}

export function redactByOutputPath(
  value: unknown,
  context: DataRedactionContext,
): DataRedactionResult {
  const entry = getDataRedactionPolicyEntry(context.outputPath);
  if (!entry) {
    return {
      value,
      redacted: false,
      redactionApplied: [],
      outputPath: context.outputPath,
      surface: context.surface,
    };
  }

  if (shouldSkipRedaction(context)) {
    return {
      value,
      redacted: false,
      redactionApplied: ["skipped:LEGAL_WORKSPACE"],
      outputPath: context.outputPath,
      surface: context.surface,
    };
  }

  if (!entry.surfaces.includes(context.surface)) {
    return {
      value,
      redacted: false,
      redactionApplied: ["skipped:surface"],
      outputPath: context.outputPath,
      surface: context.surface,
    };
  }

  const applied: string[] = [];
  const redactedValue = redactUnknown(value, entry, applied);

  return {
    value: redactedValue,
    redacted: applied.length > 0,
    redactionApplied: applied,
    outputPath: context.outputPath,
    surface: context.surface,
  };
}

function withContext(
  outputPath: DataRedactionOutputPath,
  surface: DataRedactionSurface,
  audience: DataRedactionAudience = "OPERATIONS",
) {
  return { outputPath, surface, audience } satisfies DataRedactionContext;
}

export function redactAuditLogMetadataForDisplay(metadata: unknown): unknown {
  return redactByOutputPath(metadata, withContext("AUDIT_LOG_METADATA", "DISPLAY")).value;
}

export function redactAuditLogMetadataForExport(metadata: unknown): unknown {
  return redactByOutputPath(metadata, withContext("AUDIT_LOG_METADATA", "EXPORT")).value;
}

export function redactAuditLogMetadataForPersist(metadata: unknown): unknown {
  return redactByOutputPath(metadata, withContext("AUDIT_LOG_METADATA", "AUDIT_PERSIST")).value;
}

export function redactRetryJobFailurePayload(payload: unknown): unknown {
  return redactByOutputPath(
    payload,
    withContext("RETRY_JOB_FAILURE_PAYLOAD", "OPERATIONS_PAYLOAD"),
  ).value;
}

export function redactExternalMessagePayload(payload: unknown): unknown {
  return redactByOutputPath(
    payload,
    withContext("EXTERNAL_MESSAGE_PAYLOAD", "OPERATIONS_PAYLOAD"),
  ).value;
}

export function redactDocumentPipelineFailurePayload(payload: unknown): unknown {
  return redactByOutputPath(
    payload,
    withContext("DOCUMENT_PIPELINE_FAILURE_PAYLOAD", "OPERATIONS_PAYLOAD"),
  ).value;
}

export function redactAiAuditMetadata(metadata: unknown): unknown {
  return redactByOutputPath(metadata, withContext("AI_AUDIT_METADATA", "AUDIT_PERSIST")).value;
}

export function redactCaseIntelligenceSnapshotForExport(snapshot: unknown): unknown {
  return redactByOutputPath(
    snapshot,
    withContext("CASE_INTELLIGENCE_SNAPSHOT", "EXPORT"),
  ).value;
}

export function redactLitigationExtractedTextForExport(payload: unknown): unknown {
  return redactByOutputPath(
    payload,
    withContext("LITIGATION_EXTRACTED_TEXT", "EXPORT"),
  ).value;
}

export function redactVoiceTranscriptTextForDisplay(payload: unknown): unknown {
  return redactByOutputPath(
    payload,
    withContext("VOICE_TRANSCRIPT_TEXT", "DISPLAY"),
  ).value;
}

export function assertRetentionTierRequiresRedaction(prismaModel: string): boolean {
  const entry = getDataRetentionPolicyEntry(prismaModel);
  return entry?.redactionRequired ?? false;
}
