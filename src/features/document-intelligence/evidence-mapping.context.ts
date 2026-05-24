/**
 * Phase 13-F — normalizes case context for evidence mapping engine.
 */
import type { DocumentAnalysisResult } from "./document-analysis.schema";
import { documentAnalysisResultSchema } from "./document-analysis.schema";
import { opponentBriefAnalysisResultSchema } from "./opponent-brief-analysis.schema";
import type { OpponentBriefAnalysisResult } from "./opponent-brief-analysis.schema";
import type { EvidenceMappingSourceRef } from "./evidence-mapping.schema";
import { parseExtractedPagesFromJson } from "./document-extraction.schema";
import type { loadEvidenceMappingCaseContext } from "./evidence-mapping.repository";

export const PHASE13F_EVIDENCE_MAPPING_CONTEXT_MARKER =
  "PHASE13F_EVIDENCE_MAPPING_CONTEXT" as const;

export type NormalizedClaimCandidate = {
  claimText: string;
  claimParty: "CLIENT" | "OPPONENT" | "COURT" | "UNKNOWN";
  sourceFileId?: string;
  sourceRefs: EvidenceMappingSourceRef[];
};

export type NormalizedEvidenceFile = {
  fileId: string;
  label: string;
  documentType: string;
  textSample: string;
  sourceKind: "LITIGATION_UPLOAD" | "CASE_ATTACHMENT";
};

export type EvidenceMappingEngineContext = {
  caseId: string;
  caseTitle: string;
  caseSummaryText: string;
  interviewTexts: string[];
  documentAnalyses: Array<{
    fileId: string;
    fileName: string;
    documentType: string;
    result: DocumentAnalysisResult;
  }>;
  opponentBriefAnalyses: Array<{
    fileId: string;
    fileName: string;
    result: OpponentBriefAnalysisResult;
  }>;
  evidenceFiles: NormalizedEvidenceFile[];
  existingSupplementTitles: string[];
  inputCounts: {
    documentAnalysisCount: number;
    opponentBriefAnalysisCount: number;
    interviewAnswerCount: number;
    litigationEvidenceFileCount: number;
    caseAttachmentCount: number;
    existingSupplementItemCount: number;
  };
};

const EVIDENCE_DOCUMENT_TYPE_PATTERN =
  /(_EVIDENCE$|^FINANCIAL_|^CONTRACT_|^MESSAGING_|^SMS_|^PHOTO_)/;

function flattenInterviewAnswers(answersJson: unknown): string[] {
  if (!answersJson || typeof answersJson !== "object") return [];
  const texts: string[] = [];
  for (const value of Object.values(answersJson as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) texts.push(value.trim());
    else if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === "string" && v.trim()) texts.push(v.trim());
      }
    }
  }
  return texts;
}

function extractCaseSummaryText(
  description: string | null | undefined,
  snapshot: Awaited<
    ReturnType<typeof loadEvidenceMappingCaseContext>
  >["intelligenceSnapshot"],
): string {
  const parts: string[] = [];
  if (description?.trim()) parts.push(description.trim());

  if (snapshot?.contentJson && typeof snapshot.contentJson === "object") {
    const content = snapshot.contentJson as Record<string, unknown>;
    for (const key of ["narrativeSummary", "summary", "oneLineSummary"]) {
      const v = content[key];
      if (typeof v === "string" && v.trim()) {
        parts.push(v.trim());
        break;
      }
    }
  }

  return parts.join("\n");
}

function isEvidenceDocumentType(documentType: string): boolean {
  return (
    EVIDENCE_DOCUMENT_TYPE_PATTERN.test(documentType) ||
    documentType.includes("EVIDENCE")
  );
}

