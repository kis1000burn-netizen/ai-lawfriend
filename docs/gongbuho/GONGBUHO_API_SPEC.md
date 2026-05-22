# 공부호 API 명세 (GONGBUHO_API_SPEC)

**상태**: Phase 3-F · REST + UI **Phase 4-A**〜**Phase 4-F**(라우트 권한·AuditLog 장착·Trace `gongbuhoPhase4Flow` · `verify:gongbuho`) 명세 초안 반영 계속 유지  
**연관 문서**: [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md), [GONGBUHO_FIELD_MAPPING.md](./GONGBUHO_FIELD_MAPPING.md), [GONGBUHO_API_SMOKE_TEST.md](./GONGBUHO_API_SMOKE_TEST.md), [GONGBUHO_QUESTION_FLOW_PROJECTION.md](./GONGBUHO_QUESTION_FLOW_PROJECTION.md), [GONGBUHO_QUESTION_SET_PROJECTION.md](./GONGBUHO_QUESTION_SET_PROJECTION.md), [GONGBUHO_CASE_BINDING.md](./GONGBUHO_CASE_BINDING.md), [GONGBUHO_INTERVIEW_BINDING.md](./GONGBUHO_INTERVIEW_BINDING.md), [GONGBUHO_SUMMARY_OUTPUT_CONTRACT.md](./GONGBUHO_SUMMARY_OUTPUT_CONTRACT.md), [GONGBUHO_DOCUMENT_RULES_BINDING.md](./GONGBUHO_DOCUMENT_RULES_BINDING.md), [GONGBUHO_ADMIN_PACKET_UI.md](./GONGBUHO_ADMIN_PACKET_UI.md), [GONGBUHO_ADMIN_APPROVAL_UI.md](./GONGBUHO_ADMIN_APPROVAL_UI.md), [GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md](./GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md), [GONGBUHO_MULTI_PACKET_LIBRARY.md](./GONGBUHO_MULTI_PACKET_LIBRARY.md), [GONGBUHO_OPERATIONS_QA.md](./GONGBUHO_OPERATIONS_QA.md), [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md)

## 1. 공통 응답 형식

관리자·사건 API는 현재 레포 패턴 **`{ ok: true, data }` / `{ ok: false, message, code? }`** (`src/lib/domain-api-response.ts`) 를 사용한다.

---

## 2. 권한 정책

| 경로 패턴 | 권한 |
|-----------|------|
| **UI** `GET /admin/gongbuho` · `GET /admin/gongbuho/[gongbuhoId]` (RSC)·상세 라이프사이클 패널(Client)·**questionFlow 미리보기(RSC)·Project 패널(Client)** | STAFF · ADMIN · SUPER_ADMIN 페이지 접근 — 승인·보관·**Project 저장** 버튼은 ADMIN · SUPER_ADMIN만 (`viewerCanMutateLifecycle` / `viewerCanProjectQuestionSet`) · [GONGBUHO_ADMIN_APPROVAL_UI](./GONGBUHO_ADMIN_APPROVAL_UI.md), [GONGBUHO_ADMIN_PREVIEW_PROJECT_UI](./GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md) |
| `GET /api/admin/gongbuho` · `GET /api/admin/gongbuho/[id]` · `POST /api/admin/gongbuho/[id]/question-flow/preview` | `requireStaffOrPlatformAdminApi()` + `assertGongbuhoOperation` (`LIST` / `DETAIL` / `PREVIEW`) — STAFF · ADMIN · SUPER_ADMIN |
| `POST /api/admin/gongbuho`(본문 패킷 등록) | 위 게이트 + **`CREATE_PACKET`** — **ADMIN · SUPER_ADMIN만**(STAFF 불가)·성공 시 `GONGBUHO_PACKET_CREATED` AuditLog |
| `POST /api/admin/gongbuho/[id]/approve` · `POST /api/admin/gongbuho/[id]/archive` · `POST /api/admin/gongbuho/[id]/question-set/project` | `assertGongbuhoOperation` (`APPROVE` / `ARCHIVE` / `PROJECT_QUESTION_SET`) — ADMIN · SUPER_ADMIN · STAFF 403 · 성공 시 각각 AuditLog 기록 |
| `POST /api/cases/[caseId]/gongbuho/apply` | 로그인 + 사건 **`canWriteCase`** (`getCaseAccessContext`) |
| `GET /api/cases/[caseId]/gongbuho/candidates` | 로그인 + 사건 **`canRead`** (`getCaseAccessContext`) |
| `GET /api/cases/[caseId]/gongbuho/interview` | 로그인 + 사건 **`canRead`** |
| `POST /api/cases/[caseId]/gongbuho/interview/bind` | 로그인 + 사건 **`canWriteCase`** |
| `POST /api/cases/[caseId]/summary/generate` | 로그인 + 사건 접근 **`listCaseInterviewAnswersService`(열람 축)·인터뷰 기반 1차 요약 |
| `POST /api/cases/[caseId]/documents/generate` | 로그인 + **`document.generate`** 권한(기존)·인터뷰 `COMPLETED` · Phase 3-F 공부호 규칙은 **탐지·표시** 및 Trace 병합만(자동 교정 없음) |
| `GET /api/cases/[caseId]/gongbuho/trace` | 로그인 + 사건 **`canRead`** (`getCaseAccessContext`) |

