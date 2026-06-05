/**
 * Product Phase 63-D — Draft Paragraph Generator service SSOT.
 */
import { randomUUID } from "node:crypto";
import type { CounterArgumentCandidate } from "./phase63b-counter-argument-candidate.schema";
import type { BackfireRiskReport } from "./phase63c-risk-backfire-check.schema";
import { buildCounterArgumentDraftParagraph } from "./phase63d-draft-paragraph-generator.policy";
import type {
  CounterArgumentDraftParagraph,
  CounterArgumentDraftParagraphPurpose,
  DraftParagraphSourceTrace,
  GenerateDraftParagraphsInput,
} from "./phase63d-draft-paragraph-generator.schema";
import { counterArgumentDraftParagraphSchema } from "./phase63d-draft-paragraph-generator.schema";

const DRAFT_REVIEW_PREFIX = "[변호사 검토용 초안]";

function buildSourceTrace(input: {
  candidate: CounterArgumentCandidate;
  backfireRiskReport: BackfireRiskReport;
  paragraphPurpose: CounterArgumentDraftParagraphPurpose;
}): DraftParagraphSourceTrace[] {
  const capturedAt = new Date().toISOString();
  const baseTrace = input.candidate.sourceTrace[0];
  if (!baseTrace) {
    return [];
  }

  return [
    {
      ...baseTrace,
      traceId: randomUUID(),
      backfireRiskReportId: input.backfireRiskReport.reportId,
      draftParagraphPurpose: input.paragraphPurpose,
      capturedAt,
    },
  ];
}

function buildFactualRebuttalText(candidate: CounterArgumentCandidate): string {
  const premiseSummary = candidate.decomposition.premiseFacts
    .map((premise) => premise.summary)
    .join("; ");
  return `${DRAFT_REVIEW_PREFIX} 상대방이 전제로 삼는 "${premiseSummary}"에 대하여, ${candidate.decomposition.counterDirection} 방향으로 사실관계를 재검토할 필요가 있습니다.`;
}

function buildEvidenceRebuttalText(candidate: CounterArgumentCandidate): string {
  if (candidate.decomposition.submittedEvidence.length === 0) {
    return `${DRAFT_REVIEW_PREFIX} ${candidate.decomposition.weakLinkAnalysis} 따라 상대방 증거의 입증력 또는 연결고리를 검토할 여지가 있습니다.`;
  }

  const evidenceTitles = candidate.decomposition.submittedEvidence
    .map((evidence) => evidence.title)
    .join(", ");
  return `${DRAFT_REVIEW_PREFIX} 상대방이 제출한 ${evidenceTitles}에 대하여 ${candidate.decomposition.weakLinkAnalysis}`;
}

function buildLegalRebuttalText(candidate: CounterArgumentCandidate): string {
  const basis = candidate.decomposition.gongbuhoBasisRefs[0]?.summary ?? "공부호 근거";
  return `${DRAFT_REVIEW_PREFIX} ${basis}를 참고하여 "${candidate.opponentArgumentTitle}"에 대한 법리적 반박 방향을 검토할 수 있습니다.`;
}

function buildJudgmentDistinctionText(candidate: CounterArgumentCandidate): string {
  const judgmentBasis = candidate.decomposition.gongbuhoBasisRefs.find(
    (basis) => basis.basisKind === "JUDGMENT_LINK",
  );
  if (!judgmentBasis) {
    return buildLegalRebuttalText(candidate);
  }

  return `${DRAFT_REVIEW_PREFIX} ${judgmentBasis.summary}와 본 사건의 사실관계 차이를 구분하여 "${candidate.opponentArgumentTitle}"에 대한 판례 인용 범위를 검토할 필요가 있습니다.`;
}

function inferParagraphPurposes(
  candidate: CounterArgumentCandidate,
): CounterArgumentDraftParagraphPurpose[] {
  const purposes: CounterArgumentDraftParagraphPurpose[] = ["FACTUAL_REBUTTAL"];

  if (candidate.decomposition.submittedEvidence.length > 0) {
    purposes.push("EVIDENCE_REBUTTAL");
  }

  const hasJudgmentBasis = candidate.decomposition.gongbuhoBasisRefs.some(
    (basis) => basis.basisKind === "JUDGMENT_LINK",
  );
  if (hasJudgmentBasis) {
    purposes.push("JUDGMENT_DISTINCTION");
  } else {
    purposes.push("LEGAL_REBUTTAL");
  }

  return purposes;
}

function buildDraftTextForPurpose(
  candidate: CounterArgumentCandidate,
  purpose: CounterArgumentDraftParagraphPurpose,
): string {
  switch (purpose) {
    case "FACTUAL_REBUTTAL":
      return buildFactualRebuttalText(candidate);
    case "EVIDENCE_REBUTTAL":
      return buildEvidenceRebuttalText(candidate);
    case "LEGAL_REBUTTAL":
      return buildLegalRebuttalText(candidate);
    case "JUDGMENT_DISTINCTION":
      return buildJudgmentDistinctionText(candidate);
    case "BURDEN_OF_PROOF_ARGUMENT":
      return `${DRAFT_REVIEW_PREFIX} ${candidate.decomposition.weakLinkAnalysis}에 따라 입증책임 분배를 검토할 여지가 있습니다.`;
    case "DAMAGES_ARGUMENT":
      return `${DRAFT_REVIEW_PREFIX} 손해 및 인과관계 주장에 대해 ${candidate.decomposition.counterDirection} 방향으로 검토할 필요가 있습니다.`;
    case "PROCEDURAL_ARGUMENT":
      return `${DRAFT_REVIEW_PREFIX} 절차상 쟁점에 대해 ${candidate.decomposition.counterDirection} 방향으로 검토할 필요가 있습니다.`;
  }
}

export function generateDraftParagraphsFromCandidate(
  input: GenerateDraftParagraphsInput,
): CounterArgumentDraftParagraph[] {
  const purposes = inferParagraphPurposes(input.counterArgumentCandidate);

  return purposes.map((paragraphPurpose) =>
    counterArgumentDraftParagraphSchema.parse(
      buildCounterArgumentDraftParagraph({
        paragraphId: randomUUID(),
        counterArgumentCandidate: input.counterArgumentCandidate,
        backfireRiskReport: input.backfireRiskReport,
        reasoningContext: input.reasoningContext,
        paragraphPurpose,
        draftText: buildDraftTextForPurpose(input.counterArgumentCandidate, paragraphPurpose),
        sourceTrace: buildSourceTrace({
          candidate: input.counterArgumentCandidate,
          backfireRiskReport: input.backfireRiskReport,
          paragraphPurpose,
        }),
        auditRef: input.auditRef,
      }),
    ),
  );
}

export function summarizeDraftParagraph(paragraph: CounterArgumentDraftParagraph) {
  return {
    paragraphId: paragraph.paragraphId,
    sourceCounterArgumentCandidateId: paragraph.sourceCounterArgumentCandidateId,
    sourceBackfireRiskReportId: paragraph.sourceBackfireRiskReportId,
    paragraphPurpose: paragraph.paragraphPurpose,
    riskLevelAtGeneration: paragraph.riskLevelAtGeneration,
    reviewStatus: paragraph.reviewStatus,
    isFinalDocumentText: paragraph.isFinalDocumentText,
    documentInsertAllowed: paragraph.documentInsertAllowed,
    clientVisibleAllowed: paragraph.clientVisibleAllowed,
    autoFileAllowed: paragraph.autoFileAllowed,
  };
}
