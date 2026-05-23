import { z } from "zod";
import {
  LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS,
  assertNoProhibitedJsonKeys,
  validateCanonicalSourceRefs,
} from "@/lib/gongbuho/legal-knowledge-pipeline-gates";

const allowedCanonicalSourceKinds = [
  "STATUTE",
  "PRECEDENT",
  "ADMIN_GUIDANCE",
  "OFFICIAL_COMMENTARY",
] as const;

export const legalKnowledgeCanonicalSourceRefSchema = z.object({
  sourceKind: z.enum(allowedCanonicalSourceKinds),
  citationKey: z.string().min(1),
  officialUrl: z.string().url().nullable().optional(),
  summaryPointer: z.string().min(1),
  verifiedAt: z.string().optional(),
  verifiedByUserId: z.string().optional(),
});

export const legalKnowledgeStructureHintsSchema = z.object({
  suggestedQuestionThemes: z.array(z.string()).default([]),
  suggestedOutputSections: z.array(z.string()).default([]),
  suggestedForbiddenThemes: z.array(z.string()).default([]),
});

export const legalKnowledgeIntakeComplianceSchema = z.object({
  compilerPolicyVersion: z.literal("2026-05-23"),
  noRawUgcStored: z.literal(true),
  intakeMethod: z.enum(["MANUAL_FORM", "AGGREGATE_IMPORT", "INTERNAL_ETL"]),
  attestedByUserId: z.string().nullable().optional(),
  attestedAt: z.string().optional(),
  prohibitedFieldScan: z.enum(["PASS", "FAIL"]).nullable().optional(),
});

export const legalKnowledgeQuerySignatureSchema = z.object({
  normalizedKeyword: z.string().min(1),
  keywordHash: z.string().optional(),
  locale: z.string().min(1),
});

export const legalKnowledgeQuestionTypeSchema = z.object({
  questionTypeCode: z.string().min(1),
  taxonomyVersion: z.string().min(1),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const legalKnowledgeCaseTypeMappingSchema = z.object({
  mappedCaseType: z.string().min(1).nullable(),
  mappingRationale: z.string().min(1),
  mappingConfidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  suggestedGongbuhoCode: z.string().nullable().optional(),
});

export const createLegalKnowledgeIntakeBodySchema = z
  .object({
    signalSource: z.string().min(1),
    observationWindow: z.object({
      from: z.string().min(1),
      to: z.string().min(1),
    }),
    querySignature: legalKnowledgeQuerySignatureSchema,
    questionType: legalKnowledgeQuestionTypeSchema,
    caseTypeMapping: legalKnowledgeCaseTypeMappingSchema,
    suggestedGongbuhoCode: z.string().nullable().optional(),
    demandStrength: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    intakeCompliance: legalKnowledgeIntakeComplianceSchema,
    operatorNote: z.string().nullable().optional(),
    status: z
      .enum(["DRAFT", "MAPPING_PENDING", "READY_FOR_RESEARCH"])
      .optional(),
  })
  .superRefine((val, ctx) => {
    try {
      assertNoProhibitedJsonKeys(val);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "금지 필드(UGC·원문)가 포함되어 있습니다.",
      });
    }
    if (
      val.status === "READY_FOR_RESEARCH" &&
      !val.caseTypeMapping.mappedCaseType
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "READY_FOR_RESEARCH에는 mappedCaseType이 필요합니다.",
        path: ["caseTypeMapping", "mappedCaseType"],
      });
    }
  });

export const updateLegalKnowledgeIntakeStatusBodySchema = z.object({
  status: z.enum([
    "DRAFT",
    "MAPPING_PENDING",
    "READY_FOR_RESEARCH",
    "REJECTED",
    "ARCHIVED",
  ]),
});

export const createLegalKnowledgeResearchBriefBodySchema = z
  .object({
    packetIntent: z.enum(["NEW_PACKET", "EXTEND_EXISTING"]),
    targetGongbuhoCode: z.string().nullable().optional(),
    canonicalSourceRefs: z.array(legalKnowledgeCanonicalSourceRefSchema).min(1),
    legalIssueOutline: z.string().min(1),
    structureHints: legalKnowledgeStructureHintsSchema,
  })
  .superRefine((val, ctx) => {
    const result = validateCanonicalSourceRefs(val.canonicalSourceRefs);
    if (!result.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.message,
      });
    }
    try {
      assertNoProhibitedJsonKeys(val);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "금지 필드(UGC·원문)가 포함되어 있습니다.",
      });
    }
  });

export const updateLegalKnowledgeResearchBriefBodySchema = z
  .object({
    canonicalSourceRefs: z
      .array(legalKnowledgeCanonicalSourceRefSchema)
      .min(1)
      .optional(),
    legalIssueOutline: z.string().min(1).optional(),
    structureHints: legalKnowledgeStructureHintsSchema.optional(),
    packetIntent: z.enum(["NEW_PACKET", "EXTEND_EXISTING"]).optional(),
    targetGongbuhoCode: z.string().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.canonicalSourceRefs) {
      const result = validateCanonicalSourceRefs(val.canonicalSourceRefs);
      if (!result.ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.message,
        });
      }
    }
    try {
      assertNoProhibitedJsonKeys(val);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "금지 필드(UGC·원문)가 포함되어 있습니다.",
      });
    }
  });

export const recordLegalKnowledgeLawyerReviewBodySchema = z
  .object({
    decision: z.enum([
      "APPROVE_FOR_PACKET_DRAFT",
      "REQUEST_BRIEF_REVISION",
      "REJECT",
    ]),
    reviewNotes: z.string().min(1),
    highRiskFlags: z.array(z.string()).optional(),
    rejectionReasonCode: z.string().nullable().optional(),
    noUgcOrPiiInReviewNotes: z.literal(true),
  })
  .superRefine((val, ctx) => {
    try {
      assertNoProhibitedJsonKeys(val);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "검수 메모에 금지 필드가 포함되어 있습니다.",
      });
    }
  });

export const compileLegalKnowledgePacketDraftBodySchema = z.object({
  code: z.string().min(1),
  version: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().min(1).default("AI법친"),
});

/** verify:gongbuho — forbidden marker export for static scan */
export const LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS_VERIFY =
  LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS;
