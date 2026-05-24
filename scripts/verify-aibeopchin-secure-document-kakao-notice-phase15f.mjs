import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 15-F file: ${relativePath}`);
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

function main() {
  const required = [
    "prisma/migrations/20260525180000_secure_document_delivery_phase15f/migration.sql",
    "src/features/secure-document-delivery/secure-document-delivery.schema.ts",
    "src/features/secure-document-delivery/secure-document-delivery.service.ts",
    "src/features/secure-document-delivery/secure-document-delivery.repository.ts",
    "src/features/secure-document-delivery/secure-document-delivery-audit.ts",
    "src/app/api/cases/[caseId]/shared-documents/route.ts",
    "src/app/api/cases/[caseId]/shared-documents/[shareId]/send-kakao/route.ts",
    "src/app/api/client/cases/[caseId]/shared-documents/[shareId]/route.ts",
    "src/app/api/client/cases/[caseId]/shared-documents/[shareId]/mark-viewed/route.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model CaseDocumentDelivery",
    "model ExternalMessageLog",
    "documentShareNoticeEnabled",
    "firstViewedAt",
  ]);

  assertIncludes("src/features/secure-document-delivery/secure-document-delivery.schema.ts", [
    "PHASE15F_SECURE_DOCUMENT_DELIVERY",
    'SECURE_DOCUMENT_DELIVERY_VERSION = "15-F.1"',
    "KAKAO_DOCUMENT_NOTICE_BODY",
    "generateSecureLinkToken",
  ]);

  assertIncludes("src/features/secure-document-delivery/secure-document-delivery.service.ts", [
    "PHASE15F_SECURE_DOCUMENT_DELIVERY_SERVICE",
    "containsFileAttachment: false",
    "SKIPPED_NO_CONSENT",
    "createCaseSharedDocumentService",
    "sendKakaoDocumentNoticeService",
    "markClientSharedDocumentViewedService",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "lcc-section-shared-documents",
    "lcc-shared-document-create",
    "카카오 알림톡",
    "보안 공유 생성",
  ]);

  assertIncludes("src/components/client-portal/client-portal-client.tsx", [
    "client-portal-shared-open-",
    "client-portal-shared-detail",
    "보안 열람",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-action-feed.ts", [
    "CASE_SHARED_DOCUMENT_CREATED",
    "CASE_DOCUMENT_DELIVERY_SENT",
    "CASE_SHARED_DOCUMENT_VIEWED",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-SECURE-DOCUMENT-KAKAO-NOTICE-PHASE15F]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 15-F evidence");
  }

  console.log("verify:aibeopchin-secure-document-kakao-notice-phase15f — PASS");
}

main();
