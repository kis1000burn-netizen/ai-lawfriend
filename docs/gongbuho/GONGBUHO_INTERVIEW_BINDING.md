# 공부호 · 사건 인터뷰 질문셋 바인딩 (Phase 3-D)

Preview·초안·후보(Phase 3-A~C) 이후 **게시되고 활성화된** 공부호 기반 `QuestionSet`만 사건 인터뷰 런타임과 연결한다.

## 원칙 (필수)

**공부호에서 생성된 QuestionSet DRAFT는 즉시 의뢰인 인터뷰에 노출하지 않는다.** 반드시 기존 질문셋 검토·활성화·게시(PUBLISHED) 흐름을 거친 뒤, 사건 인터뷰에 바인딩한다.

## 저장 구조

- `Case.questionSetId` (nullable FK → `QuestionSet`) — 해당 사건의 인터뷰 질문 소스가 **바인딩된 집합**임을 나타낸다.
- 미설정 시 기존과 같이 **`getActiveQuestionSet()`**(전역 단일 활성 질문셋) 규약을 유지한다.

## 검증 규약

| 항목 | 정책 |
|------|------|
| `GongbuhoPacket` | **`APPROVED`만** |
| `QuestionSet` | **`definitionJson` Gongbuho envelope**(Phase 3-B)와 패킷 `id`/`code`/`version` 정합 |
| 인터뷰 사용 허용 | **`catalogStatus === PUBLISHED` ∧ `isActive === true`** |

## API

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| `GET` | `/api/cases/[caseId]/gongbuho/interview` | `canRead` | 미연결(`bound:false`) 포함 연결 상태·질문 목록 조회 |
| `POST` | `/api/cases/[caseId]/gongbuho/interview/bind` | **`canWriteCase`** | 명시 또는 `{"auto":true}` 단일 후보 자동 바인드 |

바인드 성공 시 **`201`** + 연결 상태 본문(GET과 동일 형태).

### 자동 바인드 (`{"auto":true}`)

- Phase 3-C와 동일: **`AUTO_IF_SINGLE_APPROVED`** 일 때만 허용 (`GONGBUHO_INTERVIEW_AUTO_UNAVAILABLE`).
- 스캔 범위 내 **게시·활성** 질문셋 중 Gongbuho envelope 패킷 연결이 **정확히 1건**일 때만 성공.

## 인터뷰 실행 (`/api/cases/[caseId]/interview`)

사건에 `questionSetId` 가 있으면 **`getInterviewFlow*`** 의 질문 소스는 해당 행만 사용하고, 게시·활성 상태가 아니면 즉시 실패해 DRAFT·비활성 노출을 막는다.

음성 입·출력 레이어는 [`docs/voice/README.md`](../voice/README.md)의 Phase 5 기준을 따르며, 기존 Gongbuho → QuestionSet → Interview 흐름을 변경하지 않고 **입출력 계층으로만** 연결한다.

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 3-D 초안 |
