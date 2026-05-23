# AI법친 Case Summary AI Core Integration (Phase **9-A**)

**상태**: Phase **9-A** — Phase **8-E RC** 이후 **사건 요약 ai-core 6축 편입 스펙·정책·verify 잠금** (Route/runtime 구현 없음)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9A-CASE-SUMMARY-INTEGRATION-SPEC]`**

## 1. 목적

Phase **8-E**에서 문서 AI(DOCUMENT_PARAGRAPH_*)를 ai-core로 RC 봉인한 뒤, **사건 요약(case summary)** 을 동일 6축(Provider · Prompt · Context · Validator · Audit · generationMode) 위에 **편입하기 위한 스펙 SSOT**을 확정한다.

Phase 9-A는 **문서·정책·마커·verify**까지이며, `summary/generate` Route ai-core 위임·LLM runtime(9-B)은 본 스펙 승인 후 착수한다.

**의미**: AI법친은 “문서 AI”에서 **“사건 이해 AI”** 로 한 단계 올라가는 첫 공식 Phase다.

## 2. 선행 조건 (불변)

| 선행 | 검증 |
| --- | --- |
| Phase **8-E** AI Core RC | `npm run verify:aibeopchin-ai-core-rc` **PASS** |
| Post-Ops · 8-A〜D | RC verify chain에 포함 |

**9-A에서 건드리지 않는 RC baseline**

- `ai-core-openai.provider` document AI 구조
- `ParagraphGenerationMode` · `generation-mode-runtime.ts` (문서 문단)
- Audit public-safe metadata 필드 집합 (8-D)
- `AI_PROMPT_REGISTRY_VERSION = "8-C.1"` (document binding)
- predeploy gate 순서 · shim lock · 8-A〜E 증빙 문구

## 3. 범위

### 3.1 In scope (9-A)

| # | 축 | 9-A SSOT | 역할 |
| --- | --- | --- | --- |
| 1 | **taskType / operation** | `case-summary-ai-core-policy.ts` | `CASE_SUMMARY_GENERATE` · `CASE_SUMMARY_REGENERATE` |
| 2 | **Prompt binding (설계)** | 동 policy · Spec §7 | `case.summary.generate` · `case.summary.regenerate` |
| 3 | **Context Builder (설계)** | Spec §8 | 인터뷰 · Gongbuho contract · case status · 첨부 메타 |
| 4 | **Validator (설계)** | Spec §9 | 판단 금지 · 승패 예측 금지 · `checkForbiddenAssertions` 계승 |
| 5 | **Audit (설계)** | Spec §10 | `taskType` · `promptVersion` · `caseSummaryAiMode` |
| 6 | **CaseSummaryAiMode** | 동 policy · Spec §6 | 문서 `generationMode` 와 **별도** enum |

### 3.2 Out of scope (9-A)

- `POST .../summary/generate` ai-core runtime 위임 (→ **9-B**)
- Prompt Registry 실제 등록 · OpenAI 호출 (→ **9-B**, registry version **9-B.1** 신규)
- Case Summary 전용 DB 테이블 · persist revision (→ 후속)
- Gongbuho / Voice / CMB AI Assist
- UI `case-summary-panel` 변경 (9-B API 호환 유지 전제)

## 4. 현재(Legacy) 사건 요약 흐름

```
CaseSummaryPanel
  → POST /api/cases/[caseId]/summary/generate
    → listCaseInterviewAnswersService
    → buildInterviewSummary (rule/heuristic)
    → buildGongbuhoAwareSummaryGeneratePayload (contract sections, LLM 없음)
    → sanitizeLegalOverclaim (route local)
    → ok({ summary: { content, disclaimer, caseStatus, ... } })
```

| 경로 | Legacy 모듈 | LLM |
| --- | --- | --- |
| `summary/generate/route.ts` | `case-interview.service` · `gongbuho-summary-contract.service` | **no** |
| 출력 명세 | [`CASE_SUMMARY_OUTPUT_SPEC.md`](../project-governance/CASE_SUMMARY_OUTPUT_SPEC.md) | — |

**갭**: ai-core `taskType` · audit · Provider · Prompt Registry **미연동**.

## 5. Target Architecture (9-B 착수 전 설계 고정)

```
src/features/ai-core/
  case-summary-ai-core-policy.ts      # Phase 9-A marker · modes · ops · planned paths
  case-summary-context-builder.ts     # 9-B — 인터뷰·공부호·첨부·status 컨텍스트
  case-summary-output-validator.ts    # 9-B — 요약 전용 guardrail + shared policy
  case-summary-ai-core-runtime.service.ts  # 9-B — invoke generate/regenerate + audit
