# AI법친 AI Core & Document Unification (Phase 8-A)

**상태**: Phase **8-A** — Post-Ops Critical Fix 이후 **자체 AI 코어 스펙·검증 게이트 잠금**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8A-DOCUMENT-UNIFICATION-SPEC]`**

## 1. 목적

Post-Ops Critical Fix(PR-1)로 Legal document 재생성 LLM 경로와 STAFF Ops UI 접근을 정리한 뒤, AI 호출을 `document-ai.ts` · `document-paragraph-ai.engine.ts` 등에 흩어두지 않고 **`src/features/ai-core`** 아래 6축으로 통합하기 위한 **스펙 SSOT**과 **정적 검증 게이트**를 확정한다.

Phase 8-A는 **문서·정책·마커·verify**까지이며, Route/Service 실제 위임(8-B)은 본 스펙 승인 후 착수한다.

## 2. 범위

### 2.1 In scope (8-A)

| # | 축 | SSOT 모듈 | 역할 |
| --- | --- | --- | --- |
| 1 | **Provider SSOT** | `ai-provider-ssot.ts` | OpenAI env·모델·legacy `openai.ts` 위임 |
| 2 | **Prompt Registry** | `ai-prompt-registry.ts` | prompt key · legacy builder 매핑 |
| 3 | **Context Builder** | `ai-context-builder.ts` | case/document 통합 컨텍스트 조립 SSOT |
| 4 | **Output Schema Validator** | `ai-output-schema-validator.ts` | guardrail 사후 검증 SSOT |
| 5 | **AI Audit** | `ai-audit.ts` | operation·provider·model·policy 감사 레코드 |
| 6 | **generationMode 런타임** | `generation-mode-runtime.ts` | 템플릿 `generationMode` ↔ LLM 허용 매트릭스 |

### 2.2 Out of scope (8-A)

- Voice 서버 STT · Gongbuho LK LLM · 인터뷰 AI 신규 구현
- multi-provider(Azure/Bedrock 등) 추가
- Route Handler 일괄 마이그레이션(→ Phase 8-B)
- Feature flag 기반 AI on/off(현재 `OPENAI_API_KEY` 존재 여부 유지)

## 3. 현재(Legacy) 호출 지점

| 경로 | Legacy 모듈 | Operation |
| --- | --- | --- |
| `POST .../documents/generate` | `document-ai.generateParagraphContent` | DOCUMENT_PARAGRAPH_GENERATE |
| `POST .../documents/draft/regenerate` | `document-paragraph-ai.engine` | DOCUMENT_PARAGRAPH_REGENERATE |
| `POST .../legal-documents/.../regenerate` | `document-ai.regenerateParagraphContent` | DOCUMENT_PARAGRAPH_REGENERATE |

공통: `openai.responses.create`, `document-generation-policy.checkForbiddenAssertions`, `buildDocumentGenerationGuardrail`.

### 3.1 Post-Ops Critical Fix 기준선

- Legal regen: `[재작성 지시 반영]` 스텁 **제거**, `rewriteParagraphWithOpenAI` + guardrail
- STAFF: `/admin/voice`, `/admin/cmb` 미들웨어 허용
- Verify: `npm run verify:post-ops-critical-fix`

## 4. Target Architecture (8-B 착수 전 설계 고정)

```
src/features/ai-core/
  ai-core-policy.ts          # Phase 8-A 마커·operation enum
  ai-provider-ssot.ts        # Provider SSOT
  ai-prompt-registry.ts      # Prompt Registry
  ai-context-builder.ts      # Context Builder (legacy re-export)
  ai-output-schema-validator.ts
  ai-audit.ts
  generation-mode-runtime.ts # generationMode 게이트
  index.ts
