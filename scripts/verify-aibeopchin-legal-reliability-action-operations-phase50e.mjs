import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const requiredFiles = [
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.service.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard.policy.ts",
  "src/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.test.ts",
  "src/features/legal-reliability-action-operations/phase50e-command-center-execution-dashboard.lock.ts",
  "src/components/cases/litigation-command-center/legal-reliability-action-operations-dashboard-panel.tsx",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/dashboard/route.ts",
];

const requiredMarkers = [
  "NO_DASHBOARD_AUTO_COMPLETION",
  "NO_DASHBOARD_AUTO_MESSAGING",
  "NO_DASHBOARD_AUTO_FILING",
  "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM",
  "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION",
  "attentionScore",
  "courtReadyAllowed",
  "blockedByUnreviewedEvidenceCount",
  "phase50e-legal-reliability-action-operations-command-center-execution-dashboard-lock",
  "lcc-section-action-operations-dashboard",
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

const forbiddenMutationMarkers = ["sendEmail", "sendKakao", "triggerUpload", "/complete"];
for (const marker of forbiddenMutationMarkers) {
  if (
    readFileSync(
      "src/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.service.ts",
      "utf8",
    ).includes(marker) ||
    readFileSync(
      "src/components/cases/litigation-command-center/legal-reliability-action-operations-dashboard-panel.tsx",
      "utf8",
    ).includes(marker)
  ) {
    throw new Error(`Forbidden dashboard mutation marker "${marker}"`);
  }
}

if (
  !readFileSync(
    "src/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.service.ts",
    "utf8",
  ).includes("assertCanReadLegalReliabilityActionOperations")
) {
  throw new Error("Missing CLIENT dashboard access block via assertCanReadLegalReliabilityActionOperations");
}

if (!readFileSync("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", "utf8").includes(
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50E-COMMAND-CENTER-EXECUTION-DASHBOARD",
)) {
  throw new Error("Missing Phase 50-E evidence block");
}

if (!readFileSync("package.json", "utf8").includes(
  "verify:aibeopchin-legal-reliability-action-operations-phase50e",
)) {
  throw new Error("Missing verify:aibeopchin-legal-reliability-action-operations-phase50e script");
}

execSync("npm run verify:aibeopchin-legal-reliability-action-operations-phase50d", {
  stdio: "inherit",
});

execSync(
  "npm run test -- src/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.test.ts",
  { stdio: "inherit" },
);

console.log("verify:aibeopchin-legal-reliability-action-operations-phase50e PASS");
