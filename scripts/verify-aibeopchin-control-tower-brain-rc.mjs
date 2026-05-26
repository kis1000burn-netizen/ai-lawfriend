import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const CONSOLIDATED_RC_BOUNDARIES = [
  "NO_UNAPPROVED_PRODUCTION_CODE_WRITE",
  "NO_DESTRUCTIVE_DB_CHANGE_BY_AI",
  "NO_AUTO_LEGAL_LOGIC_CHANGE_WITHOUT_REVIEW",
  "NO_SECRET_ACCESS_BY_AI",
  "NO_CLIENT_DATA_EXFILTRATION",
  "NO_AUTO_DEPLOY_TO_PRODUCTION",
  "NO_PATCH_WITHOUT_TEST_PLAN",
  "NO_FIX_WITHOUT_ROLLBACK_PLAN",
  "AUDIT_EVERY_BRAIN_DECISION",
  "CONTROL_TOWER_BRAIN_MASTER_VERIFY_REQUIRED",
  "HUMAN_APPROVAL_GATE_REQUIRED_FOR_RISK_PATCH",
  "NO_AUTO_FIX_WITHOUT_AUDIT",
];

const RC_GATE_BOUNDARIES = [
  "NO_CONTROL_TOWER_RC_WITHOUT_60A_SAFETY_LOCK",
  "NO_CONTROL_TOWER_RC_WITHOUT_60B_ERROR_DETECTION",
  "NO_CONTROL_TOWER_RC_WITHOUT_60C_CONFLICT_DIAGNOSIS",
  "NO_CONTROL_TOWER_RC_WITHOUT_60D_PATCH_PLAN_GENERATOR",
  "NO_CONTROL_TOWER_RC_WITHOUT_60E_SAFE_AUTO_FIX",
  "NO_CONTROL_TOWER_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_CONTROL_TOWER_RC_WITHOUT_MASTER_VERIFY",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60A-SAFETY-BOUNDARY",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60B-ERROR-DETECTION",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60C-CONFLICT-DIAGNOSIS",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60D-PATCH-PLAN",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60E-SAFE-AUTO-FIX",
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK",
];

const BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-control-tower-brain-phase60a",
  "verify:aibeopchin-control-tower-brain-phase60b",
  "verify:aibeopchin-control-tower-brain-phase60c",
  "verify:aibeopchin-control-tower-brain-phase60d",
  "verify:aibeopchin-control-tower-brain-phase60e",
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

exists("docs/platform/AIBEOPCHIN_CONTROL_TOWER_BRAIN_PHASE60_SPEC.md");
exists("docs/platform/AIBEOPCHIN_CONTROL_TOWER_BRAIN_RC_LOCK_SUMMARY.md");
exists("src/features/control-tower-brain/phase60f-control-tower-brain-rc.policy.ts");
exists("src/features/control-tower-brain/phase60f-control-tower-brain-rc-lock.ts");
exists("src/features/control-tower-brain/phase60f-control-tower-brain-rc.test.ts");
exists("src/app/(protected)/admin/control-tower/brain/page.tsx");

inc("docs/platform/AIBEOPCHIN_CONTROL_TOWER_BRAIN_RC_LOCK_SUMMARY.md", [
  "Product Phase 60-F",
  "COMPLETE · LOCKED · 60-F.1",
  "SELF_HEALING_ENGINEERING_OPS_PLATFORM",
  "verify:aibeopchin-control-tower-brain-rc",
  "/admin/control-tower/brain",
  ...CONSOLIDATED_RC_BOUNDARIES,
]);

inc("src/features/control-tower-brain/phase60f-control-tower-brain-rc-lock.ts", [
  "phase60f-control-tower-brain-rc-gate",
  "COMPLETE_LOCKED",
  "60-F.1",
  "SELF_HEALING_ENGINEERING_OPS_PLATFORM",
  "verify:aibeopchin-control-tower-brain-rc",
  ...BUNDLED_VERIFY_SCRIPTS,
]);

inc("docs/platform/AIBEOPCHIN_CONTROL_TOWER_BRAIN_PHASE60_SPEC.md", [
  "60-F",
  "COMPLETE · LOCKED · 60-F.1",
  "verify:aibeopchin-control-tower-brain-rc",
  "CONTROL_TOWER_BRAIN_MASTER_VERIFY_REQUIRED",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of EVIDENCE_TAGS) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

const pkg = read("package.json");
for (const script of [...BUNDLED_VERIFY_SCRIPTS, "verify:aibeopchin-control-tower-brain-rc"]) {
  if (!pkg.includes(script)) throw new Error(`missing ${script}`);
}

inc("tools/aibeopchin_navigator.py", [
  "60-F COMPLETE · LOCKED · 60-F.1",
  "verify:aibeopchin-control-tower-brain-rc",
  "SELF_HEALING_ENGINEERING_OPS_PLATFORM",
  "CONTROL_TOWER_BRAIN_MASTER_VERIFY_REQUIRED",
]);

inc("src/features/control-tower-brain/phase60f-control-tower-brain-rc.policy.ts", [
  "phase60f-control-tower-brain-rc-policy-v1",
  "evaluateControlTowerBrainRcGate",
  ...RC_GATE_BOUNDARIES,
]);

execSync("npm run test -- src/features/control-tower-brain/phase60f-control-tower-brain-rc.test.ts", {
  stdio: "inherit",
  cwd: root,
});

for (const script of BUNDLED_VERIFY_SCRIPTS) {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: root,
  });
  if (result.status !== 0) {
    console.error(`❌ Phase 60-F RC blocked: npm run ${script}`);
    process.exit(result.status ?? 1);
  }
}

console.log("✅ Phase 60-F Control Tower Brain RC verified");
console.log("- Platform status: SELF_HEALING_ENGINEERING_OPS_PLATFORM");
console.log("verify:aibeopchin-control-tower-brain-rc PASS (Product Phase 60-F Control Tower Brain RC)");
