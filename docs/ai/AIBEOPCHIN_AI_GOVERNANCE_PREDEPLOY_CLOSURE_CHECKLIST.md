# AI법친 AI Governance RC Predeploy Closure Checklist (Phase **10‑D**)

**상태**: **RC LOCKED** — `verify:aibeopchin-ai-governance-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE]`**

---

## ☐ A. 선행 RC (Tier 1·2 — 불변)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-ai-core-rc` Tier 1 | Post-Ops + 8‑A〜D + 8‑E Document RC |
| A2 | `npm run verify:aibeopchin-ai-core-rc` Tier 2 | 9‑A + 9‑B + 9‑C Case Summary RC |
| A3 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE]` | IMPLEMENTATION_EVIDENCE 존재 |
| A4 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE]` | IMPLEMENTATION_EVIDENCE 존재 |

---

## ☐ B. AI Governance RC 정적 게이트 (Tier 3)

| # | 명령 | 기대 |
| --- | --- | --- |
| B1 | `npm run verify:aibeopchin-ai-governance-rc` | **PASS** |
| B2 | `npm run verify:aibeopchin-ai-governance-control` | **PASS** (B1에 포함) |
| B3 | `npm run verify:aibeopchin-ai-governance-audit` | **PASS** (B1에 포함) |
| B4 | `npm run verify:aibeopchin-client-safe-disclosure` | **PASS** (B1에 포함) |

---

## ☐ C. Vitest Governance 묶음

```bash
npm run test -- src/features/ai-core/ai-governance-control.schema.test.ts
npm run test -- src/features/ai-core/ai-governance-policy.service.test.ts
npm run test -- src/features/ai-core/ai-governance-validator.test.ts
npm run test -- src/features/ai-core/ai-governance-audit.schema.test.ts
npm run test -- src/features/ai-core/ai-governance-usage-meter.service.test.ts
npm run test -- src/features/ai-core/ai-governance-audit.service.test.ts
npm run test -- src/features/ai-core/client-safe-disclosure.schema.test.ts
npm run test -- src/features/ai-core/client-safe-disclosure.service.test.ts
npm run test -- src/features/ai-core/client-safe-disclosure-validator.test.ts
```

| 기준 | 결과 |
| --- | --- |
| governance + client disclosure tests | **9** test files **PASS** |

---

## ☐ D. Governance env (배포 전 확인)

| 변수 | 용도 | RC |
| --- | --- | --- |
| `AI_GOVERNANCE_AI_ENABLED` | tenant AI master | 미설정 시 **true** |
| `AI_GOVERNANCE_TENANT_ID` | audit/meter tenant key | 미설정 시 `default` |
| `AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET` | tenant token ceiling | 미설정 시 unlimited |
| `AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE` | per-case LLM cap | 미설정 시 unlimited |

`.env.example` 주석과 [`ai-governance-rc-lock.ts`](../../src/features/ai-core/ai-governance-rc-lock.ts) SSOT 일치.

---

## ☐ E. Schema / migration

AI Governance **신규 migration 없음**. runtime 의존:

| 데이터 | 용도 |
| --- | --- |
| Case · CaseStatus | invoke eligibility · client release gate |
| Audit action log | governance denial · invoke audit |
| Lawyer Judgment Ledger | 10-C client-visible projection |

Greenfield: 기존 `npm run db:migrate` / `db:deploy` 로 domain baseline 적용.

---

## ☐ F. Runtime · route 스폿

- `summary/generate/route.ts` → Phase 10-A / 10-B / 10-C 주석
- `case-summary-ai-core-runtime.service.ts` → governance+meter gate · view filter · client disclosure
- `ai-governance-policy.service.ts` — `10-A.1` matrix
- `ai-governance-audit.service.ts` — invoke/denial audit
- `client-safe-disclosure.service.ts` — `10-C.1` projection

---

## ☐ G. Predeploy 통합

```bash
npm run predeploy:check
```

`scripts/predeploy-check.ts` — gate 명령 **`verify:aibeopchin-ai-core-rc`** (Tier 1+2+3 확장본) 유지, **순서 변경 없음**.

---

## ☐ H. Intelligence pipeline (선행 증빙 — Tier 3 범위 외 단독 회귀)

| 명령 | 용도 |
| --- | --- |
| `npm run verify:aibeopchin-case-intelligence-graph` | 9-D baseline |
| `npm run verify:aibeopchin-contradiction-radar` | 9-E baseline |
| `npm run verify:aibeopchin-lawyer-judgment-ledger` | 9-F baseline |

10-D **필수 아님** — Governance RC는 10-A〜C + evidence tag 존재만 잠근다.

---

## ☐ I. 문서 교차 참조

- RC 잠금: [`AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md)
- Control Matrix: [`AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md`](./AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md)
- Audit & Meter: [`AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md`](./AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md)
- Client Disclosure: [`AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md`](./AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md)
- Case Summary RC: [`AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md)
- Document RC: [`AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md)
- 증빙 SSOT: [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md)

---

## RC 이후 (본 체크리스트 **범위 외**)

Cross-tenant governance UI · real-time budget dashboard · Gongbuho/Voice/CMB governance 편입 — 별도 Phase.
