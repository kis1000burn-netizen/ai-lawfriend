import fs from "node:fs";
import path from "node:path";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50A-QUEUE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50B-ASSIGNMENT-DUE-SLA",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50C-CLIENT-RESPONSE-EVIDENCE-INTAKE-SYNC",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50D-LAWYER-COMPLETION-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50E-COMMAND-CENTER-EXECUTION-DASHBOARD",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50F-RC",
];

const SUB = [
  "verify:aibeopchin-legal-reliability-action-operations-phase50a",
  "verify:aibeopchin-legal-reliability-action-operations-phase50b",
  "verify:aibeopchin-legal-reliability-action-operations-phase50c",
  "verify:aibeopchin-legal-reliability-action-operations-phase50d",
  "verify:aibeopchin-legal-reliability-action-operations-phase50e",
];

const ACTION_OPERATIONS_FILES = [
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation.service.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-client-response-sync.service.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-completion.service.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.service.ts",
  "src/components/cases/litigation-command-center/legal-reliability-action-operations-dashboard-panel.tsx",
];

const FORBIDDEN_MARKERS = [
  "real-messaging",
  "sendEmail",
  "sendKakao",
  "triggerUpload",
];

export function runLegalReliabilityActionOperationsRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-reliability-action-operations-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/legal-reliability-action-operations/legal-reliability-action-operations-rc-lock.ts");
  exists("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_SUMMARY.md");

  inc("src/features/legal-reliability-action-operations/legal-reliability-action-operations-rc-lock.ts", [
    "phase50f-legal-reliability-action-operations-rc-gate",
    "verify:aibeopchin-legal-reliability-action-operations-rc",
    "50-A Action Operations Queue",
    "50-E Command Center Execution Dashboard",
    "NO_DASHBOARD_AUTO_COMPLETION",
    "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM",
  ]);

  inc("src/features/legal-reliability-action-operations/legal-reliability-action-operations-rc.policy.ts", [
    "assertLegalReliabilityActionOperationsRcBoundary",
    "NO_DASHBOARD_AUTO_MESSAGING",
    "NO_AI_OPERATION_PRIORITY_OVERRIDE",
  ]);

  inc("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_SUMMARY.md", [
    "50-A",
    "50-F",
    "NO_DASHBOARD_AUTO_COMPLETION",
    "verify:aibeopchin-legal-reliability-action-operations-rc",
  ]);

  inc("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RUNBOOK.md", [
    "Phase 50-F",
    "verify:aibeopchin-legal-reliability-action-operations-rc",
  ]);

  inc("docs/OPERATIONS_INDEX.md", ["Product 50-F", "LEGAL_RELIABILITY_ACTION_OPERATIONS"]);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "50-F",
    "COMPLETE · LOCKED",
    "verify:aibeopchin-legal-reliability-action-operations-rc",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-reliability-action-operations-rc")) {
    throw new Error("missing master verify script");
  }
  for (const s of SUB) if (!pkg.includes(s)) throw new Error(`missing ${s}`);

  for (const file of ACTION_OPERATIONS_FILES) {
    const content = read(file);
    for (const marker of FORBIDDEN_MARKERS) {
      if (content.includes(marker)) {
        throw new Error(`Forbidden auto-trigger marker "${marker}" in ${file}`);
      }
    }
  }

  inc(
    "src/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.service.ts",
    ["NO_DASHBOARD_AUTO_COMPLETION", "NO_DASHBOARD_AUTO_MESSAGING", "NO_DASHBOARD_AUTO_FILING"],
  );

  console.log(`[${label}] verify:aibeopchin-legal-reliability-action-loop-rc (prereq) …`);
  execSync("npm run verify:aibeopchin-legal-reliability-action-loop-rc", {
    stdio: "inherit",
    cwd: root,
  });

  for (const script of SUB) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  execSync(
    "npm run test -- src/features/legal-reliability-action-operations/legal-reliability-action-operations-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
