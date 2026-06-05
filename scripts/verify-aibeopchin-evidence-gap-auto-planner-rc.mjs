import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const CONSOLIDATED_RC_BOUNDARIES = [
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE",
  "NO_AI_FINAL_EVIDENCE_JUDGMENT",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "NO_AUTO_SUPPLEMENT_REQUEST_FROM_DETECTION",
  "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT",
  "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL",
  "NO_AUTO_SEND_AFTER_PORTAL_SYNC",
  "NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL",
  "NO_SEND_WITHOUT_SEND_GATE",
  "NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY",
  "NO_AUTO_LITIGATION_TASK_EXECUTION",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
  "EVIDENCE_GAP_AUTO_PLANNER_MASTER_VERIFY_REQUIRED",
];

const RC_GATE_BOUNDARIES = [
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62A_CANDIDATE_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62B_DETECTION_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62C_DRAFT_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62D_PORTAL_SYNC_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62E_SEND_GATE_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_MASTER_VERIFY",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62A-EVIDENCE-GAP-CANDIDATE-SCHEMA",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62B-EVIDENCE-GAP-DETECTION-ENGINE",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62C-SUPPLEMENT-REQUEST-DRAFT-GENERATOR",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62D-LAWYER-APPROVAL-PORTAL-DRAFT-SYNC",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62E-CLIENT-VISIBLE-SEND-GATE",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62F-EVIDENCE-GAP-AUTO-PLANNER-RC",
];

const BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-control-tower-brain-rc",
  "verify:aibeopchin-legal-strategy-phase62a",
  "verify:aibeopchin-legal-strategy-phase62b",
  "verify:aibeopchin-legal-strategy-phase62c",
  "verify:aibeopchin-legal-strategy-phase62d",
  "verify:aibeopchin-legal-strategy-phase62e",
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

exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK_SUMMARY.md");
exists("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md");
exists("src/features/legal-strategy/evidence-gap-planner/phase62f-evidence-gap-auto-planner-rc.policy.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62f-evidence-gap-auto-planner-rc.lock.ts");
exists("src/features/legal-strategy/evidence-gap-planner/phase62f-evidence-gap-auto-planner-rc.test.ts");

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK_SUMMARY.md", [
  "Product Phase 62-F",
  "COMPLETE · LOCKED · 62-F.1",
  "EVIDENCE_GAP_AUTO_PLANNER_RC_LOCKED",
  "verify:aibeopchin-evidence-gap-auto-planner-rc",
  ...CONSOLIDATED_RC_BOUNDARIES,
]);

inc("src/features/legal-strategy/evidence-gap-planner/phase62f-evidence-gap-auto-planner-rc.lock.ts", [
  "phase62f-evidence-gap-auto-planner-rc-gate",
  "COMPLETE_LOCKED",
  "62-F.1",
  "EVIDENCE_GAP_AUTO_PLANNER_RC_LOCKED",
  "verify:aibeopchin-evidence-gap-auto-planner-rc",
  ...BUNDLED_VERIFY_SCRIPTS,
]);

inc("docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md", [
  "62-F",
  "COMPLETE · LOCKED · 62-F.1",
  "verify:aibeopchin-evidence-gap-auto-planner-rc",
  "EVIDENCE_GAP_AUTO_PLANNER_MASTER_VERIFY_REQUIRED",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of EVIDENCE_TAGS) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

const pkg = read("package.json");
for (const script of [...BUNDLED_VERIFY_SCRIPTS, "verify:aibeopchin-evidence-gap-auto-planner-rc"]) {
  if (!pkg.includes(script)) throw new Error(`missing ${script}`);
}

inc("tools/aibeopchin_navigator.py", [
  "62-F COMPLETE · LOCKED · 62-F.1",
  "verify:aibeopchin-evidence-gap-auto-planner-rc",
  "EVIDENCE_GAP_AUTO_PLANNER_RC_LOCKED",
  "EVIDENCE_GAP_AUTO_PLANNER_MASTER_VERIFY_REQUIRED",
]);

execSync(
  "npm run test -- src/features/legal-strategy/evidence-gap-planner/phase62f-evidence-gap-auto-planner-rc.test.ts",
  { stdio: "inherit", cwd: root },
);

for (const script of BUNDLED_VERIFY_SCRIPTS) {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: root,
  });

  if (result.status !== 0) {
    console.error(`❌ Phase 62-F RC blocked: npm run ${script}`);
    process.exit(result.status ?? 1);
  }
}

console.log("✅ Phase 62-F Evidence Gap Auto Planner RC verified");
console.log("- 62-A Evidence Gap Candidate: LOCKED");
console.log("- 62-B Detection Engine: LOCKED");
console.log("- 62-C Supplement Request Draft: LOCKED");
console.log("- 62-D Lawyer Approval Portal Sync: LOCKED");
console.log("- 62-E Client-visible Send Gate: LOCKED");
console.log("- Platform status: EVIDENCE_GAP_AUTO_PLANNER_RC_LOCKED");
console.log(
  "verify:aibeopchin-evidence-gap-auto-planner-rc PASS (Product Phase 62-F Evidence Gap Auto Planner RC)",
);
