import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const PHASE59A_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59A-MEMORY-PACKET-SCHEMA";

const PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54F-PRODUCTION-STABILIZATION-RC";

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

exists("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md");
exists("src/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema.ts");
exists("src/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.test.ts");
exists("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc.policy.ts");
exists("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc-lock.ts");

inc("docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md", [
  "Product Phase 59",
  "Gongbuho Intelligence Layer",
  "59-A",
  "59-F",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "LAWYER_CONFIRMED_BEFORE_STRATEGY_USE",
  "verify:aibeopchin-gongbuho-intelligence-phase59a",
  "59-SPEC.6",
]);

inc("src/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema.ts", [
  "phase59a-gongbuho-memory-packet-schema",
  "gongbuhoMemoryPacketSchema",
  "gongbuhoLearningTraceSchema",
  "AI_CANDIDATE",
  "LAWYER_CONFIRMED",
  "LOCKED",
  "caseScopeOnly",
  "tenantIsolationRequired",
  "realTimeLegalSignalStatusSchema",
]);

inc("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc.policy.ts", [
  "phase59f-gongbuho-intelligence-rc-policy",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "NO_INTELLIGENCE_RC_WITHOUT_59A_MEMORY_PACKET_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_PHASE54_STABILIZATION_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_MASTER_VERIFY",
  "NO_UGC_VECTOR_STORAGE",
  "NO_AI_AUTO_ACTION",
]);

inc("src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc-lock.ts", [
  "phase59f-gongbuho-intelligence-rc-gate",
  "verify:aibeopchin-gongbuho-intelligence-rc",
  "COMPLETE_LOCKED",
  "LEGAL_RELIABILITY_INTELLIGENCE_PLATFORM",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(PHASE59A_EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${PHASE59A_EVIDENCE_TAG}`);
}
if (!impl.includes(PREREQ_EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing prereq ${PREREQ_EVIDENCE_TAG}`);
}

if (!read("package.json").includes("verify:aibeopchin-gongbuho-intelligence-phase59a")) {
  throw new Error("missing verify:aibeopchin-gongbuho-intelligence-phase59a");
}

inc("tools/aibeopchin_navigator.py", [
  "Product Phase 59",
  "Gongbuho Intelligence Layer",
  "59-A DRAFT",
  "verify:aibeopchin-gongbuho-intelligence-phase59a",
]);

execSync(
  "npm run test -- src/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.test.ts src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Phase 59-A Gongbuho Memory Packet schema draft verified");
console.log("- Memory Packet schema: DRAFT · 59-A.0");
console.log("- Learning trace schema: included");
console.log("- Phase 54-F prereq evidence: present");
console.log(
  "verify:aibeopchin-gongbuho-intelligence-phase59a PASS (Product Phase 59-A Gongbuho Memory Packet Schema DRAFT)",
);
