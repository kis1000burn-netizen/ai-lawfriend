import fs from "node:fs";
import path from "node:path";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48A-NAVIGATION-SHELL",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48B-LITIGATION-RISK-RADAR",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48C-CLAIM-GRAPH-WORKSPACE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48D-JUDGMENT-DRAWER",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48E-COURT-READY-PACK-BUILDER",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48F-RC",
];

const PREREQ = ["EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47-RC"];

const SUB = [
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48a",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48b",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48c",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48d",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48e",
];

export function runLegalReliabilityLawyerWorkbenchRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-reliability-lawyer-workbench-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/legal-reliability-lawyer-workbench/legal-reliability-lawyer-workbench-rc-lock.ts");
  exists("docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_SUMMARY.md");
  exists("src/features/legal-reliability-lawyer-workbench/shared/legal-reliability-lawyer-workbench-types.schema.ts");
  exists("src/app/(protected)/cases/[caseId]/lawyer-workbench/page.tsx");

  inc("src/features/legal-reliability-lawyer-workbench/legal-reliability-lawyer-workbench-rc-lock.ts", [
    "phase48f-legal-reliability-lawyer-workbench-rc-gate",
    "NO_AI_FINAL_STRATEGY",
    "NO_CLIENT_VISIBLE_STRATEGY_GRAPH",
    "LAWYER_REVIEW_REQUIRED",
    "JUDGMENT_CLICKTHROUGH_REQUIRED",
    "NO_COURT_AUTO_SUBMISSION",
    "NO_UNEXPLAINED_WORKBENCH_ITEM",
    "lawyer-workbench",
  ]);

  inc("docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_SUMMARY.md", [
    "48-A",
    "47-RC",
    "lawyer-workbench",
  ]);

  inc("docs/OPERATIONS_INDEX.md", ["Product 48", "LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_SUMMARY"]);

  inc("docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_RC_LOCK_SUMMARY.md", ["Lawyer Workbench"]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-reliability-lawyer-workbench-rc")) {
    throw new Error("missing master verify script");
  }
  for (const s of SUB) if (!pkg.includes(s)) throw new Error(`missing ${s}`);
  if (!pkg.includes("verify:aibeopchin-legal-reliability-rc")) {
    throw new Error("missing bundled verify:aibeopchin-legal-reliability-rc");
  }

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "48-F",
    "Lawyer Workbench",
    "LOCKED",
  ]);

  for (const script of SUB) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] bundled verify:aibeopchin-legal-reliability-rc …`);
  execSync("npm run verify:aibeopchin-legal-reliability-rc", { stdio: "inherit", cwd: root });

  execSync(
    "npm run test -- src/features/legal-reliability-lawyer-workbench/legal-reliability-lawyer-workbench-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
