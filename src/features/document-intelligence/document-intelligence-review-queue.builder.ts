/**
 * Phase 13-G — aggregates 13-D/E/F items into unified lawyer review queue.
 */
import { documentAnalysisResultSchema } from "./document-analysis.schema";
import { opponentBriefAnalysisResultSchema } from "./opponent-brief-analysis.schema";
import { evidenceMappingResultSchema } from "./evidence-mapping.schema";
import {
  categoryToLedgerSubjectKind,
  DOCUMENT_INTELLIGENCE_REVIEW_VERSION,
  isConfirmedReviewStatus,
  toDecisionLabel,
  type DocumentIntelligenceReviewQueueItem,
  type DocumentIntelligenceReviewQueueResponse,
} from "./document-intelligence-review.schema";
import type { LitigationDocumentIntelligenceReviewDecision } from "@prisma/client";
import { buildPortalCollaborationReviewItems, buildPortalReviewItemsFromStoredDecisions } from "@/features/client-portal/client-portal-review-candidate.service";

export const PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_QUEUE_BUILDER_MARKER =
  "PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_QUEUE_BUILDER" as const;

type BuildQueueInput = {
  caseId: string;
  litigationFiles: Array<{
    id: string;
    originalFileName: string;
    analyses: Array<{ analysisStatus: string; analysisJson: unknown }>;
    opponentBriefAnalyses: Array<{ analysisStatus: string; analysisJson: unknown }>;
  }>;
  evidenceMapping: { mappingJson: unknown } | null;
  decisions: LitigationDocumentIntelligenceReviewDecision[];
  portalSources?: Parameters<typeof buildPortalCollaborationReviewItems>[0];
};

function baseItem(
  partial: Omit<
    DocumentIntelligenceReviewQueueItem,
    "decisionLabel" | "downstreamUsable" | "ledgerSubjectKind"
  >,
  decision?: LitigationDocumentIntelligenceReviewDecision | null,
): DocumentIntelligenceReviewQueueItem {
  const reviewStatus =
    (decision?.reviewStatus as DocumentIntelligenceReviewQueueItem["reviewStatus"]) ??
    partial.reviewStatus;
  return {
    ...partial,
    reviewStatus,
    decisionLabel: toDecisionLabel(reviewStatus),
    editedText: decision?.editedText ?? partial.editedText,
    rejectionReason: decision?.rejectionReason ?? partial.rejectionReason,
    reviewNote: decision?.reviewNote ?? partial.reviewNote,
    reviewedAt: decision?.reviewedAt?.toISOString(),
    reviewedByUserId: decision?.reviewedByUserId ?? undefined,
    ledgerEntryId: decision ? `doc-intel-${partial.itemId}` : partial.ledgerEntryId,
    ledgerSubjectKind: categoryToLedgerSubjectKind(partial.itemCategory),
    displayText: decision?.editedText ?? partial.displayText,
    downstreamUsable: isConfirmedReviewStatus(reviewStatus),
  };
}

function decisionMap(decisions: LitigationDocumentIntelligenceReviewDecision[]) {
  return new Map(decisions.map((d) => [d.itemId, d]));
}

