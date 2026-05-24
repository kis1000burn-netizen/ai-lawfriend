# AI법친 — 변호사 업무 영역 검토 자료

> **생성일**: 2026-05-24  
> **목적**: 변호사 로그인 이후 업무 흐름·화면·API·정책 문서를 외부 법률전문가 검토용으로 묶은 패키지입니다.

---

## 1. 변호사 업무 흐름 개요

### 1-1. 로그인 · 승인 상태

| 단계 | 경로 | 설명 |
|------|------|------|
| 로그인 | `/login` | 역할 `LAWYER` 계정으로 JWT 쿠키(`aibupchin_access_token`) 발급 |
| 승인 대기 | `/lawyer/verification-pending` | `LawyerProfile.verificationStatus` ≠ `APPROVED` 이면 전문가 업무 차단 |
| 변호사 홈 | `/lawyer` | 승인된 변호사 대시보드 (검토 큐·우선 작업) |
| 의뢰인 대시보드 | `/dashboard` | 배정된 사건 목록 (변호사도 접근) |

**핵심 인증**: `src/lib/auth/session.ts` — `requireLawyer()`, `requireApprovedLawyer()`

### 1-2. 주요 업무 영역 (승인 후)

| # | 업무 | 진입 경로 | 관련 폴더 |
|---|------|-----------|-----------|
| A | **변호사 대시보드** | `/lawyer` | `01-portal-pages`, `02-lawyer-dashboard-ui` |
| B | **사건 패키지 조회** | `/lawyer/case-packages/lookup` → `[shareId]` | `01-portal-pages`, `05-lawyer-api`, `08-domain-services` |
| C | **공부호 Legal Knowledge 검수** | `/lawyer/legal-knowledge/reviews` | `01-portal-pages`, `05-lawyer-api`, `09-docs-specs` |
| D | **사건 상세 · 문서 검토** | `/cases/[caseId]` | `03-case-review-ui`, `04-protected-pages-lawyer-access` |
| E | **AI 지능 검토 콘솔** | `/cases/[caseId]/intelligence-review` | `03-case-review-ui`, `06-case-apis-lawyer-uses`, `09-docs-specs` |
| F | **Voice 변호사 검토** | 사건 상세 내 Voice 패널 | `03-case-review-ui`, `08-domain-services` |
| G | **보완요청(Supplement)** | 사건 상세 내 보완요청 UI | `08-domain-services`, `09-docs-specs` |
| H | **인터뷰 질문셋 관리** | `/admin/question-sets` (변호사 권한 시) | `07-auth-permissions` |

### 1-3. 변호사 판단 · 책임 경계 (AI Core)

- **Lawyer Review Console**: Graph · Radar · Ledger를 변호사가 확인·승인·수정
- **Judgment Boundary Ledger**: AI 제안 → 변호사 `CONFIRMED` / `REJECTED` / `EDITED` 전이
- **Client Disclosure**: 의뢰인 공개 가능 여부는 별도 gate

→ 상세: `09-docs-specs/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md`  
→ 상세: `09-docs-specs/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md`

---

## 2. 패키지 디렉터리 구조

