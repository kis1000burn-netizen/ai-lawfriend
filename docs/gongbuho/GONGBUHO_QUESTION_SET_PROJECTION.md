# 공부호 → QuestionSet 초안 저장 (Phase 3-B)

**전제**: [GONGBUHO_QUESTION_FLOW_PROJECTION.md](./GONGBUHO_QUESTION_FLOW_PROJECTION.md) 투영 함수  
**API**: `POST /api/admin/gongbuho/[gongbuhoId]/question-set/project`

**권한(Phase 4-C SSOT)**: **ADMIN·SUPER_ADMIN** 만 호출 가능 (`assertAdminOnly`). STAFF 는 `POST …/question-flow/preview` 및 관리 상세 RSC 미리보기만 허용합니다.

## 1. Preview vs 저장 분리

| 구분 | 정책 |
|------|------|
| `POST …/question-flow/preview` | 패킷 상태 제한 없음 · **DB 저장 없음** |
| `POST …/question-set/project` | **`status === APPROVED` 인 GongbuhoPacket만** · **QuestionSet 행 생성** |

## 2. 저장 메타데이터 (`QuestionSet.definitionJson` 오버레이)

카탈로그 게시용 `definitionJson`(Zod)과 병행 가능하도록 **최소 독립 객체**만 넣습니다(런타임 인터뷰는 계속 **`questions`** 만 사용).

```json
{
  "source": "GONGBUHO",
  "gongbuho": {
    "packetId": "(GongbuhoPacket.id cuid)",
    "code": "LAW-FRAUD-001",
    "version": "1.0.0",
    "projectedAt": "2026-05-23T12:34:56.789Z"
  }
}
```

- **추적 키**: `packetId` 우선 시일치. 동일 `code`·`version` 문자열도 중복 차단 후보와 함께 검사합니다.

## 3. 초안 속성

- `questions`: `projectGongbuhoQuestionFlowToQuestions(packetJson)` 결과(선택 **A안** 공부호 전용 투영 유지).
- `catalogStatus`: Prisma 기본값 **`DRAFT`** (`QuestionSetStatus.DRAFT`).
- `isActive`: **`false`** — 활성 단일 인터뷰 집합(`getActiveQuestionSet`)에 자동 포함되지 않도록 합니다.

## 4. 중복 생성 정책 (Phase 3-B)

- 같은 공부호 식별(`definitionJson.source === "GONGGBUHO"` 이고 **`gongbuho.packetId` 일치** 또는 **`gongbuho.code`·`version` 문자열 동시 일치**)인 질문셋이 최근 레코드 스캔에서 발견되면 **`409 CONFLICT`** · `details.code`: `QUESTION_SET_FROM_GONGBUHO_EXISTS`.
- **`force`/재생성 옵션은 Phase 3-B 범위 밖**(운영 분기 단순화).

## 5. 실패 매핑(요약)

| 상황 | HTTP |
|------|------|
| 패킷 없음 | 404 |
| 비 APPROVED 패킷 | 400 (`GONGBUHO_PROJECT_REQUIRES_APPROVED_PACKET`) |
| 중복 초안 존재 | 409 (`QUESTION_SET_FROM_GONGBUHO_EXISTS`) |
| `questionFlow` 투영 실패 | 400 (`details.code` Gongbuho `_QUESTION_FLOW_*`) |
| STAFF/플랫폼 ADMIN 아님 | 403 |

## 6. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 3-B 초안 |