---

## 3. 관리자 API

### `GET /api/admin/gongbuho`

- **역할**: 공부호 패킷 목록(목록에서는 `packetJson` 미포함·용량 절약).
- **쿼리(선택)**: `status`, `code`, `caseType` — `GongbuhoPacketStatus` 또는 문자열 필터.

### `GET /api/admin/gongbuho/[gongbuhoId]`

- **역할**: 단건 상세, **`packetJson` 포함**.
- **`gongbuhoId`**: `GongbuhoPacket.id` (cuid).

### `POST /api/admin/gongbuho`

- **역할**: `packetJson`으로 등록, 기본 상태 `DRAFT`.
- **Body**: `{ "packetJson": { ...표준 패킷 본문… } }`  
  필수 필드 검증: `code`, `version`, `name`, `domain` (나머지는 `FIELD_MAPPING`/샘플과 동일 키 권장, Zod `.passthrough()`).
- **정합**: 행 컬럼 `code`, `version`, `name`, `domain`, `caseType` 은 **`packetJson` 내 동명 키와 일치**해야 함 (`caseType` 없으면 DB `null`).
- **중복**: `@@unique([code, version])` 위반 시 `409` + `DUPLICATE_PACKET`.

### `POST /api/admin/gongbuho/[gongbuhoId]/approve`

- **역할**: `DRAFT` 또는 `REVIEW` → `APPROVED`.
- **`approvedByUserId` / `approvedAt`** 기록 (세션 사용자).
- **금지**: `ARCHIVED` → 승인 불가 `400` + `GONGBUHO_PACKET_NOT_APPROVABLE`.
- **이미 `APPROVED`**: **`200`** + `data.alreadyApproved: true`(idempotent).
- **승인 후 수정**: Phase 2-C에서는 **패킷 갱신 API 없음**. 운영 정책은 **변경 시 새 `version` 행 생성**(STANDARD §5). 구현되는 시점부터는 서비스/마이그레이션 레벨에서 강제 검토.

### `POST /api/admin/gongbuho/[gongbuhoId]/archive`

- **역할**: `DRAFT`/`REVIEW`/`APPROVED` → **`ARCHIVED`**. 패킷 행 삭제가 아니라 상태 전환만 수행한다.
- **권한**: `approve`와 동일 — **플랫폼 관리자만** (`assertAdminOnly`).
- **이미 `ARCHIVED`**: **`200`** + `data.alreadyArchived: true`(멱등). 기존 `GongbuhoTrace`(적용 이력)는 그대로 둠 — **삭제 API는 제공하지 않음**(Phase 4-B 정책).

### `POST /api/admin/gongbuho/[gongbuhoId]/question-flow/preview`

- **역할**: `packetJson.questionFlow`를 `QuestionSetQuestion[]`로 투영 · **저장 없음**.
- **권한**: STAFF 또는 플랫폼 관리자 (`requireStaffOrPlatformAdminApi`).
- **상태**: DRAFT/REVIEW/APPROVED/ARCHIVED 모두 허용 · 투영 전용 상세는 [GONGBUHO_QUESTION_FLOW_PROJECTION.md](./GONGBUHO_QUESTION_FLOW_PROJECTION.md).

### `POST /api/admin/gongbuho/[gongbuhoId]/question-set/project`

