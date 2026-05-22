import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "docs/gongbuho/GONGBUHO_OPERATIONS_QA.md",
  "docs/gongbuho/GONGBUHO_AUDIT_POLICY.md",
  "docs/gongbuho/GONGBUHO_MVP_LOCK_SUMMARY.md",
  "src/lib/gongbuho/gongbuho-permissions.ts",
  "src/lib/gongbuho/gongbuho-audit-events.ts",
  "src/lib/gongbuho/gongbuho-audit-log.ts",
];

const requiredSamples = [
  "docs/gongbuho/samples/LAW_FRAUD_001_GONGBUHO.json",
  "docs/gongbuho/samples/LAW_WAGE_001_GONGBUHO.json",
  "docs/gongbuho/samples/LAW_LAND_001_GONGBUHO.json",
  "docs/gongbuho/samples/LAW_CONTENT_001_GONGBUHO.json",
  "docs/gongbuho/samples/LAW_COMPLAINT_001_GONGBUHO.json",
];

const requiredDocTerms = {
  "docs/gongbuho/GONGBUHO_OPERATIONS_QA.md": [
    "Phase 4-E",
    "Phase 4-G",
    "PASS",
    "권한 매트릭스",
    "운영 QA 체크리스트",
    "Seed / Sample",
    "API 검증",
    "UI Model",
    "STAFF",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  "docs/gongbuho/GONGBUHO_AUDIT_POLICY.md": [
    "AuditLog",
    "GongbuhoTrace",
    "GONGBUHO_PACKET_CREATED",
    "GONGBUHO_PACKET_APPROVED",
    "GONGBUHO_PACKET_ARCHIVED",
    "GONGBUHO_QUESTION_SET_PROJECTED",
    "GONGBUHO_APPLIED_TO_CASE",
    "GONGBUHO_INTERVIEW_BOUND",
    "GONGBUHO_DOCUMENT_RULES_APPLIED",
  ],
  "docs/gongbuho/GONGBUHO_MVP_LOCK_SUMMARY.md": [
    "Phase 4-G",
    "npm run verify:gongbuho",
    "EVIDENCE-20260523-GONGBUHO-PHASE4G-MVP-LOCK-PREDEPLOY-QA",
  ],
};

const requiredSourceTerms = {
  "src/lib/gongbuho/gongbuho-permissions.ts": [
    "STAFF",
    "ADMIN",
    "SUPER_ADMIN",
    "canOperateGongbuho",
    "assertCanOperateGongbuho",
    "assertGongbuhoOperation",
    "PROJECT_QUESTION_SET",
    "CREATE_PACKET",
  ],
  "src/lib/gongbuho/gongbuho-audit-events.ts": [
    "GONGBUHO_AUDIT_EVENTS",
    "AUDIT_LOG_EVENTS",
    "GONGBUHO_TRACE_EVENTS",
    "isAuditLogEvent",
    "isGongbuhoTraceEvent",
  ],
  "src/lib/gongbuho/gongbuho-audit-log.ts": ["writeGongbuhoAuditLog", "AUDIT_LOG_EVENTS"],
};

const phase4FWiringMarkers = {
  "src/app/api/admin/gongbuho/route.ts": [
    "assertGongbuhoOperation",
    "writeGongbuhoAuditLog",
    "LIST",
    "CREATE_PACKET",
  ],
  "src/app/api/admin/gongbuho/[gongbuhoId]/route.ts": ["assertGongbuhoOperation", "DETAIL"],
  "src/app/api/admin/gongbuho/[gongbuhoId]/approve/route.ts": [
    "assertGongbuhoOperation",
    "writeGongbuhoAuditLog",
    "GONGBUHO_PACKET_APPROVED",
  ],
  "src/app/api/admin/gongbuho/[gongbuhoId]/archive/route.ts": [
    "assertGongbuhoOperation",
    "writeGongbuhoAuditLog",
    "GONGBUHO_PACKET_ARCHIVED",
  ],
  "src/app/api/admin/gongbuho/[gongbuhoId]/question-set/project/route.ts": [
    "assertGongbuhoOperation",
    "writeGongbuhoAuditLog",
    "GONGBUHO_QUESTION_SET_PROJECTED",
  ],
  "src/app/api/admin/gongbuho/[gongbuhoId]/question-flow/preview/route.ts": [
    "assertGongbuhoOperation",
    "PREVIEW",
  ],
  "src/app/api/cases/[caseId]/gongbuho/apply/route.ts": ["applyGongbuhoToCase", "actorUserId"],
  "src/features/gongbuho/gongbuho-packet.service.ts": [
    "gongbuhoPhase4Flow",
    "GONGBUHO_APPLIED_TO_CASE",
    "mergeLatestGongbuhoTraceInterviewBinding",
  ],
  "src/features/gongbuho/gongbuho-interview-binding.service.ts": [
    "mergeLatestGongbuhoTraceInterviewBinding",
  ],
  "src/features/gongbuho/gongbuho-document-rules.service.ts": [
    "GONGBUHO_DOCUMENT_RULES_APPLIED",
    "gongbuhoPhase4Flow",
  ],
};

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  const target = path.join(root, relativePath);

  if (!fs.existsSync(target)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

function assertIncludes(relativePath, terms) {
  const content = readFile(relativePath);

  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

function assertJsonHasCaseType(relativePath) {
  const content = readFile(relativePath);
  const json = JSON.parse(content);

  if (!json.caseType || typeof json.caseType !== "string") {
    throw new Error(`Sample must include string caseType: ${relativePath}`);
  }
}

function main() {
  for (const file of requiredFiles) {
    assertFileExists(file);
  }

  for (const file of requiredSamples) {
    assertFileExists(file);
    assertJsonHasCaseType(file);
  }

  for (const [file, terms] of Object.entries(requiredDocTerms)) {
    assertIncludes(file, terms);
  }

  for (const [file, terms] of Object.entries(requiredSourceTerms)) {
    assertIncludes(file, terms);
  }

  for (const [file, terms] of Object.entries(phase4FWiringMarkers)) {
    assertFileExists(file);
    assertIncludes(file, terms);
  }

  console.log("verify:gongbuho PASS (static gates)");
  console.log("- Operations QA document exists");
  console.log("- Audit policy document exists");
  console.log("- Permission matrix source exists");
  console.log("- Audit event source exists");
  console.log("- gongbuho-audit-log helper exists");
  console.log("- Phase 4-F route/wiring markers present");
  console.log("- MVP lock summary (Phase 4-G) exists");
  console.log("- Required sample packets exist");
  console.log("- Required sample packets include caseType");
}

main();
