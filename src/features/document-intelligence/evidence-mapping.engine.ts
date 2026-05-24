/**
 * Phase 13-F — claim-evidence mapping engine (baseline rule engine).
 */
import {
  collectClaimCandidates,
  type EvidenceMappingEngineContext,
  type NormalizedClaimCandidate,
  type NormalizedEvidenceFile,
} from "./evidence-mapping.context";
import {
  EVIDENCE_MAPPING_VERSION,
  type EvidenceMappingResult,
  type EvidenceMappingSourceRef,
} from "./evidence-mapping.schema";
import { validateEvidenceMappingResult } from "./evidence-mapping-validator";

export const PHASE13F_EVIDENCE_MAPPING_ENGINE_MARKER =
  "PHASE13F_EVIDENCE_MAPPING_ENGINE" as const;

let itemCounter = 0;
function nextItemId(prefix: string): string {
  itemCounter += 1;
  return `${prefix}-${itemCounter}`;
}

function resetItemCounter(): void {
  itemCounter = 0;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.:;()[\]{}·\-/]+/)
    .filter((t) => t.length >= 2);
}

function scoreClaimEvidenceMatch(
  claim: NormalizedClaimCandidate,
  evidence: NormalizedEvidenceFile,
): number {
  const claimTokens = new Set(tokenize(claim.claimText));
  const evidenceTokens = tokenize(`${evidence.label} ${evidence.textSample}`);
  let score = 0;

  for (const token of evidenceTokens) {
    if (claimTokens.has(token)) score += 1;
  }

  if (/대여|투자|계좌|입금|변제|송금/.test(claim.claimText)) {
    if (/계좌|입금|거래|이체|financial|bank/i.test(evidence.label + evidence.textSample)) {
      score += 3;
    }
  }

  if (/계약|약정/.test(claim.claimText)) {
    if (/contract|계약/i.test(evidence.label + evidence.textSample)) {
      score += 3;
    }
  }

  if (/문자|카카오|대화|메시지/.test(claim.claimText)) {
    if (/message|chat|카카오|문자/i.test(evidence.label + evidence.textSample)) {
      score += 3;
    }
  }

  return score;
}

function buildEvidenceSourceRef(
  evidence: NormalizedEvidenceFile,
): EvidenceMappingSourceRef {
  return {
    sourceKind:
      evidence.sourceKind === "CASE_ATTACHMENT"
        ? "CASE_ATTACHMENT"
        : "LITIGATION_UPLOAD",
    sourceId: evidence.fileId,
    sourceFileId: evidence.fileId,
    snippet: evidence.textSample.slice(0, 120) || evidence.label,
    reason: "업로드 증거자료 후보",
  };
}

function interviewMentionsLoan(texts: string[]): boolean {
  return texts.some((t) => /대여|차용|빌려/.test(t));
}

function interviewMentionsInvestment(texts: string[]): boolean {
  return texts.some((t) => /투자/.test(t));
}

function opponentClaimsInvestment(ctx: EvidenceMappingEngineContext): boolean {
  return ctx.opponentBriefAnalyses.some((o) =>
    [...o.result.newArguments, ...o.result.denials, ...o.result.admissions].some(
      (a) => /투자금|투자/.test(a.text),
    ),
  );
}

function clientClaimsLoan(ctx: EvidenceMappingEngineContext): boolean {
  return (
    interviewMentionsLoan(ctx.interviewTexts) ||
    /대여|차용/.test(ctx.caseSummaryText)
  );
}

