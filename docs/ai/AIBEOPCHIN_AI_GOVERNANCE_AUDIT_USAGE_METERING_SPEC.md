# AI법친 AI Governance Audit & Usage Metering (Phase **10‑B**)

**상태**: Phase **10‑B** — **Audit · Usage Meter · Denial Log · Summary Runtime Gate**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10B-AI-GOVERNANCE-AUDIT-USAGE-METERING]`**

## 1. 10‑A vs 10‑B

| Phase | 초점 |
| --- | --- |
| **10‑A** | **통제권** — 누가·어디서·어떤 역할이 AI를 쓰고 볼 수 있는가 |
| **10‑B** | **감사·미터링** — 누가 언제 호출했는지 · usage · denial · budget/case limit |

> 10‑A에서 권한 통제를 만들었으면, 바로 다음은 **사용량·비용·차단 이력·감사 추적**을 잠그는 것.

**선행**: Phase **10‑A** (`verify:aibeopchin-ai-governance-control` PASS).

## 2. 추적 대상 (10‑B 핵심)

| # | 질문 | SSOT |
| --- | --- | --- |
| 1 | **누가 언제** AI를 호출했는가 | `AiGovernanceAuditRecord.invokedAt` · `actorUserId` |
| 2 | **어떤 feature**를 얼마나 썼는가 | `meterSnapshot.featureUsage` |
| 3 | **tenant token/budget** 초과 여부 | `TENANT_TOKEN_BUDGET_EXCEEDED` |
| 4 | **case별 LLM 호출** 제한 | `CASE_LLM_LIMIT_EXCEEDED` |
| 5 | **governance denial** 로그 | `GOVERNANCE_INVOKE_DENIED` · audit log metadata |

## 3. Audit Event Types (`10-B.1`)

| `eventType` | 의미 |
| --- | --- |
| `GOVERNANCE_INVOKE_ALLOWED` | 통제+미터 통과 · LLM 미사용 invoke |
| `GOVERNANCE_INVOKE_DENIED` | 10‑A governance gate 거부 |
| `LLM_USAGE_RECORDED` | LLM 호출 + usage 기록 |
| `METER_BUDGET_EXCEEDED` | tenant monthly token budget 초과 |
| `METER_CASE_LIMIT_EXCEEDED` | case `maxLlmCallsPerCase` 초과 |

코드 SSOT: [`buildAiGovernanceAuditRecord()`](../../src/features/ai-core/ai-governance-audit.service.ts)

## 4. Usage Meter

- In-memory meter (10‑B) — Prisma persist는 후속
- `evaluateAiGovernanceMeterGate` — LLM invoke **전** 검사
- `recordAiGovernanceFeatureUsage` — invoke/LLM/token 집계
- `meterSnapshot` — audit metadata에 snapshot 첨부

Env (10‑A 계승):

| Env | 미터링 |
| --- | --- |
| `AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET` | tenant monthly cap |
| `AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE` | case LLM cap |

## 5. Runtime 통합

`invokeCaseSummaryGenerate`:

1. `assertCaseSummaryGovernanceAndMeterAllowsInvoke` (governance → meter)
2. denial 시 `persistAiGovernanceDenialAudit` → `ForbiddenError`
3. 성공 시 `recordAiGovernanceInvokeAudit` (invoke + meter bump)

Audit persist: `writeAuditLog` · action `AI_GOVERNANCE_${eventType}`

## 6. 산출물

| # | 파일 |
| --- | --- |
| 1 | 본 Spec |
| 2 | [`ai-governance-audit.schema.ts`](../../src/features/ai-core/ai-governance-audit.schema.ts) |
| 3 | [`ai-governance-usage-meter.service.ts`](../../src/features/ai-core/ai-governance-usage-meter.service.ts) |
| 4 | [`ai-governance-audit.service.ts`](../../src/features/ai-core/ai-governance-audit.service.ts) |
| 5 | [`verify-aibeopchin-ai-governance-audit.mjs`](../../scripts/verify-aibeopchin-ai-governance-audit.mjs) |

## 7. Out of scope (10‑B)

- Billing dashboard UI
- Prisma `AiUsageMeter` table
- **10‑C** Client-Safe Disclosure Layer

## 8. 검증

```bash
npm run verify:aibeopchin-ai-governance-control
npm run verify:aibeopchin-ai-governance-audit
npm run test -- src/features/ai-core/ai-governance-audit.schema.test.ts
npm run test -- src/features/ai-core/ai-governance-usage-meter.service.test.ts
npm run test -- src/features/ai-core/ai-governance-audit.service.test.ts
```

## 9. 파이프라인

```
… → Governance Matrix (10-A) → Audit & Metering (10-B) → Client Disclosure (10-C)
```

## 10. 한 줄 판정

10‑B까지 잠기면 AI법친은 **통제권 + 감사·비용·차단 이력**을 함께 갖춘 AI 운영체제가 된다.
