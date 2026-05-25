/**
 * Product Phase 44-C — EvidenceListPack SSOT.
 */
import type { EvidenceListPackResult } from "./evidence-list-pack.schema";

export const EVIDENCE_LIST_PACK_REGISTRY_MARKER_44C =
  "phase44c-evidence-list-pack-registry" as const;

export const COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG = "court-ready-case-record-pack-001" as const;

type EvidenceListPackItem = Omit<EvidenceListPackResult["items"][number], "defined">;

export const EVIDENCE_LIST_PACK_ITEMS: EvidenceListPackItem[] = [
  { itemId: "EVIDENCE_INDEX", label: "Evidence index with hash trace", required: true },
  { itemId: "EXHIBIT_NUMBERING", label: "Exhibit numbering draft", required: true },
  { itemId: "CUSTODY_REFERENCE", label: "Chain of custody reference", required: true },
  { itemId: "EVIDENCE_LIST_LAWYER_REVIEW", label: "Lawyer review of evidence list", required: true },
];
