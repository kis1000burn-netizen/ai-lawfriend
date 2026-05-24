/**
 * Phase 13-C — rule-based document classifier (taskType: LEGAL_FILE_CLASSIFY).
 * Uses extracted page text + filename — no legal content analysis.
 */
import type { LitigationDocumentType } from "./document-intelligence-engine.schema";
import type { ExtractedPage } from "./document-extraction.schema";
import type { LitigationQualityFlag } from "./document-extraction-quality.types";
import {
  DOCUMENT_INTELLIGENCE_CLASSIFICATION_VERSION,
  getRecommendedTasksForDocumentType,
  type ClassificationCitation,
  type DocumentClassificationResult,
  type LitigationAnalysisReadiness,
  type LitigationSensitivityLevel,
  type LitigationSourceParty,
  type LitigationStage,
} from "./document-classification.schema";
import { validateDocumentClassificationResult } from "./document-classification-validator";

export const PHASE13C_DOCUMENT_CLASSIFICATION_CLASSIFIER_MARKER =
  "PHASE13C_DOCUMENT_CLASSIFICATION_CLASSIFIER" as const;

type ClassifyInput = {
  originalFileName: string;
  mimeType: string;
  pages: ExtractedPage[];
  extractionStatus: string;
  extractionQualityScore: number | null;
  qualityFlags: LitigationQualityFlag[];
};

type PatternRule = {
  documentType: LitigationDocumentType;
  filenamePatterns: RegExp[];
  textPatterns: RegExp[];
  weight: number;
};

const PATTERN_RULES: PatternRule[] = [
  {
    documentType: "OPPONENT_ANSWER",
    filenamePatterns: [/답변서/i, /answer/i],
    textPatterns: [/피고는\s+원고/i, /답변서/i, /청구를\s+다투/i],
    weight: 1,
  },
  {
    documentType: "OPPONENT_PREPARATORY_BRIEF",
    filenamePatterns: [/준비서면/i, /preparatory/i],
    textPatterns: [/준비서면/i, /변론준비/i, /서면\s*제출/i],
    weight: 1.05,
  },
  {
    documentType: "OPPONENT_BRIEF",
    filenamePatterns: [/brief/i, /서면/i],
    textPatterns: [/서면/i],
    weight: 0.95,
  },
  {
    documentType: "OPPONENT_EVIDENCE_OPINION",
    filenamePatterns: [/증거신청/i, /증거의견/i, /evidence/i],
    textPatterns: [/증거\s*신청/i, /증거\s*의견/i, /증거\s*조사/i],
    weight: 1.05,
  },
  {
    documentType: "COURT_CORRECTION_ORDER",
    filenamePatterns: [/보정명령/i, /보정/i],
    textPatterns: [/보\s*정\s*명\s*령/i, /보정하\s*라/i, /보정할\s*것/i],
    weight: 1.1,
  },
  {
    documentType: "COURT_CLARIFICATION_ORDER",
    filenamePatterns: [/석명명령/i, /석명/i],
    textPatterns: [/석\s*명\s*명\s*령/i, /석명하\s*라/i],
    weight: 1.1,
  },
  {
    documentType: "COURT_HEARING_NOTICE",
    filenamePatterns: [/기일통지/i, /변론기일/i, /기일/i],
    textPatterns: [/변론기일/i, /기일\s*통지/i, /출석하\s*라/i],
    weight: 1,
  },
  {
    documentType: "JUDGMENT",
    filenamePatterns: [/판결문/i, /judgment/i],
    textPatterns: [/판\s*결/i, /주\s*문/i, /이\s*유/i],
    weight: 1.1,
  },
  {
    documentType: "COURT_DECISION",
    filenamePatterns: [/결정문/i, /결정/i],
    textPatterns: [/결\s*정/i, /주\s*문/i],
    weight: 0.9,
  },
  {
    documentType: "FINANCIAL_EVIDENCE",
    filenamePatterns: [/계좌/i, /거래내역/i, /bank/i, /financial/i],
    textPatterns: [/입금/i, /출금/i, /잔액/i, /계좌번호/i],
    weight: 0.85,
  },
  {
    documentType: "MESSAGING_EVIDENCE",
    filenamePatterns: [/카카오/i, /kakao/i, /대화/i, /chat/i],
    textPatterns: [/카카오톡/i, /대화/i, /메시지/i],
    weight: 0.85,
  },
  {
    documentType: "CONTRACT_EVIDENCE",
    filenamePatterns: [/계약서/i, /contract/i],
    textPatterns: [/계약/i, /당사자/i, /갑\s*·?\s*을/i],
    weight: 0.85,
  },
  {
    documentType: "NOTICE_DEMAND_LETTER",
    filenamePatterns: [/내용증명/i, /최고/i],
    textPatterns: [/내용증명/i, /최고/i, /통지/i],
    weight: 0.85,
  },
  {
    documentType: "STATEMENT_TRANSCRIPT",
    filenamePatterns: [/녹취/i, /transcript/i],
    textPatterns: [/녹취/i, /통화/i, /진술/i],
    weight: 0.85,
  },
  {
    documentType: "SETTLEMENT_DRAFT",
    filenamePatterns: [/합의/i, /settlement/i],
    textPatterns: [/합의/i, /화해/i],
    weight: 0.85,
  },
  {
    documentType: "OPPONENT_MOTION",
    filenamePatterns: [/신청서/i, /motion/i],
    textPatterns: [/신청/i, /가처분/i, /보전/i],
    weight: 0.8,
  },
  {
    documentType: "SMS_EVIDENCE",
    filenamePatterns: [/문자/i, /sms/i],
    textPatterns: [/문자/i, /SMS/i],
    weight: 0.8,
  },
  {
    documentType: "PHOTO_EVIDENCE",
    filenamePatterns: [/사진/i, /photo/i, /\.(jpg|jpeg|png|webp)$/i],
    textPatterns: [],
    weight: 0.7,
  },
];

