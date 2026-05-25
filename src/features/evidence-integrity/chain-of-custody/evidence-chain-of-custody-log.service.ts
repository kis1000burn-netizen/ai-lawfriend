/**
 * Product Phase 42-B — EvidenceChainOfCustodyLog service.
 */
import {
  EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
  EVIDENCE_CHAIN_OF_CUSTODY_LOG_ITEMS,
} from "./evidence-chain-of-custody-log.registry";
import { assembleEvidenceChainOfCustodyLog } from "./evidence-chain-of-custody-log.policy";
import type { EvidenceChainOfCustodyLogResult } from "./evidence-chain-of-custody-log.schema";

export const EVIDENCE_CHAIN_OF_CUSTODY_LOG_SERVICE_MARKER_42B =
  "phase42b-evidence-chain-of-custody-log-service" as const;

export function buildEvidenceChainOfCustodyLog(input?: {
  evidenceIntegrityScopeSlug?: string;
  definedItemIds?: string[];
}): EvidenceChainOfCustodyLogResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      EVIDENCE_CHAIN_OF_CUSTODY_LOG_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleEvidenceChainOfCustodyLog({
    evidenceIntegrityScopeSlug: input?.evidenceIntegrityScopeSlug ?? EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
