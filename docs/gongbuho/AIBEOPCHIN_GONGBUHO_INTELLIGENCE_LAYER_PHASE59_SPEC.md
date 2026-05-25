# Gongbuho Intelligence Layer — Product Phase **59** Spec

Product Phase 59 — Gongbuho Intelligence Layer

**상태**: **DRAFT · IN PROGRESS** — **59-A schema · 59-B COMPLETE · LOCKED · 59-F boundary skeleton**

**선행**: Product **54-F** · `[EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54F-PRODUCTION-STABILIZATION-RC]` · Commercially Stable Operation

**Compiler 상속**: [GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md) — UGC·벡터 DB 영구 저장 금지

**Action Loop 상속**: Phase **49-C** — `NO_AI_AUTO_ACTION` · `LAWYER_DECISION_LEDGER_REQUIRED` · `NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL`

## 1. 한 줄 기준

공부호를 사건별 확정 지식 패킷으로 구조화하고, 실시간 법령·판례·사건자료·운영 피드백을 연결하여 AI법친의 주장 구성, 약점 탐지, 증거 요청, 반박 전략, 문서 생성 품질을 지속적으로 강화한다.

**짧은 고정 문장**: 공부호는 AI의 기억창고가 아니라 **검증된 사건 판단 연료**다. AI는 `LAWYER_CONFIRMED` / `LOCKED` 항목만 강한 근거로 쓰고, 나머지는 변호사 검토 후보만 생성한다.

## 2. 54 → 59 전환

| 구간 | 질문 | Phase |
| --- | --- | --- |
| Commercial Production Stabilization | 고객 운영 구간에서 안전·지원·degraded mode가 잠겼는가? | **54** |
| Gongbuho Intelligence Layer | 사건 지식·Graph·실시간 신호·피드백이 **지능 파이프라인**으로 연결되었는가? | **59** |

```
54-F Production Stabilization RC (COMPLETE · LOCKED)
        ↓
59 Gongbuho Intelligence Layer (DRAFT)
        ↓
Legal Reliability Intelligence Platform
```

## 3. Sub-phases

| Phase | Module | 역할 | 상태 |
| --- | --- | --- | --- |
| **59-A** | Gongbuho Memory Packet Schema | 사건별 AI 판단 단위·reviewStatus·sourceTrace | **DRAFT · 59-A.0** |
| **59-B** | Real-time Legal Signal Connector | 법령·판례·운영 신호 + 검증 상태 게이트 | **COMPLETE · LOCKED · 59-B.1** |
| **59-C** | Gongbuho Retrieval-Augmented Reasoning | 검색 → 충돌 확인 → Graph merge → 후보 생성 | **COMPLETE · LOCKED · 59-C.1** |
| **59-D** | Lawyer Feedback Learning Loop | `GongbuhoLearningTrace` + decision ledger | **COMPLETE · LOCKED · 59-D.1** |
| **59-E** | Reusable Legal Pattern Library | 익명화·tenant 정책·변호사 승인 패턴 | **COMPLETE · LOCKED · 59-E.1** |
| **59-F** | Gongbuho Intelligence RC | 59-A~E bundled verify + boundary 봉인 | **COMPLETE · LOCKED · 59-F.1** |

## 4. 5층 아키텍처

### 4.1 Gongbuho Memory Packet (59-A)

정적 `GongbuhoPacket`(APPROVED) 위에, **사건·세션별 동적 지식 패킷**을 둔다.

SSOT: `src/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema.ts`

핵심 필드:

- `confirmedFacts` / `disputedFacts`
- `clientWeaknesses` / `opponentClaims`
- `evidenceMap` / `judgmentLinks` / `lawyerConfirmedIssues`
- `reviewStatus`: `AI_CANDIDATE` | `LAWYER_CONFIRMED` | `LOCKED`
- `confidenceLevel`: UI·audit용 (자동 권위 부여 금지)
- `sourceTrace`: 출처·Graph node·Gongbuho packet ref

### 4.2 Real-time Legal Context Connector (59-B)

외부 정보는 `RealTimeLegalSignalStatus` 게이트를 통과해야 AI 강추론에 사용된다.