function normalizeSearchText(input: ClassifyInput): string {
  const pageText = input.pages
    .slice(0, 2)
    .map((p) => p.text)
    .join("\n");
  return `${input.originalFileName}\n${pageText}`.toLowerCase();
}

function scoreRule(rule: PatternRule, fileName: string, bodyText: string): number {
  let score = 0;
  for (const pattern of rule.filenamePatterns) {
    if (pattern.test(fileName)) score += 0.45 * rule.weight;
  }
  for (const pattern of rule.textPatterns) {
    if (pattern.test(bodyText)) score += 0.55 * rule.weight;
  }
  return score;
}

function inferDocumentType(input: ClassifyInput): {
  documentType: LitigationDocumentType;
  confidence: number;
  citations: ClassificationCitation[];
} {
  const fileName = input.originalFileName.toLowerCase();
  const bodyText = input.pages.map((p) => p.text).join("\n");

  let bestType: LitigationDocumentType = "OTHER";
  let bestScore = 0;
  let bestRule: PatternRule | null = null;

  for (const rule of PATTERN_RULES) {
    const score = scoreRule(rule, fileName, bodyText);
    if (score > bestScore) {
      bestScore = score;
      bestType = rule.documentType;
      bestRule = rule;
    }
  }

  if (input.mimeType.startsWith("image/") && bestScore < 0.5) {
    bestType = "PHOTO_EVIDENCE";
    bestScore = 0.55;
  }

  const confidence = Math.min(0.99, Math.max(0.35, bestScore || 0.4));

  const citations: ClassificationCitation[] = [];
  const firstPage = input.pages[0];
  if (firstPage?.text.trim()) {
    const snippet = firstPage.text.trim().slice(0, 120);
    citations.push({
      pageNumber: firstPage.pageNumber,
      textSnippet: snippet,
      reason: bestRule
        ? `${bestRule.documentType} 유형 판단 근거 (파일명·본문 패턴)`
        : "문서 유형 미확정 — 기본 OTHER",
    });
  } else if (bestRule?.filenamePatterns.some((p) => p.test(fileName))) {
    citations.push({
      pageNumber: 1,
      textSnippet: input.originalFileName,
      reason: "파일명 기반 문서 유형 추정 (본문 없음)",
    });
  }

  return { documentType: bestType, confidence, citations };
}

