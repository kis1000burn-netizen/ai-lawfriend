# AI법친 Full AI Core RC Predeploy Master Checklist (Phase **12‑A**)

**상태**: **RC LOCKED** — `verify:aibeopchin-full-ai-core-rc` / `verify:aibeopchin-ai-core-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE]`**

---

## ☐ A. Predeploy master gate (gate 개수 불변)

| # | 확인 | 기대 |
| --- | --- | --- |
| A1 | `scripts/predeploy-check.ts` | `verify:aibeopchin-ai-core-rc` 호출 (**full-ai-core-rc 추가 gate 없음**) |
| A2 | `npm run verify:aibeopchin-ai-core-rc` | Tier 1〜4 + 12-A master block **PASS** |
| A3 | `npm run verify:aibeopchin-full-ai-core-rc` | semantic Full RC **PASS** |

---

## ☐ B. Tier 1〜4 verify chain

| Tier | RC Phase | 포함 verify |
| --- | --- | --- |
| 1 | **8‑E** Document | Post-Ops + 8‑A〜D + Document Vitest |
| 2 | **9‑C** Case Summary | 9‑A + 9‑B + Case Summary Vitest |
| 3 | **10‑D** Governance | governance-control + audit + client-safe-disclosure + Vitest |
| 4 | **11‑D** Client Disclosure | lawyer-review + preview + delivery + Vitest |

```bash
npm run verify:aibeopchin-ai-core-rc
```

---

## ☐ C. Schema / migration (Full baseline)

| migration | 용도 |
| --- | --- |
| `20260418180000_domain_definitions_phase1` | Document `generationMode` baseline |
| `20260525120000_case_intelligence_snapshot_phase11a` | Lawyer Review Console snapshot |
| `20260525130000_case_client_disclosure_release_phase11b` | Client disclosure release audit |

Greenfield: `npm run db:migrate` / `db:deploy` 후 위 migration **존재** 확인.

---

## ☐ D. env SSOT (`.env.example` 정합)

| 변수 | Tier |
| --- | --- |
| `OPENAI_API_KEY` | 1 · 2 |
| `OPENAI_DOCUMENT_GENERATE_MODEL` | 1 |
| `OPENAI_PARAGRAPH_REWRITE_MODEL` | 1 |
| `OPENAI_CASE_SUMMARY_MODEL` | 2 |
| `CASE_SUMMARY_AI_MODE` | 2 |
| `AI_GOVERNANCE_AI_ENABLED` | 3 |
| `AI_GOVERNANCE_TENANT_ID` | 3 |
| `AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET` | 3 |
| `AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE` | 3 |

SSOT: [`full-ai-core-rc-lock.ts`](../../src/features/ai-core/full-ai-core-rc-lock.ts)

---

## ☐ E. Role binding (CLIENT vs internal)

| # | 확인 | 기대 |
| --- | --- | --- |
| E1 | CLIENT `summary/generate` | `getClientDisclosureDelivery` · `invokeCaseSummaryGenerate` **미호출** |
| E2 | CLIENT delivery payload | `intelligenceGraph` **undefined** |
| E3 | LAWYER/STAFF/ADMIN summary | `filterIntelligenceGraphForRole` · graph/radar/ledger **유지** |
| E4 | CLIENT portal | `CaseClientDisclosureRelease` latest only · preview API **금지** |

---

## ☐ F. Tier RC evidence stack

| Tier | 증빙 태그 |
| --- | --- |
| 1 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE]` |
| 2 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE]` |
| 3 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE]` |
| 4 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11D-CLIENT-DISCLOSURE-RC-CLOSURE]` |
| Master | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE]` |

---

## ☐ G. 문서 · SSOT

| 파일 | Phase |
| --- | --- |
| [`AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md) | **12‑A** |
| 본 checklist | **12‑A** |
| [`full-ai-core-rc-lock.ts`](../../src/features/ai-core/full-ai-core-rc-lock.ts) | **12‑A** |
| [`docs/ai/README.md`](./README.md) | **12‑A RC LOCKED** row |

---

## ☐ H. 최종 판정

```bash
npm run verify:aibeopchin-full-ai-core-rc
npm run verify:aibeopchin-ai-core-rc
npm run verify:canonical-sources
```

**한 줄**: 문서 AI · 사건 이해 AI · 거버넌스 · 의뢰인 공개 통제가 **하나의 Full AI Core RC**로 묶여 `predeploy:check` 직전 게이트를 통과한다.

---

## ☐ I. 운영 절차 (배포 후보 → staging)

| # | 문서 | 내용 |
| --- | --- | --- |
| I1 | [Predeploy 로컬 · CI 런북](../operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md) | dev 종료 · Prisma DLL lock · NODE_ENV |
| I2 | [DB migration chronology](../operations/DB_MIGRATION_CHRONOLOGY.md) | incremental deploy vs greenfield |
| I3 | [Staging secrets checklist](../operations/STAGING_SECRETS_CHECKLIST.md) | staging env · AI Core 9 keys |
| I4 | [Staging secrets live Phase A](../operations/STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md) | env 실측 · OAuth callback · role smoke |
| I5 | CI | `.github/workflows/ci.yml` — `predeploy-fresh-build` (dev 없이 fresh build) |

**한 줄**: AI Core는 **로컬 predeploy 후보** — 남은 것은 migration 이력 · secrets · staging 실측.