```

**원칙**

1. Route/Service는 ai-core public API만 호출(8-B).
2. Legacy 모듈은 8-B까지 유지·위임; 삭제는 8-C.
3. Guardrail prompt + regex post-check 이중 레이어 유지.

## 5. generationMode 런타임 SSOT

정의: [`ParagraphGenerationModeEnum`](../../src/lib/definitions/document-template.ts)

| `generationMode` | Generate LLM | Regenerate LLM | 비고 |
| --- | --- | --- | --- |
| `MANUAL_ONLY` | **no** | **no** | seed/fallback만 |
| `AI_GENERATE` | **yes** | **no** | 초안 생성만 LLM |
| `AI_REGENERATE` | **yes** | **yes** | 재작성 허용 문단 |
| `LOCK_AFTER_APPROVAL` | **yes** | 승인 전 yes / 승인 후 **no** | 잠금은 paragraph·document status |

**구현 SSOT**: [`generation-mode-runtime.ts`](../../src/features/ai-core/generation-mode-runtime.ts) — `resolveGenerationModeRuntimeGate()`

**현재 갭(8-B 대상)**: `generate/route.ts`는 모든 seed에 LLM 시도 — `generationMode` 미반영.

## 6. Provider SSOT

| Provider | Env | Default model |
| --- | --- | --- |
| `openai` | `OPENAI_API_KEY` | `OPENAI_PARAGRAPH_REWRITE_MODEL` → `gpt-5.2` |
| | `OPENAI_DOCUMENT_GENERATE_MODEL` | 미설정 시 rewrite 모델과 동일 |

API surface: `responses.create` only (Phase 8-A).

## 7. Prompt Registry

| Key | Legacy builder | 용도 |
| --- | --- | --- |
| `document.generation.integrated` | `buildDocumentGenerationPrompt` | case-level generate |
| `document.paragraph.generate` | `document-ai` local instructions | 문단별 generate input |
| `document.paragraph.rewrite` | `buildParagraphRewriteInstructions` + `buildParagraphRewriteInput` | regen/rewrite |

`aiPromptKey`(템플릿 필드)는 8-B에서 registry key와 연결.

## 8. Context Builder

입력 블록(통합 컨텍스트):

1. guardrail (`buildDocumentGenerationGuardrail`)
2. 문서 유형·템플릿명
3. 사건 요약
4. 인터뷰 JSON
5. 공식서식 trace · parsedText 발췌
6. 첨부 요약
7. Gongbuho rules appendix(해당 시)

Legacy: [`build-document-generation-prompt.ts`](../../src/features/document-generation/build-document-generation-prompt.ts)

## 9. Output Schema Validator

- Policy: `NO_UNVERIFIED_FACTS` (현재 단일)
- Post-check: `checkForbiddenAssertions` — 판례번호·조문·과도 단정 등
- Violation codes: `DOCUMENT_GENERATION_GUARDRAIL_VIOLATION`, `DOCUMENT_REGENERATE_GUARDRAIL_VIOLATION`

## 10. AI Audit

최소 감사 필드(8-A SSOT):

| 필드 | 설명 |
| --- | --- |
| `operation` | `AiCoreOperation` |
| `providerId` | `openai` |
| `model` | 실제 호출 모델 또는 `local-fallback` |
| `promptKey` | Prompt Registry key |
| `generationMode` | 문단 generationMode |
| `guardrailPolicy` | e.g. `NO_UNVERIFIED_FACTS` |
| `guardrailPassed` | boolean |
| `invokedAt` | ISO8601 |

Legacy trace: `document-generation-guardrail-trace` — 8-B에서 ai-audit과 병합.

## 11. 검증

```bash
npm run verify:post-ops-critical-fix
npm run verify:aibeopchin-ai-core-phase8a
npm run verify:aibeopchin-ai-core-phase8b
npm run verify:aibeopchin-ai-core-phase8d
npm run test -- src/features/ai-core
```

### 11.1 정적 게이트 (`verify:aibeopchin-ai-core-phase8a`)

- Spec·README·policy·6축 모듈 존재
- `PHASE8A_AI_CORE_DOCUMENT_UNIFICATION` 마커
- `generationMode` 런타임 매트릭스 4종
- Legacy 위임 export(Provider·Validator·Context)
- IMPLEMENTATION_EVIDENCE 태그

## 12. Phase 8-B — Route Migration (완료)

1. `verify:aibeopchin-ai-core-phase8b` PASS
2. `generate/route.ts` — `invokeDocumentParagraphGenerate` + `generationMode` + `aiAuditTrail`
3. Legal/Draft regen — `invokeDocumentParagraphRegenerate` / `invokeDraftParagraphRegenerateBatch` + audit
4. 회귀: `ai-core-runtime.service.test.ts`, `document-ai.test.ts`

## 13. Phase 8-C — Legacy Cleanup & Prompt Binding (완료)

1. `verify:aibeopchin-ai-core-phase8c` PASS
2. OpenAI document AI → `ai-core-openai.provider` only
3. `aiPromptKey` → `AI_TEMPLATE_PROMPT_KEY_BINDINGS`
4. Audit: `taskType` · `promptVersion` · `templateAiPromptKey`

## 15. Phase 8-D — Native Context & Audit Closure (완료)

1. `verify:aibeopchin-ai-core-phase8d` PASS
2. `buildIntegratedDocumentContext` native (generate route)
3. `GET /api/admin/ai-core/audit-policy` + E2E smoke
4. `document-paragraph-ai.*` deprecated shim lock

## 16. Phase 8-E — AI Core RC / Predeploy Closure (완료)

1. `verify:aibeopchin-ai-core-rc` PASS (Post-Ops + 8-A〜D 선행 + RC 문서)
2. [`AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md) · [`AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md`](./AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md)
3. `scripts/predeploy-check.ts` — AI Core RC gate
4. Provider env · `generationMode` baseline migration · shim deprecated lock · audit-policy API

**RC 이후 확장(본 Phase 범위 외)**: Case Summary AI · Gongbuho/Voice/CMB AI Assist.

## 17. 관련 문서

- [AI_OUTPUT_POLICY.md](../project-governance/AI_OUTPUT_POLICY.md)
- [DOCUMENT_TEMPLATE_DEFINITION.md](../project-governance/DOCUMENT_TEMPLATE_DEFINITION.md) §17-2
- [IMPLEMENTATION_EVIDENCE.md](../project-governance/IMPLEMENTATION_EVIDENCE.md) — Post-Ops Critical Fix

## 14. 한 줄 착수 기준

AI법친은 Post-Ops Critical Fix로 문단 재생성 AI 경로와 STAFF 운영 UI 접근 불일치를 정리했으므로, Phase 8-A에서 **Provider SSOT · Prompt Registry · Context Builder · Output Validator · AI Audit · generationMode 런타임** 기준을 문서와 `verify:aibeopchin-ai-core-phase8a`로 잠근다.