| 폴더 | 내용 | 파일 수 |
|------|------|---------|
| `01-portal-pages/` | src/app/(lawyer)/lawyer | 7 |
| `02-lawyer-dashboard-ui/` | src/components/dashboard/lawyer, src/components/lawyer | 13 |
| `03-case-review-ui/` | src/components/cases/lawyer-intelligence-review-console.tsx, src/components/cases/lawyer-voice-review-panel.tsx, src/components/cases/document-review-panel.tsx, src/components/cases/case-gongbuho-review-card.tsx, src/components/cases/case-detail-client.tsx, src/components/cases/paragraph-structure-panel.tsx, src/components/cases/case-timeline-panel.tsx, src/components/cases/document-detail-client.tsx, src/components/case-package, src/components/supplement-requests, src/components/jeonse-damage/jeonse-damage-lawyer-review-button.tsx, src/components/illegal-lending/illegal-lending-lawyer-review-button.tsx | 15 |
| `04-protected-pages-lawyer-access/` | src/app/(protected)/cases/[caseId]/intelligence-review, src/app/(protected)/cases/[caseId]/page.tsx, src/app/(protected)/cases/[caseId]/client-disclosure-preview, src/app/(protected)/cases/[caseId]/documents, src/app/(protected)/dashboard/page.tsx | 6 |
| `05-lawyer-api/` | src/app/api/lawyer | 9 |
| `06-case-apis-lawyer-uses/` | src/app/api/cases/[caseId]/intelligence-review, src/app/api/cases/[caseId]/voice/lawyer-reviews, src/app/api/cases/[caseId]/voice/document-finalize-gate, src/app/api/legal-documents | 11 |
| `07-auth-permissions/` | src/lib/auth/session.ts, src/lib/auth/require-approved-lawyer-api.ts, src/lib/auth/require-legal-knowledge-lawyer-review-api.ts, src/lib/auth/post-auth-redirect.ts, src/lib/auth/roles.ts, src/lib/landing/post-login-href.ts, src/features/cases/case.permissions.ts, src/lib/case-action-guard.ts, src/lib/dashboard/lawyer-review-priority.ts, src/lib/dashboard/dashboard-metrics.ts, src/lib/dashboard/dashboard-display.ts, src/lib/definitions/permission-definition.ts, src/lib/definitions/permissions.ts, src/lib/role-map.ts, src/middleware.ts | 15 |
| `08-domain-services/` | src/lib/lawyer, src/features/ai-core/lawyer-judgment-boundary-ledger.schema.ts, src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts, src/features/ai-core/lawyer-judgment-boundary-validator.ts, src/features/ai-core/lawyer-review-console-lock.ts, src/features/ai-core/case-intelligence-review.service.ts, src/features/ai-core/case-intelligence-review.api.validators.ts, src/features/ai-core/client-safe-disclosure.schema.ts, src/features/voice/voice-lawyer-supplement.service.ts, src/features/voice/voice-lawyer-supplement.api.validators.ts, src/lib/voice/voice-lawyer-review-ux-policy.ts, src/lib/voice/voice-lawyer-review-flags.repository.ts, src/lib/voice/voice-document-finalize-gate.service.ts, src/lib/voice/voice-document-finalize-gate-ui.ts, src/features/gongbuho/case-gongbuho-review-ux.ts, src/features/gongbuho/legal-knowledge-pipeline.service.ts, src/features/gongbuho/legal-knowledge-intelligence.service.ts, src/lib/gongbuho/legal-knowledge-pipeline-gates.ts, src/lib/gongbuho/legal-knowledge-intelligence-policy.ts, src/lib/gongbuho/gongbuho-permissions.ts, src/features/case-package/case-package-share-policy.ts, src/features/case-package/case-package-share-policy-utils.ts, src/features/case-package/case-package-privacy-security-policy.ts, src/features/case-package/case-package-share.repository.ts, src/lib/case-package, src/features/supplement-request, src/features/illegal-lending/illegal-lending-lawyer-assignment.ts | 57 |
| `09-docs-specs/` | docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md, docs/ai/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md, docs/gongbuho/GONGBUHO_LAWYER_REVIEW_UX.md, docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md, docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md, docs/voice/VOICE_LAWYER_REVIEW_UX_SPEC.md, docs/project-governance/AIBEOPCHIN_6_0_CASE_PACKAGE_SHARE_LAWYER_ACCESS_PLAN.md, docs/project-governance/AIBEOPCHIN_6_1_CASE_PACKAGE_DATA_STRUCTURE_AND_GENERATION_RULES.md, docs/project-governance/AIBEOPCHIN_6_2_CASE_PACKAGE_CODE_CONSENT_POLICY.md, docs/project-governance/AIBEOPCHIN_6_2_PUBLIC_CODE_AND_SHARE_CONSENT_RULES.md, docs/project-governance/LAWYER_VERIFICATION_DOCUMENT_STORAGE_SECURITY_PLAN.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_DATA_STRUCTURE_DEFINITION.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_STATUS_DEFINITION.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_IMPLEMENTATION_DEFINITION.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_SCREEN_DEFINITION.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_WORKFLOW_DEFINITION.md | 16 |
| `10-e2e-reference/` | tests/e2e/lawyer-verification-smoke.spec.ts, tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts | 2 |
| `11-schema/` | Prisma excerpt | 1 |

---

## 3. 검토 시 권장 순서

