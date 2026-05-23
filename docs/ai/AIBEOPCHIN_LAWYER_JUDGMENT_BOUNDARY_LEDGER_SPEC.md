# AI법친 Lawyer Judgment Boundary Ledger (Phase **9‑F**)

**상태**: Phase **9‑F** — **Ledger Schema · Service · Validator · Graph Runtime 편입**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9F-LAWYER-JUDGMENT-BOUNDARY-LEDGER]`**

## 1. 책임 구조 (9‑F 핵심)

> **AI는 구조화했고, 변호사가 판단했다.**

| 경계 | 의미 |
| --- | --- |
| **AI가 감지한 것** | `AI_DETECTED` — Claim · Radar signal · Contradiction edge |
| **변호사가 확인한 것** | `LAWYER_CONFIRMED` — `judgmentState: CONFIRMED` |
| **변호사가 기각한 것** | `LAWYER_REJECTED` — `judgmentState: REJECTED` + reason |
| **변호사가 수정한 것** | `LAWYER_EDITED` — `lawyerEditedText` |
| **의뢰인에게 공개 가능한 것** | `CLIENT_VISIBLE` — 변호사 CONFIRMED/EDITED 후만 |
| **문서화/제출 가능한 것** | `SUBMISSION_READY` — 변호사 CONFIRMED/EDITED 후만 |

일반 법률 챗봇과 다른 점: **AI 출력이 곧바로 의뢰인·법원 제출물이 되지 않는다.** Ledger가 경계를 기록한다.

**선행**: Phase **9‑E** (`verify:aibeopchin-contradiction-radar` PASS).

## 2. 파이프라인 (9‑A → 9‑F)

```
요약(9-B) → Graph(9-D) → Radar(9-E) → Ledger(9-F)
```

| Phase | 산출 |
| --- | --- |
| 9-B | flat summary |
| 9-D | Claim + provenance |
| 9-E | contradiction signals |
| 9-F | lawyer judgment boundary ledger |

## 3. Ledger 모델 (`9-F.1`)

### 3.1 Entry

| 필드 | 설명 |
| --- | --- |
| `entryId` | Ledger row ID |
| `subjectKind` | `CLAIM` · `RADAR_SIGNAL` · `CONTRADICTION_EDGE` |
| `subjectId` | claimId / signalId / edge key |
| `aiDetectedText` | AI가 구조화한 원문 |
| `judgmentState` | `PENDING` · `CONFIRMED` · `REJECTED` · `EDITED` |
| `boundaryLanes[]` | 6경계 lane projection |
| `clientVisible` | 의뢰인 노출 승인 |
| `submissionReady` | 문서/제출 승인 |

### 3.2 Draft vs Decision

- **Draft** (`buildLawyerJudgmentBoundaryLedgerDraft`): Graph+Radar → 전 항목 `PENDING` · `AI_DETECTED` only
- **Decision** (`applyLawyerJudgmentDecision`): 변호사 확인/기각/수정 + 공개/제출 플래그

코드 SSOT: [`buildLawyerJudgmentBoundaryLedgerDraft()`](../../src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts)

## 4. Runtime/API

`summary/generate` → `intelligenceGraph` (additive):

```json
{
  "graph": { "...": "..." },
  "radar": { "...": "..." },
  "ledger": {
    "ledgerVersion": "9-F.1",
    "motto": "AI는 구조화했고, 변호사가 판단했다",
    "entries": [],
    "summary": { "pendingCount": 0, "aiDetectedCount": 0 }
  },
  "ledgerValidationPassed": true
}
```

## 5. Validator 불변 규칙

| 규칙 | 내용 |
| --- | --- |
| PENDING | `clientVisible` · `submissionReady` **금지** |
| REJECTED | 공개/제출 **금지** · `rejectionReason` 권장 |
| CLIENT_VISIBLE | `CONFIRMED` 또는 `EDITED` 필수 |
| SUBMISSION_READY | `CONFIRMED` 또는 `EDITED` 필수 |
| EDITED | `lawyerEditedText` 필수 · 최종 판단 표현 금지 |

## 6. 산출물

| # | 파일 |
| --- | --- |
| 1 | 본 Spec |
| 2 | [`lawyer-judgment-boundary-ledger.schema.ts`](../../src/features/ai-core/lawyer-judgment-boundary-ledger.schema.ts) |
| 3 | [`lawyer-judgment-boundary-ledger.service.ts`](../../src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts) |
| 4 | [`lawyer-judgment-boundary-validator.ts`](../../src/features/ai-core/lawyer-judgment-boundary-validator.ts) |
| 5 | [`verify-aibeopchin-lawyer-judgment-ledger.mjs`](../../scripts/verify-aibeopchin-lawyer-judgment-ledger.mjs) |

## 7. Out of scope (9‑F)

- Prisma persist / lawyer UI panel
- 별도 REST `POST .../ledger/decide` (→ 후속)
- tenant AI 통제 (→ **10‑A**)

## 8. 검증

```bash
npm run verify:aibeopchin-contradiction-radar
npm run verify:aibeopchin-lawyer-judgment-ledger
npm run test -- src/features/ai-core/lawyer-judgment-boundary-ledger.schema.test.ts
npm run test -- src/features/ai-core/lawyer-judgment-boundary-ledger.service.test.ts
npm run test -- src/features/ai-core/lawyer-judgment-boundary-validator.test.ts
npm run test -- src/features/ai-core/case-intelligence-graph-runtime.service.test.ts
```

## 9. 한 줄 판정

9‑F까지 잠기면 AI법친 사건 이해 AI는 **요약 → 그래프 → 모순탐지 → 변호사 판단경계 기록**까지 연결되어, 법률 AI의 **책임 구조**를 갖춘다.
