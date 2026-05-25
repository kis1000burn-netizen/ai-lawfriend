import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phaseId = process.argv[2];

const phases = {
  "50a": {
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50A-QUEUE",
    prereqEvidence: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-LOOP-PHASE49C-RC",
    prereqVerify: "verify:aibeopchin-legal-reliability-action-loop-rc",
    verifyScript: "verify:aibeopchin-legal-reliability-action-operations-phase50a",
    test: "src/features/legal-reliability-action-operations/phase50a-action-operations-queue.test.ts",
    service: "src/features/legal-reliability-action-operations/legal-reliability-action-operation.service.ts",
    lock: "src/features/legal-reliability-action-operations/phase50a-action-operations-queue.lock.ts",
    schema: "src/features/legal-reliability-action-operations/legal-reliability-action-operation.schema.ts",
    spec: "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_PHASE50_SPEC.md",
    operations: ["Product 50-A", "LEGAL_RELIABILITY_ACTION_OPERATIONS"],
    crossLink: "50-A",
    checks: [
      ["src/features/legal-reliability-action-operations/phase50a-action-operations-queue.lock.ts", [
        "NO_AUTO_OPERATION_COMPLETION",
        "phase50a-legal-reliability-action-operations-queue-lock",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation.schema.ts", [
        "SUPPLEMENT_REQUEST_OPERATION",
        "EVIDENCE_REQUEST_OPERATION",
        "WAITING_TO_SEND",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation.service.ts", [
        "createLegalReliabilityActionOperationFromApprovedCandidateService",
        "LEGAL_RELIABILITY_ACTION_OPERATION_CREATED",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation.policy.ts", [
        "LAWYER_DECISION_LEDGER_REQUIRED",
        "NO_AUTO_OPERATION_COMPLETION",
      ]],
      ["src/components/cases/litigation-command-center/legal-reliability-action-operations-panel.tsx", [
        "lcc-section-action-operations-queue",
      ]],
      ["src/components/cases/litigation-command-center-client.tsx", [
        "LegalReliabilityActionOperationsPanel",
        "lcc-section-action-operations-wrapper",
      ]],
      ["src/features/document-intelligence/litigation-command-center.schema.ts", [
        "actionOperations",
      ]],
      ["src/app/api/cases/[caseId]/legal-reliability/action-operations/route.ts", [
        "listLegalReliabilityActionOperationsService",
      ]],
    ],
  },
  "50b": {
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50B-ASSIGNMENT-DUE-SLA",
    prereqEvidence: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50A-QUEUE",
    prereqVerify: "verify:aibeopchin-legal-reliability-action-operations-phase50a",
    verifyScript: "verify:aibeopchin-legal-reliability-action-operations-phase50b",
    test: [
      "src/features/legal-reliability-action-operations/legal-reliability-action-operation-sla.test.ts",
      "src/features/legal-reliability-action-operations/legal-reliability-action-operation-assignment.policy.test.ts",
    ],
    service: "src/features/legal-reliability-action-operations/legal-reliability-action-operation.service.ts",
    lock: "src/features/legal-reliability-action-operations/phase50b-assignment-due-sla.lock.ts",
    schema: "src/features/legal-reliability-action-operations/legal-reliability-action-operation.schema.ts",
    spec: "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_PHASE50_SPEC.md",
    operations: ["Product 50-B", "LEGAL_RELIABILITY_ACTION_OPERATIONS"],
    crossLink: "50-B",
    checks: [
      ["src/features/legal-reliability-action-operations/phase50b-assignment-due-sla.lock.ts", [
        "NO_SLA_ESCALATION_WITHOUT_HUMAN_OWNER",
        "phase50b-legal-reliability-action-operations-assignment-due-sla-lock",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation-sla.service.ts", [
        "computeLegalReliabilityActionSlaStatus",
        "DUE_SOON",
        "OVERDUE",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation-assignment.policy.ts", [
        "CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN",
        "COMPLETED_OPERATION_ASSIGNMENT_FORBIDDEN",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation.service.ts", [
        "assignLegalReliabilityActionOperationService",
        "setLegalReliabilityActionOperationDueDateService",
        "LEGAL_RELIABILITY_ACTION_OPERATION_ASSIGNED",
        "LEGAL_RELIABILITY_ACTION_OPERATION_DUE_DATE_SET",
      ]],
      ["src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/assign/route.ts", [
        "assignLegalReliabilityActionOperationService",
      ]],
      ["src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/due-date/route.ts", [
        "setLegalReliabilityActionOperationDueDateService",
      ]],
      ["src/components/cases/litigation-command-center/legal-reliability-action-operation-sla-badge.tsx", [
        "lcc-action-operation-sla-",
      ]],
      ["src/components/cases/litigation-command-center/legal-reliability-action-operation-row.tsx", [
        "assignedToName",
        "slaBadgeLabel",
        "lcc-action-operation-due-at-",
      ]],
      ["src/components/cases/litigation-command-center/legal-reliability-action-operation-assignment-controls.tsx", [
        "lcc-action-operation-assign-",
      ]],
      ["src/components/cases/litigation-command-center/legal-reliability-action-operation-due-date-control.tsx", [
        "lcc-action-operation-due-date-",
      ]],
    ],
  },
  "50c": {
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50C-CLIENT-RESPONSE-EVIDENCE-INTAKE-SYNC",
    prereqEvidence: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50B-ASSIGNMENT-DUE-SLA",
    prereqVerify: "verify:aibeopchin-legal-reliability-action-operations-phase50b",
    verifyScript: "verify:aibeopchin-legal-reliability-action-operations-phase50c",
    test: [
      "src/features/legal-reliability-action-operations/legal-reliability-action-operation-client-response-sync.test.ts",
      "src/features/legal-reliability-action-operations/legal-reliability-action-operation-evidence-intake-sync.test.ts",
      "src/features/legal-reliability-action-operations/legal-reliability-action-operation-review-handoff.test.ts",
    ],
    service: "src/features/legal-reliability-action-operations/legal-reliability-action-operation-client-response-sync.service.ts",
    lock: "src/features/legal-reliability-action-operations/phase50c-client-response-evidence-intake.lock.ts",
    schema: "src/features/legal-reliability-action-operations/legal-reliability-action-operation.schema.ts",
    spec: "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_PHASE50_SPEC.md",
    operations: ["Product 50-C", "LEGAL_RELIABILITY_ACTION_OPERATIONS"],
    crossLink: "50-C",
    checks: [
      ["src/features/legal-reliability-action-operations/phase50c-client-response-evidence-intake.lock.ts", [
        "CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION",
        "NO_AUTO_EVIDENCE_PROMOTION",
        "phase50c-legal-reliability-action-operations-client-response-evidence-intake-lock",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation-client-response.policy.ts", [
        "CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION",
        "CLIENT_UPLOAD_IS_NOT_CONFIRMED_EVIDENCE",
        "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION",
        "NO_AUTO_EVIDENCE_PROMOTION",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation-client-response-sync.service.ts", [
        "syncClientResponseToLegalReliabilityOperation",
        "LEGAL_RELIABILITY_ACTION_CLIENT_RESPONSE_SYNCED",
        "LEGAL_RELIABILITY_ACTION_EVIDENCE_INTAKE_LINKED",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation-evidence-intake-sync.service.ts", [
        "buildEvidenceIntakeLinksForUploadedFiles",
        "NO_AUTO_EVIDENCE_PROMOTION",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation-status-sync.service.ts", [
        "validateClientResponseStatusTransition",
        "EVIDENCE_INTAKE_LINKED",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation-review-handoff.service.ts", [
        "handoffLegalReliabilityActionOperationToLawyerReviewService",
        "LEGAL_RELIABILITY_ACTION_LAWYER_REVIEW_HANDOFF_CREATED",
        "downstreamAllowed: false",
      ]],
      ["src/features/legal-reliability-action-operations/legal-reliability-action-operation.schema.ts", [
        "EVIDENCE_INTAKE_LINKED",
        "evidenceIntakeSyncStatusSchema",
        "lawyerReviewRequired",
      ]],
      ["src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/client-response-sync/route.ts", [
        "syncClientResponseToLegalReliabilityOperationService",
      ]],
      ["src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/handoff-lawyer-review/route.ts", [
        "handoffLegalReliabilityActionOperationToLawyerReviewService",
      ]],
      ["src/features/client-portal/client-submission.service.ts", [
        "syncClientResponseToLegalReliabilityOperationFromPortal",
      ]],
      ["src/components/cases/litigation-command-center/legal-reliability-action-operation-response-badge.tsx", [
        "lcc-action-operation-response-badge-",
        "lcc-action-operation-uploaded-file-count-",
      ]],
      ["src/components/cases/litigation-command-center/legal-reliability-action-operation-review-handoff-control.tsx", [
        "lcc-action-operation-handoff-",
      ]],
      ["src/components/cases/litigation-command-center/legal-reliability-action-operation-row.tsx", [
        "LegalReliabilityActionOperationResponseBadge",
      ]],
    ],
  },
};

