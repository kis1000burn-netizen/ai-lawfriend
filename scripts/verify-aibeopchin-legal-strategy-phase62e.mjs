import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const PHASE62E_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62E-CLIENT-VISIBLE-SEND-GATE";

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62D-LAWYER-APPROVAL-PORTAL-DRAFT-SYNC",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BOUNDARY_MARKERS = [
  "NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL",
  "NO_SEND_WITHOUT_SEND_GATE",
  "NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY",
  "NO_AUTO_LITIGATION_TASK_EXECUTION",
  "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT",
  "NO_UNAPPROVED_DRAFT_TO_CLIENT_PORTAL",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED",
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

exists("docs/legal-strategy/AIBEOPCHIN_CLIENT_VISIBLE_SEND_GATE_PHASE62E.md");
exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md");
exists("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.schema.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.policy.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.service.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.lock.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_CLIENT_VISIBLE_SEND_GATE_PHASE62E.md", [
  "Product Phase 62-E",
  "ClientVisibleSupplementRequestPayload",
  "LitigationOpsDraftLink",
  "DRAFT_LINKED",
  "COMPLETE · LOCKED · 62-E.1",
  "verify:aibeopchin-legal-strategy-phase62e",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.schema.ts", [
  "phase62e-client-send-gate-schema",
  "clientVisibleSupplementRequestPayloadSchema",
  "litigationOpsDraftLinkSchema",
  "62-E.1",
  "notificationAllowed",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.policy.ts", [
  "phase62e-client-send-gate-policy",
  "approvePortalDraftForClientVisibility",
  "enableSupplementRequestSendGate",
  "linkSupplementRequestToLitigationOpsDraft",
  "assertClientVisibleSendGateAllowed",
  ...BOUNDARY_MARKERS,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.service.ts", [
  "runClientVisibleSendGateWorkflow",
  "summarizeClientVisiblePayload",
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.lock.ts", [
  "phase62e-client-send-gate-lock",
  "COMPLETE_LOCKED",
  "PHASE62E_BOUNDARY_MARKERS",
  "PHASE62E_CLIENT_SEND_GATE_VERIFY_SCRIPT",
  "PHASE62E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT",
]);

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md", [
  "62-E",
  "COMPLETE · LOCKED · 62-E.1",
  "Control Tower Brain scan",
  "verify:aibeopchin-legal-strategy-phase62e",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of [PHASE62E_EVIDENCE_TAG, ...PREREQ_EVIDENCE_TAGS]) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

if (!read("package.json").includes("verify:aibeopchin-legal-strategy-phase62e")) {
  throw new Error("missing verify:aibeopchin-legal-strategy-phase62e");
}

inc("tools/aibeopchin_navigator.py", [
  "62-E COMPLETE · LOCKED · 62-E.1",
  "verify:aibeopchin-legal-strategy-phase62e",
  "NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL",
]);

execSync(
  "npm run test -- src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.test.ts",
  { stdio: "inherit", cwd: root },
);

const controlTower = spawnSync("npm", ["run", "verify:aibeopchin-control-tower-brain-rc"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  cwd: root,
});

if (controlTower.status !== 0) {
  console.error("❌ Phase 62-E blocked: Control Tower Brain verify failed");
  process.exit(controlTower.status ?? 1);
}

console.log("✅ Phase 62-E Client-visible Send Gate & Litigation Ops Draft Link verified");
console.log("- Final lawyer approval → clientVisible; send/notification gated separately");
console.log("- Litigation Ops DRAFT_LINKED only · auto task execution blocked");
console.log("- Control Tower Brain RC gate: PASS");
console.log(
  "verify:aibeopchin-legal-strategy-phase62e PASS (Product Phase 62-E Client-visible Send Gate)",
);
