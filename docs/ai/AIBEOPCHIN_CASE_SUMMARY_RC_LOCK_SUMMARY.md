# AI법친 Case Summary Release Candidate Lock Summary — Phase **9‑C**

**상태**: Phase **9‑C** — Case Summary **RC LOCKED** (9‑C-FIX 적용)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE]`**

## 1. 목적

Phase **9‑B**까지 완료된 **Case Summary AI Core**(context · runtime · Prompt Registry `9-B.1` · audit · `CaseSummaryAiMode`)를 **배포 레벨 RC**로 고정한다.

8‑E **Document AI RC** baseline은 **수정·재서술하지 않고**, `verify:aibeopchin-ai-core-rc`에 **Tier 2 Case Summary RC block**을 **additive**로 편입한다.

## 2. RC 포함 Phase 매트릭스 (Case Summary 축)

| Phase | 요약 | RC 핵심 |
| --- | --- | --- |
| **9‑A** | Integration Spec · `CaseSummaryAiMode` · RC boundary | `verify:aibeopchin-ai-core-phase9a` |
| **9‑B** | Runtime · Route · Registry `9-B.1` | `verify:aibeopchin-ai-core-phase9b` |
| **9‑C** | **본 RC 봉인** | [`AIBEOPCHIN_CASE_SUMMARY_PREDEPLOY_CLOSURE_CHECKLIST.md`](./AIBEOPCHIN_CASE_SUMMARY_PREDEPLOY_CLOSURE_CHECKLIST.md) |

**선행 (불변)**: Phase **8‑E** Document AI RC — `verify:aibeopchin-ai-core-rc` **Tier 1** 전체 PASS.

## 3. Case Summary AI 호출 흐름 (9‑C 불변)

```
CaseSummaryPanel
  → POST /api/cases/[caseId]/summary/generate
    → invokeCaseSummaryGenerate (case-summary-ai-core-runtime)
      → listCaseInterviewAnswers + Gongbuho contract (RULE_BASED baseline)
      → buildCaseSummaryGenerationContext
      → CaseSummaryAiMode gate (default RULE_BASED)
      → case-summary-openai.provider (LLM on AI_ENRICH / AI_REGENERATE only)
      → validateCaseSummaryContent + case-summary-audit
```

## 4. RC 불변 기준 (9‑C)

1. **Document RC 유지** — `AI_PROMPT_REGISTRY_VERSION = 8-C.1` · `ai-core-openai.provider` document-only · 8‑E 증빙 문구 불변.
2. **Case Summary Registry** — `CASE_SUMMARY_PROMPT_REGISTRY_VERSION = 9-B.1` · document registry와 **분리**.
3. **기본 모드** — `CASE_SUMMARY_AI_MODE` 미설정 → `RULE_BASED` (LLM skip, legacy heuristic 동등).
4. **Provider 분리** — case summary `responses.create`는 `case-summary-openai.provider` only.
5. **API 호환** — `summary.content.*` · `contractSections` · `disclaimer` shape 유지.
6. **Audit** — `caseSummaryAiMode` · `promptVersion=9-B.1` · `CASE_SUMMARY_AI_CORE_*` action.
7. **Schema** — Case Summary **신규 migration 없음** (인터뷰·공부호 기존 스키마).
8. **정적 게이트** — Tier 1 + Tier 2 verify **PASS**.

## 5. 9‑C에서 건드리지 않는 것

| 대상 | 이유 |
| --- | --- |
| 8‑E RC summary/checklist **본문 재작성** | Document RC baseline |
| `generation-mode-runtime.ts` (문단) | ParagraphGenerationMode SSOT |
| `ai-core-audit-policy` document 필드 집합 | 8‑D API smoke baseline |
| Voice / Gongbuho LK / CMB RC gates | 별도 domain RC |
| `predeploy:check` gate **순서** | 기존 Voice → Gongbuho LK → CMB → **AI Core RC** 유지 |

## 6. RC 이후 확장 (9‑C **미포함**)

- Gongbuho AI Assist
- Voice AI Assist
- CMB AI Assist
- Case Summary **regenerate** Route (9‑B는 generate only)

## 7. 검증 (9‑C 구현 후 재현)

| 명령 | 기대 |
| --- | --- |
| `npm run verify:aibeopchin-case-summary-rc` | **PASS** (9‑A + 9‑B + 9‑C RC 문서) |
| `npm run verify:aibeopchin-ai-core-rc` | **PASS** (Tier 1 Document 8‑E + Tier 2 Case Summary 9‑C) |
| `npm run predeploy:check` | AI Core RC gate = 확장된 `verify:aibeopchin-ai-core-rc` |

상세 확장 설계: [`AIBEOPCHIN_AI_CORE_RC_PHASE9C_EXTENSION_DESIGN.md`](./AIBEOPCHIN_AI_CORE_RC_PHASE9C_EXTENSION_DESIGN.md)

## 8. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | Phase **9‑C** Case Summary RC Closure **설계** |
