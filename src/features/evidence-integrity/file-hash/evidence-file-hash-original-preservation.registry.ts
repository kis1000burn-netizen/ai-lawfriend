/**
 * Product Phase 42-A — EvidenceFileHashOriginalPreservation SSOT.
 */
import type { EvidenceFileHashOriginalPreservationResult } from "./evidence-file-hash-original-preservation.schema";

export const EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_REGISTRY_MARKER_42A =
  "phase42a-evidence-file-hash-original-preservation-registry" as const;

export const EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG = "evidence-integrity-001" as const;

type EvidenceFileHashOriginalPreservationItem = Omit<EvidenceFileHashOriginalPreservationResult["items"][number], "defined">;

export const EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_ITEMS: EvidenceFileHashOriginalPreservationItem[] = [
  { itemId: "ORIGINAL_FILE_PRESERVED", label: "Original file preserved flag", required: true },
  { itemId: "EVIDENCE_FILE_HASH", label: "Evidence file SHA-256 hash", required: true },
  { itemId: "UPLOAD_TIMESTAMP", label: "Upload timestamp audit", required: true },
  { itemId: "UPLOADER_IDENTITY", label: "Uploader identity record", required: true },
  { itemId: "HASH_REGISTRY_ENTRY", label: "Hash registry entry", required: true },
];
