import fs from "node:fs";
import path from "node:path";
import { runLegalReliabilityProductionReadinessRcBlock } from "./run-legal-reliability-production-readiness-rc-block.mjs";
import { runLegalReliabilityStagingEvidenceLockBlock } from "./run-legal-reliability-staging-evidence-lock-block.mjs";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51-PRODUCTION-READINESS-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE52-STAGING-LIVE-VALIDATION-GO-LIVE-EVIDENCE",
];

export function runLegalReliabilityStagingLiveValidationRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-reliability-staging-live-validation-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/legal-reliability-staging-validation/legal-reliability-staging-validation-rc-lock.ts");
  exists("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK_SUMMARY.md");

  inc("src/features/legal-reliability-staging-validation/legal-reliability-staging-validation-rc-lock.ts", [
    "phase52f-legal-reliability-staging-live-validation-rc-gate",
    "verify:aibeopchin-legal-reliability-staging-live-validation-rc",
    "52-C Action Loop Live Smoke",
    "52-D Action Operations Live Smoke",
    "NO_GO_LIVE_WITHOUT_STAGING_EVIDENCE",
    "NO_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM",
  ]);

  inc("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK_SUMMARY.md", [
    "52-A",
    "52-F",
    "NO_GO_LIVE_WITHOUT_STAGING_EVIDENCE",
    "verify:aibeopchin-legal-reliability-staging-live-validation-rc",
  ]);

  inc("docs/OPERATIONS_INDEX.md", ["Product 52", "LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION"]);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "52-F",
    "COMPLETE · LOCKED",
    "verify:aibeopchin-legal-reliability-staging-live-validation-rc",
  ]);

  inc("DEPLOY_PRECHECK.md", [
    "verify:aibeopchin-legal-reliability-staging-live-validation-rc",
    "verify:aibeopchin-legal-reliability-staging-evidence-lock",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  for (const script of [
    "verify:aibeopchin-legal-reliability-production-readiness-rc",
    "verify:aibeopchin-legal-reliability-staging-evidence-lock",
    "verify:aibeopchin-legal-reliability-staging-live-validation-rc",
  ]) {
    if (!pkg.includes(script)) throw new Error(`missing ${script}`);
  }

  console.log(`[${label}] verify:aibeopchin-legal-reliability-production-readiness-rc …`);
  runLegalReliabilityProductionReadinessRcBlock(execSync, root, label);

  console.log(`[${label}] verify:aibeopchin-legal-reliability-staging-evidence-lock …`);
  runLegalReliabilityStagingEvidenceLockBlock(execSync, root, label);
}