- **역할**: `packetJson.questionFlow` → **`QuestionSet` DRAFT DB 저장** (`isActive=false`, `catalogStatus=DRAFT` 기본) · 원천 추적은 **`QuestionSet.definitionJson` 오버레이** — [GONGBUHO_QUESTION_SET_PROJECTION.md](./GONGBUHO_QUESTION_SET_PROJECTION.md).
- **권한**: **`approve` / `archive` 와 동일** — ADMIN · SUPER_ADMIN (`assertAdminOnly`) · STAFF **403**.
- **상태**: **`APPROVED` 패킷만** 저장 가능 (`400`, `details.code`: `GONGBUHO_PROJECT_REQUIRES_APPROVED_PACKET`).
- **중복**: 동일 패킷 `id` **또는** 동일 저장 `definitionJson.gongbuho.code`+`version` 문자열 조합으로 이미 연 질문셋이 스캔 범위에 있으면 `409`, `details.code`: `QUESTION_SET_FROM_GONGBUHO_EXISTS` · **`force` 등 재생성 옵션은 Phase 3-B 범위 밖**.
- **성공**: `201`, `data`에 `source`, `gongbuhoPacket`(`id`,`code`,`version`), `questionSet`(`id`,`title`,`status`), `questions` 배열 — preview와 동등한 배열 순서 규약.

---

## 4. 사건 적용 API

### `POST /api/cases/[caseId]/gongbuho/apply`

- **역할**: `APPROVED` 패킷만 적용 가능, **`GongbuhoTrace` 1건 생성**.
- **Body (선택)**  
  - `"code"` + `"version"` 둘 다 있으면: 해당 패킷 적용 (`status === APPROVED` 필수).
  - 둘 다 없으면: 사건 `Case.category` 를 `GongbuhoPacket.caseType` 과 매칭하는 **유일한** `APPROVED` 행 선택.
- **`caseType` 복수 후보**: `400` + `AMBIGUOUS_GONGBUHO_PACKET`(후보 목록은 Phase 3에서 확장 가능).
- **미매칭**: `404` + `NOT_FOUND` 또는 전용 코드 `NO_APPROVED_PACKET_FOR_CASE`.

### `GET /api/cases/[caseId]/gongbuho/candidates`

- **역할**: `Case.category` ↔ 공부호 `caseType`으로 **APPROVED** 패킷만 후보 목록 반환 (`DRAFT`/`REVIEW`/`ARCHIVED` 제외) · 선택 정책·질문셋 초안(Phase 3-B envelope)·Trace 적용 여부·**최신 Trace 요약**.
- **`selectionPolicy`**: `AUTO_IF_SINGLE_APPROVED`(유일)·`REQUIRE_CODE_VERSION_IF_MULTIPLE`(복수)·`NO_APPROVED_PACKET`(0건 또는 카테고리 불가)·상세는 [GONGBUHO_CASE_BINDING.md](./GONGBUHO_CASE_BINDING.md).
- **`resolutionReason`**: 카테고리 없음 등으로 목록 생성 불가 시 `CASE_TYPE_REQUIRED` (HTTP **400 금지** · `candidates: []`).
- **apply 정합**: `POST …/apply` 의 자동 선택 규칙과 동일(복수면 body에 `code`·`version`).

### `GET /api/cases/[caseId]/gongbuho/interview`

- **역할**: `Case.questionSetId` Gongbuho 인터뷰 바인딩 여부 및 연결된 `QuestionSet`(게시 상태·활성 여부 필드 포함)·`questions` 목록 반환 (`bound:false` 가능).
- **정책**: [GONGBUHO_INTERVIEW_BINDING.md](./GONGBUHO_INTERVIEW_BINDING.md) · DRAFT는 인터뷰에 노출 금지(바인드 API 차단 및 런타임 검증 동시 적용).

### `POST /api/cases/[caseId]/gongbuho/interview/bind`

- **역할**: **게시(`PUBLISHED`)·활성**이며 `definitionJson` Gongbuho envelope 와 패킷(`APPROVED`)이 정합인 `QuestionSet`을 `Case.questionSetId`에 저장.
- **Body**: `{"auto":true}` **또는** `{ "gongbuhoPacketId", "questionSetId" }` (strict).

### `POST /api/cases/[caseId]/summary/generate`

