import fs from "node:fs";
import path from "node:path";

const CHECKLIST_REQUIRED_ITEMS = [
  "staging migration apply",
  "prisma validate PASS",
  "production-readiness RC verify PASS",
  "LAWYER candidate",
  "decision ledger",
  "SupplementRequest DRAFT",
  "Operation 자동 생성",
  "SLA badge",
  "client response sync",
  "lawyer review handoff",
  "completion review",
  "courtReadyAllowed",
  "dashboard KPI",
  "CLIENT dashboard 접근 차단",
  "feature flag OFF",
  "rollback/read-only degrade",
  "phase52-staging-go-live-evidence-checklist",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51-PRODUCTION-READINESS-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE52-STAGING-LIVE-VALIDATION-GO-LIVE-EVIDENCE",
];

export function runLegalReliabilityStagingEvidenceLockBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-reliability-staging-evidence-lock",
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
  exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md");
  exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RUNBOOK.md");

  inc("src/features/legal-reliability-staging-validation/legal-reliability-staging-validation-rc-lock.ts", [
    "phase52f-legal-reliability-staging-live-validation-rc-gate",
    "verify:aibeopchin-legal-reliability-staging-evidence-lock",
    "52-A Staging Migration Apply Evidence",
    "52-E Rollback / Feature Flag Live Validation",
    "NO_GO_LIVE_WITHOUT_STAGING_EVIDENCE",
    "phase52-staging-go-live-evidence-checklist",
  ]);

  inc("src/features/legal-reliability-staging-validation/legal-reliability-staging-validation.policy.ts", [
    "assertStagingLiveValidationRcBoundary",
    "assertStagingRoleLiveSmokeBoundary",
    "NO_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS",
  ]);

  inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md", [
    "phase52-staging-go-live-evidence-checklist",
    "NO_GO_LIVE_WITHOUT_STAGING_EVIDENCE",
    "Risk Radar",
    "Graph Gap",
    "LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED",
  ]);

  inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RUNBOOK.md", [
    "Phase 52",
    "npm run db:deploy",
    "NO_GO_LIVE_WITHOUT_ROLE_SMOKE",
    "read-only degrade",
  ]);

  const checklist = read("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md");
  for (const item of CHECKLIST_REQUIRED_ITEMS) {
    if (!checklist.includes(item)) {
      throw new Error(`Go-live checklist missing "${item}"`);
    }
  }

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-reliability-staging-evidence-lock")) {
    throw new Error("missing verify:aibeopchin-legal-reliability-staging-evidence-lock");
  }

  execSync(
    "npm run test -- src/features/legal-reliability-staging-validation/legal-reliability-staging-validation.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
