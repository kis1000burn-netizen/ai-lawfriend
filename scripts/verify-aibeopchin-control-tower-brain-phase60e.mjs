import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const TAG = "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60E-SAFE-AUTO-FIX";

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

exists("src/features/control-tower-brain/phase60e-safe-auto-fix.schema.ts");
exists("src/features/control-tower-brain/phase60e-safe-auto-fix.policy.ts");
exists("src/features/control-tower-brain/phase60e-safe-auto-fix.service.ts");

inc("src/features/control-tower-brain/phase60e-safe-auto-fix.policy.ts", [
  "phase60e-safe-auto-fix-policy-v1",
  "NAVIGATOR_STATUS_SYNC",
  "canExecuteSafeAutoFix",
]);

inc("src/features/control-tower-brain/phase60e-safe-auto-fix.service.ts", [
  "executeControlTowerBrainSafeAutoFix",
  "CONTROL_TOWER_BRAIN_DECISION",
]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${TAG}`);
}
if (!read("package.json").includes("verify:aibeopchin-control-tower-brain-phase60e")) {
  throw new Error("missing verify:aibeopchin-control-tower-brain-phase60e");
}

execSync("npm run test -- src/features/control-tower-brain/control-tower-brain.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log("verify:aibeopchin-control-tower-brain-phase60e PASS (Product Phase 60-E Safe Auto-Fix Executor)");
