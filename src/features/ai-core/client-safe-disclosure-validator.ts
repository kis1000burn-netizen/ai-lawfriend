/**
 * Phase 10-C — Client-Safe Disclosure validator.
 * Radar · 내부 메모 · PENDING Ledger는 의뢰인 bundle에 포함될 수 없다.
 */
import type { LawyerJudgmentBoundaryEntry } from "./lawyer-judgment-boundary-ledger.schema";
import {
  type ClientSafeDisclosureLayer,
  type ClientSafeStatement,
  clientSafeDisclosureLayerSchema,
  CLIENT_SAFE_BLOCKED_CATEGORIES,
} from "./client-safe-disclosure.schema";

export const CLIENT_SAFE_DISCLOSURE_VALIDATOR_MARKER =
  "PHASE10C_CLIENT_SAFE_DISCLOSURE_VALIDATOR" as const;

export type ClientSafeDisclosureValidationResult = {
  passed: boolean;
  issues: string[];
};

const FORBIDDEN_CLIENT_TEXT_PATTERNS = [
  /Contradiction Radar/i,
  /검토되지 않은 핵심 Claim/i,
  /LawyerMemo\./,
  /AI_DETECTED only/i,
];

export function assertStatementClientSafe(statement: ClientSafeStatement): string[] {
  const issues: string[] = [];
  if (!statement.clientVisibleLane || !statement.releaseGatePassed) {
    issues.push(`statement ${statement.statementId}: release gates must pass`);
  }
  if (statement.judgmentState !== "CONFIRMED" && statement.judgmentState !== "EDITED") {
    issues.push(`statement ${statement.statementId}: invalid judgmentState for client release`);
  }
  for (const pattern of FORBIDDEN_CLIENT_TEXT_PATTERNS) {
    if (pattern.test(statement.text)) {
      issues.push(`statement ${statement.statementId}: internal-only text pattern`);
    }
  }
  return issues;
}

export function assertLedgerEntryNotInClientBundle(
  entry: LawyerJudgmentBoundaryEntry,
  includedEntryIds: Set<string>,
): string[] {
  if (!includedEntryIds.has(entry.entryId)) {
    return [];
  }
  if (entry.subjectKind === "RADAR_SIGNAL" || entry.subjectKind === "CONTRADICTION_EDGE") {
    return [`entry ${entry.entryId}: radar/contradiction must not appear in client bundle`];
  }
  if (entry.judgmentState === "PENDING") {
    return [`entry ${entry.entryId}: PENDING must not appear in client bundle`];
  }
  return [];
}

export function validateClientSafeDisclosureLayer(
  input: unknown,
): ClientSafeDisclosureValidationResult & { layer: ClientSafeDisclosureLayer } {
  const layer = clientSafeDisclosureLayerSchema.parse(input);
  const issues: string[] = [];

  for (const category of CLIENT_SAFE_BLOCKED_CATEGORIES) {
    if (!layer.blockedCategories.includes(category)) {
      issues.push(`blockedCategories must include ${category}`);
    }
  }

  if (layer.releaseGatePassed && layer.statements.length === 0) {
    issues.push("releaseGatePassed requires at least one statement");
  }
  if (!layer.releaseGatePassed && layer.statements.length > 0) {
    issues.push("statements present but releaseGatePassed is false");
  }

  for (const statement of layer.statements) {
    issues.push(...assertStatementClientSafe(statement));
  }

  return {
    passed: issues.length === 0,
    issues,
    layer,
  };
}