export function runEvidenceMappingEngine(
  ctx: EvidenceMappingEngineContext,
): EvidenceMappingResult {
  resetItemCounter();

  const claims = collectClaimCandidates(ctx);
  const claimEvidenceLinks: EvidenceMappingResult["claimEvidenceLinks"] = [];
  const unsupportedClaims: EvidenceMappingResult["unsupportedClaims"] = [];
  const contradictedClaims: EvidenceMappingResult["contradictedClaims"] = [];
  const missingEvidenceRequests: EvidenceMappingResult["missingEvidenceRequests"] =
    [];
  const clientConfirmationQuestions: EvidenceMappingResult["clientConfirmationQuestions"] =
    [];
  const evidenceStrengthCandidates: EvidenceMappingResult["evidenceStrengthCandidates"] =
    [];
  const issueMappingCandidates: EvidenceMappingResult["issueMappingCandidates"] =
    [];
  const supplementRequestDrafts: EvidenceMappingResult["supplementRequestDrafts"] =
    [];

  const linkedClaimKeys = new Set<string>();

  for (const claim of claims) {
    let best: { evidence: NormalizedEvidenceFile; score: number } | null = null;

    for (const evidence of ctx.evidenceFiles) {
      const score = scoreClaimEvidenceMatch(claim, evidence);
      if (score >= 2 && (!best || score > best.score)) {
        best = { evidence, score };
      }
    }

    const claimKey = claim.claimText.slice(0, 80);
    if (best) {
      linkedClaimKeys.add(claimKey);
      const strengthLevel =
        best.score >= 5
          ? "HIGH_CANDIDATE"
          : best.score >= 3
            ? "MEDIUM_CANDIDATE"
            : "LOW_CANDIDATE";

      claimEvidenceLinks.push({
        itemId: nextItemId("cel"),
        itemKind: "CLAIM_EVIDENCE_LINK",
        claimText: claim.claimText.slice(0, 300),
        claimParty: claim.claimParty,
        mappingKind: "SUPPORTS",
        description:
          "이 주장과 연결 가능한 증거 후보가 있습니다. (변호사 검토 필요)",
        linkedEvidenceFileId: best.evidence.fileId,
        linkedEvidenceLabel: best.evidence.label,
        confidence: Math.min(0.95, 0.55 + best.score * 0.08),
        sourceRefs: [
          ...claim.sourceRefs,
          buildEvidenceSourceRef(best.evidence),
        ],
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });

      evidenceStrengthCandidates.push({
        itemId: nextItemId("esc"),
        itemKind: "EVIDENCE_STRENGTH_CANDIDATE",
        claimText: claim.claimText.slice(0, 200),
        evidenceLabel: best.evidence.label,
        strengthLevel,
        description: `증거 연결 강도 후보: ${strengthLevel.replace("_CANDIDATE", "")} (확정 아님)`,
        confidence: Math.min(0.9, 0.5 + best.score * 0.07),
        sourceRefs: [
          ...claim.sourceRefs,
          buildEvidenceSourceRef(best.evidence),
        ],
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    } else {
      unsupportedClaims.push({
        itemId: nextItemId("ucl"),
        itemKind: "UNSUPPORTED_CLAIM",
        claimText: claim.claimText.slice(0, 300),
        claimParty: claim.claimParty,
        description:
          "현재 업로드 자료 기준으로 직접 연결되는 증거를 찾지 못했습니다. 의뢰인 확인 또는 추가자료 요청이 필요합니다.",
        confidence: 0.72,
        sourceRefs: claim.sourceRefs,
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    }
  }

  if (clientClaimsLoan(ctx) && opponentClaimsInvestment(ctx)) {
    const interviewRef: EvidenceMappingSourceRef = ctx.interviewTexts[0]
      ? {
          sourceKind: "INTERVIEW_ANSWER",
          snippet: ctx.interviewTexts[0]!.slice(0, 120),
          reason: "의뢰인 인터뷰 진술 후보",
        }
      : {
          sourceKind: "CASE_SUMMARY",
          snippet: ctx.caseSummaryText.slice(0, 120) || ctx.caseTitle,
          reason: "사건 요약·진술 후보",
        };

    const opponentRef =
      ctx.opponentBriefAnalyses[0]?.result.newArguments[0]?.citation ??
      ctx.opponentBriefAnalyses[0]?.result.denials[0]?.citation;

    contradictedClaims.push({
      itemId: nextItemId("cc"),
      itemKind: "CONTRADICTED_CLAIM",
      claimText: "금전의 법적 성격(대여 vs 투자) 주장 충돌 후보",
      conflictWith: "의뢰인 진술·사건 요약 vs 상대방 서면 주장",
      description:
        "기존 진술과 충돌 가능성이 있습니다. (확정 판단 아님)",
      confidence: 0.84,
      sourceRefs: [
        interviewRef,
        {
          sourceKind: "OPPONENT_BRIEF_13E",
          sourceFileId: ctx.opponentBriefAnalyses[0]?.fileId,
          pageNumber: opponentRef?.pageNumber,
          snippet: opponentRef?.snippet ?? "투자금 주장 후보",
          reason: "상대방 서면 주장 후보",
        },
      ],
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  for (const doc of ctx.documentAnalyses) {
    for (const issue of doc.result.legalIssueCandidates) {
      issueMappingCandidates.push({
        itemId: nextItemId("imc"),
        itemKind: "ISSUE_MAPPING_CANDIDATE",
        issueText: issue.text,
        relatedClaimTexts: doc.result.claims.slice(0, 3).map((c) => c.text),
        description: "쟁점표로 넘길 후보 데이터 (변호사 검토 필요)",
        confidence: issue.confidence,
        sourceRefs: [
          {
            sourceKind: "DOCUMENT_ANALYSIS_13D",
            sourceFileId: doc.fileId,
            pageNumber: issue.citation.pageNumber,
            snippet: issue.citation.snippet,
            reason: issue.citation.reason,
          },
        ],
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    }
  }

  const missingDrafts = [
    {
      text: "계좌이체·입금 내역 추가 업로드 요청 후보",
      reason: "금전 지급·변제 경위 확인",
      keyword: "계좌",
    },
    {
      text: "문자·메신저 대화 원본 추가 업로드 요청 후보",
      reason: "당시 합의·성격 관련 확인",
      keyword: "문자",
    },
    {
      text: "대여·투자 성격 관련 당시 자료 추가 요청 후보",
      reason: "주장 충돌 대조",
      keyword: "투자",
    },
  ];

  for (const draft of missingDrafts) {
    const duplicate = ctx.existingSupplementTitles.some((t) =>
      t.includes(draft.keyword),
    );
    if (duplicate) continue;

    missingEvidenceRequests.push({
      itemId: nextItemId("mer"),
      itemKind: "MISSING_EVIDENCE_REQUEST",
      requestText: draft.text,
      requestReason: draft.reason,
      confidence: 0.78,
      sourceRefs: [
        {
          sourceKind: "CASE_SUMMARY",
          snippet: ctx.caseSummaryText.slice(0, 120) || ctx.caseTitle,
          reason: "사건 맥락 기반 추가 증거 요청 후보",
        },
      ],
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });

    supplementRequestDrafts.push({
      itemId: nextItemId("srd"),
      itemKind: "SUPPLEMENT_REQUEST_DRAFT",
      draftTitle: draft.text.replace(" 요청 후보", ""),
      draftBody: `${draft.text}. ${draft.reason} — 변호사 검토 후 보완요청 전송 여부를 결정해 주세요.`,
      confidence: 0.76,
      sourceRefs: [
        {
          sourceKind: "CASE_SUMMARY",
          snippet: ctx.caseSummaryText.slice(0, 120) || ctx.caseTitle,
          reason: "보완요청 초안 후보",
        },
      ],
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  for (const opp of ctx.opponentBriefAnalyses) {
    for (const q of opp.result.clientConfirmationQuestions.slice(0, 5)) {
      clientConfirmationQuestions.push({
        itemId: nextItemId("ccq"),
        itemKind: "CLIENT_CONFIRMATION_QUESTION",
        questionText: q.text,
        confidence: q.confidence,
        sourceRefs: [
          {
            sourceKind: "OPPONENT_BRIEF_13E",
            sourceFileId: opp.fileId,
            pageNumber: q.citation.pageNumber,
            snippet: q.citation.snippet,
            reason: "13-E 의뢰인 확인 질문 정제",
          },
        ],
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      });
    }
  }

  if (unsupportedClaims.length > 0) {
    clientConfirmationQuestions.push({
      itemId: nextItemId("ccq"),
      itemKind: "CLIENT_CONFIRMATION_QUESTION",
      questionText:
        "증거가 부족한 주장 후보에 대해 추가 설명이나 자료를 제공해 주실 수 있나요? (확인 필요)",
      confidence: 0.75,
      sourceRefs: [unsupportedClaims[0]!.sourceRefs[0]!],
      reviewStatus: "NEEDS_LAWYER_REVIEW",
    });
  }

  const result: EvidenceMappingResult = {
    version: EVIDENCE_MAPPING_VERSION,
    caseId: ctx.caseId,
    mappingStatus: "AI_MAPPED",
    inputSummary: ctx.inputCounts,
    claimEvidenceLinks,
    unsupportedClaims,
    contradictedClaims,
    missingEvidenceRequests,
    clientConfirmationQuestions,
    evidenceStrengthCandidates,
    issueMappingCandidates,
    supplementRequestDrafts,
  };

  return validateEvidenceMappingResult(result);
}