const phase = phases[phaseId];
if (!phase) throw new Error(`Unknown phase ${phaseId}`);

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

exists(phase.service);
exists(phase.lock);
exists(phase.spec);

for (const [file, terms] of phase.checks) {
  inc(file, terms);
}

inc("prisma/schema.prisma", ["LegalReliabilityActionOperation", "sourceActionCandidateId"]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(phase.tag)) {
  throw new Error(`Missing ${phase.tag}`);
}
if (!read("package.json").includes(phase.verifyScript)) {
  throw new Error(`missing ${phase.verifyScript}`);
}
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(phase.prereqEvidence)) {
  throw new Error(`missing prereq ${phase.prereqEvidence}`);
}
if (!read("package.json").includes(phase.prereqVerify)) {
  throw new Error(`missing prereq verify ${phase.prereqVerify}`);
}

inc("docs/OPERATIONS_INDEX.md", phase.operations);
inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [phase.crossLink, "Action Operations"]);

inc("src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.service.ts", [
  "createLegalReliabilityActionOperationFromApprovedCandidateService",
]);
inc("src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.service.ts", [
  "createLegalReliabilityActionOperationFromApprovedCandidateService",
]);

const forbidden = ["real-messaging", "sendEmail", "sendKakao", "triggerUpload"];
for (const marker of forbidden) {
  if (read(phase.service).includes(marker)) {
    throw new Error(`Forbidden direct trigger marker "${marker}" in ${phase.service}`);
  }
}

execSync(`npm run test -- ${Array.isArray(phase.test) ? phase.test.join(" ") : phase.test}`, {
  stdio: "inherit",
  cwd: root,
});

console.log(`${phase.verifyScript} PASS`);
