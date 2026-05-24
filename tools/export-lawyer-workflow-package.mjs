#!/usr/bin/env node
/**
 * 변호사 로그인 이후 업무 영역 — 외부 법률전문가 검토용 자료 패키지 생성
 *
 * 사용: node tools/export-lawyer-workflow-package.mjs
 * 출력: exports/lawyer-workflow-review-YYYYMMDD/ + .zip
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATE = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const EXPORT_NAME = `lawyer-workflow-review-${DATE}`;
const EXPORT_DIR = path.join(ROOT, "exports", EXPORT_NAME);

/** @type {Array<{ label: string; paths: string[] }>} */
const SECTIONS = [
  {
    label: "01-portal-pages",
    paths: ["src/app/(lawyer)/lawyer"],
  },
  {
    label: "02-lawyer-dashboard-ui",
    paths: [
      "src/components/dashboard/lawyer",
      "src/components/lawyer",
    ],
  },
  {
    label: "03-case-review-ui",
    paths: [
      "src/components/cases/lawyer-intelligence-review-console.tsx",
      "src/components/cases/lawyer-voice-review-panel.tsx",
      "src/components/cases/document-review-panel.tsx",
      "src/components/cases/case-gongbuho-review-card.tsx",
      "src/components/cases/case-detail-client.tsx",
      "src/components/cases/paragraph-structure-panel.tsx",
      "src/components/cases/case-timeline-panel.tsx",
      "src/components/cases/document-detail-client.tsx",
      "src/components/case-package",
      "src/components/supplement-requests",
      "src/components/jeonse-damage/jeonse-damage-lawyer-review-button.tsx",
      "src/components/illegal-lending/illegal-lending-lawyer-review-button.tsx",
    ],
  },
  {
    label: "04-protected-pages-lawyer-access",
    paths: [
      "src/app/(protected)/cases/[caseId]/intelligence-review",
      "src/app/(protected)/cases/[caseId]/page.tsx",
      "src/app/(protected)/cases/[caseId]/client-disclosure-preview",
      "src/app/(protected)/cases/[caseId]/documents",
      "src/app/(protected)/dashboard/page.tsx",
    ],
  },
  {
    label: "05-lawyer-api",
    paths: ["src/app/api/lawyer"],
  },
  {
    label: "06-case-apis-lawyer-uses",
    paths: [
      "src/app/api/cases/[caseId]/intelligence-review",
      "src/app/api/cases/[caseId]/voice/lawyer-reviews",
      "src/app/api/cases/[caseId]/voice/document-finalize-gate",
      "src/app/api/legal-documents",
    ],
  },
  {
    label: "07-auth-permissions",
    paths: [
      "src/lib/auth/session.ts",
      "src/lib/auth/require-approved-lawyer-api.ts",
      "src/lib/auth/require-legal-knowledge-lawyer-review-api.ts",
      "src/lib/auth/post-auth-redirect.ts",
      "src/lib/auth/roles.ts",
      "src/lib/landing/post-login-href.ts",
      "src/features/cases/case.permissions.ts",
      "src/lib/case-action-guard.ts",
      "src/lib/dashboard/lawyer-review-priority.ts",
      "src/lib/dashboard/dashboard-metrics.ts",
      "src/lib/dashboard/dashboard-display.ts",
      "src/lib/definitions/permission-definition.ts",
      "src/lib/definitions/permissions.ts",
      "src/lib/role-map.ts",
      "src/middleware.ts",
    ],
  },
  {
    label: "08-domain-services",
    paths: [
      "src/lib/lawyer",
      "src/features/ai-core/lawyer-judgment-boundary-ledger.schema.ts",
      "src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts",
      "src/features/ai-core/lawyer-judgment-boundary-validator.ts",
      "src/features/ai-core/lawyer-review-console-lock.ts",
      "src/features/ai-core/case-intelligence-review.service.ts",
      "src/features/ai-core/case-intelligence-review.api.validators.ts",
      "src/features/ai-core/client-safe-disclosure.schema.ts",
      "src/features/voice/voice-lawyer-supplement.service.ts",
      "src/features/voice/voice-lawyer-supplement.api.validators.ts",
      "src/lib/voice/voice-lawyer-review-ux-policy.ts",
      "src/lib/voice/voice-lawyer-review-flags.repository.ts",
      "src/lib/voice/voice-document-finalize-gate.service.ts",
      "src/lib/voice/voice-document-finalize-gate-ui.ts",
      "src/features/gongbuho/case-gongbuho-review-ux.ts",
      "src/features/gongbuho/legal-knowledge-pipeline.service.ts",
      "src/features/gongbuho/legal-knowledge-intelligence.service.ts",
      "src/lib/gongbuho/legal-knowledge-pipeline-gates.ts",
      "src/lib/gongbuho/legal-knowledge-intelligence-policy.ts",
      "src/lib/gongbuho/gongbuho-permissions.ts",
      "src/features/case-package/case-package-share-policy.ts",
      "src/features/case-package/case-package-share-policy-utils.ts",
      "src/features/case-package/case-package-privacy-security-policy.ts",
      "src/features/case-package/case-package-share.repository.ts",
      "src/lib/case-package",
      "src/features/supplement-request",
      "src/features/illegal-lending/illegal-lending-lawyer-assignment.ts",
    ],
  },
  {
    label: "09-docs-specs",
    paths: [
      "docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md",
      "docs/ai/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md",
      "docs/gongbuho/GONGBUHO_LAWYER_REVIEW_UX.md",
      "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md",
      "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md",
      "docs/voice/VOICE_LAWYER_REVIEW_UX_SPEC.md",
      "docs/project-governance/AIBEOPCHIN_6_0_CASE_PACKAGE_SHARE_LAWYER_ACCESS_PLAN.md",
      "docs/project-governance/AIBEOPCHIN_6_1_CASE_PACKAGE_DATA_STRUCTURE_AND_GENERATION_RULES.md",
      "docs/project-governance/AIBEOPCHIN_6_2_CASE_PACKAGE_CODE_CONSENT_POLICY.md",
      "docs/project-governance/AIBEOPCHIN_6_2_PUBLIC_CODE_AND_SHARE_CONSENT_RULES.md",
      "docs/project-governance/LAWYER_VERIFICATION_DOCUMENT_STORAGE_SECURITY_PLAN.md",
      "docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_DATA_STRUCTURE_DEFINITION.md",
      "docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_STATUS_DEFINITION.md",
      "docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_IMPLEMENTATION_DEFINITION.md",
      "docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_SCREEN_DEFINITION.md",
      "docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_WORKFLOW_DEFINITION.md",
    ],
  },
  {
    label: "10-e2e-reference",
    paths: [
      "tests/e2e/lawyer-verification-smoke.spec.ts",
      "tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts",
    ],
  },
];

