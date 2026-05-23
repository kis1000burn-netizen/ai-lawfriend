# AI법친 AI Core Release Candidate Lock Summary — Phase **8‑E**

**상태**: Phase **8‑E** — AI Core **8‑A〜8‑D** (Post-Ops · Spec · Route · Legacy · Native Context · Audit) 전 레이어 **릴리즈 후보(RC) 봉인** — 기능 추가 없음.

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE]`**

## 1. 목적

Phase **8‑D**까지 완료된 **자체 AI Core**(Provider · Prompt · Context · Validator · Audit · `generationMode` runtime)를 **배포 레벨 RC**로 고정한다. `npm run verify:aibeopchin-ai-core-rc` 가 Post-Ops · 8‑A〜8‑D 선행 verify + RC 문서 · env · migration baseline · audit-policy · shim lock · predeploy 연동을 한 번에 재현한다.

## 2. RC 포함 Phase 매트릭스

| Phase | 요약 | RC 핵심 |
| --- | --- | --- |
| Post-Ops | Legal regen · STAFF Voice/CMB | `verify:post-ops-critical-fix` |
| **8‑A** | 6축 Spec · policy SSOT | `verify:aibeopchin-ai-core-phase8a` |
| **8‑B** | Route runtime · generationMode · audit | `verify:aibeopchin-ai-core-phase8b` |
| **8‑C** | OpenAI provider 단일화 · aiPromptKey binding | `verify:aibeopchin-ai-core-phase8c` |
| **8‑D** | Native context · audit E2E/API smoke | `verify:aibeopchin-ai-core-phase8d` |
| **8‑E** | **본 RC 봉인** | [`AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md`](./AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md) |

## 3. AI Core 호출 흐름 (불변)

```
Route (generate / regen)
  → ai-core-runtime (generationMode gate + audit)
    → ai-integrated-context-builder (native)
    → ai-core-openai.provider (sole responses.create)
    → ai-prompt-registry (aiPromptKey binding)
    → auditLog + version snapshot aiAuditTrail
```

## 4. RC 불변 기준

1. **OpenAI SSOT** — document AI `responses.create`는 `ai-core-openai.provider` only.
2. **generationMode** — Spec §5 매트릭스 런타임 적용 (generate · legal/draft regen).
3. **Audit metadata** — `promptVersion` · `templateAiPromptKey` · `generationMode` · `taskType` public-safe.
4. **Shim lock** — `document-paragraph-ai.*` deprecated marker · OpenAI 코드 없음.
5. **정적 게이트** — `verify:aibeopchin-ai-core-rc` **PASS** (8‑A〜D + Post-Ops 포함).
6. **Provider env** — `.env.example` OpenAI 키·모델 문서화 (미설정 시 fallback, RC는 문서만 검증).
7. **Schema baseline** — `LegalDocumentParagraph.generationMode` (Phase 1 migration 존재).

## 5. RC 이후 확장 (본 RC **미포함**)

- Case Summary AI → Phase **9-A〜9-C** ([Case Summary RC](./AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md))
- Gongbuho AI Assist
- Voice AI Assist
- CMB AI Assist

## 6. 검증 (재현)

| 명령 | 기대 |
| --- | --- |
| `npm run verify:aibeopchin-ai-core-rc` | **PASS** (Post-Ops + 8‑A〜D + RC 문서) |
| `npm run verify:canonical-sources` | **PASS** (배포 플라이트 권장) |
| `npm run predeploy:check` | AI Core RC gate 포함 |

상세: [`AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md`](./AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md)

## 7. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | Phase **8‑E** AI Core RC / Predeploy Closure |
