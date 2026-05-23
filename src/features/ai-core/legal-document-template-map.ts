/**
 * Phase 8-C — Legal document type mapping (ai-core SSOT).
 */
import type { LegalDocumentType } from "@prisma/client";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";

export function mapLegalDocumentTypeToTemplateType(
  type: LegalDocumentType | string,
): DocumentTemplateType {
  switch (type) {
    case "STATEMENT":
      return "STATEMENT";
    case "OPINION":
      return "LEGAL_OPINION";
    case "CONSULT_NOTE":
      return "CONSULTATION_NOTE";
    default:
      return "STATEMENT";
  }
}