const PRISMA_MODELS = [
  "LawyerProfile",
  "LawyerVerificationDocument",
  "CasePackageShare",
  "CasePackageShareAccessLog",
  "CaseIntelligenceSnapshot",
  "LegalKnowledgeResearchBrief",
  "LegalKnowledgeLawyerReview",
  "VoiceLawyerReviewFlag",
  "SupplementRequest",
  "SupplementRequestAuditLog",
];

function collectFiles(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return [];

  const stat = fs.statSync(abs);
  if (stat.isFile()) return [relPath.replace(/\\/g, "/")];

  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    out.push(...collectFiles(path.join(relPath, entry.name)));
  }
  return out;
}

function copyFile(relPath, destSection) {
  const src = path.join(ROOT, relPath);
  const dest = path.join(EXPORT_DIR, destSection, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function extractPrismaExcerpt() {
  const schemaPath = path.join(ROOT, "prisma/schema.prisma");
  const schema = fs.readFileSync(schemaPath, "utf8");
  const lines = schema.split("\n");
  const blocks = [];
  let currentEnum = null;
  let enumLines = [];

  const flushEnum = () => {
    if (currentEnum) {
      blocks.push({ kind: "enum", name: currentEnum, text: enumLines.join("\n") });
      currentEnum = null;
      enumLines = [];
    }
  };

  for (const line of lines) {
    const enumMatch = line.match(/^enum\s+(\w+)/);
    if (enumMatch) {
      flushEnum();
      currentEnum = enumMatch[1];
      enumLines = [line];
      continue;
    }
    if (currentEnum) {
      enumLines.push(line);
      if (line.trim() === "}") flushEnum();
      continue;
    }
  }
  flushEnum();

  const modelBlocks = [];
  for (const model of PRISMA_MODELS) {
    const re = new RegExp(`model\\s+${model}\\s+\\{[\\s\\S]*?^\\}`, "m");
    const m = schema.match(re);
    if (m) modelBlocks.push(m[0]);
  }

  const relatedEnums = [
    "UserRole",
    "LawyerVerificationStatus",
    "CasePackageShareMode",
    "CasePackageShareStatus",
    "LegalKnowledgeResearchBriefStatus",
    "SupplementRequestStatus",
    "CaseStatus",
  ];
  const enumBlocks = blocks
    .filter((b) => relatedEnums.includes(b.name))
    .map((b) => b.text);

  const excerpt = [
    "// AI법친 — 변호사 업무 영역 관련 Prisma 스키마 발췌",
    `// 원본: prisma/schema.prisma (생성일 ${new Date().toISOString().slice(0, 10)})`,
    "",
    ...enumBlocks,
    "",
    ...modelBlocks,
  ].join("\n\n");

  const dest = path.join(EXPORT_DIR, "11-schema", "prisma-lawyer-workflow-excerpt.prisma");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, excerpt, "utf8");
  return dest;
}

function writeReadme(manifest) {
  const readme = `# AI법친 — 변호사 업무 영역 검토 자료

> **생성일**: ${new Date().toISOString().slice(0, 10)}  
> **목적**: 변호사 로그인 이후 업무 흐름·화면·API·정책 문서를 외부 법률전문가 검토용으로 묶은 패키지입니다.

---

## 1. 변호사 업무 흐름 개요

### 1-1. 로그인 · 승인 상태

| 단계 | 경로 | 설명 |
|------|------|------|
| 로그인 | \`/login\` | 역할 \`LAWYER\` 계정으로 JWT 쿠키(\`aibupchin_access_token\`) 발급 |
| 승인 대기 | \`/lawyer/verification-pending\` | \`LawyerProfile.verificationStatus\` ≠ \`APPROVED\` 이면 전문가 업무 차단 |
| 변호사 홈 | \`/lawyer\` | 승인된 변호사 대시보드 (검토 큐·우선 작업) |
| 의뢰인 대시보드 | \`/dashboard\` | 배정된 사건 목록 (변호사도 접근) |

**핵심 인증**: \`src/lib/auth/session.ts\` — \`requireLawyer()\`, \`requireApprovedLawyer()\`

### 1-2. 주요 업무 영역 (승인 후)

| # | 업무 | 진입 경로 | 관련 폴더 |
|---|------|-----------|-----------|
| A | **변호사 대시보드** | \`/lawyer\` | \`01-portal-pages\`, \`02-lawyer-dashboard-ui\` |
| B | **사건 패키지 조회** | \`/lawyer/case-packages/lookup\` → \`[shareId]\` | \`01-portal-pages\`, \`05-lawyer-api\`, \`08-domain-services\` |
| C | **공부호 Legal Knowledge 검수** | \`/lawyer/legal-knowledge/reviews\` | \`01-portal-pages\`, \`05-lawyer-api\`, \`09-docs-specs\` |
| D | **사건 상세 · 문서 검토** | \`/cases/[caseId]\` | \`03-case-review-ui\`, \`04-protected-pages-lawyer-access\` |
| E | **AI 지능 검토 콘솔** | \`/cases/[caseId]/intelligence-review\` | \`03-case-review-ui\`, \`06-case-apis-lawyer-uses\`, \`09-docs-specs\` |
| F | **Voice 변호사 검토** | 사건 상세 내 Voice 패널 | \`03-case-review-ui\`, \`08-domain-services\` |
| G | **보완요청(Supplement)** | 사건 상세 내 보완요청 UI | \`08-domain-services\`, \`09-docs-specs\` |
| H | **인터뷰 질문셋 관리** | \`/admin/question-sets\` (변호사 권한 시) | \`07-auth-permissions\` |

### 1-3. 변호사 판단 · 책임 경계 (AI Core)

- **Lawyer Review Console**: Graph · Radar · Ledger를 변호사가 확인·승인·수정
- **Judgment Boundary Ledger**: AI 제안 → 변호사 \`CONFIRMED\` / \`REJECTED\` / \`EDITED\` 전이
- **Client Disclosure**: 의뢰인 공개 가능 여부는 별도 gate

→ 상세: \`09-docs-specs/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md\`  
→ 상세: \`09-docs-specs/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md\`

---

## 2. 패키지 디렉터리 구조

| 폴더 | 내용 | 파일 수 |
|------|------|---------|
${manifest.map((m) => `| \`${m.section}/\` | ${m.label} | ${m.count} |`).join("\n")}

