import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const root = process.cwd();

const CONSOLIDATED_RC_BOUNDARIES = [
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT",
  "NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION",
  "NO_REJECTED_SUGGESTION_REUSE",
  "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE",
  "NO_PATTERN_WITHOUT_ANONYMIZATION",
  "NO_CROSS_TENANT_REASONING_CONTEXT",
  "NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "AUDIT_EVERY_AI_LEARNING",
  "GONGBUHO_INTELLIGENCE_MASTER_VERIFY_REQUIRED",
];

const GOVERNANCE_BOUNDARIES = [
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "LAWYER_CONFIRMED_BEFORE_STRATEGY_USE",
  "REAL_TIME_SIGNAL_NOT_AUTHORITY",
  "NO_AUTO_LEGAL_ADVICE_TO_CLIENT",
  "CASE_SCOPE_FIRST",
  "TENANT_ISOLATION_REQUIRED",
  "ANONYMIZED_PATTERN_ONLY",
  "AUDIT_EVERY_AI_LEARNING",
];

const RC_GATE_BOUNDARIES = [
  "NO_INTELLIGENCE_RC_WITHOUT_59A_MEMORY_PACKET_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_59B_REALTIME_SIGNAL_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_59C_REASONING_ENGINE_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_59D_LEARNING_LOOP_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_59E_PATTERN_LIBRARY_LOCK",
  "NO_INTELLIGENCE_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_INTELLIGENCE_RC_WITHOUT_PHASE54_STABILIZATION_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_MASTER_VERIFY",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59A-MEMORY-PACKET-SCHEMA",
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59B-REAL-TIME-LEGAL-SIGNAL",
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59C-REASONING-CONTEXT",
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59D-LAWYER-FEEDBACK-LEARNING",
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59E-REUSABLE-LEGAL-PATTERN",
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59F-RC-LOCK",
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54F-PRODUCTION-STABILIZATION-RC",
];

const BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-gongbuho-intelligence-phase59a",
  "verify:aibeopchin-gongbuho-intelligence-phase59b",
  "verify:aibeopchin-gongbuho-intelligence-phase59c",
  "verify:aibeopchin-gongbuho-intelligence-phase59d",
  "verify:aibeopchin-gongbuho-intelligence-phase59e",
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

exists("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_RC_LOCK_SUMMARY.md");
exists("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md");
exists("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc.policy.ts");
exists("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc-lock.ts");
exists("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc.test.ts");

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_RC_LOCK_SUMMARY.md", [
  "Product Phase 59-F",
  "COMPLETE · LOCKED · 59-F.1",
  "Gongbuho Intelligence RC",
  "LEGAL_RELIABILITY_INTELLIGENCE_PLATFORM",
  "LAWYER_CONFIRMED",
  "APPROVED_FOR_AI_USE",
  "APPROVED_FOR_REUSE",
  "verify:aibeopchin-gongbuho-intelligence-rc",
  "Phase 60",
  ...CONSOLIDATED_RC_BOUNDARIES,
]);

inc("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc.policy.ts", [
  "phase59f-gongbuho-intelligence-rc-policy",
  "PHASE59F_CONSOLIDATED_RC_BOUNDARY_MARKERS",
  "evaluateGongbuhoIntelligenceRcGate",
  ...CONSOLIDATED_RC_BOUNDARIES,
  ...GOVERNANCE_BOUNDARIES,
  ...RC_GATE_BOUNDARIES,
]);

inc("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc-lock.ts", [
  "phase59f-gongbuho-intelligence-rc-gate",
  "COMPLETE_LOCKED",
  "59-F.1",
  "LEGAL_RELIABILITY_INTELLIGENCE_PLATFORM",
  "verify:aibeopchin-gongbuho-intelligence-rc",
  ...CONSOLIDATED_RC_BOUNDARIES,
  ...BUNDLED_VERIFY_SCRIPTS,
]);

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md", [
  "59-F",
  "COMPLETE · LOCKED · 59-F.1",
  "verify:aibeopchin-gongbuho-intelligence-rc",
  "GONGBUHO_INTELLIGENCE_MASTER_VERIFY_REQUIRED",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
for (const tag of EVIDENCE_TAGS) {
  if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
}

const pkg = read("package.json");
for (const script of [...BUNDLED_VERIFY_SCRIPTS, "verify:aibeopchin-gongbuho-intelligence-rc"]) {
  if (!pkg.includes(script)) throw new Error(`missing ${script}`);
}

inc("tools/aibeopchin_navigator.py", [
  "59-F COMPLETE · LOCKED · 59-F.1",
  "verify:aibeopchin-gongbuho-intelligence-rc",
  "LEGAL_RELIABILITY_INTELLIGENCE_PLATFORM",
  "GONGBUHO_INTELLIGENCE_MASTER_VERIFY_REQUIRED",
]);

execSync(
  "npm run test -- src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc.test.ts",
  { stdio: "inherit", cwd: root },
);

for (const script of BUNDLED_VERIFY_SCRIPTS) {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: root,
  });

  if (result.status !== 0) {
    console.error(`❌ Phase 59-F RC blocked: npm run ${script}`);
    process.exit(result.status ?? 1);
  }
}

console.log("✅ Phase 59-F Gongbuho Intelligence RC verified");
console.log("- 59-A Memory Packet schema gate: PASS");
console.log("- 59-B Real-time Legal Signal: LOCKED");
console.log("- 59-C Reasoning Context: LOCKED");
console.log("- 59-D Lawyer Feedback Learning: LOCKED");
console.log("- 59-E Reusable Legal Pattern: LOCKED");
console.log("- Platform status: LEGAL_RELIABILITY_INTELLIGENCE_PLATFORM");
console.log(
  "verify:aibeopchin-gongbuho-intelligence-rc PASS (Product Phase 59-F Gongbuho Intelligence RC)",
);
