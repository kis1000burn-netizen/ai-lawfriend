# AI법친 AI Core RC Predeploy Closure Checklist (Phase **8‑E**)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE]`**

목적: AI Core **Post-Ops · 8‑A〜8‑D** 전 레이어를 **릴리즈 후보(RC)** 로 봉인한 뒤, 배포 직전에 **한 번에** 재확인한다.

---

## ☐ A. RC 정적 게이트(자동)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-ai-core-rc` | **PASS** — Post-Ops + 8‑A〜D + RC 문서 · env · shim · audit-policy |
| A2 | `npm run verify:post-ops-critical-fix` | **PASS** (A1에 포함) |
| A3 | `npm run verify:aibeopchin-ai-core-phase8a` … `phase8d` | **PASS** (A1에 포함) |
| A4 | `npm run verify:canonical-sources` | **PASS** (배포 플라이트 권장) |

---

## ☐ B. Vitest AI Core 묶음

```bash
npm run test -- src/features/ai-core
npm run test -- src/lib/document-ai.test.ts
```

| 기준(본 헤드) | 결과 |
| --- | --- |
| `src/features/ai-core/**/*.test.ts` | **25+** tests **PASS** |

---

## ☐ C. Provider env (배포 전 확인)

`.env` / 배포 시크릿:

| 변수 | 용도 | RC |
| --- | --- | --- |
| `OPENAI_API_KEY` | LLM on/off | 미설정 시 seed/fallback (문서화 필수) |
| `OPENAI_PARAGRAPH_REWRITE_MODEL` | regen 모델 | 기본 `gpt-5.2` |
| `OPENAI_DOCUMENT_GENERATE_MODEL` | generate 모델 | 미설정 시 rewrite 모델과 동일 |

`.env.example` 주석과 [`ai-provider-ssot.ts`](../../src/features/ai-core/ai-provider-ssot.ts) SSOT 일치.

---

## ☐ D. Schema / migration baseline

AI Core **신규 migration 없음**. runtime은 기존 스키마에 의존:

| migration | 용도 |
| --- | --- |
| `20260418180000_domain_definitions_phase1` | `LegalDocumentParagraph.generationMode` · paragraph history |

Greenfield 배포 시 `npm run db:migrate` / prod `npm run db:deploy` 로 baseline 적용.

---

## ☐ E. generationMode · audit-policy (스폿)

- **generationMode** — `MANUAL_ONLY` / `AI_GENERATE` / `AI_REGENERATE` / `LOCK_AFTER_APPROVAL` 런타임 게이트 ([Spec §5](./AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md))
- **Audit API** — `GET /api/admin/ai-core/audit-policy` (STAFF+)
  - 미로그인 **401/403** (E2E always-on)
  - optional: `E2E_AI_CORE_AUDIT_SMOKE=1` + ADMIN credentials

---

## ☐ F. Legacy shim deprecated lock

| 파일 | 기대 |
| --- | --- |
| `document-paragraph-ai.engine.ts` | `PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM` · no OpenAI |
| `document-paragraph-ai.prompts.ts` | shim marker · re-export only |
| `document-paragraph-ai.utils.ts` | shim marker · ai-core batch |
| `document-ai.ts` | Post-Ops marker · re-export only |

---

## ☐ G. Predeploy 통합

```bash
npm run predeploy:check
```

`scripts/predeploy-check.ts`에 **AI Core RC gate** (`verify:aibeopchin-ai-core-rc`) 포함.

---

## ☐ H. 문서 교차 참조

- RC 잠금: [`AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md)
- Unification Spec: [`AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md`](./AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md)
- 증빙 SSOT: [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md) · `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE]`

---

## RC 이후 (본 체크리스트 **범위 외**)

Case Summary AI · Gongbuho/Voice/CMB AI Assist — 별도 Phase 착수.