- **역할**: 인터뷰 답변을 바탕으로 `POST` body 없이 1차 사건 요약 JSON 반환.(기존)
- **Phase 3-E**: 사건 기준 Gongbuho 패킷 JSON을 확인해 `outputContract.summary` 가 유효하면 `data.summary.content.contractSections[]`(패킷 목차 순)·`outputContractApplied: true`. 없으면 **기존** `caseOverview`·`timeline`·`issues`·`riskNotes`·`checklist` 유지(`outputContractApplied: false`).
- **정책**: [GONGBUHO_SUMMARY_OUTPUT_CONTRACT.md](./GONGBUHO_SUMMARY_OUTPUT_CONTRACT.md) · 자동 요약 고지 및 변호사 검토 포인트 별도 섹션.

### `POST /api/cases/[caseId]/documents/generate`

- **역할**: 기존 동일 — AI 문서 초안·문단·버전 1 스냅샷·가드레일.
- **Phase 3-F**: 사건에 연결 가능한 Gongbuho 패킷이 있으면 `validationRules`/`forbiddenRules` 를 프롬프트에 첨부하고, 생성 후 본문에 대해 금지 규칙 **트리거 탐지**(인용구·한글 덩어리 휴리스틱)·`expertReviewPoints` 를 `riskFlags` 로 연계.**자동 수정 금지**.
- **응답**: `data.gongbuhoDocumentRules` (`applied`, `forbiddenHits`, `riskFlags`, `validationChecklist`, `expertReviewPoints` 등)·`LegalDocumentVersion.snapshotJson.gongbuhoDocumentRules` 동기·최신 `GongbuhoTrace` 에 `documentDraftGenerations` 및 `riskFlags` 누적(Trace 없으면 스킵).
- **정책**: [GONGBUHO_DOCUMENT_RULES_BINDING.md](./GONGBUHO_DOCUMENT_RULES_BINDING.md)

### `GET /api/cases/[caseId]/gongbuho/trace`

- **역할**: 해당 사건의 `GongbuhoTrace` 시간 역순 목록(JSON 스냅샷 포함).

---

## 5. 핵심 정책: APPROVED만 적용

- 적용 가능 조건은 **항상** `status === GongbuhoPacketStatus.APPROVED`.
- **`DRAFT` / `REVIEW` / `ARCHIVED`** 는 apply 대상 제외.

---

## 6. Trace 기록 정책 (Phase 2-C)

- **`packetJson` 전체 중복 저장하지 않음** — 원본은 `gongbuhoPacketId` + 행 단위 `code`/`version`으로 추적.
- Trace 저장 필드(초기값 예):
  - `inputSnapshot`: 사건 상태 스냅샷 최소 블록(예: 카테고리·상태·제목 등).
  - `validationResult`: 적용 검증 메타(`ok`, `appliedVia`: `explicit` | `caseType`).
  - `riskFlags`: 배열 또는 객체(Json), 초기 빈 배열 허용.
  - `expertReviewPoints`: 적용 시점 패킷 `packetJson.expertReviewPoints` 스냅샷(Json).
  - `humanApprovalStatus`: 문자열 초기 상태(예 `"PENDING"`).

---

## 7. 에러 코드(초안)

| code | HTTP | 설명 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 미로그인 |
| `FORBIDDEN` | 403 | 역할 부족 |
| `VALIDATION_ERROR` | 400 | Zod 검증 실패 |
| `DUPLICATE_PACKET` | 409 | 동일 code+version |
| `NOT_FOUND` | 404 | 패킷/사건 없음 |
| `GONGBUHO_PACKET_NOT_APPROVABLE` | 400 | ARCHIVED 등 승인 불가 |
| `GONGBUHO_PACKET_INVALID_STATE` | 400 | 적용 시 비 APPROVED |
| `AMBIGUOUS_GONGBUHO_PACKET` | 400 | caseType으로 복수 후보 |
| `NO_APPROVED_PACKET_FOR_CASE` | 404 | 자동 매칭 실패 |
| `PACKET_BODY_MISMATCH` | 400 | 컬럼과 packetJson 필드 불일치 |
| `GONGBUHO_QUESTION_FLOW_MISSING` 등 | 400 | questionFlow 투영 검증 실패 — [GONGBUHO_QUESTION_FLOW_PROJECTION.md](./GONGBUHO_QUESTION_FLOW_PROJECTION.md) §3 |
| `GONGBUHO_PROJECT_REQUIRES_APPROVED_PACKET` | 400 | QuestionSet 초안 저장 시 비 APPROVED 패킷 |
| `QUESTION_SET_FROM_GONGBUHO_EXISTS` | 409 | 동일 공부호 신원 envelope로 이미 QuestionSet 존재(Phase 3-B 중복 방지 정책) |
| *(응답)* `resolutionReason` | *(body 필드)* | 예: `CASE_TYPE_REQUIRED` · `GET …/gongbuho/candidates` 시 HTTP 에러 없이 빈 `candidates`와 함께 전달 |
| *(응답)* `selectionPolicy` | *(body 필드)* | 자동 선택 정책 코드(`AUTO_IF_SINGLE_APPROVED` 등) |