---

## 3. 검토 시 권장 순서

1. **\`00-README.md\`** (본 문서) — 전체 흐름 파악
2. **\`09-docs-specs/\`** — 기획·정책·UX 스펙 (법률 관점 우선)
3. **\`01-portal-pages/\` + \`02-lawyer-dashboard-ui/\`** — 변호사 포털 화면
4. **\`07-auth-permissions/\`** — 접근 제어·역할·승인 게이트
5. **\`05-lawyer-api/\` + \`06-case-apis-lawyer-uses/\`** — API 계약
6. **\`08-domain-services/\`** — 비즈니스 규칙·판단 로직
7. **\`11-schema/\`** — DB 모델 발췌
8. **\`03-case-review-ui/\` + \`04-protected-pages-lawyer-access/\`** — 사건별 검토 UI

---

## 4. 검토 시 유의사항

- 본 패키지는 **소스코드·스펙 문서**이며, 실제 운영 데이터·환경변수·비밀키는 **포함하지 않습니다**.
- \`LAWYER\` 역할과 UI 4분할 \`CLIENT|LAWYER|STAFF|ADMIN\`은 별개입니다 (\`src/lib/role-map.ts\`).
- AI 출력은 **판단 보조**이며, 최종 법률 판단 책임은 변호사·의뢰인 관계에 있습니다 (공부호·Voice UX 스펙 참조).
- 테스트 파일(\`.test.ts\`, E2E)은 동작 참고용으로 일부만 포함했습니다.

---

## 5. 포함 파일 목록

<details>
<summary>전체 manifest (${manifest.reduce((s, m) => s + m.count, 0)} files)</summary>

${manifest.map((m) => `\n### ${m.section} — ${m.label}\n\n${m.files.map((f) => `- \`${f}\``).join("\n")}`).join("\n")}