`FETCHED` → `NORMALIZED` → `RELEVANCE_SCORED` → `CONFLICT_CHECKED` → `LAWYER_REVIEW_REQUIRED` → `APPROVED_FOR_AI_USE`

### 4.3 Gongbuho Retrieval-Augmented Reasoning (59-C)

일반 RAG(문서 찾아 답변)가 아니라:

```
Intent → Memory Packet Retrieval → Legal Context Retrieval
  → Conflict & Reliability Check → Graph Merge
  → AI Draft / Risk / Strategy Candidate → Lawyer Review Gate
```

선행 Graph: Phase **43** Claim-Evidence-Judgment Graph · Phase **48-C** Workbench

### 4.4 Learning Loop (59-D)

`GongbuhoLearningTrace` — 변호사 채택·수정·거절·결과를 축적.

전역 재사용은 `reusableScope` + 익명화 + tenant 정책 + governance gate 필수.

### 4.5 Reusable Legal Pattern Library (59-E)

`ReusableLegalPattern` — 59-D learning trace 중 APPROVED / MODIFIED 항목만 익명화·audit·scope 검사 후 승격.

`APPROVED_FOR_REUSE` 상태만 향후 Reasoning Context 보조 근거로 사용.

### 4.6 Intelligence RC (59-F)

59-A~E 증빙 연결성·bundled verify·거버넌스 갱신을 최종 확인.

## 5. Locked boundaries (Phase 59)

### 5.1 Intelligence governance (59-F SSOT)

| Boundary | 의미 |
| --- | --- |
| NO_RAW_CLIENT_FACT_GLOBAL_LEARNING | 의뢰인 원문 사실관계 전역 학습 금지 |
| LAWYER_CONFIRMED_BEFORE_STRATEGY_USE | 전략 판단은 변호사 확정 후 사용 |
| REAL_TIME_SIGNAL_NOT_AUTHORITY | 실시간 정보는 곧바로 권위 있는 판단이 아님 |
| NO_AUTO_LEGAL_ADVICE_TO_CLIENT | 의뢰인에게 자동 법률전략 노출 금지 |
| CASE_SCOPE_FIRST | 기본은 사건 범위 내 기억 |
| TENANT_ISOLATION_REQUIRED | tenant 간 데이터 혼합 금지 |
| ANONYMIZED_PATTERN_ONLY | 전역 학습은 익명화된 패턴만 |
| AUDIT_EVERY_AI_LEARNING | AI 학습·재사용 흔적 감사 필수 |

### 5.2 Inherited boundaries (must not weaken)

| Boundary | 출처 |
| --- | --- |
| NO_UGC_VECTOR_STORAGE | Gongbuho Compiler Policy |
| NO_AI_AUTO_ACTION | Phase 49 Action Loop |
| LAWYER_DECISION_LEDGER_REQUIRED | Phase 49 Action Loop |
| NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL | Phase 49 Action Loop |

### 5.3 RC gate boundaries (59-F lock, sub-phase 미완 시 RC 금지)

| Boundary | 의미 |
| --- | --- |
| NO_INTELLIGENCE_RC_WITHOUT_59A_MEMORY_PACKET_LOCK | Memory Packet schema·gate 없으면 RC 금지 |
| NO_INTELLIGENCE_RC_WITHOUT_59B_REALTIME_SIGNAL_LOCK | Real-time connector 없으면 RC 금지 |
| NO_INTELLIGENCE_RC_WITHOUT_59C_REASONING_ENGINE_LOCK | RAG reasoning 없으면 RC 금지 |
| NO_INTELLIGENCE_RC_WITHOUT_59D_LEARNING_LOOP_LOCK | Learning loop 없으면 RC 금지 |
| NO_INTELLIGENCE_RC_WITHOUT_59E_PATTERN_LIBRARY_LOCK | Pattern library 없으면 RC 금지 |
| NO_INTELLIGENCE_RC_WITH_BROKEN_EVIDENCE_CHAIN | 59-A~E evidence chain 끊기면 RC 금지 |
| NO_INTELLIGENCE_RC_WITHOUT_PHASE54_STABILIZATION_LOCK | Phase 54-F 없으면 RC 금지 |
| NO_INTELLIGENCE_RC_WITHOUT_MASTER_VERIFY | master verify 없으면 RC 금지 |

