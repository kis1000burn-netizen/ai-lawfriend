# Gongbuho Reasoning Context — Product Phase **59-C**

Product Phase 59-C — Gongbuho Retrieval-Augmented Reasoning

**상태**: **COMPLETE · LOCKED · 59-C.1**

**선행**: Phase **59-A** · Phase **59-B**

## 1. 한 줄 기준

59-C는 LAWYER_CONFIRMED / LOCKED 공부호 항목과 APPROVED_FOR_AI_USE 실시간 신호만 선택적으로 조립하여, 주장·증거·판례·약점·반박 후보를 사건 범위 안에서 추론 가능한 AI context bundle로 만든다.

## 2. 핵심 원칙

**AI에게 많이 주는 게 아니라, 쓸 수 있는 것만 준다.**

- Memory: `LAWYER_CONFIRMED` · `LOCKED` only
- Signal: `APPROVED_FOR_AI_USE` + Compiler Policy PASS only
- Scope: `caseId` · `tenantId` 일치 필수
- Bundle: `reasoningLimits` + `sourceTrace` + `auditRef` 필수

## 3. GongbuhoReasoningContextBundle

SSOT: `phase59c-gongbuho-reasoning-context.schema.ts`

Builder: `buildGongbuhoReasoningContextBundle()` in `phase59c-gongbuho-reasoning-context.builder.ts`

## 4. Locked boundaries

NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING · NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT · NO_CROSS_TENANT_REASONING_CONTEXT · NO_CROSS_CASE_MEMORY_MERGE_WITHOUT_POLICY · NO_SOURCELESS_CONTEXT_ITEM · NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW · NO_STRATEGY_OUTPUT_WITHOUT_REASONING_LIMITS · NO_RAW_CLIENT_FACT_GLOBAL_LEARNING · CONTEXT_BUNDLE_AUDIT_REQUIRED

## 5. Verification

```bash
npm run verify:aibeopchin-gongbuho-intelligence-phase59c
```

## 6. Final judgment

Phase 59-C는 LAWYER_CONFIRMED / LOCKED 공부호 항목과 APPROVED_FOR_AI_USE 실시간 신호만 사건·tenant 범위 안에서 조립하여 GongbuhoReasoningContextBundle을 생성하도록 고정했다. AI_CANDIDATE memory, 미승인·충돌·만료 signal, sourceTrace 없는 항목, cross-tenant/cross-case 항목은 strong reasoning context에서 제외되며, 모든 bundle은 reasoningLimits와 sourceTrace를 포함한다.

**다음**: **59-D** Lawyer Feedback Learning Loop

**버전** **`59-C.1`**
