# AI법친 AI Core RC — Phase **9‑C** Extension Design

**목적**: `verify:aibeopchin-ai-core-rc`를 **additive** 확장하여 Document RC (8‑E) + Case Summary RC (9‑C)를 **단일 predeploy gate**로 재현한다.

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-DESIGN]`**

---

## 1. 설계 원칙

| # | 원칙 |
| --- | --- |
| P1 | **8‑E Tier 1 블록은 로직·증빙 문구 변경 없이** 함수 추출만 허용 |
| P2 | **Tier 2는 Tier 1 PASS 후**에만 실행 |
| P3 | **별도 npm script** `verify:aibeopchin-case-summary-rc` 제공 (Case Summary만 단독 회귀) |
| P4 | **`predeploy:check`는 gate 1개** — 확장된 `verify:aibeopchin-ai-core-rc`만 호출 (순서 불변) |
| P5 | 8‑E IMPLEMENTATION_EVIDENCE 블록 **재작성 금지** — 9‑C 블록 **추가**만 |

---

## 2. Verify 아키텍처 (Before → After)

### 2.1 Before (8‑E 현재)

```
verify:aibeopchin-ai-core-rc
  ├─ exec: post-ops, phase8a, 8b, 8c, 8d
  ├─ static: 8-E RC docs, ai-rc-lock, evidence 8-A~E, shims, audit-policy
  ├─ static: env (document OpenAI), migration generationMode
  └─ vitest: src/features/ai-core + document-ai.test.ts
```

### 2.2 After (9‑C 목표)

```
verify:aibeopchin-ai-core-rc
  ├─ runDocumentAiCoreRcBlock()     ← 기존 main() 본문 (Tier 1)
  ├─ runCaseSummaryRcBlock()        ← 신규 (Tier 2)
  └─ PASS (Document 8-E + Case Summary 9-C)

verify:aibeopchin-case-summary-rc   ← 신규 standalone
  ├─ exec: phase9a, phase9b
  ├─ static: 9-C RC docs, case-summary-rc-lock, evidence 9-A~C
  ├─ static: env CASE_SUMMARY_*, route, provider separation, registry 9-B.1
  └─ vitest: case-summary-* + summary/generate route.test.ts
```

**의존 관계**

```
verify:aibeopchin-ai-core-rc
  = runDocumentAiCoreRcBlock()
  + runCaseSummaryRcBlock()

verify:aibeopchin-case-summary-rc
  = runCaseSummaryRcBlock() only
  (+ optional: assert 8-E evidence tag exists — Tier 1 선행 증빙만)
```

---

## 3. SSOT 모듈 (9‑C 구현 시 추가)

**파일**: `src/features/ai-core/case-summary-rc-lock.ts`

```ts
export const CASE_SUMMARY_RC_LOCK_MARKER_PHASE9C =
  "phase9c-case-summary-rc-predeploy-closure" as const;

export const CASE_SUMMARY_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE" as const;

export const CASE_SUMMARY_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-ai-core-phase9a",
  "verify:aibeopchin-ai-core-phase9b",
] as const;

export const CASE_SUMMARY_RC_PROVIDER_ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_CASE_SUMMARY_MODEL",
  "CASE_SUMMARY_AI_MODE",
] as const;

/** Case Summary 신규 migration 없음 — 빈 배열 또는 주석 baseline only */
export const CASE_SUMMARY_RC_BASELINE_MIGRATION_DIRS = [] as const;
```

**`ai-rc-lock.ts` 확장 (additive)**

```ts
export const AI_CORE_RC_INCLUDES_CASE_SUMMARY_PHASE9C = true as const;