SSOT: `src/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc.policy.ts`

### 5.4 Phase 59-B boundaries

| Boundary | 의미 |
| --- | --- |
| NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL | `APPROVED_FOR_AI_USE` 없이 강추론 금지 |
| NO_UNVERIFIED_SIGNAL_IN_STRONG_REASONING | `sourceReliability: LOW` 강추론 금지 |
| NO_STALE_SIGNAL_IN_AI_CONTEXT | `STALE` 신호 AI context 제외 |
| NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW | 충돌 신호는 변호사 검토 전 사용 금지 |
| NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW | 의뢰인 노출은 변호사 승인 후 |
| SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL | 모든 신호에 sourceTrace 필수 |
| SIGNAL_STATUS_TRANSITION_REQUIRED | 임의 상태 점프 금지 |
| COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE | Compiler Policy 없이 prompt 주입 금지 |

SSOT: `phase59b-real-time-legal-signal.policy.ts` · `phase59b-real-time-legal-signal-compiler.ts`

### 5.5 Phase 59-C boundaries

| Boundary | 의미 |
| --- | --- |
| NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING | AI_CANDIDATE memory strong context 금지 |
| NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT | APPROVED_FOR_AI_USE 외 signal 제외 |
| NO_CROSS_TENANT_REASONING_CONTEXT | tenant 불일치 항목 제외 |
| NO_CROSS_CASE_MEMORY_MERGE_WITHOUT_POLICY | case 불일치 merge 금지 |
| NO_SOURCELESS_CONTEXT_ITEM | sourceTrace 없는 항목 제외 |
| NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW | client visible은 lawyer review 필수 |
| CONTEXT_BUNDLE_AUDIT_REQUIRED | bundle auditRef 필수 |

SSOT: `phase59c-gongbuho-reasoning-context.policy.ts` · `phase59c-gongbuho-reasoning-context.builder.ts`

### 5.6 Phase 59-D boundaries

| Boundary | 의미 |
| --- | --- |
| NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION | 변호사 판단 없는 trace 금지 |
| NO_REJECTED_SUGGESTION_REUSE | REJECTED 후보 재사용 금지 |
| NO_RAW_CLIENT_FACT_IN_REUSABLE_TRACE | raw client fact trace 재사용 금지 |
| NO_GLOBAL_REUSE_WITHOUT_ANONYMIZATION | 익명화 없는 사건유형 재사용 금지 |
| LAWYER_DECISION_LEDGER_REQUIRED | decision ledger 필수 |

SSOT: `phase59d-lawyer-feedback-learning.policy.ts` · `phase59d-lawyer-feedback-learning.service.ts`

### 5.7 Phase 59-E boundaries

| Boundary | 의미 |
| --- | --- |
| NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE | REJECTED trace 패턴 승격 금지 |
| NO_RAW_CLIENT_FACT_IN_PATTERN | raw client fact pattern 금지 |
| NO_PATTERN_WITHOUT_ANONYMIZATION | anonymizationVerified 필수 |
| NO_GLOBAL_PATTERN_WITHOUT_EXTRA_GOVERNANCE | GLOBAL_ANONYMIZED는 extra governance 필수 |
| NO_PATTERN_DIRECTLY_VISIBLE_TO_CLIENT | client direct visible 금지 |
| PATTERN_REUSE_SCOPE_REQUIRED | reuseScope 필수 |

SSOT: `phase59e-reusable-legal-pattern.policy.ts` · `phase59e-reusable-legal-pattern.builder.ts`

### 5.8 Phase 59-F consolidated RC boundaries

NO_RAW_CLIENT_FACT_GLOBAL_LEARNING · NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING · NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT · NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION · NO_REJECTED_SUGGESTION_REUSE · NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE · NO_PATTERN_WITHOUT_ANONYMIZATION · NO_CROSS_TENANT_REASONING_CONTEXT · NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW · LAWYER_DECISION_LEDGER_REQUIRED · AUDIT_EVERY_AI_LEARNING · GONGBUHO_INTELLIGENCE_MASTER_VERIFY_REQUIRED

