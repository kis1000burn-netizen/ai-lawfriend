# AI법친 Case Summary RC Predeploy Closure Checklist (Phase **9‑C**)

**상태**: **RC LOCKED** — `verify:aibeopchin-case-summary-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE]`**

---

## ☐ A. 선행 Document RC (Tier 1 — 불변)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-ai-core-rc` Tier 1 | Post-Ops + 8‑A〜D + 8‑E 문서·shim·audit-policy |
| A2 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE]` | IMPLEMENTATION_EVIDENCE 존재 |

---

## ☐ B. Case Summary RC 정적 게이트 (Tier 2)

| # | 명령 | 기대 |
| --- | --- | --- |
| B1 | `npm run verify:aibeopchin-case-summary-rc` | **PASS** |
| B2 | `npm run verify:aibeopchin-ai-core-phase9a` | **PASS** (B1에 포함) |
| B3 | `npm run verify:aibeopchin-ai-core-phase9b` | **PASS** (B1에 포함) |

---

## ☐ C. Vitest Case Summary 묶음

```bash
npm run test -- src/features/ai-core/case-summary-ai-core-runtime.service.test.ts
npm run test -- src/features/ai-core/case-summary-context-builder.test.ts
npm run test -- src/features/ai-core/case-summary-prompt-registry.test.ts
npm run test -- src/features/ai-core/case-summary-ai-core-policy.test.ts
npm run test -- src/app/api/cases/[caseId]/summary/generate/route.test.ts
```

| 기준 | 결과 |
| --- | --- |
| case-summary + summary route tests | **12+** tests **PASS** |

---

## ☐ D. Provider env (배포 전 확인)

| 변수 | 용도 | RC |
| --- | --- | --- |
| `OPENAI_API_KEY` | LLM on/off | 미설정 시 RULE_BASED fallback |
| `OPENAI_CASE_SUMMARY_MODEL` | summary LLM 모델 | 미설정 시 document generate 모델 |
| `CASE_SUMMARY_AI_MODE` | `RULE_BASED` / `AI_ENRICH` / `AI_REGENERATE` / `LOCK_AFTER_LAWYER_REVIEW` | **기본 `RULE_BASED`** |

`.env.example` 주석과 [`case-summary-rc-lock.ts`](../../src/features/ai-core/case-summary-rc-lock.ts) SSOT 일치.

---

## ☐ E. Schema / migration

Case Summary **신규 migration 없음**. runtime 의존:

| 데이터 | 용도 |
| --- | --- |
| Case · InterviewAnswer · QuestionSet | 인터뷰 답변 |
| GongbuhoTrace · GongbuhoPacket | outputContract.summary |

Greenfield: 기존 `npm run db:migrate` / `db:deploy` 로 domain baseline 적용.

---

## ☐ F. Route · provider · registry 스폿

- `summary/generate/route.ts` → `invokeCaseSummaryGenerate`
- `case-summary-openai.provider.ts` — document provider에 case key **없음**
- `case-summary-prompt-registry.ts` — `9-B.1`
- `ai-prompt-registry.ts` — document `8-C.1` **불변**

---

## ☐ G. Predeploy 통합

```bash
npm run predeploy:check
```

`scripts/predeploy-check.ts` — gate 명령 **`verify:aibeopchin-ai-core-rc`** (Tier 1+2 확장본) 유지, **순서 변경 없음**.

---

## ☐ H. (선택) E2E smoke

| 항목 | 기대 |
| --- | --- |
| `tests/e2e/aibeopchin-case-summary-ai-smoke.spec.ts` | 미로그인 summary generate **401/403** (always-on) |
| `E2E_CASE_SUMMARY_AI_SMOKE=1` | RULE_BASED 응답 shape smoke (optional) |

9‑C **필수 아님** — 9‑D 또는 Gongbuho AI Assist 전 착수 가능.

---

## ☐ I. 문서 교차 참조

- RC 잠금: [`AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md)
- Integration Spec: [`AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md`](./AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md)
- RC 확장 설계: [`AIBEOPCHIN_AI_CORE_RC_PHASE9C_EXTENSION_DESIGN.md`](./AIBEOPCHIN_AI_CORE_RC_PHASE9C_EXTENSION_DESIGN.md)
- Document RC: [`AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md)
- 증빙 SSOT: [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md)

---

## RC 이후 (본 체크리스트 **범위 외**)

Gongbuho / Voice / CMB AI Assist — 별도 Phase.
