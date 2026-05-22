# Gongbuho 멀티 패킷 라이브러리 (Phase 4-D)

**목적**: LAW-FRAUD-001 단일 샘플에 머물지 않고, 사건 유형별 패킷 확장·시드·목록 필터를 같은 축으로 묶어 **운영 라이브러리**로 다룬다.

## 1. 샘플 JSON 인벤토리

| 파일명 | `code` | `caseType` (DB `GongbuhoPacket.caseType`) | 우선순위(권장 논의) |
|--------|--------|----------------------------------------------|----------------------|
| [LAW_FRAUD_001_GONGBUHO.json](./samples/LAW_FRAUD_001_GONGBUHO.json) | LAW-FRAUD-001 | FRAUD | 기준선(기존) |
| [LAW_WAGE_001_GONGBUHO.json](./samples/LAW_WAGE_001_GONGBUHO.json) | LAW-WAGE-001 | WAGE_BACKPAY | 1순위(임금체불) |
| [LAW_LAND_001_GONGBUHO.json](./samples/LAW_LAND_001_GONGBUHO.json) | LAW-LAND-001 | LAND_DISPUTE | 2순위 |
| [LAW_CONTENT_001_GONGBUHO.json](./samples/LAW_CONTENT_001_GONGBUHO.json) | LAW-CONTENT-001 | CONTENTS_CERTIFIED_DEMAND | 3순위 |
| [LAW_COMPLAINT_001_GONGBUHO.json](./samples/LAW_COMPLAINT_001_GONGBUHO.json) | LAW-COMPLAINT-001 | CRIMINAL_COMPLAINT_DRAFT | 4순위 |

신규 패킷 추가 시 **README 본 표와** `GONGGBUHO_ADMIN_CASE_TYPE_FILTER_PRESETS`(관리 필터 프리셋)를 가능한 한 동기화한다. 임의 패킷은 `code` 입력란으로 검색한다(`GET` 동일 축).

## 2. 라이브러리 검증(SSOT)

관리 API `POST …/gongbuho`의 최소 Zod(`gongbuhoPacketJsonMinSchema`)과 달리 **시드·샘플 라이브러리**에는:

- **`gongbuhoSampleLibraryPacketSchema`**: 필수 `caseType` 문자열(비공백) — 사건 `Case.category` 매칭 후보(`findApprovedPacketForApply` 등) 정합.
- **`projectGongbuhoQuestionFlowToQuestions`**: `questionFlow` 규격 검증(저장·프리뷰 동일 축).

### `outputContract.summary` 누락

- **패킷 본문 검증(B)**: 누락되어도 시드·Vitest는 통과할 수 있다(Phase 3-E는 요약 시 **미적용 폴백**).
- **문서·운영 표준**: 새 샘플은 가급적 LAW_FRAUD 패턴처럼 **summary 배열을 포함**해 문서·카드 일관성을 맞춘다.

## 3. 시드

| 명령 | 설명 |
|------|------|
| `npm run seed:gongbuho-law-fraud-001` | LAW-FRAUD-001 한 건만 삽입 — 내부적으로 라이브러리 규약 적용 |
| `npm run seed:gongbuho-samples` | `docs/gongbuho/samples/*_GONGBUHO.json` 정렬 순서로 전부 시도 · `code`+`version` 중복은 **SKIP** · 실패 시 종료 코드 `1` 및 로그 |

환경 변수 `GONGBUHO_SEED_CREATED_BY_USER_ID`는 기존과 동일하게 선택.

## 4. 관리 목록 필터

- 페이지: **`GET /admin/gongbuho?status=&caseType=&code=`**
- 쿼리 파싱: `adminListGongbuhoPacketsQuerySchema` 동일(SSOT 서버 검증 실패 시 필터 무시).
- 목록 패널 선택지 출처: `admin-gongbuho-case-type-filter-presets.ts` + 운영자가 **code 정확 일치** 문자열 검색 가능.

## 5. Phase 4-E 연계

코드 회귀: **`npm run verify:gongbuho`** (`verify-gongbuho.mjs` 정적 검증 후 `run-gongbuho-verify.mjs` Vitest 묶음). 통합 스모크·운영 책임 체계: [GONGBUHO_OPERATIONS_QA](./GONGBUHO_OPERATIONS_QA.md), [GONGBUHO_AUDIT_POLICY](./GONGBUHO_AUDIT_POLICY.md).

증빙 태그: `[EVIDENCE-20260523-GONGBUHO-PHASE4D-MULTI-PACKET-LIBRARY]`