/** verify:aibeopchin-ai-core-rc Tier 2 (9-C) */
export const AI_CORE_RC_EXTENDED_PHASE_VERIFY_SCRIPTS = [
  ...AI_CORE_RC_PHASE_VERIFY_SCRIPTS,
  ...CASE_SUMMARY_RC_PHASE_VERIFY_SCRIPTS,
] as const;
```

> `AI_CORE_RC_PHASE_VERIFY_SCRIPTS` (8‑E) **배열 내용 변경 금지**.

---

## 4. `runCaseSummaryRcBlock()` 정적 게이트 (상세)

| # | 검사 | 실패 메시지 요지 |
| --- | --- | --- |
| C1 | exec `verify:aibeopchin-ai-core-phase9a` | 9-A spec regression |
| C2 | exec `verify:aibeopchin-ai-core-phase9b` | 9-B runtime regression |
| C3 | `docs/ai/AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md` 존재 | 9-C RC summary missing |
| C4 | `docs/ai/AIBEOPCHIN_CASE_SUMMARY_PREDEPLOY_CLOSURE_CHECKLIST.md` 존재 | 9-C checklist missing |
| C5 | `case-summary-rc-lock.ts` marker `phase9c-case-summary-rc-predeploy-closure` | SSOT missing |
| C6 | IMPLEMENTATION_EVIDENCE `EVIDENCE-...-PHASE9C-CASE-SUMMARY-RC-CLOSURE` | closure evidence missing |
| C7 | IMPLEMENTATION_EVIDENCE 9-A + 9-B tags | stack incomplete |
| C8 | `.env.example` — `CASE_SUMMARY_AI_MODE`, `OPENAI_CASE_SUMMARY_MODEL` | env doc missing |
| C9 | `summary/generate/route.ts` includes `invokeCaseSummaryGenerate` | route not delegated |
| C10 | `ai-core-openai.provider.ts` **excludes** `case.summary` | document provider polluted |
| C11 | `case-summary-prompt-registry.ts` version `9-B.1` | registry regression |
| C12 | `ai-prompt-registry.ts` version `8-C.1` unchanged | document RC broken |
| C13 | `docs/ai/README.md` Phase **9-C** RC LOCKED row | README drift |
| C14 | vitest case-summary bundle (§ checklist C) | runtime tests fail |

**실행하지 않는 것 (9‑C)**

- LLM live call (env 키 **문서화**만)
- Case Summary regenerate route (미구현)
- Document audit-policy API 변경

---

## 5. `runDocumentAiCoreRcBlock()` (Tier 1) — 변경 허용 범위

| 허용 | 금지 |
| --- | --- |
| `verify-aibeopchin-ai-core-rc.mjs`에서 `function runDocumentAiCoreRcBlock()` **추출** | 8‑E static assert **삭제·완화** |
| PASS 로그 문구에 “Tier 1” 추가 | 8‑E evidence tag rename |
| shared helper `readFile` / `assertIncludes` 공유 | phase8a~d exec **순서 변경** |

---

## 6. package.json scripts (9‑C 구현 시)

```json
{
  "verify:aibeopchin-case-summary-rc": "node scripts/verify-aibeopchin-case-summary-rc.mjs",
  "verify:aibeopchin-ai-core-rc": "node scripts/verify-aibeopchin-ai-core-rc.mjs"
}
```

| Script | 용도 |
| --- | --- |
| `verify:aibeopchin-case-summary-rc` | Case Summary 축만 빠른 회귀 |
| `verify:aibeopchin-ai-core-rc` | predeploy **단일 AI gate** (Document + Case Summary) |

---

## 7. predeploy-check.ts (변경 없음 — 동작만 확장)

```ts
run("AI Core RC predeploy closure gate", "npm run verify:aibeopchin-ai-core-rc");
```

- **gate 추가 없음** (Voice / Gongbuho LK / CMB / AI Core 순서 유지)
- AI Core gate **내부**가 Tier 1+2로 넓어짐

---

## 8. IMPLEMENTATION_EVIDENCE (9‑C 구현 시)

**신규 블록** (상단 추가):

`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE]`

| 섹션 | 내용 |
| --- | --- |
| 목적 | 9-B runtime RC 봉인 + verify chain 확장 |
| 산출물 | case-summary-rc-lock, RC docs, verify scripts, ai-rc-lock additive |
| 불변 | 8-E document RC, predeploy 순서, 8-C.1 |
| 검증 | verify:case-summary-rc + verify:ai-core-rc PASS |

**설계 단계** (현재): `[EVIDENCE-...-PHASE9C-CASE-SUMMARY-RC-DESIGN]` 블록만 존재.

---

## 9. README / Spec 갱신 (9‑C 구현 시)

| 파일 | 변경 |
| --- | --- |
| `docs/ai/README.md` | `\| **9-C** \| **RC LOCKED** \| ... verify:aibeopchin-case-summary-rc` |
| `AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md` | §16 Phase 9-C 완료 |
| `AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md` | §5에 “Case Summary → 9-C” **한 줄 cross-ref** (8-E 본문 재작성 최소) |

---

## 10. 구현 체크리스트 (9‑C 착수 순서)

1. `case-summary-rc-lock.ts` + `index.ts` export  
2. `scripts/verify-aibeopchin-case-summary-rc.mjs` (Tier 2 본문)  
3. `scripts/verify-aibeopchin-ai-core-rc.mjs` refactor → Tier 1 + Tier 2  
4. RC summary + checklist (본 설계 문서 → **RC LOCKED** 상태로 승격)  
5. `ai-rc-lock.ts` additive constants  
6. IMPLEMENTATION_EVIDENCE closure 블록  
7. README · Integration Spec §16  
8. 전체 verify + `npm run test -- src/features/ai-core`  
9. (선택) E2E smoke spec  

**예상 소요**: 구현 Phase 1회 (8-E와 동일 패턴, LLM live test 없음).

---

## 11. 한 줄 판정 (설계)

Phase **9‑C**는 **8‑E Document RC를 깨지 않고** `verify:aibeopchin-ai-core-rc`에 **Case Summary Tier 2**를 additive로 얹어, predeploy **gate 1개**로 “문서 AI + 사건 이해 AI” RC를 동시에 재현하는 것이 최적이다.

**다음 착수 명령**: `Phase 9-C Case Summary RC Closure Implementation` — 위 §10 체크리스트 실행.