1. **`00-README.md`** (본 문서) — 전체 흐름 파악
2. **`09-docs-specs/`** — 기획·정책·UX 스펙 (법률 관점 우선)
3. **`01-portal-pages/` + `02-lawyer-dashboard-ui/`** — 변호사 포털 화면
4. **`07-auth-permissions/`** — 접근 제어·역할·승인 게이트
5. **`05-lawyer-api/` + `06-case-apis-lawyer-uses/`** — API 계약
6. **`08-domain-services/`** — 비즈니스 규칙·판단 로직
7. **`11-schema/`** — DB 모델 발췌
8. **`03-case-review-ui/` + `04-protected-pages-lawyer-access/`** — 사건별 검토 UI

---

## 4. 검토 시 유의사항

- 본 패키지는 **소스코드·스펙 문서**이며, 실제 운영 데이터·환경변수·비밀키는 **포함하지 않습니다**.
- `LAWYER` 역할과 UI 4분할 `CLIENT|LAWYER|STAFF|ADMIN`은 별개입니다 (`src/lib/role-map.ts`).
- AI 출력은 **판단 보조**이며, 최종 법률 판단 책임은 변호사·의뢰인 관계에 있습니다 (공부호·Voice UX 스펙 참조).
- 테스트 파일(`.test.ts`, E2E)은 동작 참고용으로 일부만 포함했습니다.

---

## 5. 포함 파일 목록

<details>
<summary>전체 manifest (152 files)</summary>


### 01-portal-pages — src/app/(lawyer)/lawyer

- `src/app/(lawyer)/lawyer/case-packages/[shareId]/page.tsx`
- `src/app/(lawyer)/lawyer/case-packages/lookup/page.tsx`
- `src/app/(lawyer)/lawyer/layout.tsx`
- `src/app/(lawyer)/lawyer/legal-knowledge/reviews/[briefId]/page.tsx`
- `src/app/(lawyer)/lawyer/legal-knowledge/reviews/page.tsx`
- `src/app/(lawyer)/lawyer/page.tsx`
- `src/app/(lawyer)/lawyer/verification-pending/page.tsx`

### 02-lawyer-dashboard-ui — src/components/dashboard/lawyer, src/components/lawyer

- `src/components/dashboard/lawyer/lawyer-case-radar.tsx`
- `src/components/dashboard/lawyer/lawyer-dashboard-empty-guide.tsx`
- `src/components/dashboard/lawyer/lawyer-dashboard-home.tsx`
- `src/components/dashboard/lawyer/lawyer-dashboard-pending-approval.tsx`
- `src/components/dashboard/lawyer/lawyer-priority-card.tsx`
- `src/components/dashboard/lawyer/lawyer-review-queue.tsx`
- `src/components/lawyer/.gitkeep`
- `src/components/lawyer/case-package/lawyer-case-package-detail-client.tsx`
- `src/components/lawyer/case-package/lawyer-case-package-lookup-client.tsx`
- `src/components/lawyer/lawyer-pending-verification-docs-client.tsx`
- `src/components/lawyer/lawyer-signup-verification-docs.tsx`
- `src/components/lawyer/legal-knowledge-lawyer-brief-list.tsx`
- `src/components/lawyer/legal-knowledge-lawyer-review-panel.tsx`

### 03-case-review-ui — src/components/cases/lawyer-intelligence-review-console.tsx, src/components/cases/lawyer-voice-review-panel.tsx, src/components/cases/document-review-panel.tsx, src/components/cases/case-gongbuho-review-card.tsx, src/components/cases/case-detail-client.tsx, src/components/cases/paragraph-structure-panel.tsx, src/components/cases/case-timeline-panel.tsx, src/components/cases/document-detail-client.tsx, src/components/case-package, src/components/supplement-requests, src/components/jeonse-damage/jeonse-damage-lawyer-review-button.tsx, src/components/illegal-lending/illegal-lending-lawyer-review-button.tsx

- `src/components/case-package/case-package-share-client.tsx`
- `src/components/case-package/case-package-share-detail-client.tsx`
- `src/components/case-package/case-package-share-settings-panel.tsx`
- `src/components/cases/case-detail-client.tsx`
- `src/components/cases/case-gongbuho-review-card.tsx`
- `src/components/cases/case-timeline-panel.tsx`
- `src/components/cases/document-detail-client.tsx`
- `src/components/cases/document-review-panel.tsx`
- `src/components/cases/lawyer-intelligence-review-console.tsx`
- `src/components/cases/lawyer-voice-review-panel.tsx`
- `src/components/cases/paragraph-structure-panel.tsx`
- `src/components/illegal-lending/illegal-lending-lawyer-review-button.tsx`
- `src/components/jeonse-damage/jeonse-damage-lawyer-review-button.tsx`
- `src/components/supplement-requests/supplement-request-mvp-client.tsx`
- `src/components/supplement-requests/supplement-request-status-badge.tsx`