</details>

---

## 6. 문의 · 후속

검토 결과(누락 업무, 법률 리스크, UX 개선, 책임 경계 등)는 AI법친 개발팀에 전달해 주시면 \`docs/project-governance/IMPLEMENTATION_EVIDENCE.md\` 및 \`tools/aibeopchin_navigator.py\` 기준으로 반영 계획을 수립합니다.

**패키지 버전**: ${EXPORT_NAME}  
**생성 도구**: \`tools/export-lawyer-workflow-package.mjs\`
`;

  fs.writeFileSync(path.join(EXPORT_DIR, "00-README.md"), readme, "utf8");
}

function createZip() {
  const zipPath = path.join(ROOT, "exports", `${EXPORT_NAME}.zip`);
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${EXPORT_DIR.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force"`,
      { stdio: "inherit" },
    );
  } else {
    execSync(`cd "${path.join(ROOT, "exports")}" && zip -r "${EXPORT_NAME}.zip" "${EXPORT_NAME}"`, {
      stdio: "inherit",
    });
  }
  return zipPath;
}

function main() {
  if (fs.existsSync(EXPORT_DIR)) {
    fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(EXPORT_DIR, { recursive: true });

  /** @type {Array<{ section: string; label: string; count: number; files: string[] }>} */
  const manifest = [];

  for (const section of SECTIONS) {
    const files = new Set();
    for (const p of section.paths) {
      for (const f of collectFiles(p)) files.add(f);
    }
    const sorted = [...files].sort();
    for (const f of sorted) {
      copyFile(f, section.label);
    }
    manifest.push({
      section: section.label,
      label: section.paths.join(", "),
      count: sorted.length,
      files: sorted,
    });
  }

  extractPrismaExcerpt();
  manifest.push({
    section: "11-schema",
    label: "Prisma excerpt",
    count: 1,
    files: ["11-schema/prisma-lawyer-workflow-excerpt.prisma"],
  });

  writeReadme(manifest);

  const zipPath = createZip();
  const totalFiles = manifest.reduce((s, m) => s + m.count, 0);

  console.log("\n✅ 변호사 업무 영역 검토 패키지 생성 완료");
  console.log(`   폴더: ${EXPORT_DIR}`);
  console.log(`   ZIP:  ${zipPath}`);
  console.log(`   파일: ${totalFiles}개 (+ README)`);
}

main();
