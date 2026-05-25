import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const requiredFiles = [
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-completion.schema.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-completion.policy.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-completion.service.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-completion-ledger.service.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-completion.test.ts",
  "src/features/legal-reliability-action-operations/phase50d-lawyer-completion-review.lock.ts",
  "src/components/cases/litigation-command-center/legal-reliability-action-operation-completion-controls.tsx",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/complete/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/request-more-info/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/reopen/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/defer/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/cancel/route.ts",
];

const requiredMarkers = [
  "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION",
  "NO_CLIENT_RESPONSE_AUTO_COMPLETION",
  "NO_AI_COMPLETION_DECISION",
  "NO_EVIDENCE_CONFIRMATION_WITHOUT_LAWYER_REVIEW",
  "COMPLETION_DECISION_LEDGER_REQUIRED",
  "NO_COURT_READY_USE_WITHOUT_CONFIRMED_REVIEW",
  "phase50d-legal-reliability-action-operations-completion-lock",
  "LEGAL_RELIABILITY_ACTION_OPERATION_COMPLETION_REVIEWED",
  "NEEDS_MORE_INFO",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const combined = requiredFiles
  .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

for (const marker of requiredMarkers) {
  if (!combined.includes(marker)) {
    throw new Error(`Missing required marker: ${marker}`);
  }
}

if (!readFileSync("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", "utf8").includes(
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50D-LAWYER-COMPLETION-REVIEW",
)) {
  throw new Error("Missing Phase 50-D evidence block");
}

if (!readFileSync("package.json", "utf8").includes(
  "verify:aibeopchin-legal-reliability-action-operations-phase50d",
)) {
  throw new Error("Missing verify:aibeopchin-legal-reliability-action-operations-phase50d script");
}

execSync("npm run verify:aibeopchin-legal-reliability-action-operations-phase50c", {
  stdio: "inherit",
});

execSync(
  "npm run test -- src/features/legal-reliability-action-operations/legal-reliability-action-operation-completion.test.ts",
  { stdio: "inherit" },
);

console.log("verify:aibeopchin-legal-reliability-action-operations-phase50d PASS");
