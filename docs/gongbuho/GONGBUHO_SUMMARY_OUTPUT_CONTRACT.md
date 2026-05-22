# 공부호 사건 요약 출력 계약 (GONGBUHO_SUMMARY_OUTPUT_CONTRACT)

작업 코드명 · **AI법친 Gongbuho Phase 3-E — Summary OutputContract Binding**

## 목적

`GongbuhoPacket.packetJson.outputContract.summary` 에 정의된 **제목 순서와 범위**에 맞춰, 인터뷰 기반 1차 사건 요약이 **패킷 간 일관된 구조**로 표시되게 한다.

- **실제 LLM 재작성이 아니라**(현 단계)**인터뷰 답변·기존 요약 버킷을 휴리스틱으로 나누어 채운다**.
- 패킷별 제목 문자열은 SSOT 패킷 정의 그대로이며 앱별 별칭을 두지 않는다([FIELD_MAPPING](./GONGBUHO_FIELD_MAPPING.md)).

## 적용 트리거

| 조건 | 동작 |
|------|------|
| 사건에 연결 가능한 패킷이 있고 **`outputContract.summary` 가 비어 있지 않음** | `contractSections`(제목+본문) 생성 · 클라이언트는 순서 그대로 표시 |
| 공부호를 찾을 수 없음 **또는** `outputContract.summary` 없음·파싱 불가 | **기존** `caseOverview`·`timeline`·`issues`·`riskNotes`·`checklist` 플랫 형식 유지 |

**패킷 조회 우선순위** (`src/features/gongbuho/gongbuho-summary-contract.service.ts`)

1. **최신 `GongbuhoTrace`** — `POST …/gongbuho/apply` 로 적용된 패킷(적용 이력이 곧 패킷 SSOT 선택의 기본 신호).
2. **미적용**이면 **`Case.questionSetId` → `QuestionSet.definitionJson` Gongbuho envelope `packetId`** (Phase 3-D 인터뷰 바인딩과 정합).

## 핵심 정책

1. 자동 결과는 **최종 법률 판단이 아님** · API·UI 고지 문구 유지 및 `structuredSummaryNote` 보강(Phase 3-E).
2. **변호사 검토 필요** 항목: 패킷 `expertReviewPoints` 및 휴리스틱 블록 **「변호사 검토 포인트」** 섹션에 별도 본문으로 제시(LLM 근거 재진술이 아니라 패킷 정의 라인 재나열 중심).
3. **`outputContract.documents`**(문서 골격)는 **본 Phase에서 사건 요약 API 응답에 포함하지 않음** · 문서 생성 파이프라인에서 재사용 예정(GONGBUHO_ENGINE_SPEC §3 문서 초안 참고).

## `GongbuhoTrace` 연계 후보 (정리만)

본 구현에서는 Trace에 추가 컬럼을 두지 않는다.

| 필드 | 후보 활용 · 비고 |
|------|----------------|
| **`validationResult`** | 적용 시점 메타 (`ok`, `appliedVia`). 요약 형식 선택과 무관하게 **감사·운영 디버깅**에 활용 가능. 향후 `outputContractFingerprint` 같은 읽기 전용 derived 필드를 JSON 하위키로 넣는 방안 검토. |
| **`outputSnapshot`** | 현재 `apply` 플로우에서는 미기재. 장기적으로 생성된 요약 원문·메타 버전 고정 저장 시 활용 가능(사건 상태 스냅샷처럼). |
| **`expertReviewPoints`** | 적용 시 패킷의 `expertReviewPoints`를 Trace에 스냅샷 저장(기존). 요약 출력 시 패킷 `packetJson` 루트 `expertReviewPoints` 또는 Trace 스냅샷 우선 순위 통일 문제는 차기 합의(현재 코드는 패킷 `packetJson` 기준으로 추출). |

## 검증 명령(참고)

```bash
npx vitest run src/features/gongbuho/gongbuho-summary-contract.service.test.ts "src/app/api/cases/[caseId]/summary/generate/route.test.ts"
```

증빙: `[EVIDENCE-20260523-GONGBUHO-PHASE3E-SUMMARY-OUTPUT-CONTRACT]`
