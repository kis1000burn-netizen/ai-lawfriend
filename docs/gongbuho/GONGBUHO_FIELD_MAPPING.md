# 공부호 필드 매핑 (GONGBUHO_FIELD_MAPPING)

**상태**: Phase 2-A · Prisma/API 구현 전 **이름 계약(contract) 고정**  
**전제**: [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md), [samples/LAW_FRAUD_001_GONGBUHO.json](./samples/LAW_FRAUD_001_GONGBUHO.json)

## 1. 원칙(반드시 지킬 것)

1. **샘플 JSON 루트 키 이름 = 패킷 본문(Body)의 유일한 진실 원천(SSOT)**.  
   불가피한 경우에만 이 문서에 예외 행으로 추가하고, STANDARD·샘플을 함께 수정한다.

2. **Prisma에서는 `camelCase`** 를 사용한다. 패킷 JSON Body 키도 **전부 camelCase**로 통일한다(현재 샘플과 동일).

3. **REST API 성공 페이로드**: 패킷 “본문”을 내려줄 때는 JSON 파일과 동일한 키를 사용한다(`data.packet` 같은 래핑 한 단계 안에서 속성 이름 유지).

4. **프론트엔드(React 등)**: 위 Body 키를 그대로 사용한다. **별칭(alias) 금지** — 필요 시 레이어마다 매핑 유틸을 두지 않고 타입만 `GongbuhoPacketBody` 로 공유하는 방향을 권장한다.

5. DB에 **메타 행**(id·승인일 등)만 별도 컬럼으로 두고, 질문 흐름·규칙 등은 하나의 **`Json`(또는 분할된 Json 칼럼들)** 에 **아래 같은 키 구조를 그대로** 넣는다.  
   (컬럼을 과도하게 쪼개면 키 이름이 새로 만들어져 표준이 깨지기 쉽다.)

## 2. 패킷 본문(Packet Body) — 표준 ↔ JSON ↔ Prisma(Json) ↔ API

Body는 저장소에서 **통째 `Json`** 이거나 동일 스키마를 여러 컬럼으로 나눈 경우 각각 같은 키를 유지한다.

| 표준 이름 | 샘플 JSON 키 | Prisma 저장(Json 내부) | GET API Body 키 | 비고 |
|-----------|---------------|-------------------------|-----------------|------|
| 공부호 코드 | `code` | `code` | `code` | 식별. 예 `LAW-FRAUD-001` |
| 표시명 | `name` | `name` | `name` | |
| 도메인 | `domain` | `domain` | `domain` | 예 `AI법친` |
| 사건 유형 | `caseType` | `caseType` | `caseType` | 앱 매핑 키. 예 `FRAUD` |
| 버전 | `version` | `version` | `version` | SemVer 권장 |
| 로캘 | `locale` | `locale` | `locale` | 선택. 예 `ko-KR` |
| 메타 | `meta` | `meta` | `meta` | 선택. `description`, `tags` 등 |
| 지식 맵 | `knowledgeMap` | `knowledgeMap` | `knowledgeMap` | 선택 강력 권장 |
| 추론 순서 | `reasoningFlow` | `reasoningFlow` | `reasoningFlow` | 문자열 배열 |
| 질문 흐름 | `questionFlow` | `questionFlow` | `questionFlow` | 객체 배열 |
| 검증 규칙 | `validationRules` | `validationRules` | `validationRules` | 문자열 배열 |
| 출력 계약 | `outputContract` | `outputContract` | `outputContract` | `summary`, `documents` 배열 포함 |
| 금지 규칙 | `forbiddenRules` | `forbiddenRules` | `forbiddenRules` | 문자열 배열 |
| 전문가 검토 포인트 | `expertReviewPoints` | `expertReviewPoints` | `expertReviewPoints` | 문자열 배열 |
| 인간 확인 조건 | `humanApproval` | `humanApproval` | `humanApproval` | 객체(아래 표) |

### 2.1 `questionFlow[]` 원소 형태(SSOT)

| 키 | 필수 | 설명 |
|----|------|------|
| `id` | 예 | 안정적인 질문 ID(답변 키 후보로 재사용) |
| `phase` | 권장 | 단계 레이블(인터뷰 UI 진행률 등) |
| `text` | 예 | 사용자에게 보이거나 TTS 가능한 문장 |
| `purpose` | 권장 | 내부/운영 검수용 목적 표기 |
| `evidenceHints` | 선택 | 해당 질문과 연결된 증거 유형 힌트 배열 |

### 2.2 `knowledgeMap` 형태(SSOT)