function inferSourceParty(documentType: LitigationDocumentType): LitigationSourceParty {
  if (documentType.startsWith("OPPONENT_")) return "OPPONENT";
  if (documentType.startsWith("COURT_") || documentType === "JUDGMENT") return "COURT";
  if (
    documentType.endsWith("_EVIDENCE") ||
    documentType === "NOTICE_DEMAND_LETTER" ||
    documentType === "STATEMENT_TRANSCRIPT"
  ) {
    return "CLIENT";
  }
  if (documentType === "SETTLEMENT_DRAFT") return "THIRD_PARTY";
  return "UNKNOWN";
}

function inferLitigationStage(documentType: LitigationDocumentType): LitigationStage {
  switch (documentType) {
    case "OPPONENT_ANSWER":
      return "ANSWER_RECEIVED";
    case "OPPONENT_BRIEF":
    case "OPPONENT_PREPARATORY_BRIEF":
    case "OPPONENT_EVIDENCE_OPINION":
    case "OPPONENT_MOTION":
      return "PREPARATORY_BRIEF";
    case "JUDGMENT":
    case "COURT_JUDGMENT_NOTICE":
      return "JUDGMENT";
    case "COURT_CORRECTION_ORDER":
    case "COURT_CLARIFICATION_ORDER":
    case "COURT_HEARING_NOTICE":
    case "COURT_DECISION":
      return "PREPARATORY_BRIEF";
    default:
      return "UNKNOWN";
  }
}

function inferSensitivity(
  documentType: LitigationDocumentType,
): LitigationSensitivityLevel {
  if (
    documentType.startsWith("OPPONENT_") ||
    documentType.startsWith("COURT_") ||
    documentType === "JUDGMENT" ||
    documentType === "SETTLEMENT_DRAFT"
  ) {
    return "LAWYER_ONLY";
  }
  if (
    documentType === "FINANCIAL_EVIDENCE" ||
    documentType === "MESSAGING_EVIDENCE" ||
    documentType === "SMS_EVIDENCE"
  ) {
    return "SENSITIVE";
  }
  return "GENERAL";
}

function inferAnalysisReadiness(input: ClassifyInput): LitigationAnalysisReadiness {
  if (input.extractionStatus !== "EXTRACTED") return "UNSUPPORTED";
  if (input.qualityFlags.includes("ENCRYPTED")) return "ENCRYPTED";
  if (input.qualityFlags.includes("OCR_NOT_CONFIGURED")) return "NEEDS_OCR";
  if (
    input.qualityFlags.includes("EMPTY_TEXT") ||
    input.qualityFlags.includes("PARTIAL_OCR")
  ) {
    return "LOW_QUALITY";
  }
  const score = input.extractionQualityScore ?? 0;
  if (score < 0.45) return "LOW_QUALITY";
  if (input.pages.every((p) => !p.text.trim())) return "NEEDS_OCR";
  return "READY";
}

export function classifyLitigationDocument(input: ClassifyInput): DocumentClassificationResult {
  const { documentType, confidence, citations } = inferDocumentType(input);
  const analysisReadiness = inferAnalysisReadiness(input);

  let adjustedConfidence = confidence;
  if (analysisReadiness !== "READY") {
    adjustedConfidence = Math.min(confidence, 0.75);
  }

  const result: DocumentClassificationResult = {
    version: DOCUMENT_INTELLIGENCE_CLASSIFICATION_VERSION,
    classificationStatus: "CLASSIFIED",
    documentType,
    sourceParty: inferSourceParty(documentType),
    litigationStage: inferLitigationStage(documentType),
    sensitivityLevel: inferSensitivity(documentType),
    analysisReadiness,
    confidence: Math.round(adjustedConfidence * 100) / 100,
    recommendedNextTasks: getRecommendedTasksForDocumentType(documentType),
    citations,
  };

  return validateDocumentClassificationResult(result);
}