### 04-protected-pages-lawyer-access — src/app/(protected)/cases/[caseId]/intelligence-review, src/app/(protected)/cases/[caseId]/page.tsx, src/app/(protected)/cases/[caseId]/client-disclosure-preview, src/app/(protected)/cases/[caseId]/documents, src/app/(protected)/dashboard/page.tsx

- `src/app/(protected)/cases/[caseId]/client-disclosure-preview/page.tsx`
- `src/app/(protected)/cases/[caseId]/documents/[documentId]/page.tsx`
- `src/app/(protected)/cases/[caseId]/documents/new/page.tsx`
- `src/app/(protected)/cases/[caseId]/intelligence-review/page.tsx`
- `src/app/(protected)/cases/[caseId]/page.tsx`
- `src/app/(protected)/dashboard/page.tsx`

### 05-lawyer-api — src/app/api/lawyer

- `src/app/api/lawyer/case-packages/[shareId]/attachments/[attachmentId]/download/route.ts`
- `src/app/api/lawyer/case-packages/[shareId]/package-pdf/route.ts`
- `src/app/api/lawyer/case-packages/[shareId]/package-summary/route.ts`
- `src/app/api/lawyer/case-packages/[shareId]/route.ts`
- `src/app/api/lawyer/case-packages/lookup/route.ts`
- `src/app/api/lawyer/legal-knowledge/research-briefs/[briefId]/lawyer-review/route.ts`
- `src/app/api/lawyer/legal-knowledge/research-briefs/[briefId]/route.ts`
- `src/app/api/lawyer/legal-knowledge/research-briefs/route.ts`
- `src/app/api/lawyer/verification-documents/route.ts`

### 06-case-apis-lawyer-uses — src/app/api/cases/[caseId]/intelligence-review, src/app/api/cases/[caseId]/voice/lawyer-reviews, src/app/api/cases/[caseId]/voice/document-finalize-gate, src/app/api/legal-documents

- `src/app/api/cases/[caseId]/intelligence-review/judgments/route.ts`
- `src/app/api/cases/[caseId]/intelligence-review/route.ts`
- `src/app/api/cases/[caseId]/voice/document-finalize-gate/route.ts`
- `src/app/api/cases/[caseId]/voice/lawyer-reviews/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/delivery/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/lock/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/histories/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/lock/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/regenerate/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/restore/route.ts`

### 07-auth-permissions — src/lib/auth/session.ts, src/lib/auth/require-approved-lawyer-api.ts, src/lib/auth/require-legal-knowledge-lawyer-review-api.ts, src/lib/auth/post-auth-redirect.ts, src/lib/auth/roles.ts, src/lib/landing/post-login-href.ts, src/features/cases/case.permissions.ts, src/lib/case-action-guard.ts, src/lib/dashboard/lawyer-review-priority.ts, src/lib/dashboard/dashboard-metrics.ts, src/lib/dashboard/dashboard-display.ts, src/lib/definitions/permission-definition.ts, src/lib/definitions/permissions.ts, src/lib/role-map.ts, src/middleware.ts

- `src/features/cases/case.permissions.ts`
- `src/lib/auth/post-auth-redirect.ts`
- `src/lib/auth/require-approved-lawyer-api.ts`
- `src/lib/auth/require-legal-knowledge-lawyer-review-api.ts`
- `src/lib/auth/roles.ts`
- `src/lib/auth/session.ts`
- `src/lib/case-action-guard.ts`
- `src/lib/dashboard/dashboard-display.ts`
- `src/lib/dashboard/dashboard-metrics.ts`
- `src/lib/dashboard/lawyer-review-priority.ts`
- `src/lib/definitions/permission-definition.ts`
- `src/lib/definitions/permissions.ts`
- `src/lib/landing/post-login-href.ts`
- `src/lib/role-map.ts`
- `src/middleware.ts`

