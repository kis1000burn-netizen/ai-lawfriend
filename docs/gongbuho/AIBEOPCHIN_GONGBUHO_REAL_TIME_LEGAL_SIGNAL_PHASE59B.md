# Gongbuho Real-time Legal Signal — Product Phase **59-B**

Product Phase 59-B — Real-time Legal Signal Connector

**상태**: **COMPLETE · LOCKED · 59-B.1**

**선행**: Phase **59-A** · `[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59A-MEMORY-PACKET-SCHEMA]`

**Compiler 상속**: [GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md) · `validateCanonicalSourceRefs`

## 1. 한 줄 기준

실시간 법령·판례·운영 신호를 곧바로 AI 판단 근거로 쓰지 않고, `FETCHED` → `NORMALIZED` → `RELEVANCE_SCORED` → `CONFLICT_CHECKED` → `LAWYER_REVIEW_REQUIRED` → `APPROVED_FOR_AI_USE` 게이트를 통과한 신호만 공부호 추론에 연결한다.

## 2. 핵심 원칙

**REAL_TIME_SIGNAL_NOT_AUTHORITY**

- 최신 판례·법령을 가져왔더라도 검증 전에는 AI 참고자료일 뿐
- 사건 전략 근거로 쓰려면 충돌 검사 필요
- 의뢰인 노출은 변호사 검토 필요
- 강추론 근거는 `APPROVED_FOR_AI_USE`만 허용

## 3. Signal 상태 전이

### Forward path

```
FETCHED → NORMALIZED → RELEVANCE_SCORED → CONFLICT_CHECKED
  → LAWYER_REVIEW_REQUIRED → APPROVED_FOR_AI_USE
```

### Blocked terminal states

- `REJECTED`
- `STALE`
- `CONFLICTED`
- `UNVERIFIED_SOURCE`

SSOT: `phase59b-real-time-legal-signal.policy.ts` · `canTransitionRealTimeLegalSignalStatus`

## 4. Compiler Policy 연동

`canUseAsStrongReasoningGround(signal)` 허용 조건:

- `status === APPROVED_FOR_AI_USE`
- `sourceReliability !== LOW`
- `conflictStatus === CLEAR`
- `caseRelevanceScore >= 0.6`
- `lawyerReviewRequired === false` 또는 `lawyerReviewed === true`
- `compilerPolicyApplied === true`
- not stale

불허:

- `FETCHED` / `NORMALIZED` / `RELEVANCE_SCORED`
- source 불명확 · forbidden canonical source
- 사건 공부호 충돌 (`CONFLICTED`)
- 최신성 만료 (`STALE`)
- 변호사 검토 필요 상태

SSOT: `phase59b-real-time-legal-signal-compiler.ts`

## 5. Locked boundaries

NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL · NO_UNVERIFIED_SIGNAL_IN_STRONG_REASONING · NO_STALE_SIGNAL_IN_AI_CONTEXT · NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW · NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW · SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL · SIGNAL_STATUS_TRANSITION_REQUIRED · COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE · REAL_TIME_SIGNAL_NOT_AUTHORITY

## 6. Verification

```bash
npm run verify:aibeopchin-gongbuho-intelligence-phase59b
```

## 7. Final judgment

Phase 59-B는 실시간 법령·판례·운영 신호를 AI 판단에 직접 주입하지 않고, 상태 전이, 출처 추적, 충돌 검사, 최신성 검사, 변호사 검토, Compiler Policy를 거쳐 `APPROVED_FOR_AI_USE` 신호만 공부호 기반 강추론에 사용할 수 있도록 고정했다.

**다음**: **59-C** Gongbuho Retrieval-Augmented Reasoning

**버전** **`59-B.1`**
