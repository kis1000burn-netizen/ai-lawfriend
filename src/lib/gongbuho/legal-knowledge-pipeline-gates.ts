/** Forbidden canonical source kinds — Pipeline Spec §4.2 · verify:gongbuho marker SSOT */
export const LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS = [
  "BLOG",
  "CAFE",
  "KNOWLEDGE_IN",
  "NAVER_SNIPPET",
  "UNVERIFIED_URL",
] as const;

export type LegalKnowledgeForbiddenSourceKind =
  (typeof LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS)[number];

/** Intake Spec §5.1 + Pipeline §5.2 prohibited JSON keys */
export const LEGAL_KNOWLEDGE_PROHIBITED_JSON_KEYS = [
  "rawSnippet",
  "rawBody",
  "rawTitle",
  "htmlBody",
  "sourceUrl",
  "naverDocumentId",
  "knowledgeInAnswer",
  "blogPostContent",
  "cafePostContent",
  "scrapedHtml",
  "naverSearchResult",
  "knowledgeInQuestion",
  "blogExcerpt",
] as const;

export const LEGAL_KNOWLEDGE_COMPILER_PIPELINE_VERSION = "2026-05-23" as const;

export type CanonicalSourceRefInput = {
  sourceKind: string;
  citationKey: string;
  officialUrl?: string | null;
  summaryPointer: string;
  verifiedAt?: string;
  verifiedByUserId?: string;
};

export function scanProhibitedJsonKeys(
  value: unknown,
  path = "",
): string[] {
  const hits: string[] = [];

  if (value === null || value === undefined) return hits;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      hits.push(...scanProhibitedJsonKeys(item, `${path}[${index}]`));
    });
    return hits;
  }

  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const keyPath = path ? `${path}.${key}` : key;
      if (
        LEGAL_KNOWLEDGE_PROHIBITED_JSON_KEYS.includes(
          key as (typeof LEGAL_KNOWLEDGE_PROHIBITED_JSON_KEYS)[number],
        ) ||
        key.endsWith("_fullText") ||
        key.endsWith("_originalContent")
      ) {
        hits.push(keyPath);
      }
      hits.push(...scanProhibitedJsonKeys(nested, keyPath));
    }
  }

  return hits;
}

export function assertNoProhibitedJsonKeys(value: unknown): void {
  const hits = scanProhibitedJsonKeys(value);
  if (hits.length > 0) {
    throw new Error(
      `LEGAL_KNOWLEDGE_PROHIBITED_FIELD:${hits.slice(0, 5).join(",")}`,
    );
  }
}

export function validateCanonicalSourceRefs(
  refs: CanonicalSourceRefInput[],
): { ok: true } | { ok: false; code: string; message: string } {
  if (!Array.isArray(refs) || refs.length === 0) {
    return {
      ok: false,
      code: "LEGAL_KNOWLEDGE_CANONICAL_SOURCES_REQUIRED",
      message: "canonicalSourceRefs는 1건 이상 필요합니다.",
    };
  }

  for (const ref of refs) {
    if (
      LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS.includes(
        ref.sourceKind as LegalKnowledgeForbiddenSourceKind,
      )
    ) {
      return {
        ok: false,
        code: "LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KIND",
        message: `금지된 sourceKind: ${ref.sourceKind}`,
      };
    }
    if (!ref.citationKey?.trim() || !ref.summaryPointer?.trim()) {
      return {
        ok: false,
        code: "LEGAL_KNOWLEDGE_INVALID_CANONICAL_REF",
        message: "citationKey와 summaryPointer는 필수입니다.",
      };
    }
  }

  return { ok: true };
}

export function assertIntakeReadyForResearch(status: string): void {
  if (status !== "READY_FOR_RESEARCH") {
    throw new Error("LEGAL_KNOWLEDGE_INTAKE_NOT_READY_FOR_RESEARCH");
  }
}

export function assertIntakeComplianceNoRawUgc(
  intakeCompliance: unknown,
): void {
  if (
    typeof intakeCompliance !== "object" ||
    intakeCompliance === null ||
    (intakeCompliance as Record<string, unknown>).noRawUgcStored !== true
  ) {
    throw new Error("LEGAL_KNOWLEDGE_NO_RAW_UGC_REQUIRED");
  }
}

export function assertBriefReadyForLawyerReview(status: string): void {
  if (status !== "READY_FOR_LAWYER_REVIEW") {
    throw new Error("LEGAL_KNOWLEDGE_BRIEF_NOT_READY_FOR_REVIEW");
  }
}

export function assertLawyerApprovedForDraft(decision: string): void {
  if (decision !== "APPROVE_FOR_PACKET_DRAFT") {
    throw new Error("LEGAL_KNOWLEDGE_LAWYER_APPROVAL_REQUIRED");
  }
}

export function assertReviewNotAlreadyCompiled(gongbuhoPacketId: string | null): void {
  if (gongbuhoPacketId) {
    throw new Error("LEGAL_KNOWLEDGE_PACKET_ALREADY_COMPILED");
  }
}