```

**원칙**

1. 응답 JSON shape(`summary.content.*`, `contractSections`, `disclaimer`) **하위 호환** (9-B).
2. `RULE_BASED` 모드는 현재 heuristic **100% 유지** — LLM off 기본값.
3. Document ai-core RC baseline **수정 없이** case summary 축 **추가**만.

## 6. CaseSummaryAiMode (문서 generationMode와 분리)

SSOT: [`case-summary-ai-core-policy.ts`](../../src/features/ai-core/case-summary-ai-core-policy.ts)

| `CaseSummaryAiMode` | Generate LLM | Regenerate LLM | 비고 |
| --- | --- | --- | --- |
| `RULE_BASED` | **no** | **no** | **현재 기본·9-A/초기 9-B** |
| `AI_ENRICH` | **yes** | **no** | rule 출력 위 LLM 정리·보강 |
| `AI_REGENERATE` | **yes** | **yes** | 전면 LLM 재작성 + fallback |
| `LOCK_AFTER_LAWYER_REVIEW` | 잠금 전 yes / 잠금 후 **no** | 잠금 후 **no** | 변호사 검수 완료 시 |

**구현 SSOT (9-A)**: `shouldInvokeLlmOnCaseSummaryGenerate` · `shouldInvokeLlmOnCaseSummaryRegenerate`

**9-B 갭**: Route·Case 설정에서 `CaseSummaryAiMode` 읽기 — Phase 1 migration 신규 없음, 초기에는 env/feature 또는 case-level default `RULE_BASED`.

## 7. Prompt Registry (9-B binding 예정)

| Key | Operation | 용도 |
| --- | --- | --- |
| `case.summary.generate` | `CASE_SUMMARY_GENERATE` | 인터뷰+공부호 컨텍스트 → 구조화 요약 |
| `case.summary.regenerate` | `CASE_SUMMARY_REGENERATE` | 기존 요약·지시 반영 재작성 |

- Registry version: **9-B에서 `9-B.1` 신규** — `8-C.1` document binding **불변**
- Gongbuho `outputContract.summary` 섹션 heading은 prompt input에 **구조 힌트**로만 사용 (UGC 학습 금지)

## 8. Context Builder (9-B)

입력 블록:

1. case 메타 — `title`, `category`, `status`, `interviewCompleted`
2. 인터뷰 답변 JSON — `listCaseInterviewAnswersService` 원천
3. rule-based buckets — `buildInterviewSummary` 결과 (LLM off fallback SSOT)
4. Gongbuho — `outputContract.summary` headings · `expertReviewPoints` · resolution trace
5. 첨부 메타 요약 (파일명·분류·존재 여부; 원문 bulk 학습 **금지**)
6. 고지·면책 prepend — `CASE_SUMMARY_OUTPUT_SPEC` · route disclaimer 상속

Legacy re-use: [`gongbuho-summary-contract.service.ts`](../../src/features/gongbuho/gongbuho-summary-contract.service.ts)

## 9. Output Validator

**정책 상위**: [`AI_OUTPUT_POLICY.md`](../project-governance/AI_OUTPUT_POLICY.md) · [`CASE_SUMMARY_OUTPUT_SPEC.md`](../project-governance/CASE_SUMMARY_OUTPUT_SPEC.md)

| 계층 | 내용 |
| --- | --- |
| Shared | `checkForbiddenAssertions` — 판례번호·조문·과도 단정 |
| Case Summary | `sanitizeLegalOverclaim` 패턴 계승 — 승패 확정·100% 단정 |
| 구조 | `caseOverview` · `timeline` · `issues` · `riskNotes` · `checklist` · optional `contractSections` |

**금지 (요약 AI)**

- 최종 법률 판단·승소/패소 확정
- 근거 없는 사실 invent
- UGC·타 의뢰인 데이터 학습/반영

## 10. AI Audit (9-B)

기존 public-safe metadata **필드 집합 유지**, case summary 전용 값만 추가:

| 필드 | Case Summary 값 예 |
| --- | --- |
| `operation` / `taskType` | `CASE_SUMMARY_GENERATE` / `CASE_SUMMARY_REGENERATE` |
| `promptKey` | `case.summary.generate` |
| `promptVersion` | `9-B.1` (9-B에서 고정) |
| `caseSummaryAiMode` | `RULE_BASED` 등 (generationMode와 혼동 금지) |
| `guardrailPolicy` | `NO_UNVERIFIED_FACTS` |
| `gongbuhoResolution` | optional public-safe trace id (9-B) |

Legacy audit 없음 — 9-B에서 `persistCaseSummaryAiCoreAudit` (`case-summary-audit.ts`) 신규 연결.

## 11.1 CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD_MAPPING

[`CASE_SUMMARY_OUTPUT_SPEC.md`](../project-governance/CASE_SUMMARY_OUTPUT_SPEC.md) §6 snake_case 섹션 ↔ 현행 API camelCase **공식 매핑** (하위 호환 유지).

| Output Spec §6 (`sections`) | API `summary.content` | 비고 |
| --- | --- | --- |
| `case_overview` | `caseOverview` | 1:1 |
| `fact_summary` | `timeline[]` | 인터뷰 시계·경위 버킷 (추후 `factSummary` 필드 분리 가능) |
| `issue_summary` | `issues[]` | 1:1 |
| `status_summary` | `caseStatus` (top-level) + 개요 내 상태 설명 | status는 응답 최상위 |
| `next_step` | `checklist[]` | 다음 확인·준비 항목 |
| `risk_or_missing_info` | `riskNotes[]` | 누락·주의 |
| `request_summary` | `issues[]` 일부 / Gongbuho contract section | `desired_result` 등 인터뷰 키에서 유도 |
| (공부호 contract) | `contractSections[]` | `outputContract.summary` heading → `{ heading, body }` |

Validator·UI·RC verify는 본 표를 SSOT로 사용한다.

## 11. API 계약 (9-B 하위 호환)

`POST /api/cases/[caseId]/summary/generate` 응답 최상위:

- `summary.generatedAt`
- `summary.content.caseOverview` · `timeline` · `issues` · `riskNotes` · `checklist`
- `summary.content.disclaimer` · `contractSections?`
- `summary.outputContractApplied` · `gongbuhoResolution?`
- `summary.caseStatus`

**9-A**: shape 변경 없음. **9-B**: ai-core runtime 내부 위임만.

## 12. 검증

```bash
npm run verify:aibeopchin-ai-core-rc
npm run verify:aibeopchin-ai-core-phase9a
npm run test -- src/features/ai-core/case-summary-ai-core-policy.test.ts
```

### 12.1 정적 게이트 (`verify:aibeopchin-ai-core-phase9a`)

- 본 Spec · README · `case-summary-ai-core-policy.ts` 존재
- `PHASE9A_CASE_SUMMARY_AI_CORE_INTEGRATION` 마커
- `CaseSummaryAiMode` 4종 · prompt key 2종
- 8-E RC evidence 선행 · IMPLEMENTATION_EVIDENCE 9-A 태그
- Legacy route·service 경로 문서화
- **8-C.1 registry · document generationMode 파일 미변경** (정적 확인)

## 13. Phase 9-B — Route & Runtime (완료)

1. `verify:aibeopchin-ai-core-phase9b` PASS
2. `case-summary-context-builder` · `case-summary-ai-core-runtime.service` · `case-summary-openai.provider`
3. Case Summary Prompt Registry **`9-B.1`** (document `8-C.1` 불변)
4. `summary/generate/route.ts` → `invokeCaseSummaryGenerate` (응답 shape 하위 호환)
5. Vitest: runtime · context · prompt registry

## 14. Phase 9-C — Case Summary RC Closure (완료)

1. `verify:aibeopchin-case-summary-rc` · 확장 `verify:aibeopchin-ai-core-rc` Tier 2 **PASS**
2. 9-C-FIX: `LOCK_AFTER_LAWYER_REVIEW` gate · output mapping · env fail-fast · Tier2 script 순환 제거
3. `predeploy:check` gate 1개 유지

## 15. RC 이후 확장 (9-C **미포함**)

1. Gongbuho AI Assist
2. Voice AI Assist
3. CMB AI Assist

## 16. 한 줄 착수 기준

Phase **8-E** RC 위에 **사건 요약 ai-core runtime(9-B)** 이 연결되었으므로, **9-C**에서 Case Summary RC를 `verify:aibeopchin-ai-core-rc` Tier 2로 봉인하면 Gongbuho AI Assist 착수가 안전하다.
