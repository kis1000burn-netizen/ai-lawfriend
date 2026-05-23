import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "docs/gongbuho/GONGBUHO_OPERATIONS_QA.md",
  "docs/gongbuho/GONGBUHO_AUDIT_POLICY.md",
  "docs/gongbuho/GONGBUHO_MVP_LOCK_SUMMARY.md",
  "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md",
  "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md",
  "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md",
  "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md",
  "src/lib/gongbuho/gongbuho-permissions.ts",
  "src/lib/gongbuho/gongbuho-audit-events.ts",
  "src/lib/gongbuho/gongbuho-audit-log.ts",
  "src/lib/gongbuho/legal-knowledge-pipeline-gates.ts",
  "src/features/gongbuho/legal-knowledge-pipeline.service.ts",
  "src/features/gongbuho/legal-knowledge-intake-form-defaults.ts",
  "src/lib/validators/legal-knowledge-pipeline.ts",
  "src/app/(protected)/admin/gongbuho/legal-knowledge/new/page.tsx",
  "src/app/(lawyer)/lawyer/legal-knowledge/reviews/page.tsx",
  "src/app/(lawyer)/lawyer/legal-knowledge/reviews/[briefId]/page.tsx",
  "src/lib/auth/require-approved-lawyer-api.ts",
  "src/components/lawyer/legal-knowledge-lawyer-review-panel.tsx",
  "tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts",
  "prisma/schema.prisma",
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
  "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md": [
    "Legal Knowledge Compiler",
    "GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY",
    "네이버 원문 무단 수집 금지",
    "UGC 본문",
    "UGC 전문",
    "변호사 검수",
    "변호사 승인",
    "법령·판례·공공자료",
    "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-COMPILER-POLICY",
  ],
  "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md": [
    "Legal Knowledge Intake",
    "GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC",
    "LegalKnowledgeDemandIntake",
    "querySignature",
    "normalizedKeyword",
    "questionType",
    "caseTypeMapping",
    "demandStrength",
    "noRawUgcStored",
    "READY_FOR_RESEARCH",
    "GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY",
    "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTAKE-SPEC",
  ],
  "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md": [
    "Legal Knowledge",
    "GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC",
    "LegalKnowledgeResearchBrief",
    "Research Brief",
    "LegalKnowledgeLawyerReviewDecision",
    "Lawyer Review",
    "canonicalSourceRefs",
    "GongbuhoPacket",
    "APPROVED",
    "READY_FOR_RESEARCH",
    "noRawUgcStored",
    "APPROVE_FOR_PACKET_DRAFT",
    "NAVER_SNIPPET",
    "KNOWLEDGE_IN",
    "GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC",
    "GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY",
    "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-PACKET-PIPELINE-SPEC",
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
    "LEGAL_KNOWLEDGE_READ",
    "LEGAL_KNOWLEDGE_WRITE",
    "LEGAL_KNOWLEDGE_COMPILE",
  ],
  "src/lib/gongbuho/gongbuho-audit-events.ts": [
    "GONGBUHO_AUDIT_EVENTS",
    "AUDIT_LOG_EVENTS",
    "GONGBUHO_TRACE_EVENTS",
    "isAuditLogEvent",
    "isGongbuhoTraceEvent",
    "GONGBUHO_LEGAL_KNOWLEDGE_RESEARCH_BRIEF_CREATED",
    "GONGBUHO_LEGAL_KNOWLEDGE_PACKET_DRAFT_FROM_PIPELINE",
  ],
  "src/lib/gongbuho/legal-knowledge-pipeline-gates.ts": [
    "LEGAL_KNOWLEDGE_FORBIDDEN_SOURCE_KINDS",
    "NAVER_SNIPPET",
    "KNOWLEDGE_IN",
    "LEGAL_KNOWLEDGE_CANONICAL_SOURCES_REQUIRED",
    "assertIntakeReadyForResearch",
    "assertLawyerApprovedForDraft",
  ],
  "src/features/gongbuho/legal-knowledge-pipeline.service.ts": [
    "createLegalKnowledgeResearchBrief",
    "recordLegalKnowledgeLawyerReview",
    "compileLegalKnowledgePacketDraft",
    "finalizeLegalKnowledgePipelineOnPacketApproved",
    "listLegalKnowledgeBriefsForLawyerReview",
    "getLegalKnowledgeBriefForLawyerReview",
    "LEGAL_KNOWLEDGE_INTAKE_NOT_READY_FOR_RESEARCH",
    "LEGAL_KNOWLEDGE_LAWYER_APPROVAL_REQUIRED",
    "LEGAL_KNOWLEDGE_BRIEF_NOT_READY_FOR_LAWYER",
  ],
  "src/features/gongbuho/legal-knowledge-intake-form-defaults.ts": [
    "buildLegalKnowledgeIntakeCreatePayload",
    "READY_FOR_RESEARCH",
    "noRawUgcStored",
  ],
  "tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts": [
    "E2E_LEGAL_KNOWLEDGE_PIPELINE_SMOKE",
    "PACKET_APPROVED",
    "compile-packet-draft",
    "/api/lawyer/legal-knowledge/research-briefs",
  ],
  "prisma/schema.prisma": [
    "model LegalKnowledgeDemandIntake",
    "model LegalKnowledgeResearchBrief",
    "model LegalKnowledgeLawyerReviewDecision",
    "LegalKnowledgeIntakeStatus",
    "READY_FOR_RESEARCH",
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

const legalKnowledgePipelineApiMarkers = {
  "src/app/api/admin/gongbuho/legal-knowledge/intake/route.ts": [
    "createLegalKnowledgeIntake",
    "LEGAL_KNOWLEDGE_READ",
    "LEGAL_KNOWLEDGE_WRITE",
  ],
  "src/app/api/admin/gongbuho/legal-knowledge/intake/[intakeId]/research-brief/route.ts": [
    "createLegalKnowledgeResearchBrief",
    "GONGBUHO_LEGAL_KNOWLEDGE_RESEARCH_BRIEF_CREATED",
  ],
  "src/app/api/admin/gongbuho/legal-knowledge/research-brief/[briefId]/ready-for-review/route.ts": [
    "markLegalKnowledgeResearchBriefReadyForReview",
    "GONGBUHO_LEGAL_KNOWLEDGE_RESEARCH_BRIEF_READY",
  ],
  "src/app/api/admin/gongbuho/legal-knowledge/research-brief/[briefId]/lawyer-review/route.ts": [
    "recordLegalKnowledgeLawyerReview",
    "requireLegalKnowledgeLawyerReviewApi",
  ],
  "src/app/api/admin/gongbuho/legal-knowledge/lawyer-review/[reviewId]/compile-packet-draft/route.ts": [
    "compileLegalKnowledgePacketDraft",
    "LEGAL_KNOWLEDGE_COMPILE",
    "GONGBUHO_LEGAL_KNOWLEDGE_PACKET_DRAFT_FROM_PIPELINE",
  ],
};

const legalKnowledgeLawyerPortalMarkers = {
  "src/lib/auth/require-approved-lawyer-api.ts": [
    "requireApprovedLawyerApi",
    "assertLawyerProfessionalAccess",
  ],
  "src/app/api/lawyer/legal-knowledge/research-briefs/route.ts": [
    "requireApprovedLawyerApi",
    "listLegalKnowledgeBriefsForLawyerReview",
  ],
  "src/app/api/lawyer/legal-knowledge/research-briefs/[briefId]/route.ts": [
    "requireApprovedLawyerApi",
    "getLegalKnowledgeBriefForLawyerReview",
  ],
  "src/app/api/lawyer/legal-knowledge/research-briefs/[briefId]/lawyer-review/route.ts": [
    "requireApprovedLawyerApi",
    "reviewerRole: \"LAWYER\"",
    "LAWYER_PORTAL",
    "GONGBUHO_LEGAL_KNOWLEDGE_LAWYER_REVIEW_RECORDED",
  ],
  "src/app/(lawyer)/lawyer/legal-knowledge/reviews/page.tsx": [
    "listLegalKnowledgeBriefsForLawyerReview",
    "requireApprovedLawyer",
    "READY_FOR_LAWYER_REVIEW",
  ],
  "src/app/(lawyer)/lawyer/legal-knowledge/reviews/[briefId]/page.tsx": [
    "getLegalKnowledgeBriefForLawyerReview",
    "LegalKnowledgeLawyerReviewPanel",
  ],
  "src/components/lawyer/legal-knowledge-lawyer-review-panel.tsx": [
    "APPROVE_FOR_PACKET_DRAFT",
    "/api/lawyer/legal-knowledge/research-briefs",
    "legal-knowledge-lawyer-review-panel",
  ],
  "src/app/(lawyer)/lawyer/layout.tsx": [
    "/lawyer/legal-knowledge/reviews",
    "공부호 Legal Knowledge 검수",
  ],
};

const legalKnowledgeIntelligenceMarkers = {
  "src/lib/gongbuho/legal-knowledge-intelligence-policy.ts": [
    "LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_POLICY_MARKER",
    "LEGAL_KNOWLEDGE_INTELLIGENCE_BODY_EXPOSURE_ALLOWED = false",
    "LEGAL_KNOWLEDGE_LAWYER_REVIEW_SLA_HOURS_DEFAULT",
  ],
  "src/features/gongbuho/legal-knowledge-intelligence.service.ts": [
    "LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_SERVICE_MARKER",
    "getLegalKnowledgeIntelligenceDashboard",
    "assertLegalKnowledgeIntelligenceDashboardMetaOnly",
  ],
  "src/app/api/admin/gongbuho/legal-knowledge/dashboard/route.ts": [
    "getLegalKnowledgeIntelligenceDashboard",
    "LEGAL_KNOWLEDGE_READ",
  ],
  "src/app/(protected)/admin/gongbuho/legal-knowledge/dashboard/page.tsx": [
    "LegalKnowledgeIntelligenceDashboardView",
    "getLegalKnowledgeIntelligenceDashboard",
  ],
  "src/components/admin/gongbuho/legal-knowledge-intelligence-dashboard.tsx": [
    "legal-knowledge-intelligence-dashboard",
    "caseTypeDemand",
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

  for (const [file, terms] of Object.entries(legalKnowledgePipelineApiMarkers)) {
    assertFileExists(file);
    assertIncludes(file, terms);
  }

  for (const [file, terms] of Object.entries(legalKnowledgeLawyerPortalMarkers)) {
    assertFileExists(file);
    assertIncludes(file, terms);
  }

  for (const [file, terms] of Object.entries(legalKnowledgeIntelligenceMarkers)) {
    assertFileExists(file);
    assertIncludes(file, terms);
  }

  const readme = readFile("docs/gongbuho/README.md");
  if (!readme.includes("GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md")) {
    throw new Error("docs/gongbuho/README.md must link GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md");
  }
  if (!readme.includes("Legal Knowledge Compiler")) {
    throw new Error("docs/gongbuho/README.md must reference Legal Knowledge Compiler policy");
  }
  if (!readme.includes("GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md")) {
    throw new Error("docs/gongbuho/README.md must link GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md");
  }
  if (!readme.includes("Legal Knowledge Intake")) {
    throw new Error("docs/gongbuho/README.md must reference Legal Knowledge Intake spec");
  }
  if (!readme.includes("GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md")) {
    throw new Error("docs/gongbuho/README.md must link GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md");
  }
  if (!readme.includes("Legal Knowledge 패킷 파이프라인")) {
    throw new Error("docs/gongbuho/README.md must reference Legal Knowledge packet pipeline spec");
  }
  if (!readme.includes("**4-I**")) {
    throw new Error("docs/gongbuho/README.md must reference Phase **4-I**");
  }
  if (!readme.includes("GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md")) {
    throw new Error("docs/gongbuho/README.md must link GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md");
  }

  const spec4i = readFile("docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md");
  const spec4iTerms = [
    "Phase 4-I",
    "Intelligence Dashboard",
    "draftText",
    "legalIssueOutline",
    "[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTELLIGENCE-DASHBOARD]",
  ];
  for (const term of spec4iTerms) {
    if (!spec4i.includes(term)) {
      throw new Error(`Missing term "${term}" in GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md`);
    }
  }

  const e2eLk = readFile("tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts");
  if (!e2eLk.includes("/api/admin/gongbuho/legal-knowledge/dashboard")) {
    throw new Error("gongbuho-legal-knowledge-pipeline-smoke.spec.ts must gate dashboard API");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tagCompilerPolicy = "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-COMPILER-POLICY";
  if (!impl.includes(tagCompilerPolicy)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagCompilerPolicy}`);
  }
  const tagIntakeSpec = "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTAKE-SPEC";
  if (!impl.includes(tagIntakeSpec)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagIntakeSpec}`);
  }
  const tagPipelineSpec = "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-PACKET-PIPELINE-SPEC";
  if (!impl.includes(tagPipelineSpec)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagPipelineSpec}`);
  }
  const tagPipelineImpl = "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-PIPELINE-IMPLEMENTATION";
  if (!impl.includes(tagPipelineImpl)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagPipelineImpl}`);
  }
  const tagLawyerPortal = "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-LAWYER-PORTAL";
  if (!impl.includes(tagLawyerPortal)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagLawyerPortal}`);
  }
  const tag4i = "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTELLIGENCE-DASHBOARD";
  if (!impl.includes(tag4i)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag4i}`);
  }

  console.log("verify:gongbuho PASS (static gates + Phase 4-I Intelligence Dashboard)");
  console.log("- Operations QA document exists");
  console.log("- Audit policy document exists");
  console.log("- Legal Knowledge Compiler policy (GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY) exists");
  console.log("- Legal Knowledge Intake spec (GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC) exists");
  console.log("- Legal Knowledge packet pipeline spec (GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC) exists");
  console.log("- README links Legal Knowledge Compiler policy");
  console.log("- README links Legal Knowledge Intake spec");
  console.log("- README links Legal Knowledge packet pipeline spec");
  console.log("- IMPLEMENTATION_EVIDENCE compiler policy tag present");
  console.log("- IMPLEMENTATION_EVIDENCE intake spec tag present");
  console.log("- IMPLEMENTATION_EVIDENCE packet pipeline spec tag present");
  console.log("- IMPLEMENTATION_EVIDENCE pipeline implementation tag present");
  console.log("- IMPLEMENTATION_EVIDENCE lawyer portal tag present");
  console.log("- Legal Knowledge pipeline gates + service exist");
  console.log("- Legal Knowledge pipeline API routes exist");
  console.log("- Legal Knowledge Lawyer portal routes + UI exist");
  console.log("- Legal Knowledge Intake form + E2E smoke spec exist");
  console.log("- Permission matrix source exists");
  console.log("- Audit event source exists");
  console.log("- gongbuho-audit-log helper exists");
  console.log("- Phase 4-F route/wiring markers present");
  console.log("- MVP lock summary (Phase 4-G) exists");
  console.log("- Required sample packets exist");
  console.log("- Required sample packets include caseType");
}

main();
