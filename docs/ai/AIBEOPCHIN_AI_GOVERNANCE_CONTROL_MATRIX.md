# AI법친 AI Governance Control Matrix (Phase **10‑A**)

**상태**: Phase **10‑A** — **Governance Matrix · Policy · Validator · Summary Runtime Gate**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10A-AI-GOVERNANCE-CONTROL-MATRIX]`**

## 1. 9‑F vs 10‑A

| Phase | 초점 |
| --- | --- |
| **9‑F** | AI·변호사 **책임 경계** (Ledger 6 lane) |
| **10‑A** | 조직·역할·사건 **AI 사용 통제권** |

> 9‑F: “AI는 구조화했고, 변호사가 판단했다.”  
> 10‑A: “**누가·어디서·어떤 역할이·언제** AI를 쓰고 볼 수 있는가.”

## 2. 통제 5+1 질문

| # | 질문 | SSOT |
| --- | --- | --- |
| 1 | **누가 AI를 켤 수 있는가** | `masterEnableRoles` (default: `ADMIN`) |
| 2 | **어떤 사건에서 AI를 쓸 수 있는가** | `allowedCaseStatuses` · blocked `DELETED/REJECTED/HOLD` |
| 3 | **어떤 역할이 결과를 볼 수 있는가** | `roleView` per feature |
| 4 | **어떤 상태부터 의뢰인 공개가 가능한가** | `clientVisibleMinCaseStatus` (default: `REVIEW_PENDING`) + 9‑F ledger lane |
| 5 | **조직/테넌트별 기능·비용·권한 잠금** | `tenantPolicy` (`aiEnabled`, `allowedFeatures`, budgets) |
| +1 | **누가 AI를 invoke 하는가** | `roleInvoke` per feature |

## 3. Feature 단위

| Feature | 설명 |
| --- | --- |
| `CASE_SUMMARY` | flat summary invoke/view |
| `CASE_INTELLIGENCE_GRAPH` | Claim graph (internal) |
| `CONTRADICTION_RADAR` | Radar signals |
| `LAWYER_JUDGMENT_LEDGER` | 9‑F boundary ledger |
| `DOCUMENT_PARAGRAPH` | Document AI (8‑x) |

## 4. Default Matrix (`10-A.1`)

| 역할 | CASE_SUMMARY invoke | Graph/Radar/Ledger view |
| --- | --- | --- |
| `CLIENT` | ✅ | ❌ |
| `LAWYER` | ✅ | ✅ |
| `STAFF` | ✅ | ✅ |
| `ADMIN` | ✅ | ✅ (+ master toggle) |

**의뢰인 공개**: case status ≥ `REVIEW_PENDING` **and** ledger entry `clientVisible` (9‑F).

코드 SSOT: [`resolveDefaultAiGovernanceControlMatrix()`](../../src/features/ai-core/ai-governance-policy.service.ts)

## 5. Runtime 통합

### 5.1 Invoke gate

`invokeCaseSummaryGenerate` → `assertCaseSummaryAiGovernanceAllowsInvoke`  
실패 시 `ForbiddenError`.

### 5.2 View filter

`filterIntelligenceGraphForRole` — `CLIENT`는 `intelligenceGraph` **미노출** (summary content만).

### 5.3 Env (tenant hook)

| Env | 의미 |
| --- | --- |
| `AI_GOVERNANCE_TENANT_ID` | tenant id (default `default`) |
| `AI_GOVERNANCE_AI_ENABLED` | master switch |
| `AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET` | optional cap |
| `AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE` | optional cap |

## 6. 산출물

| # | 파일 |
| --- | --- |
| 1 | 본 Spec |
| 2 | [`ai-governance-control.schema.ts`](../../src/features/ai-core/ai-governance-control.schema.ts) |
| 3 | [`ai-governance-policy.service.ts`](../../src/features/ai-core/ai-governance-policy.service.ts) |
| 4 | [`ai-governance-validator.ts`](../../src/features/ai-core/ai-governance-validator.ts) |
| 5 | [`verify-aibeopchin-ai-governance-control.mjs`](../../scripts/verify-aibeopchin-ai-governance-control.mjs) |

## 7. Out of scope (10‑A)

- Prisma tenant table / admin UI toggle panel
- Billing meter enforcement (budget fields = hook only)
- Document paragraph route wiring (schema/policy only)

## 8. 검증

```bash
npm run verify:aibeopchin-lawyer-judgment-ledger
npm run verify:aibeopchin-ai-governance-control
npm run test -- src/features/ai-core/ai-governance-control.schema.test.ts
npm run test -- src/features/ai-core/ai-governance-policy.service.test.ts
npm run test -- src/features/ai-core/ai-governance-validator.test.ts
```

## 9. 파이프라인 (9‑A → 10‑A)

```
요약 → Graph → Radar → Ledger → Governance Matrix
```

## 10. 한 줄 판정

10‑A까지 잠기면 AI법친은 **책임 경계(9‑F)** 와 **조직·역할·사건 통제권(10‑A)** 을 함께 갖춘 **법률 AI 운영체제**가 된다.
