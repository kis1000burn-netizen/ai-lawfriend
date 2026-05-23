# AI법친 Case Intelligence Graph (Phase **9‑D**)

**상태**: Phase **9‑D** — **Spec · Schema · Provenance · Claim Validator** 잠금 (Runtime/API 편입은 **9‑E**)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9D-CASE-INTELLIGENCE-GRAPH-SPEC]`**

## 1. 불변 원칙 (9‑D 핵심)

> **AI는 판단하지 않는다.**  
> AI는 **주장·근거·출처·모순·누락**을 구조화하고, **최종 판단은 변호사**가 한다.

| AI가 하는 일 | AI가 하지 않는 일 |
| --- | --- |
| Claim 분류 · 출처 연결 · confidence 표시 | 최종 법률 판단 · 승소/패소 확정 |
| Gongbuho·인터뷰·첨부 메타 provenance | 근거 없는 사실 invent |
| 모순·누락 **신호** (9‑E Radar) | 변호사 검토 상태 **대체** |

**선행**: Phase **9‑C** Case Summary RC CLOSURE (`verify:aibeopchin-case-summary-rc` PASS).

## 2. 목적

Phase **9‑B** flat text 요약을 넘어, **모든 요약 문장(Claim)** 을 아래 5축 출처 그래프에 연결한다.

1. 의뢰인 인터뷰 답변  
2. 첨부자료 메타/요약  
3. 공부호 승인 패킷  
4. 변호사 검토 메모 (후속)  
5. 시스템 상태값/절차 이력  

**의미**: AI법친은 “요약 잘하는 AI”가 아니라 **변호사가 사건의 진실 구조를 장악**하게 하는 **사건 지능 운영체제**로 진화한다.

## 3. 예시 Claim (Spec SSOT)

**요약 문장**

> 근로자는 2025년 3월부터 임금을 지급받지 못했다고 **주장**합니다.

**연결 정보 (Graph node)**

| 필드 | 값 |
| --- | --- |
| `source` | `InterviewAnswer.Q_WAGE_03` |
| `claimType` | `USER_CLAIM` |
| `legalBasis` | `GongbuhoPacket.WAGE_BACKPAY` |
| `confidence` | `MEDIUM` |
| `lawyerReviewState` | `NOT_REVIEWED` |
| `clientVisible` | `false` |

코드 SSOT: [`buildWageBackpayExampleClaim()`](../../src/features/ai-core/case-summary-provenance-map.ts)

## 4. 범위

### 4.1 In scope (9‑D)

| # | 산출물 | 역할 |
| --- | --- | --- |
| 1 | 본 Spec | Graph 개념 · 불변 원칙 · Phase 로드맵 |
| 2 | [`case-intelligence-graph.schema.ts`](../../src/features/ai-core/case-intelligence-graph.schema.ts) | Zod schema · enums · `9-D.1` |
| 3 | [`case-summary-provenance-map.ts`](../../src/features/ai-core/case-summary-provenance-map.ts) | Output Spec §6 ↔ API ↔ Claim mapping |
| 4 | [`case-summary-claim-validator.ts`](../../src/features/ai-core/case-summary-claim-validator.ts) | 출처 필수 · 판단 금지 guardrail |
| 5 | [`verify-aibeopchin-case-intelligence-graph.mjs`](../../scripts/verify-aibeopchin-case-intelligence-graph.mjs) | 정적 게이트 |

### 4.2 Out of scope (9‑D)

- `summary/generate` API에 graph JSON 노출 (→ **9‑E**)
- Contradiction Radar 자동 탐지 (→ **9‑E**)
- Lawyer Judgment Boundary Ledger (→ **9‑F**)
- Prisma `CaseSummarySnapshot` / migration (→ 후속)
- LLM graph extraction (→ 9‑E+)

## 5. Graph 모델 (9‑D.1)

### 5.1 `CaseIntelligenceClaim`

| 필드 | 설명 |
| --- | --- |
| `claimId` | 그래프 내 고유 ID |
| `text` | 표시 문장 (비판단 framing) |
| `claimType` | `USER_CLAIM` · `USER_STATEMENT` · … |
| `sources[]` | `EvidenceRef` (kind + ref + excerpt) |
| `legalBasis[]` | Gongbuho / contract hint |
| `confidence` | `LOW` \| `MEDIUM` \| `HIGH` |
| `lawyerReviewState` | `NOT_REVIEWED` … |
| `clientVisible` | 의뢰인 노출 여부 |
| `audience` | `INTERNAL` \| `CLIENT` \| `COURT_READY` |
| `outputSectionKey` | Spec §6 snake_case |
| `apiFieldHint` | API camelCase hint |

### 5.2 `CaseIntelligenceGraph`

- `graphVersion`: **`9-D.1`**
- `claims[]`: Claim 목록
- `contradictions[]`: optional (9‑E)

## 6. Provenance mapping (Output Spec ↔ API)

SSOT: [`CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD`](../../src/features/ai-core/case-summary-provenance-map.ts)

Integration Spec §11.1과 **동일 매핑** — validator·UI·graph가 한 표를 공유.

Rule-based draft: `buildCaseIntelligenceGraphDraft()` — 인터뷰 답변 → Claim nodes (LLM 없음).

## 7. Claim Validator

| 검사 | 내용 |
| --- | --- |
| Schema | Zod `caseIntelligenceClaimSchema` |
| Sources | `sources.length >= 1` |
| No final judgment | regex + `checkForbiddenAssertions` |
| USER_CLAIM framing | “주장/진술” framing 권장 (strict mode) |

## 8. RC boundary (9‑C 유지)

- Document RC `8-C.1` · Case Summary RC `9-B.1` **불변**
- 9‑D는 **additive module** — `verify:aibeopchin-case-summary-rc` PASS 유지

## 9. 검증

```bash
npm run verify:aibeopchin-case-summary-rc
npm run verify:aibeopchin-case-intelligence-graph
npm run test -- src/features/ai-core/case-intelligence-graph.schema.test.ts
npm run test -- src/features/ai-core/case-summary-provenance-map.test.ts
npm run test -- src/features/ai-core/case-summary-claim-validator.test.ts
```

## 10. Phase 로드맵 (9‑D 이후)

| Phase | 목표 |
| --- | --- |
| **9‑E** | Contradiction Radar · graph API/runtime 편입 |
| **9‑F** | Lawyer Judgment Boundary Ledger |
| **10‑A** | tenant/role/case AI 통제 · rate limit |

## 11. 한 줄 착수 기준

Phase **9‑C** RC 위에 **Claim·EvidenceRef·LegalBasis·LawyerReviewState** schema가 `verify:aibeopchin-case-intelligence-graph`에 잠겼으므로, **9‑E**에서 flat 요약 API 위에 **출처 추적형 Graph**를 안전하게 올릴 수 있다.