### 08-domain-services — src/lib/lawyer, src/features/ai-core/lawyer-judgment-boundary-ledger.schema.ts, src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts, src/features/ai-core/lawyer-judgment-boundary-validator.ts, src/features/ai-core/lawyer-review-console-lock.ts, src/features/ai-core/case-intelligence-review.service.ts, src/features/ai-core/case-intelligence-review.api.validators.ts, src/features/ai-core/client-safe-disclosure.schema.ts, src/features/voice/voice-lawyer-supplement.service.ts, src/features/voice/voice-lawyer-supplement.api.validators.ts, src/lib/voice/voice-lawyer-review-ux-policy.ts, src/lib/voice/voice-lawyer-review-flags.repository.ts, src/lib/voice/voice-document-finalize-gate.service.ts, src/lib/voice/voice-document-finalize-gate-ui.ts, src/features/gongbuho/case-gongbuho-review-ux.ts, src/features/gongbuho/legal-knowledge-pipeline.service.ts, src/features/gongbuho/legal-knowledge-intelligence.service.ts, src/lib/gongbuho/legal-knowledge-pipeline-gates.ts, src/lib/gongbuho/legal-knowledge-intelligence-policy.ts, src/lib/gongbuho/gongbuho-permissions.ts, src/features/case-package/case-package-share-policy.ts, src/features/case-package/case-package-share-policy-utils.ts, src/features/case-package/case-package-privacy-security-policy.ts, src/features/case-package/case-package-share.repository.ts, src/lib/case-package, src/features/supplement-request, src/features/illegal-lending/illegal-lending-lawyer-assignment.ts

- `src/features/ai-core/case-intelligence-review.api.validators.ts`
- `src/features/ai-core/case-intelligence-review.service.ts`
- `src/features/ai-core/client-safe-disclosure.schema.ts`
- `src/features/ai-core/lawyer-judgment-boundary-ledger.schema.ts`
- `src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts`
- `src/features/ai-core/lawyer-judgment-boundary-validator.ts`
- `src/features/ai-core/lawyer-review-console-lock.ts`
- `src/features/case-package/case-package-privacy-security-policy.ts`
- `src/features/case-package/case-package-share-policy-utils.ts`
- `src/features/case-package/case-package-share-policy.ts`
- `src/features/case-package/case-package-share.repository.ts`
- `src/features/gongbuho/case-gongbuho-review-ux.ts`
- `src/features/gongbuho/legal-knowledge-intelligence.service.ts`
- `src/features/gongbuho/legal-knowledge-pipeline.service.ts`
- `src/features/illegal-lending/illegal-lending-lawyer-assignment.ts`
- `src/features/supplement-request/supplement-request.repository.ts`
- `src/features/supplement-request/supplement-request.service.test.ts`
- `src/features/supplement-request/supplement-request.service.ts`
- `src/features/supplement-request/supplement-request.validators.ts`
- `src/features/voice/voice-lawyer-supplement.api.validators.ts`
- `src/features/voice/voice-lawyer-supplement.service.ts`
- `src/lib/case-package/case-package-access-log-serializer.ts`
- `src/lib/case-package/case-package-access-log.ts`
- `src/lib/case-package/case-package-download-policy.ts`
- `src/lib/case-package/case-package-pdf-policy.ts`
- `src/lib/case-package/case-package-share-policy.ts`
- `src/lib/case-package/case-package-share-schema.ts`
- `src/lib/case-package/case-package-share-serializer.ts`
- `src/lib/case-package/case-package-summary-renderer.ts`
- `src/lib/case-package/public-code.ts`
- `src/lib/case-package/shared-attachment-file.ts`
- `src/lib/gongbuho/gongbuho-permissions.ts`
- `src/lib/gongbuho/legal-knowledge-intelligence-policy.ts`
- `src/lib/gongbuho/legal-knowledge-pipeline-gates.ts`
- `src/lib/lawyer/lawyer-signup-risk.test.ts`
- `src/lib/lawyer/lawyer-signup-risk.ts`
- `src/lib/lawyer/lawyer-verification-access.test.ts`
- `src/lib/lawyer/lawyer-verification-access.ts`
- `src/lib/lawyer/lawyer-verification-content-token.ts`
- `src/lib/lawyer/lawyer-verification-document-access-audit.test.ts`
- `src/lib/lawyer/lawyer-verification-document-access-audit.ts`
- `src/lib/lawyer/lawyer-verification-document-types.test.ts`
- `src/lib/lawyer/lawyer-verification-document-types.ts`
- `src/lib/lawyer/lawyer-verification-document-upload.test.ts`
- `src/lib/lawyer/lawyer-verification-document-upload.ts`
- `src/lib/lawyer/lawyer-verification-fileurl-migration.test.ts`
- `src/lib/lawyer/lawyer-verification-fileurl-migration.ts`
- `src/lib/lawyer/lawyer-verification-legacy-policy.test.ts`
- `src/lib/lawyer/lawyer-verification-legacy-policy.ts`
- `src/lib/lawyer/lawyer-verification-migration-audit.test.ts`
- `src/lib/lawyer/lawyer-verification-migration-audit.ts`
- `src/lib/lawyer/lawyer-verification-signed-get.ts`
- `src/lib/lawyer/lawyer-verification-storage.ts`
- `src/lib/voice/voice-document-finalize-gate-ui.ts`
- `src/lib/voice/voice-document-finalize-gate.service.ts`
- `src/lib/voice/voice-lawyer-review-flags.repository.ts`
- `src/lib/voice/voice-lawyer-review-ux-policy.ts`

