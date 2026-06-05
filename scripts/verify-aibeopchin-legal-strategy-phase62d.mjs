import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE62D_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62D-LAWYER-APPROVAL-PORTAL-DRAFT-SYNC";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62C-SUPPLEMENT-REQUEST-DRAFT-GENERATOR",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL",
  "NO_PORTAL_SYNC_FROM_REJECTED_DRAFT",
  "NO_AUTO_SEND_AFTER_PORTAL_SYNC",
  "NO_AUTO_NOTIFICATION_AFTER_PORTAL_SYNC",
  "NO_AUTO_TASK_EXECUTION_AFTER_PORTAL_SYNC",
  "NO_INTERNAL_STRATEGY_LEAK_TO_PORTAL",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "PORTAL_DRAFT_SYNC_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
];

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function exists(p) {
  if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
}

function inc(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

exists("docs/legal-strategy/AIBEOPCHIN_LAWYER_APPROVAL_PORTAL_DRAFT_SYNC_PHASE62D.md");
exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md");
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.schema.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.policy.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.service.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.lock.ts",
);
exists(
  "src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.test.ts",
);

inc("docs/legal-strategy/AIBEOPCHIN_LAWYER_APPROVAL_PORTAL_DRAFT_SYNC_PHASE62D.md", [
  "Product Phase 62-D",
  "ClientPortalSupplementDraftSync",
  "LawyerSupplementDecisionLedgerEntry",
  "LAWYER_APPROVED",
  "COMPLETE · LOCKED · 62-D.1",
  "verify:aibeopchin-legal-strategy-phase62d",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.schema.ts", [
  "phase62d-lawyer-approval-portal-sync-schema",
  "clientPortalSupplementDraftSyncSchema",
  "lawyerSupplementDecisionLedgerEntrySchema",
  "62-D.1",
  "notificationAllowed",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.policy.ts", [
  "phase62d-lawyer-approval-portal-sync-policy",
  "approveSupplementRequestDraftForPortalSync",
  "modifySupplementRequestDraftForPortalSync",
  "rejectSupplementRequestDraft",
  "syncApprovedSupplementDraftToClientPortal",
  "assertPortalDraftSyncAllowed",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.service.ts", [
  "runLawyerApprovalAndPortalSync",
  "summarizeClientPortalSupplementDraftSync",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.lock.ts", [
  "phase62d-lawyer-approval-portal-sync-lock",
  "COMPLETE_LOCKED",
  "PHASE62D_BOUNDARY_MARKERS",
  "PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERIFY_SCRIPT",
  "PHASE62D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md", [
  "62-D",
  "COMPLETE · LOCKED · 62-D.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase62d",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE62D_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase62d")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase62d");
}

inc("tools/aibeopchin_navigator.py", [
  "62-D COMPLETE · LOCKED · 62-D.1",
  "verify:aibeopchin-legal-strategy-phase62d",
  "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL",
]);

execSync(
  "npm run test -- src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 62-D blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 62-D Lawyer Approval & Portal Draft Sync verified");
console.log("- Lawyer APPROVE/MODIFY/REJECT ledger + portal draft sync");
console.log("- Post-sync send/notification/task execution blocked");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase62d PASS (Product Phase 62-D Lawyer Approval & Portal Draft Sync)",
);