`POST …/gongbuho/interview/bind` 실패 시 식별자는 응답 본문 **`details.code`** 에 있으며, 최상단 **`code`** 는 보통 `VALIDATION_ERROR`(HTTP 400) 또는 `CONFLICT`(HTTP 409) 입니다.

| `details.code` (인터뷰 바인딩) | HTTP | 설명 |
|------------------------------|------|------|
| `GONGBUHO_INTERVIEW_AUTO_UNAVAILABLE` | 400 | `{"auto":true}` 인데 후보 `selectionPolicy !== AUTO_IF_SINGLE_APPROVED` |
| `GONGBUHO_INTERVIEW_PACKET_NOT_APPROVED` | 400 | 명시 바인드에서 패킷이 APPROVED 가 아님 |
| `GONGBUHO_INTERVIEW_QUESTION_SET_NOT_FROM_PACKET` | 400 | 질문셋 `definitionJson` Gongbuho envelope 와 패킷 불일치 |
| `GONGBUHO_INTERVIEW_QUESTION_SET_NOT_ACTIVE` | 409 | `isActive=false` |
| `GONGBUHO_INTERVIEW_QUESTION_SET_NOT_PUBLISHED` | 409 | `catalogStatus != PUBLISHED` |
| `GONGBUHO_INTERVIEW_NO_PUBLISHED_QUESTION_SET` | 409 | 자동 바인드 시 해당 공부호에 게시·활성 질문셋 없음 |
| `GONGBUHO_INTERVIEW_MULTIPLE_PUBLISHED_QUESTION_SETS` | 409 | 자동 바인드 시 게시 후보 질문셋이 복수(명시 필요) |

---

## 8. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 2-C 초안 — 스켈레톤 API와 동기 |
| 2026-05-23 | Phase 2-D: 수동·Vitest 결합 검증 안내 연결 |
| 2026-05-23 | Phase 3-A: `POST …/question-flow/preview` · 투영 문서 |
| 2026-05-23 | Phase 3-B: `POST …/question-set/project` · `GONGBUHO_QUESTION_SET_PROJECTION.md` |
| 2026-05-23 | Phase 3-C: `GET …/gongbuho/candidates` · `GONGBUHO_CASE_BINDING.md` |
| 2026-05-23 | Phase 3-D: `GET/POST …/gongbuho/interview` · `POST …/interview/bind` · `GONGBUHO_INTERVIEW_BINDING.md` |
| 2026-05-23 | Phase 3-E: `POST …/summary/generate` `outputContract` · `GONGBUHO_SUMMARY_OUTPUT_CONTRACT.md` |
| 2026-05-23 | Phase 4-C: 관리 UI questionFlow 미리보기·QuestionSet Project 및 `question-set/project` ADMIN 전용(SSOT)·`GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md` |
| 2026-05-23 | Phase 3-F: `POST …/documents/generate` 공부호 규칙 · `GONGBUHO_DOCUMENT_RULES_BINDING.md` |
| 2026-05-23 | Phase 4-E: 운영 QA·감사 정책(`GONGBUHO_OPERATIONS_QA.md`, `GONGBUHO_AUDIT_POLICY.md`) · `npm run verify:gongbuho` 회귀 묶음 — **[GONGBUHO_API_SMOKE_TEST.md](./GONGBUHO_API_SMOKE_TEST.md)** |
| 2026-05-23 | Phase 4-F: 라우트 `assertGongbuhoOperation` 정렬 · `writeGongbuhoAuditLog` · 사건 Trace `gongbuhoPhase4Flow` 마커(적용·인터뷰·문서 규칙) · `verify-gongbuho.mjs` Phase 4-F 정적 검사 — 증빙 `EVIDENCE-20260523-GONGBUHO-PHASE4F-ROUTE-PERMISSION-AUDIT-WIRING` |