| 하위 키 | 타입 |
|---------|------|
| `coreElements` | `string[]` |
| `evidenceTypes` | `string[]` |

### 2.3 `outputContract` 형태(SSOT)

| 하위 키 | 타입 |
|---------|------|
| `summary` | `string[]` |
| `documents` | `string[]` |

### 2.4 `humanApproval` 형태(SSOT)

| 키 | 타입 |
|----|------|
| `clientConfirmationRequired` | `boolean` |
| `lawyerReviewRequired` | `boolean` |
| `autoSubmitAllowed` | `boolean` |
| `highRiskCaseFlagSuggested` | `boolean`(선택) |

## 3. 저장소 행 메타(Packet Row) — JSON에 없는 필드

DB `GongbuhoPacket` **테이블 전용**(JSON Body와 혼동 금지). 아래 이름은 Phase 2 Prisma 초안안이며, 확정 시 이 표만 갱신한다.

| Prisma 후보 필드명 | 타입 후보 | API 노출 여부 | 설명 |
|--------------------|-----------|---------------|------|
| `id` | `String` @id | 예 | 내부 PK |
| `status` | `GongbuhoPacketStatus` enum | 예 | `DRAFT` 등 — Prisma 이름은 `docs/gongbuho/GONGBUHO_STANDARD.md` §3과 동일 |
| `packetJson` | `Json` | 조건부 | **Body 통째 저장 시** 원본과 동일 키(Structurally equal to 파일 JSON + 필요 시 검증 후 정규화) |
| `createdByUserId` | `String?` | 운영자만 | 선택 |
| `approvedByUserId` | `String?` | 운영자만 | 선택 |
| `approvedAt` | `DateTime?` | 예 | 승인 시각 |
| `createdAt` / `updatedAt` | `DateTime` | 예 | 관례 필드 |

**주의**: `code`·`version` 은 Body에 반드시 있으므로, DB에서 unique 인덱스를 줄 때 **`packetJson`** 에서 추출하지 말고 **동일 값을 반복 가능한 형태**(중복 저장 또는 generated virtual이 아니라 **명시 컬럼 `code`, `semverVersion`**)가 필요하면 **Phase 2에서 이 매핑 문서를 먼저 업데이트**한 뒤 컬럼을 추가한다. (추가 시에도 Body 키 이름은 변경하지 않는다.)

## 4. GongbuhoTrace 행 매핑(Phase 2 초안)

Trace는 **패킷 파일과 다른 스키마**이다. 이름만 일관되게 가져간다.

| 표준(Trace 페이로드) | Prisma 후보 | API 후보 | 설명 |
|----------------------|-------------|----------|------|
| `id` | `id` | `id` | Trace PK |
| `gongbuhoPacketId` | `gongbuhoPacketId` | `gongbuhoPacketId` | 패킷 FK |
| `caseId` | `caseId` | `caseId` | 사건 FK |
| `appliedVersion` | **`version`** | **`version`** | 적용당시 패킷 버전(본문 `version`과 동일). 명세 어미는 `appliedVersion`, DB/API 필드명은 `version`(중복 허용) |
| 패킷 코드(스냅샷) | `code` | `code` | 조회·감사용(패킷 `code`와 동일 문자열 유지) |
| 적용 시 전문가 포인트 스냅샷 | `expertReviewPoints` | `expertReviewPoints` | 패킷 동일 키를 복사하거나 재구조화 배열 등 `Json`(선택) |
| `inputSnapshot` | `Json` | `inputSnapshot` | 사건 상태 스냅샷 등 |
| `outputSnapshot` | `Json`(선택) | `outputSnapshot` | 요약 생성 결과 참조 등 |
| `validationResult` | `Json` | `validationResult` | 구조화 검증 결과 |
| `riskFlags` | `Json` | `riskFlags` | 위험 플래그 배열 또는 객체 |
| `humanApprovalStatus` | `String` | `humanApprovalStatus` | 예 `PENDING_CLIENT` |
| `createdAt` | `DateTime` | `createdAt` | 적용 일시 |

## 5. Phase 2 착수 전 체크리스트

- [ ] 새 샘플(`LAW_WAGE_001` 등) 추가 시 **이 표에 행 추가 없이 동일 Body 키만 사용했는지** 확인
- [ ] Prisma 마이그레이션 작성 전 **이 문서 업데이트**
- [ ] API 응답 예시(OpenAPI 또는 주석)에서 Body 키 오타 검사

## 6. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 2-B: Trace `appliedVersion` ↔ Prisma 필드명 `version` 정합 명시 · `status` enum명 `GongbuhoPacketStatus` 반영 |
| 2026-05-23 | Phase 2-A 초안 작성 |
