import fs from "node:fs";
import path from "node:path";
import { assertPredeployMasterOrGate } from "./predeploy-gate-assertions.mjs";

/**
 * Shared Client Collaboration Portal Full RC block (Phase 15-G).
 * Used by verify:aibeopchin-client-collaboration-portal-full-rc.
 */
export function createClientCollaborationPortalFullRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Client Collaboration Portal Full RC file: ${relativePath}`);
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

  return { readFile, assertFileExists, assertIncludes };
}

const PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-client-supplement-tracking-phase15a",
  "verify:aibeopchin-court-schedule-client-reminder-phase15e",
  "verify:aibeopchin-secure-document-kakao-notice-phase15f",
];

const MIGRATION_DIRS = [
  "20260525140000_client_portal_collaboration_phase15a",
  "20260525150000_client_portal_phase15bc_intake_chat",
  "20260525160000_client_portal_phase15c2_review_gate",
  "20260525170000_litigation_deadline_client_reminder_phase15d",
  "20260525180000_secure_document_delivery_phase15f",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-LAWYER-COLLABORATION-PORTAL-PHASE15A",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-FILE-UPLOAD-PHASE15B",
  "EVIDENCE-20260524-AIBEOPCHIN-CASE-CONVERSATION-PHASE15C",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-STATEMENT-REVIEW-GATE-PHASE15C2",
  "EVIDENCE-20260524-AIBEOPCHIN-COMMAND-CENTER-CHAT-ADOPT-PHASE15C3",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15D-RC-PREDEPLOY-CLOSURE",
  "EVIDENCE-20260524-AIBEOPCHIN-COURT-SCHEDULE-CLIENT-REMINDER-PHASE15E",
  "EVIDENCE-20260524-AIBEOPCHIN-SECURE-DOCUMENT-KAKAO-NOTICE-PHASE15F",
];

const FULL_RC_API_ROUTES = [
  "src/app/api/client/cases/route.ts",
  "src/app/api/client/cases/[caseId]/supplement-requests/[requestId]/submit/route.ts",
  "src/app/api/client/cases/[caseId]/files/upload/route.ts",
  "src/app/api/client/cases/[caseId]/submissions/free-upload/route.ts",
  "src/app/api/client/cases/[caseId]/messages/route.ts",
  "src/app/api/client/cases/[caseId]/shared-documents/route.ts",
  "src/app/api/client/cases/[caseId]/shared-documents/[shareId]/route.ts",
  "src/app/api/client/cases/[caseId]/shared-documents/[shareId]/mark-viewed/route.ts",
  "src/app/api/client/cases/[caseId]/deadlines/route.ts",
  "src/app/api/cases/[caseId]/client-submissions/route.ts",
  "src/app/api/cases/[caseId]/messages/[messageId]/adopt-record/route.ts",
  "src/app/api/cases/[caseId]/deadlines/route.ts",
  "src/app/api/cases/[caseId]/deadlines/[deadlineId]/notify-client/route.ts",
  "src/app/api/cases/[caseId]/shared-documents/route.ts",
  "src/app/api/cases/[caseId]/shared-documents/[shareId]/send-kakao/route.ts",
];

export function runClientCollaborationPortalFullRcBlock(
  execSync,
  root,
  label = "verify:client-collaboration-portal-full-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createClientCollaborationPortalFullRcFsHelpers(root);

  for (const script of PHASE_VERIFY_SCRIPTS) {
    console.log(`[${label}] running npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  assertFileExists(
    "docs/client-portal/AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_FULL_RC_LOCK_SUMMARY.md",
  );
  assertFileExists(
    "docs/client-portal/AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_CLOSURE_CHECKLIST.md",
  );
  assertFileExists("src/features/client-portal/client-collaboration-portal-full-rc-lock.ts");
  assertFileExists("src/features/client-portal/client-collaboration-portal-full-rc-lock.test.ts");

  for (const route of FULL_RC_API_ROUTES) {
    assertFileExists(route);
  }

  for (const dir of MIGRATION_DIRS) {
    const migrationPath = path.join(root, "prisma/migrations", dir, "migration.sql");
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Missing Client Collaboration Portal Full RC migration: ${dir}`);
    }
  }

  assertIncludes("src/features/client-portal/client-collaboration-portal-full-rc-lock.ts", [
    "CLIENT_COLLABORATION_PORTAL_FULL_RC_LOCK_MARKER_PHASE15G",
    "CLIENT_COLLABORATION_PORTAL_FULL_RC_MIGRATION_DIRS",
    "CLIENT_COLLABORATION_PORTAL_FULL_RC_SAFETY_PRINCIPLES",
    "EXTERNAL_MESSAGE_NO_RAW_FILE_ATTACHMENT",
  ]);

  assertIncludes("src/features/client-portal/client-portal.schema.ts", [
    'CLIENT_PORTAL_VERSION = "15-G.1"',
    "nextCourtDeadlineDisplay",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.schema.ts", [
    'LITIGATION_COMMAND_CENTER_VERSION = "15-G.1"',
    "sharedDocuments",
    "conversationMessages",
  ]);

  assertIncludes("src/features/client-portal/client-portal-review-candidate.service.ts", [
    "assertPortalReviewConfirmedForDownstream",
    "NEEDS_LAWYER_REVIEW",
    "LAWYER_CONFIRMED",
  ]);

  assertIncludes("src/features/litigation-deadline-reminder/litigation-deadline-reminder.service.ts", [
    "SKIPPED_NO_CONSENT",
    "getOrCreateClientNotificationPreference",
  ]);

  assertIncludes("src/features/secure-document-delivery/secure-document-delivery.service.ts", [
    "containsFileAttachment: false",
    "ExternalMessageLog",
    "documentShareNoticeEnabled",
  ]);

  assertIncludes("src/components/client-portal/client-portal-client.tsx", [
    "자료 제출",
    "사건 대화",
    "다음 재판기일",
    "보안 열람",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "lcc-section-deadlines",
    "lcc-section-shared-documents",
    "CommandCenterConversationRow",
    "의뢰인에게 알림 예약",
    "카카오 알림톡",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tagClosure =
    "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15G-FULL-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tagClosure)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagClosure}`);
  }

  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-client-collaboration-portal-full-rc")) {
    throw new Error("package.json must define verify:aibeopchin-client-collaboration-portal-full-rc");
  }

  const predeploy = readFile("scripts/predeploy-check.ts");
  assertPredeployMasterOrGate(
    predeploy,
    "verify:aibeopchin-client-collaboration-portal-full-rc",
    "Phase 15-G Full RC",
  );

  console.log(`[${label}] running Full RC Vitest bundles …`);
  for (const target of [
    "src/features/client-portal",
    "src/features/litigation-deadline-reminder",
    "src/features/secure-document-delivery",
  ]) {
    execSync(`npm run test -- ${target}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] running client-collaboration-portal-full-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/client-portal/client-collaboration-portal-full-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
