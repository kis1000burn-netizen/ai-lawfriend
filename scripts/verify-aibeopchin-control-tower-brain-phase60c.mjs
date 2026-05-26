import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const TAG = "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60C-CONFLICT-DIAGNOSIS";

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

exists("src/features/control-tower-brain/phase60c-conflict-diagnosis.schema.ts");
exists("src/features/control-tower-brain/phase60c-conflict-diagnosis.service.ts");

inc("src/features/control-tower-brain/phase60c-conflict-diagnosis.schema.ts", [
  "phase60c-conflict-diagnosis-v1",
  "PHASE_STATUS_INCONSISTENCY",
  "VERIFY_SCRIPT_OUT_OF_SYNC",
]);

inc("src/features/control-tower-brain/phase60c-conflict-diagnosis.service.ts", [
  "runControlTowerBrainDiagnosis",
]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-control-tower-brain-phase60c")) {
  throw new Error("missing verify:aibeopchin-control-tower-brain-phase60c");
}

execSync("npm run test -- src/features/control-tower-brain/control-tower-brain.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log("verify:aibeopchin-control-tower-brain-phase60c PASS (Product Phase 60-C Conflict Diagnosis)");
