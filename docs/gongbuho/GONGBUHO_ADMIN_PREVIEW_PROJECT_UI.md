# 공부호 Phase 4-C — questionFlow 미리보기 · QuestionSet Project UI

**목적**: `/admin/gongbuho/[gongbuhoId]` 상세에서 공부호 `questionFlow`를 **저장 없이** 검토하고, **`APPROVED`** 패킷만 **질문셋 카탈로그 초안(`QuestionSet` DRAFT)** 으로 투영·저장하는 운영 UI를 제공한다.

## 권한

| 역할 | questionFlow 미리보기(화면/RSC) | Project 저장(API·버튼) |
|------|--------------------------------|-------------------------|
| **STAFF** | 허용 — 상세 `packetJson` 기준 즉시 투영 | **불가** — 버튼 비표시 및 안내 |
| **ADMIN / SUPER_ADMIN** | 허용 | 허용 — `POST …/question-set/project` |

- Project API는 **`assertAdminOnly`** (`approve` / `archive` / 본 라우트와 동일 패턴).
- REST 미리보기 엔드포인트 **`POST …/question-flow/preview`** 는 STAFF+ (패킷 상태 무관) 유지됨([GONGBUHO_QUESTION_FLOW_PROJECTION](./GONGBUHO_QUESTION_FLOW_PROJECTION.md)). 화면은 **네트워크 없이 RSC 동일 규약**(`deriveGongbuhoQuestionFlowPreview`) 사용.

## UI 규칙(SSOT)

순수 모델: `deriveGongbuhoQuestionSetProjectPanelUi` (`admin-gongbuho-question-set-project-ui.ts`).

| 조건 | Project 버튼 |
|------|----------------|
| STAFF | **숨김** |
| 패킷 상태 ≠ `APPROVED` | **비활성** + 캡션 (승인 필요) |
| `questionFlow` 투영 실패(프리뷰 오류) | **비활성** + 오류 코드는 미리보기 패널에 표시 |
| 동일 공부호 envelope 로 이미 `QuestionSet` 존재 | **비활성** · 상단 **중복 배너** + `/admin/question-sets/[id]` 링크 |
| ADMIN + APPROVED + 프리뷰 성공 + 무중복 | **활성** |

저장 후: 클라이언트가 **`router.refresh()`** 호출하여 `findExistingQuestionSetForGongbuhoIdentity` 재조회 결과(링크 노출)·버튼 비활성을 맞춤.

## 오류 표시 요약

- **미리보기 실패**: `deriveGongbuhoQuestionFlowPreview` 의 `code`·`message` (예 `GONGBUHO_QUESTION_FLOW_MISSING`).
- **Project 비 APPROVED**: API `400` · `details.code` `GONGBUHO_PROJECT_REQUIRES_APPROVED_PACKET`.
- **중복 저장**: API `409` · `details.code` `QUESTION_SET_FROM_GONGBUHO_EXISTS` · 선택적 `existingQuestionSetId`(감사·UI 재동기화).
- questionFlow 무효로 인한 저장 실패: 예 `400` · `details.code` `GONGBUHO_QUESTION_FLOW_*`.

## 연관 코드

- `gongbuho-question-flow-preview-panel.tsx` · `deriveGongbuhoQuestionFlowPreview`
- `gongbuho-question-set-project-panel.tsx` · `deriveGongbuhoQuestionSetProjectPanelUi`
- `POST …/question-set/project` 라우트 + `projectGongbuhoPacketToQuestionSetDraft`

증빙 태그: `[EVIDENCE-20260523-GONGBUHO-PHASE4C-ADMIN-PREVIEW-PROJECT-UI]`