SSOT: `phase59f-gongbuho-intelligence-rc.policy.ts` · [`AIBEOPCHIN_GONGBUHO_INTELLIGENCE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_GONGBUHO_INTELLIGENCE_RC_LOCK_SUMMARY.md)

## 6. 강력 기능 5개 (59-C~E 구현 대상)

1. **의뢰인 약점 선제 탐지** — `clientWeaknesses` + Graph + Risk Radar (48-B) → 49-A bridge
2. **상대방 법리공격 예측** — `opponentClaims` + 판례 신호 (59-B)
3. **반박 논리 구성** — Graph merge + `reasoningFlow` hint
4. **증거 공백 자동 요청** — Graph gap (49-B) 연동
5. **사건별 AI 성장 기록** — `GongbuhoLearningTrace` (59-D) → `ReusableLegalPattern` (59-E)

## 7. Recommended feature location

```
src/features/gongbuho-intelligence-layer/
  phase59a-gongbuho-memory-packet.schema.ts
  phase59a-gongbuho-memory-packet.test.ts
  phase59b-real-time-legal-signal.schema.ts
  phase59b-real-time-legal-signal.policy.ts
  phase59b-real-time-legal-signal-compiler.ts
  phase59b-real-time-legal-signal.lock.ts
  phase59b-real-time-legal-signal.test.ts
  phase59f-gongbuho-intelligence-rc.policy.ts
  phase59f-gongbuho-intelligence-rc-lock.ts
  phase59f-gongbuho-intelligence-rc.test.ts
  (59-C~E: 추후 추가)

scripts/
  verify-aibeopchin-gongbuho-intelligence-phase.mjs
  verify-aibeopchin-gongbuho-intelligence-phase59b.mjs
  verify-aibeopchin-gongbuho-intelligence-rc.mjs

docs/gongbuho/
  AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md
  AIBEOPCHIN_GONGBUHO_REAL_TIME_LEGAL_SIGNAL_PHASE59B.md
```

## 8. Verification (초안)

```bash
# 59-A schema draft
npm run verify:aibeopchin-gongbuho-intelligence-phase59a

# 59-B Real-time Legal Signal Connector (COMPLETE · LOCKED · 59-B.1)
npm run verify:aibeopchin-gongbuho-intelligence-phase59b

# 59-C Gongbuho Retrieval-Augmented Reasoning (COMPLETE · LOCKED · 59-C.1)
npm run verify:aibeopchin-gongbuho-intelligence-phase59c

# 59-D Lawyer Feedback Learning Loop (COMPLETE · LOCKED · 59-D.1)
npm run verify:aibeopchin-gongbuho-intelligence-phase59d

# 59-E Reusable Legal Pattern Library (COMPLETE · LOCKED · 59-E.1)
npm run verify:aibeopchin-gongbuho-intelligence-phase59e

# 59-F Gongbuho Intelligence RC (COMPLETE · LOCKED · 59-F.1)
npm run verify:aibeopchin-gongbuho-intelligence-rc
```

**선행 master gate (required before 59-F LOCKED)**:

```bash
npm run verify:aibeopchin-legal-reliability-production-stabilization-rc
npm run verify:gongbuho-legal-knowledge-rc
```

## 9. Final judgment

Phase 59는 “초지능 LLM”이 아니라 **검증된 사건 지식 패킷 + Graph + 실시간 신호 + 변호사 피드백**을 하나의 Intelligence Layer로 묶는 단계다. **59-F LOCKED** 이후 AI법친은 **Legal Reliability Intelligence Platform**으로 인정한다.

**다음 구현 후보**: **Phase 60** — AI Legal Strategy Assistant (변호사 전용)

**59-F evidence**: `[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59F-RC-LOCK]`

**59-E evidence**: `[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59E-REUSABLE-LEGAL-PATTERN]`

**59-D evidence**: `[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59D-LAWYER-FEEDBACK-LEARNING]`

**59-C evidence**: `[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59C-REASONING-CONTEXT]`

**59-B evidence**: `[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59B-REAL-TIME-LEGAL-SIGNAL]`

**59-A evidence (DRAFT)**: `[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59A-MEMORY-PACKET-SCHEMA]`

**버전** **`59-SPEC.6`**
