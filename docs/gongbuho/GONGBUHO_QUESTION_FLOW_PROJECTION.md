# 공부호 questionFlow → QuestionSet 인터뷰 질문 투영 (Phase 3-A)

**상태**: Phase 3-A — DB 저장 없음(preview)·투영 함수만 고정  
**구현**: `src/features/gongbuho/project-gongbuho-question-flow.ts` · `POST /api/admin/gongbuho/[gongbuhoId]/question-flow/preview`

## 1. 목적

공부호 `packetJson.questionFlow`(SSOT는 [GONGBUHO_FIELD_MAPPING.md](./GONGBUHO_FIELD_MAPPING.md))를 AI법친 인터뷰 A안 플랫 구조 **`QuestionSetQuestion`** ([question-set.types.ts](../src/features/question-set/question-set.types.ts))으로 변환해, 향후 질문셋 등록·인터뷰와 연결할 수 있게 한다.

## 2. 필드 매핑

| 공부호 (`questionFlow[]`) | `QuestionSetQuestion` | 비고 |
|---------------------------|------------------------|------|
| `id` | `key` = `gongbuho.` + trim(`id`), `id` = `proj-` + `key`(카탈로그 게시물과 동일 권장 패턴 [project-definition-json-to-questions.ts](../../src/features/question-set/project-definition-json-to-questions.ts)) | `id`(공부호) 문자열 고유 · 중복 시 오류 |
| `text` | `label` | 필수 비어 있으면 불가 |
| `purpose` | `description` | 비어 있으면 `null` |
| — | `type` | 기본값 **`TEXTAREA`** |
| — | `required` | **`true`** |
| 입력 순번 | `order` | `1`부터 **배열 인덱스 순서 고정** |
| `phase` | `helpText` 일부 | `단계: {phase}` 한 줄 선행 |
| `evidenceHints[]` | `helpText` 일부 | 존재 시 `증거 힌트: …` 줄 추가 |
| (메타) | 응답 래핑 | Type에 필드 없음 → preview API 바디 최상단 `source: "GONGBUHO"` 로 표시 |

## 3. 검증 규칙 (오류 시 `ValidationError`, HTTP 400)

- `packetJson`이 객체가 아님 → `GONGBUHO_QUESTION_FLOW_INVALID`
- `questionFlow` 없음 → `GONGBUHO_QUESTION_FLOW_MISSING`
- `questionFlow`가 배열이 아님 → `GONGBUHO_QUESTION_FLOW_NOT_ARRAY`
- 각 항목이 객체 아님 → `GONGBUHO_QUESTION_FLOW_ITEM_INVALID`
- `id` 누락·비문자열·공백 → `GONGBUHO_QUESTION_FLOW_ID_INVALID`
- `text` 누락·공백 → `GONGBUHO_QUESTION_FLOW_TEXT_MISSING`
- trim된 `id` 중복 → `GONGBUHO_QUESTION_FLOW_DUPLICATE_ID`

## 4. Preview API 정책

- **경로**: `POST /api/admin/gongbuho/[gongbuhoId]/question-flow/preview`
- **권한**: STAFF 또는 플랫폼 ADMIN (`requireStaffOrPlatformAdminApi`) — 다른 공부호 관리 API와 동일
- **패킷 상태**: **DRAFT / REVIEW / APPROVED / ARCHIVED** 모두 허용(문자열 투영만 수행 · DB에 QuestionSet 저장 없음)
- **실제 적용`(apply)` / 질문셋 초안 저장** 등은 향후 **APPROVED** 정책 유지 ([GONGBUHO_API_SPEC.md](./GONGBUHO_API_SPEC.md))

## 5. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 3-A 초안 · preview + 투영 함수 |
