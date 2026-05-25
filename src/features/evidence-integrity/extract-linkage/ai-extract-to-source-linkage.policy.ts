/**
 * Product Phase 42-C — AiExtractToSourceLinkage policy SSOT.
 */
import { AI_EXTRACT_TO_SOURCE_LINKAGE_ITEMS } from "./ai-extract-to-source-linkage.registry";
import type { AiExtractToSourceLinkageResult } from "./ai-extract-to-source-linkage.schema";
import { AI_EXTRACT_TO_SOURCE_LINKAGE_VERSION } from "./ai-extract-to-source-linkage.schema";

export const AI_EXTRACT_TO_SOURCE_LINKAGE_POLICY_MARKER_42C =
  "phase42c-ai-extract-to-source-linkage-policy" as const;

export const AI_EXTRACT_TO_SOURCE_LINKAGE_GATE_MARKER_42C =
  "phase42c-ai-extract-to-source-linkage-gate" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_NO_AI_REPLACES_ORIGINAL =
  "NO_AI_EXTRACT_REPLACES_ORIGINAL" as const;

export function assembleAiExtractToSourceLinkage(input: {
  evidenceIntegrityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): AiExtractToSourceLinkageResult {
  const items = AI_EXTRACT_TO_SOURCE_LINKAGE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: AI_EXTRACT_TO_SOURCE_LINKAGE_VERSION,
    evidenceIntegrityScopeSlug: input.evidenceIntegrityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    aiExtractToSourceLinkageReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    sampleIntegrityRecord: {
      evidenceFileId: "evidence-file-sample-001",
      fileHash: {
        evidenceFileId: "evidence-file-sample-001",
        sha256Hash: "sha256-sample-hash",
        uploadedAt: new Date().toISOString(),
        uploadedByUserId: "lawyer-user-001",
        originalFilePreserved: true as const,
      },
      chainOfCustody: [
        {
          logId: "custody-log-001",
          evidenceFileId: "evidence-file-sample-001",
          action: "UPLOAD" as const,
          actorUserId: "lawyer-user-001",
          occurredAt: new Date().toISOString(),
          modificationDetected: false,
        },
      ],
      aiExtractLinks: [
        {
          extractId: "extract-001",
          evidenceFileId: "evidence-file-sample-001",
          extractedTextExcerpt: "Contract clause excerpt",
          pageReference: "p-3",
          paragraphReference: "para-2",
          replacesOriginal: false as const,
        },
      ],
      reviewStatus: "NEEDS_REVIEW" as const,
      tamperWarning: false,
      lawyerReviewRequired: true as const,
    },
  };
}
