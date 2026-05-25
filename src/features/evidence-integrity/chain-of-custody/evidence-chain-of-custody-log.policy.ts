/**
 * Product Phase 42-B — EvidenceChainOfCustodyLog policy SSOT.
 */
import { EVIDENCE_CHAIN_OF_CUSTODY_LOG_ITEMS } from "./evidence-chain-of-custody-log.registry";
import type { EvidenceChainOfCustodyLogResult } from "./evidence-chain-of-custody-log.schema";
import { EVIDENCE_CHAIN_OF_CUSTODY_LOG_VERSION } from "./evidence-chain-of-custody-log.schema";

export const EVIDENCE_CHAIN_OF_CUSTODY_LOG_POLICY_MARKER_42B =
  "phase42b-evidence-chain-of-custody-log-policy" as const;

export const EVIDENCE_CHAIN_OF_CUSTODY_LOG_GATE_MARKER_42B =
  "phase42b-evidence-chain-of-custody-log-gate" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;


export function assembleEvidenceChainOfCustodyLog(input: {
  evidenceIntegrityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): EvidenceChainOfCustodyLogResult {
  const items = EVIDENCE_CHAIN_OF_CUSTODY_LOG_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EVIDENCE_CHAIN_OF_CUSTODY_LOG_VERSION,
    evidenceIntegrityScopeSlug: input.evidenceIntegrityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    evidenceChainOfCustodyLogReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
