/**
 * Product Phase 42-B — EvidenceChainOfCustodyLog SSOT.
 */
import type { EvidenceChainOfCustodyLogResult } from "./evidence-chain-of-custody-log.schema";

export const EVIDENCE_CHAIN_OF_CUSTODY_LOG_REGISTRY_MARKER_42B =
  "phase42b-evidence-chain-of-custody-log-registry" as const;

export const EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG = "evidence-integrity-001" as const;

type EvidenceChainOfCustodyLogItem = Omit<EvidenceChainOfCustodyLogResult["items"][number], "defined">;

export const EVIDENCE_CHAIN_OF_CUSTODY_LOG_ITEMS: EvidenceChainOfCustodyLogItem[] = [
  { itemId: "CUSTODY_LOG_ENTRY", label: "Chain of custody log entry", required: true },
  { itemId: "VIEW_HISTORY", label: "Evidence view history", required: true },
  { itemId: "ANALYSIS_HISTORY", label: "Evidence analysis history", required: true },
  { itemId: "MODIFICATION_FLAG", label: "Modification attempt flag", required: true },
  { itemId: "CUSTODY_LAWYER_REVIEW", label: "Lawyer review of custody log", required: true },
];