export function buildEvidenceMappingEngineContext(
  raw: Awaited<ReturnType<typeof loadEvidenceMappingCaseContext>>,
): EvidenceMappingEngineContext | null {
  if (!raw.caseRow) return null;

  const documentAnalyses: EvidenceMappingEngineContext["documentAnalyses"] = [];
  const opponentBriefAnalyses: EvidenceMappingEngineContext["opponentBriefAnalyses"] =
    [];
  const evidenceFiles: NormalizedEvidenceFile[] = [];

  for (const file of raw.litigationFiles) {
    const classification = file.classifications[0];
    const analysis = file.analyses[0];
    const opponent = file.opponentBriefAnalyses[0];
    const extraction = file.extractions[0];

    let textSample = "";
    if (extraction?.pagesJson) {
      const pages = parseExtractedPagesFromJson(extraction.pagesJson);
      textSample = pages
        .map((p) => p.text)
        .join("\n")
        .slice(0, 4000);
    }

    if (analysis?.analysisStatus === "AI_ANALYZED") {
      const parsed = documentAnalysisResultSchema.safeParse(analysis.analysisJson);
      if (parsed.success) {
        documentAnalyses.push({
          fileId: file.id,
          fileName: file.originalFileName,
          documentType: parsed.data.documentType,
          result: parsed.data,
        });
      }
    }

    if (opponent?.analysisStatus === "AI_ANALYZED") {
      const parsed = opponentBriefAnalysisResultSchema.safeParse(
        opponent.analysisJson,
      );
      if (parsed.success) {
        opponentBriefAnalyses.push({
          fileId: file.id,
          fileName: file.originalFileName,
          result: parsed.data,
        });
      }
    }

    const docType = classification?.documentType ?? "OTHER";
    if (isEvidenceDocumentType(docType) || textSample.trim()) {
      evidenceFiles.push({
        fileId: file.id,
        label: file.originalFileName,
        documentType: docType,
        textSample,
        sourceKind: "LITIGATION_UPLOAD",
      });
    }
  }

  for (const attachment of raw.attachments) {
    if (
      attachment.category === "EVIDENCE" ||
      attachment.category === "FINANCIAL" ||
      attachment.category === "CONTRACT"
    ) {
      evidenceFiles.push({
        fileId: attachment.id,
        label: attachment.originalName,
        documentType: attachment.category,
        textSample: attachment.originalName,
        sourceKind: "CASE_ATTACHMENT",
      });
    }
  }

  const interviewTexts = raw.interviews.flatMap((i) =>
    flattenInterviewAnswers(i.answersJson),
  );

  const existingSupplementTitles = raw.supplementRequests.flatMap((r) =>
    r.items.map((item) => item.itemLabel.trim()).filter(Boolean),
  );

  return {
    caseId: raw.caseRow.id,
    caseTitle: raw.caseRow.title,
    caseSummaryText: extractCaseSummaryText(
      raw.caseRow.description,
      raw.intelligenceSnapshot,
    ),
    interviewTexts,
    documentAnalyses,
    opponentBriefAnalyses,
    evidenceFiles,
    existingSupplementTitles,
    inputCounts: {
      documentAnalysisCount: documentAnalyses.length,
      opponentBriefAnalysisCount: opponentBriefAnalyses.length,
      interviewAnswerCount: interviewTexts.length,
      litigationEvidenceFileCount: evidenceFiles.filter(
        (f) => f.sourceKind === "LITIGATION_UPLOAD",
      ).length,
      caseAttachmentCount: raw.attachments.length,
      existingSupplementItemCount: existingSupplementTitles.length,
    },
  };
}

export function collectClaimCandidates(
  ctx: EvidenceMappingEngineContext,
): NormalizedClaimCandidate[] {
  const claims: NormalizedClaimCandidate[] = [];

  for (const doc of ctx.documentAnalyses) {
    for (const claim of doc.result.claims) {
      const party = claim.claimType.startsWith("OPPONENT")
        ? "OPPONENT"
        : claim.claimType === "CLIENT_ASSERTION"
          ? "CLIENT"
          : claim.claimType === "COURT_ORDER"
            ? "COURT"
            : "UNKNOWN";

      claims.push({
        claimText: claim.text,
        claimParty: party,
        sourceFileId: doc.fileId,
        sourceRefs: [
          {
            sourceKind: "DOCUMENT_ANALYSIS_13D",
            sourceId: doc.fileId,
            sourceFileId: doc.fileId,
            pageNumber: claim.citation.pageNumber,
            snippet: claim.citation.snippet,
            reason: claim.citation.reason,
          },
        ],
      });
    }
  }

  for (const opp of ctx.opponentBriefAnalyses) {
    for (const item of [
      ...opp.result.newArguments,
      ...opp.result.denials,
      ...opp.result.admissions,
    ]) {
      claims.push({
        claimText: item.text,
        claimParty: "OPPONENT",
        sourceFileId: opp.fileId,
        sourceRefs: [
          {
            sourceKind: "OPPONENT_BRIEF_13E",
            sourceId: opp.fileId,
            sourceFileId: opp.fileId,
            pageNumber: item.citation.pageNumber,
            snippet: item.citation.snippet,
            reason: item.citation.reason,
          },
        ],
      });
    }
  }

  return claims;
}
