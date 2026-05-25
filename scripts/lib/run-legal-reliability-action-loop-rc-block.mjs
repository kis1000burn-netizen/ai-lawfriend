import fs from "node:fs";
import path from "node:path";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49A-RISK-RADAR-SUPPLEMENT-ACTION",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49B-GRAPH-GAP-EVIDENCE-REQUEST-ACTION",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-LOOP-PHASE49C-RC",
];

const SUB = [
  "verify:aibeopchin-legal-reliability-action-loop-phase49a",
  "verify:aibeopchin-legal-reliability-action-loop-phase49b",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48b",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48c",
];

const ACTION_LOOP_FILES = [
  "src/features/legal-reliability-action-loop/legal-reliability-action-loop.registry.ts",
  "src/features/legal-reliability-action-loop/legal-reliability-action-loop-rc-lock.ts",
  "src/features/legal-reliability-action-loop/legal-reliability-action-loop-rc.policy.ts",
  "src/features/legal-reliability-action-loop/legal-reliability-action-loop-client-sanitizer.ts",
  "src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.service.ts",
  "src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.service.ts",
];

const FORBIDDEN_IMPORT_MARKERS = [
  "real-messaging",
  "client-mobile",
  "sendMessage",
  "sendEmail",
  "sendKakao",
  "triggerUpload",
];

export function runLegalReliabilityActionLoopRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-reliability-action-loop-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/legal-reliability-action-loop/legal-reliability-action-loop-rc-lock.ts");
  exists("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_SUMMARY.md");
  exists("docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_RUNBOOK.md");

  inc("src/features/legal-reliability-action-loop/legal-reliability-action-loop-rc-lock.ts", [
    "phase49c-legal-reliability-action-loop-rc-gate",
    "RISK_RADAR_SUPPLEMENT_REQUEST",
    "GRAPH_GAP_EVIDENCE_REQUEST",
    "verify:aibeopchin-legal-reliability-action-loop-rc",
  ]);

  inc("src/features/legal-reliability-action-loop/legal-reliability-action-loop.registry.ts", [
    "NO_UNVERIFIED_EVIDENCE_LABELING",
    "GRAPH_GAP_EVIDENCE_REQUEST",
    "phase49a-",
    "phase49b-",
    "requiresLawyerApproval: true",
    "directMessagingAllowed: false",
    "autoLegalFilingAllowed: false",
    "decisionLedgerRequired: true",
    "sanitizerRequired: true",
    "ACTION_CANDIDATE_CREATED",
  ]);

  inc("src/features/legal-reliability-action-loop/legal-reliability-action-loop-rc.policy.ts", [
    "assertLegalReliabilityActionLoopRcBoundary",
    "assertSupplementDraftCreationAllowed",
    "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
    "LAWYER_DECISION_LEDGER_REQUIRED",
  ]);

  inc("src/features/legal-reliability-action-loop/legal-reliability-action-loop-client-sanitizer.ts", [
    "ClientSafeActionRequestSanitizationResult",
    "UNVERIFIED_EVIDENCE_LABELING",
    "CLIENT_VISIBLE_STRATEGY_TEXT",
  ]);

  inc("src/features/legal-reliability-lawyer-workbench/litigation-risk-radar/litigation-risk-radar.registry.ts", [
    "SUPPLEMENT_REQUEST_ACTION",
  ]);
  inc("src/features/legal-reliability-lawyer-workbench/claim-graph-workspace/claim-graph-workspace.registry.ts", [
    "EVIDENCE_REQUEST_ACTION",
  ]);

  inc("src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.validator.ts", [
    "ForbiddenError",
    "보완요청 후보는 변호사",
  ]);
  inc("src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.schema.ts", [
    "phase49a-",
  ]);
  inc("src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.schema.ts", [
    "phase49b-",
  ]);

  inc("docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_SUMMARY.md", [
    "49-A",
    "49-B",
    "49-C",
    "NO_UNVERIFIED_EVIDENCE_LABELING",
  ]);

  inc("docs/OPERATIONS_INDEX.md", [
    "Product 49-C",
    "LEGAL_RELIABILITY_ACTION_LOOP_RC",
  ]);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "49-C",
    "COMPLETE · LOCKED",
    "verify:aibeopchin-legal-reliability-action-loop-rc",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-reliability-action-loop-rc")) {
    throw new Error("missing master verify script");
  }
  for (const s of SUB) if (!pkg.includes(s)) throw new Error(`missing ${s}`);

  for (const file of ACTION_LOOP_FILES) {
    const content = read(file);
    for (const marker of FORBIDDEN_IMPORT_MARKERS) {
      if (content.includes(marker)) {
        throw new Error(`Forbidden Phase 20/21 direct trigger marker "${marker}" in ${file}`);
      }
    }
  }

  for (const script of SUB) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  execSync(
    "npm run test -- src/features/legal-reliability-action-loop/legal-reliability-action-loop-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