export function buildDocumentIntelligenceReviewQueue(
  input: BuildQueueInput,
): DocumentIntelligenceReviewQueueResponse {
  const decisions = decisionMap(input.decisions);
  const items: DocumentIntelligenceReviewQueueItem[] = [];

  for (const file of input.litigationFiles) {
    const analysis = file.analyses[0];
    if (analysis?.analysisStatus === "AI_ANALYZED") {
      const parsed = documentAnalysisResultSchema.safeParse(analysis.analysisJson);
      if (parsed.success) {
        const data = parsed.data;
        data.claims.forEach((claim, i) => {
          const itemId = `13d-${file.id}-claim-${i}`;
          items.push(
            baseItem(
              {
                itemId,
                sourcePhase: "PHASE_13D",
                sourceFileId: file.id,
                sourceFileName: file.originalFileName,
                itemCategory: "claim",
                aiText: claim.text,
                displayText: claim.text,
                reviewStatus: "NEEDS_LAWYER_REVIEW",
                confidence: claim.confidence,
                citations: [
                  {
                    pageNumber: claim.citation.pageNumber,
                    snippet: claim.citation.snippet,
                    reason: claim.citation.reason,
                    sourceFileId: file.id,
                  },
                ],
                payload: { claimType: claim.claimType },
              },
              decisions.get(itemId),
            ),
          );
        });

        data.deadlineCandidates.forEach((deadline, i) => {
          const itemId = `13d-${file.id}-deadline-${i}`;
          items.push(
            baseItem(
              {
                itemId,
                sourcePhase: "PHASE_13D",
                sourceFileId: file.id,
                sourceFileName: file.originalFileName,
                itemCategory: "deadline",
                aiText: deadline.text,
                displayText: deadline.text,
                reviewStatus: "NEEDS_LAWYER_REVIEW",
                confidence: deadline.confidence,
                citations: [
                  {
                    pageNumber: deadline.citation.pageNumber,
                    snippet: deadline.citation.snippet,
                    reason: deadline.citation.reason,
                    sourceFileId: file.id,
                  },
                ],
              },
              decisions.get(itemId),
            ),
          );
        });

        data.legalIssueCandidates.forEach((issue, i) => {
          const itemId = `13d-${file.id}-issue-${i}`;
          items.push(
            baseItem(
              {
                itemId,
                sourcePhase: "PHASE_13D",
                sourceFileId: file.id,
                sourceFileName: file.originalFileName,
                itemCategory: "issue",
                aiText: issue.text,
                displayText: issue.text,
                reviewStatus: "NEEDS_LAWYER_REVIEW",
                confidence: issue.confidence,
                citations: [
                  {
                    pageNumber: issue.citation.pageNumber,
                    snippet: issue.citation.snippet,
                    reason: issue.citation.reason,
                    sourceFileId: file.id,
                  },
                ],
              },
              decisions.get(itemId),
            ),
          );
        });

        data.evidenceRefs.forEach((ref, i) => {
          const itemId = `13d-${file.id}-evidence-${i}`;
          items.push(
            baseItem(
              {
                itemId,
                sourcePhase: "PHASE_13D",
                sourceFileId: file.id,
                sourceFileName: file.originalFileName,
                itemCategory: "evidence",
                aiText: ref.label,
                displayText: ref.description ? `${ref.label} — ${ref.description}` : ref.label,
                reviewStatus: "NEEDS_LAWYER_REVIEW",
                confidence: ref.confidence,
                citations: [
                  {
                    pageNumber: ref.citation.pageNumber,
                    snippet: ref.citation.snippet,
                    reason: ref.citation.reason,
                    sourceFileId: file.id,
                  },
                ],
              },
              decisions.get(itemId),
            ),
          );
        });

        data.riskSignals.forEach((risk, i) => {
          const itemId = `13d-${file.id}-risk-${i}`;
          items.push(
            baseItem(
              {
                itemId,
                sourcePhase: "PHASE_13D",
                sourceFileId: file.id,
                sourceFileName: file.originalFileName,
                itemCategory: "risk",
                aiText: risk.description,
                displayText: risk.description,
                reviewStatus: "NEEDS_LAWYER_REVIEW",
                confidence: risk.confidence,
                citations: risk.citation
                  ? [
                      {
                        pageNumber: risk.citation.pageNumber,
                        snippet: risk.citation.snippet,
                        reason: risk.citation.reason,
                        sourceFileId: file.id,
                      },
                    ]
                  : [],
                payload: { riskType: risk.riskType },
              },
              decisions.get(itemId),
            ),
          );
        });
      }
    }

    const opponent = file.opponentBriefAnalyses[0];
    if (opponent?.analysisStatus === "AI_ANALYZED") {
      const parsed = opponentBriefAnalysisResultSchema.safeParse(
        opponent.analysisJson,
      );
      if (parsed.success) {
        const data = parsed.data;
        const push13E = (
          itemId: string,
          category: DocumentIntelligenceReviewQueueItem["itemCategory"],
          text: string,
          citation: { pageNumber: number; snippet: string; reason: string },
          confidence: number,
          payload?: Record<string, unknown>,
        ) => {
          items.push(
            baseItem(
              {
                itemId,
                sourcePhase: "PHASE_13E",
                sourceFileId: file.id,
                sourceFileName: file.originalFileName,
                itemCategory: category,
                aiText: text,
                displayText: text,
                reviewStatus: "NEEDS_LAWYER_REVIEW",
                confidence,
                citations: [
                  {
                    pageNumber: citation.pageNumber,
                    snippet: citation.snippet,
                    reason: citation.reason,
                    sourceFileId: file.id,
                  },
                ],
                payload,
              },
              decisions.get(itemId),
            ),
          );
        };

        data.admissions.forEach((a, i) =>
          push13E(`13e-${file.id}-admission-${i}`, "claim", a.text, a.citation, a.confidence),
        );
        data.denials.forEach((d, i) =>
          push13E(`13e-${file.id}-denial-${i}`, "claim", d.text, d.citation, d.confidence),
        );
        data.defenses.forEach((d, i) =>
          push13E(`13e-${file.id}-defense-${i}`, "defense", d.text, d.citation, d.confidence, {
            defenseKind: d.defenseKind,
          }),
        );
        data.contradictionCandidates.forEach((c, i) =>
          push13E(
            `13e-${file.id}-contradiction-${i}`,
            "contradiction",
            c.text,
            c.citation,
            c.confidence,
            { conflictWith: c.conflictWith },
          ),
        );
        data.rebuttalIssueCandidates.forEach((r, i) =>
          push13E(`13e-${file.id}-rebuttal-${i}`, "rebuttal", r.text, r.citation, r.confidence),
        );
        data.clientConfirmationQuestions.forEach((q, i) =>
          push13E(`13e-${file.id}-question-${i}`, "question", q.text, q.citation, q.confidence),
        );
      }
    }
  }

  if (input.evidenceMapping) {
    const parsed = evidenceMappingResultSchema.safeParse(
      input.evidenceMapping.mappingJson,
    );
    if (parsed.success) {
      const data = parsed.data;
      const push13F = (
        itemId: string,
        category: DocumentIntelligenceReviewQueueItem["itemCategory"],
        text: string,
        sourceRefs: Array<{ snippet: string; reason: string; sourceFileId?: string; pageNumber?: number }>,
        confidence: number,
        payload?: Record<string, unknown>,
      ) => {
        const fullItemId = `13f-${itemId}`;
        items.push(
          baseItem(
            {
              itemId: fullItemId,
              sourcePhase: "PHASE_13F",
              sourceFileId: sourceRefs[0]?.sourceFileId ?? null,
              itemCategory: category,
              aiText: text,
              displayText: text,
              reviewStatus: "NEEDS_LAWYER_REVIEW",
              confidence,
              citations: sourceRefs.map((r) => ({
                snippet: r.snippet,
                reason: r.reason,
                sourceFileId: r.sourceFileId,
                pageNumber: r.pageNumber,
              })),
              payload,
            },
            decisions.get(fullItemId),
          ),
        );
      };

      data.claimEvidenceLinks.forEach((link) =>
        push13F(
          link.itemId,
          "evidence",
          link.description,
          link.sourceRefs,
          link.confidence,
          { claimText: link.claimText, mappingKind: link.mappingKind },
        ),
      );
      data.unsupportedClaims.forEach((claim) =>
        push13F(claim.itemId, "claim", claim.description, claim.sourceRefs, claim.confidence, {
          claimText: claim.claimText,
        }),
      );
      data.contradictedClaims.forEach((claim) =>
        push13F(claim.itemId, "contradiction", claim.description, claim.sourceRefs, claim.confidence),
      );
      data.missingEvidenceRequests.forEach((req) =>
        push13F(req.itemId, "evidence", req.requestText, req.sourceRefs, req.confidence),
      );
      data.clientConfirmationQuestions.forEach((q) =>
        push13F(q.itemId, "question", q.questionText, q.sourceRefs, q.confidence),
      );
      data.issueMappingCandidates.forEach((issue) =>
        push13F(issue.itemId, "issue", issue.issueText, issue.sourceRefs, issue.confidence),
      );
      data.supplementRequestDrafts.forEach((draft) =>
        push13F(
          draft.itemId,
          "supplement_draft",
          draft.draftBody,
          draft.sourceRefs,
          draft.confidence,
          { draftTitle: draft.draftTitle },
        ),
      );
    }
  }

  if (input.portalSources) {
    const portalItems = buildPortalCollaborationReviewItems(
      input.portalSources,
      decisions,
    );
    const existingIds = new Set(items.map((i) => i.itemId));
    for (const portalItem of portalItems) {
      if (!existingIds.has(portalItem.itemId)) {
        items.push(portalItem);
        existingIds.add(portalItem.itemId);
      }
    }
  }

  const portalDecisionItems = buildPortalReviewItemsFromStoredDecisions(input.decisions);
  const existingIds = new Set(items.map((i) => i.itemId));
  for (const portalItem of portalDecisionItems) {
    if (!existingIds.has(portalItem.itemId)) {
      items.push(portalItem);
      existingIds.add(portalItem.itemId);
    }
  }

  const summary = {
    totalCount: items.length,
    pendingCount: items.filter((i) => i.reviewStatus === "NEEDS_LAWYER_REVIEW").length,
    confirmedCount: items.filter((i) => i.reviewStatus === "LAWYER_CONFIRMED").length,
    editedCount: items.filter((i) => i.reviewStatus === "LAWYER_CORRECTED").length,
    rejectedCount: items.filter((i) => i.reviewStatus === "REJECTED").length,
    needsClientConfirmationCount: items.filter(
      (i) => i.reviewStatus === "NEEDS_CLIENT_CONFIRMATION",
    ).length,
    phase13dCount: items.filter((i) => i.sourcePhase === "PHASE_13D").length,
    phase13eCount: items.filter((i) => i.sourcePhase === "PHASE_13E").length,
    phase13fCount: items.filter((i) => i.sourcePhase === "PHASE_13F").length,
    phase15bCount: items.filter((i) => i.sourcePhase === "PHASE_15B").length,
    phase15cCount: items.filter((i) => i.sourcePhase === "PHASE_15C").length,
  };

  return {
    caseId: input.caseId,
    version: DOCUMENT_INTELLIGENCE_REVIEW_VERSION,
    builtAt: new Date().toISOString(),
    summary,
    items,
  };
}
