import fs from "node:fs";
import path from "node:path";
import { predeployIncludesMasterOrGate } from "./predeploy-gate-assertions.mjs";

/**
 * Shared Client Collaboration Portal RC block (Phase 15-D).
 * Used by verify:aibeopchin-client-collaboration-portal-rc.
 */
export function createClientCollaborationPortalRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Client Collaboration Portal RC file: ${relativePath}`);
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
];

const MIGRATION_DIRS = [
  "20260525140000_client_portal_collaboration_phase15a",
  "20260525150000_client_portal_phase15bc_intake_chat",
  "20260525160000_client_portal_phase15c2_review_gate",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-LAWYER-COLLABORATION-PORTAL-PHASE15A",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-FILE-UPLOAD-PHASE15B",
  "EVIDENCE-20260524-AIBEOPCHIN-CASE-CONVERSATION-PHASE15C",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-STATEMENT-REVIEW-GATE-PHASE15C2",
  "EVIDENCE-20260524-AIBEOPCHIN-COMMAND-CENTER-CHAT-ADOPT-PHASE15C3",
];

const CLIENT_PORTAL_API_ROUTES = [
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

export function runClientCollaborationPortalRcBlock(
  execSync,
  root,
  label = "verify:client-collaboration-portal-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createClientCollaborationPortalRcFsHelpers(root);

  for (const script of PHASE_VERIFY_SCRIPTS) {
    console.log(`[${label}] running npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  assertFileExists(
    "docs/client-portal/AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_RC_LOCK_SUMMARY.md",
  );
  assertFileExists(
    "docs/client-portal/AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_PREDEPLOY_CLOSURE_CHECKLIST.md",
  );
  assertFileExists("src/features/client-portal/client-collaboration-portal-rc-lock.ts");
  assertFileExists("src/features/client-portal/client-collaboration-portal-rc-lock.test.ts");

  for (const route of CLIENT_PORTAL_API_ROUTES) {
    assertFileExists(route);
  }

  for (const dir of MIGRATION_DIRS) {
    const migrationPath = path.join(root, "prisma/migrations", dir, "migration.sql");
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Missing Client Collaboration Portal RC migration: ${dir}`);
    }
  }

  assertIncludes("src/features/client-portal/client-collaboration-portal-rc-lock.ts", [
    "CLIENT_COLLABORATION_PORTAL_RC_LOCK_MARKER_PHASE15D",
    "CLIENT_COLLABORATION_PORTAL_RC_MIGRATION_DIRS",
    "CLIENT_COLLABORATION_PORTAL_RC_CLIENT_AUDIT_ACTIONS",
    "CLIENT_COLLABORATION_PORTAL_RC_COMMAND_CENTER_AUDIT_ACTIONS",
  ]);

  assertIncludes("src/features/client-portal/client-portal.policy.ts", [
    "assertClientPortalUser",
    "assertCanAccessClientPortalCase",
    "assertCanReviewClientSubmission",
    "assertCanPostCaseConversation",
  ]);

  assertIncludes("src/features/client-portal/client-portal.schema.ts", [
    'CLIENT_PORTAL_VERSION = "15-G.1"',
    "PHASE15A_CLIENT_LAWYER_COLLABORATION_PORTAL",
  ]);

  assertIncludes("src/features/client-portal/client-portal-audit.ts", [
    "CLIENT_PORTAL_ACCESS",
    "CLIENT_SUBMISSION_SUBMITTED",
    "CLIENT_SUBMISSION_REVIEWED",
    "CASE_CONVERSATION_MESSAGE_SENT",
    "CLIENT_PORTAL_FILE_UPLOAD",
  ]);

  assertIncludes("src/features/client-portal/client-portal-review-candidate.service.ts", [
    "PHASE15C2_CLIENT_STATEMENT_REVIEW_GATE",
    "NEEDS_LAWYER_REVIEW",
    "assertPortalReviewConfirmedForDownstream",
    "LAWYER_CONFIRMED",
  ]);

  assertIncludes("src/features/client-portal/case-conversation-adopt.service.ts", [
    "PHASE15C3_COMMAND_CENTER_CHAT_ADOPT",
    "CASE_CONVERSATION_MESSAGE_ADOPTED",
    "CASE_CONVERSATION_ATTACHMENT_ADOPTED",
    "reviewGate",
    "13-G",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.schema.ts", [
    'LITIGATION_COMMAND_CENTER_VERSION = "15-G.1"',
    "clientSubmissions",
    "conversationMessages",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-action-feed.ts", [
    "CASE_CONVERSATION_MESSAGE_ADOPTED",
    "CASE_CONVERSATION_ATTACHMENT_ADOPTED",
  ]);

  assertIncludes("src/components/client-portal/client-portal-client.tsx", [
    "phase15a-client-lawyer-collaboration-portal-client",
    "client-portal-supplement-submit",
    "client-portal-free-upload",
    "사건 대화",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "lcc-section-client-submissions",
    "lcc-section-conversation",
    "CommandCenterConversationRow",
    "사건기록 후보로 채택",
    "증거 후보로 채택",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tagClosure =
    "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15D-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tagClosure)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagClosure}`);
  }

  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-client-collaboration-portal-rc")) {
    throw new Error("package.json must define verify:aibeopchin-client-collaboration-portal-rc");
  }

  const predeploy = readFile("scripts/predeploy-check.ts");
  if (
    !predeployIncludesMasterOrGate(predeploy, "verify:aibeopchin-client-collaboration-portal-rc") &&
    !predeploy.includes("verify:aibeopchin-client-collaboration-portal-full-rc")
  ) {
    throw new Error(
      "scripts/predeploy-check.ts must include Full Legal Ops Platform RC master gate, Client Collaboration Portal RC, or Full RC gate",
    );
  }

  console.log(`[${label}] running Client Collaboration Portal Vitest bundle …`);
  execSync("npm run test -- src/features/client-portal", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] running client-collaboration-portal-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/client-portal/client-collaboration-portal-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