### 09-docs-specs — docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md, docs/ai/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md, docs/gongbuho/GONGBUHO_LAWYER_REVIEW_UX.md, docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md, docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md, docs/voice/VOICE_LAWYER_REVIEW_UX_SPEC.md, docs/project-governance/AIBEOPCHIN_6_0_CASE_PACKAGE_SHARE_LAWYER_ACCESS_PLAN.md, docs/project-governance/AIBEOPCHIN_6_1_CASE_PACKAGE_DATA_STRUCTURE_AND_GENERATION_RULES.md, docs/project-governance/AIBEOPCHIN_6_2_CASE_PACKAGE_CODE_CONSENT_POLICY.md, docs/project-governance/AIBEOPCHIN_6_2_PUBLIC_CODE_AND_SHARE_CONSENT_RULES.md, docs/project-governance/LAWYER_VERIFICATION_DOCUMENT_STORAGE_SECURITY_PLAN.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_DATA_STRUCTURE_DEFINITION.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_STATUS_DEFINITION.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_IMPLEMENTATION_DEFINITION.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_SCREEN_DEFINITION.md, docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_WORKFLOW_DEFINITION.md

- `docs/ai/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md`
- `docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md`
- `docs/gongbuho/GONGBUHO_LAWYER_REVIEW_UX.md`
- `docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md`
- `docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md`
- `docs/project-governance/AIBEOPCHIN_6_0_CASE_PACKAGE_SHARE_LAWYER_ACCESS_PLAN.md`
- `docs/project-governance/AIBEOPCHIN_6_1_CASE_PACKAGE_DATA_STRUCTURE_AND_GENERATION_RULES.md`
- `docs/project-governance/AIBEOPCHIN_6_2_CASE_PACKAGE_CODE_CONSENT_POLICY.md`
- `docs/project-governance/AIBEOPCHIN_6_2_PUBLIC_CODE_AND_SHARE_CONSENT_RULES.md`
- `docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_DATA_STRUCTURE_DEFINITION.md`
- `docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_IMPLEMENTATION_DEFINITION.md`
- `docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_SCREEN_DEFINITION.md`
- `docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_STATUS_DEFINITION.md`
- `docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_WORKFLOW_DEFINITION.md`
- `docs/project-governance/LAWYER_VERIFICATION_DOCUMENT_STORAGE_SECURITY_PLAN.md`
- `docs/voice/VOICE_LAWYER_REVIEW_UX_SPEC.md`

### 10-e2e-reference — tests/e2e/lawyer-verification-smoke.spec.ts, tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts

- `tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts`
- `tests/e2e/lawyer-verification-smoke.spec.ts`

### 11-schema — Prisma excerpt

- `11-schema/prisma-lawyer-workflow-excerpt.prisma`

</details>

---

## 6. 문의 · 후속

검토 결과(누락 업무, 법률 리스크, UX 개선, 책임 경계 등)는 AI법친 개발팀에 전달해 주시면 `docs/project-governance/IMPLEMENTATION_EVIDENCE.md` 및 `tools/aibeopchin_navigator.py` 기준으로 반영 계획을 수립합니다.

**패키지 버전**: lawyer-workflow-review-20260524  
**생성 도구**: `tools/export-lawyer-workflow-package.mjs`
