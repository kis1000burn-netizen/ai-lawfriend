import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const TAG = "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60A-SAFETY-BOUNDARY";
const BOUNDARIES = [
  "NO_UNAPPROVED_PRODUCTION_CODE_WRITE",
  "NO_DESTRUCTIVE_DB_CHANGE_BY_AI",
  "NO_AUTO_LEGAL_LOGIC_CHANGE_WITHOUT_REVIEW",
  "NO_SECRET_ACCESS_BY_AI",
  "NO_CLIENT_DATA_EXFILTRATION",
  "NO_AUTO_DEPLOY_TO_PRODUCTION",
  "NO_PATCH_WITHOUT_TEST_PLAN",
  "NO_FIX_WITHOUT_ROLLBACK_PLAN",
  "AUDIT_EVERY_BRAIN_DECISION",
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

exists("src/features/control-tower-brain/phase60a-control-tower-brain-safety.schema.ts");
exists("src/features/control-tower-brain/phase60a-control-tower-brain-safety.policy.ts");
exists("src/features/control-tower-brain/phase60a-control-tower-brain-safety.lock.ts");

inc("src/features/control-tower-brain/phase60a-control-tower-brain-safety.policy.ts", [
  "PHASE60A_BOUNDARY_MARKERS",
  "assertBrainActionAllowed",
  ...BOUNDARIES,
]);

inc("src/features/control-tower-brain/phase60a-control-tower-brain-safety.lock.ts", [
  "COMPLETE_LOCKED",
  "PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERSION",
  "verify:aibeopchin-control-tower-brain-phase60a",
  TAG,
]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-control-tower-brain-phase60a")) {
  throw new Error("missing verify:aibeopchin-control-tower-brain-phase60a");
}

execSync("npm run test -- src/features/control-tower-brain/control-tower-brain.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log("verify:aibeopchin-control-tower-brain-phase60a PASS (Product Phase 60-A Safety Boundary)");
