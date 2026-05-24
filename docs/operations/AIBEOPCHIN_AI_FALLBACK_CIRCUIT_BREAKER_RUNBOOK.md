# AI Fallback & Circuit Breaker Runbook (Phase **18-D**)

**원칙**: AI 장애 대응은 **“다시 호출”이 아니라**, 실패 원인별로 **재시도 · fallback · 수동 검토 · 차단**을 분리하는 **책임형 회로 차단** 구조입니다.

---

## 1. Flow

```
AI call failed
  → classifyAiFailureReason
  → evaluateAiFallbackPolicy
  → circuit state check (CLOSED / OPEN / HALF_OPEN)
  → fallback | manual review | block | limited retry
  → AI audit (AI_FALLBACK_INVOKED) + RetryJob linkage (AI_CALL)
```

## 2. Failure classification

| Class | Retry | Fallback | Circuit count |
| --- | --- | --- | --- |
| `RATE_LIMIT` | 제한적 (max 2) | task policy | yes |
| `TIMEOUT` | 제한적 (max 2) | task policy | yes |
| `PROVIDER_ERROR` / `NETWORK` | no auto | task policy | yes |
| `SAFETY_DENIAL` | **no** | **no** | no |
| `BUDGET_EXCEEDED` | **no** | **no** (block) | no |
| `PERMISSION` | **no** | **no** | no |

## 3. Circuit breaker

- Provider key: `openai` (in-process store)
- **5회** 연속 countable failure → circuit **OPEN** (60s)
- OPEN 만료 후 **HALF_OPEN** — probe 실패 시 다시 OPEN
- OPEN 상태: LLM invoke 차단, task fallback 허용 (정책에 따라)

Audit: `AI_CIRCUIT_BREAKER_OPENED`

## 4. Task-specific fallback

| Task | Fallback | Client public on fallback |
| --- | --- | --- |
| `DOCUMENT_PARAGRAPH_GENERATE` | seed content | **blocked** |
| `DOCUMENT_PARAGRAPH_REGENERATE` | local rule | **blocked** |
| `CASE_SUMMARY_GENERATE` | rule-based | **blocked** |
| `LEGAL_DOCUMENT_SUMMARIZE` | rule engine | manual review |
| `OPPONENT_BRIEF_ANALYZE` | rule engine | manual review |

**의뢰인 공개용 결과는 fallback 상태를 내부 검토 없이 공개하지 않습니다** (`blockPublicExposure` / `requiresManualReview`).

## 5. Integration points

- `ai-core-runtime.service.ts` — document paragraph generate/regenerate
- `case-summary-ai-core-runtime.service.ts` — case summary LLM
- Reliability module: `src/features/platform/reliability/ai-fallback-circuit-breaker.*`

## 6. RetryJob linkage

- `sourceType`: `AI_CALL`
- `jobCode`: task type (e.g. `CASE_SUMMARY_GENERATE`)
- Operator triage: `/admin/operations/retry-jobs`

## 7. Audit actions

- `AI_FALLBACK_INVOKED` — every failure handling path (metadata-only)
- `AI_CIRCUIT_BREAKER_OPENED` — circuit opened

## 8. 검증

```bash
npm run verify:aibeopchin-reliability-phase18d
```

**Scope keys (RC static gate)**: classifyAiFailureReason · evaluateAiFallbackPolicy · circuit breaker · AI_FALLBACK_INVOKED · task fallback · no public fallback exposure

**선행**: Phase **18-A** · **18-B** · **18-C**

**버전** **`18-D.1`**
