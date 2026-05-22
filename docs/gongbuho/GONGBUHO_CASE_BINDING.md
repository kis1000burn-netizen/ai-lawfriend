# 사건 유형 ⇄ Gongbuho 후보 연결 (Phase 3-C)

**목표**: `Case.category`(사건 카테고리)와 패킷 `GongbuhoPacket.caseType` 정합으로 **승인됨(APPROVED) 후보만** 조회하고, apply API와 같은 **복수 후보 시 code·version 명시** 정책을 UI/API에 노출한다.

## 1. 조회 흐름

| 단계 | 설명 |
|------|------|
| 사건 | `GET /api/cases/[caseId]/gongbuho/candidates` — 사건 **읽기 권한**(`getCaseAccessContext` 성공 기준과 동일) |
| 카테고리 | `case.category` 문자열 트림; 비어 있으면 **후보 없음**(HTTP 400 아님) |
| 패킷 | `caseType = category` 및 `status = APPROVED` 만 목록화 |
| 초안 존재 | `QuestionSet.definitionJson`(Phase 3-B envelope·`packetId`) 최근 레코드 스캔으로 휴리스틱 매칭 — [GONGBUHO_QUESTION_SET_PROJECTION.md](./GONGBUHO_QUESTION_SET_PROJECTION.md) |
| 적용 여부 | 해당 사건 `GongbuhoTrace.gongbuhoPacketId` 집합에 후보 패킷 id 포함 여부 |
| 최신 Trace | `createdAt DESC` 첫 행 요약 포함(Phase 3-C 응답) |

## 2. 선택 정책 (`selectionPolicy`)

| 값 | 조건 |
|----|------|
| `AUTO_IF_SINGLE_APPROVED` | 동일 카테고리 후보 중 APPROVED가 **정확히 1개** |
| `REQUIRE_CODE_VERSION_IF_MULTIPLE` | 후보 APPROVED **2개 이상** |
| `NO_APPROVED_PACKET` | 카테고리는 있으나 매칭 APPROVED **0개**이거나, 카테고리 없음으로 후보를 만들 수 없을 때 |

카테고리가 없어 후보가 비워진 경우에는 응답에 **`resolutionReason: "CASE_TYPE_REQUIRED"`**를 둔다 — apply 시에는 `code`·`version` 명시 규칙을 동시에 안내할 수 있다.

## 3. apply API와의 정합

- `findApprovedPacketForApply` 로직과 동일: 카테고리만으로는 **복수 불가**(클라이언트는 `selectionPolicy === REQUIRE_CODE_VERSION_IF_MULTIPLE` 이면 code·version 본문 전달).

## 4. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 3-C 초안 |
