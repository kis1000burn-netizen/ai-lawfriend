import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 15 file: ${relativePath}`);
  }
}

function assertIncludes(relativePath, terms) {
  const content = readFile(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

function main() {
  const required = [
    "prisma/migrations/20260525140000_client_portal_collaboration_phase15a/migration.sql",
    "prisma/migrations/20260525150000_client_portal_phase15bc_intake_chat/migration.sql",
    "src/features/client-portal/client-portal.schema.ts",
    "src/features/client-portal/client-portal.repository.ts",
    "src/features/client-portal/client-portal.service.ts",
    "src/features/client-portal/client-submission.service.ts",
    "prisma/migrations/20260525160000_client_portal_phase15c2_review_gate/migration.sql",
    "src/features/client-portal/client-portal-review-candidate.service.ts",
    "src/features/client-portal/client-submission-intake.service.ts",
    "src/features/client-portal/client-submission-status.portal.ts",
    "src/features/client-portal/case-conversation-adopt.service.ts",
    "src/features/client-portal/case-conversation.service.ts",
    "src/components/client-portal/client-portal-client.tsx",
    "src/app/(protected)/client/cases/[caseId]/page.tsx",
    "src/app/api/client/cases/route.ts",
    "src/app/api/client/cases/[caseId]/supplement-requests/[requestId]/submit/route.ts",
    "src/app/api/client/cases/[caseId]/files/upload/route.ts",
    "src/app/api/client/cases/[caseId]/submissions/free-upload/route.ts",
    "src/app/api/client/cases/[caseId]/messages/route.ts",
    "src/app/api/cases/[caseId]/client-submissions/route.ts",
    "src/app/api/cases/[caseId]/client-submissions/[submissionId]/receive/route.ts",
    "src/app/api/cases/[caseId]/client-submissions/[submissionId]/start-review/route.ts",
    "src/app/api/cases/[caseId]/messages/route.ts",
    "src/app/api/cases/[caseId]/messages/[messageId]/adopt-record/route.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model CaseClientPortalAccess",
    "model ClientSubmission",
    "model ClientSubmissionFile",
    "model CaseConversationThread",
    "model CaseConversationMessage",
    "model CaseMessageAttachment",
    "model CaseSharedDocument",
  ]);

  assertIncludes("src/features/client-portal/client-portal.schema.ts", [
    "PHASE15A_CLIENT_LAWYER_COLLABORATION_PORTAL",
    'CLIENT_PORTAL_VERSION = "15-G.1"',
    "pipelineLabelForClientSubmissionFile",
  ]);

  assertIncludes("src/features/client-portal/client-submission-status.portal.ts", [
    "PHASE15B_CLIENT_SUBMISSION_STATUS",
    "ACCEPTED_AS_CASE_RECORD",
    "CLIENT_SUBMISSION_LAWYER_PENDING_STATUSES",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.schema.ts", [
    'LITIGATION_COMMAND_CENTER_VERSION = "15-G.1"',
    "clientSubmissionPendingCount",
    "caseUnreadMessageCount",
    "clientSubmissions",
    "conversationMessages",
  ]);

  assertIncludes("src/components/client-portal/client-portal-client.tsx", [
    "phase15a-client-lawyer-collaboration-portal-client",
    "client-portal-guide-character",
    "client-portal-tab-",
    "client-portal-supplement-submit",
    "client-portal-free-upload",
    "자료 제출",
    "사건 대화",
  ]);

  assertIncludes("src/features/client-portal/client-portal-review-candidate.service.ts", [
    "PHASE15C2_CLIENT_STATEMENT_REVIEW_GATE",
    "enqueueChatMessageBodyReviewCandidate",
    "enqueueChatMessageAttachmentReviewCandidate",
    "enqueueClientSubmissionReviewCandidates",
    "buildPortalReviewItemsFromStoredDecisions",
    "assertPortalReviewConfirmedForDownstream",
    "client_statement",
  ]);

  assertIncludes("src/features/document-intelligence/document-intelligence-review.schema.ts", [
    'DOCUMENT_INTELLIGENCE_REVIEW_VERSION = "13-G.2"',
    "PHASE_15B",
    "PHASE_15C",
    "client_statement",
    "CLIENT_STATEMENT",
  ]);

  assertIncludes("src/features/client-portal/case-conversation-adopt.service.ts", [
    "PHASE15C3_COMMAND_CENTER_CHAT_ADOPT",
    "enqueueChatMessageBodyReviewCandidate",
    "NEEDS_LAWYER_REVIEW",
  ]);

  assertIncludes("prisma/schema.prisma", [
    "PHASE_15B",
    "PHASE_15C",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "lcc-section-client-submissions",
    "lcc-section-conversation",
    "CommandCenterConversationRow",
    "사건기록 후보로 채택",
    "증거 후보로 채택",
    "lcc-link-conversation-review-queue",
    "의뢰인 제출자료",
    "ClientSubmissionReviewRow",
    "채팅 미확인",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-action-feed.ts", [
    "CASE_CONVERSATION_MESSAGE_ADOPTED",
    "CASE_CONVERSATION_ATTACHMENT_ADOPTED",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [
    "[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-LAWYER-COLLABORATION-PORTAL-PHASE15A]",
    "[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-FILE-UPLOAD-PHASE15B]",
    "[EVIDENCE-20260524-AIBEOPCHIN-CASE-CONVERSATION-PHASE15C]",
    "[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-STATEMENT-REVIEW-GATE-PHASE15C2]",
    "[EVIDENCE-20260524-AIBEOPCHIN-COMMAND-CENTER-CHAT-ADOPT-PHASE15C3]",
  ]) {
    if (!evidence.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing tag: ${tag}`);
    }
  }

  console.log("verify:aibeopchin-client-supplement-tracking-phase15a — PASS");
}

main();
