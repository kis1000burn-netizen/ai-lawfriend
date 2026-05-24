/**
 * Phase 15-B — Queue client-uploaded files into Document Intelligence intake (extract).
 * Files remain non-confirmed case material until lawyer ACCEPTED + review queue confirm.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { extractLitigationDocumentService } from "@/features/document-intelligence/document-extraction.service";
import { writeAuditLog } from "@/lib/audit-log";
import { CLIENT_PORTAL_AUDIT_ENTITY_TYPE } from "./client-portal-audit";

export const PHASE15B_CLIENT_SUBMISSION_INTAKE_MARKER =
  "PHASE15B_CLIENT_SUBMISSION_INTAKE" as const;

export async function queueClientSubmissionIntakePipeline(params: {
  actor: SessionUser;
  caseId: string;
  submissionId: string;
  uploadedFileIds: string[];
  trigger: "RECEIVED" | "UNDER_REVIEW" | "ACCEPTED";
}) {
  const results: Array<{ fileId: string; ok: boolean; error?: string }> = [];

  for (const fileId of params.uploadedFileIds) {
    try {
      await extractLitigationDocumentService(params.actor, params.caseId, fileId);
      results.push({ fileId, ok: true });
    } catch (error) {
      results.push({
        fileId,
        ok: false,
        error: error instanceof Error ? error.message : "extract failed",
      });
    }
  }

  await writeAuditLog({
    actorUserId: params.actor.id,
    action: "CLIENT_SUBMISSION_INTAKE_PIPELINE",
    entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
    entityId: params.submissionId,
    message: "의뢰인 제출 자료 — Document Intelligence extract 큐",
    metadata: {
      caseId: params.caseId,
      trigger: params.trigger,
      results,
    },
  });

  return results;
}
