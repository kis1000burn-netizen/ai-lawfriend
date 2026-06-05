# AI법친 Legal Intelligence Platform — Product Phase 62~70 통합 로드맵

## One-line Standard (62~70)

Phase 62~70은 공부호 지능, 변호사 전략 보조, 증거공백, 반박초안, 판례근거, 의뢰인 설명, 변호사 지식화, 기업형 다중사건 분석, ROI 지표를 하나로 묶어 AI법친을 **Legal Intelligence Platform**으로 봉인하는 단계다.

## 전체 방향 (Phase 59~70)

| Phase | Name | Role |
|-------|------|------|
| 59 | Gongbuho Intelligence Layer | Memory · Signal · Reasoning · Learning · Pattern |
| 60 | Control Tower Brain | Self-healing engineering ops · boundary gate |
| 61 | AI Legal Strategy Assistant | StrategyCandidate foundation (61-A LOCKED) |
| 62 | Evidence Gap Auto Planner | 증거공백 탐지 · 보완자료 요청 후보 |
| 63 | Counter-Argument Draft Engine | 반박 논리·문장 후보 |
| 64 | Judgment-backed Reasoning View | 판례·법령 source trace view |
| 65 | Litigation Strategy Workspace | 변호사 전용 전략 작업공간 |
| 66 | Client-safe Explanation Layer | 의뢰인 안전 설명 |
| 67 | Lawyer Knowledge Studio | 패턴·템플릿·지식 거버넌스 |
| 68 | Enterprise Multi-Case Intelligence | tenant 격리 다중사건 분석 |
| 69 | Commercial Performance / ROI Intelligence | 시간·품질·회수율 ROI |
| 70 | Legal Intelligence Platform RC | Phase 59~69 통합 봉인 |

## 구현 순서 (권장)

```
61-A Strategy Candidate Schema  ✓ COMPLETE · LOCKED
62-A Evidence Gap Candidate Schema  ✓ COMPLETE · LOCKED
  → 62-B Evidence Gap Detection Engine
  → 63 Counter-Argument Draft Engine
  → 64 Judgment-backed Reasoning View
  → 65 Litigation Strategy Workspace
  → 66 Client-safe Explanation Layer
  → 67 Lawyer Knowledge Studio
  → 68 Enterprise Multi-Case Intelligence
  → 69 Commercial ROI Intelligence
  → 70 Legal Intelligence Platform RC
```

## Phase 61과 62~70 관계

Phase 61-A는 **StrategyCandidate schema SSOT**로 62~65의 공통 입력 타입을 제공한다.

| 이전 61 sub-phase 초안 | 통합 로드맵 Phase |
|------------------------|-------------------|
| 61-B Weakness Strategy Generator | 61 + 65 Strategy Board / Risk Map |
| 61-C Counter-Argument Generator | **63** Counter-Argument Draft Engine |
| 61-D Evidence Gap Strategy Planner | **62** Evidence Gap Auto Planner |
| 61-E Lawyer Strategy Review Console | **65** Litigation Strategy Workspace |
| 61-F AI Legal Strategy Assistant RC | **70** Platform RC (bundled) |

---

## Phase 62 — Evidence Gap Auto Planner

**한 줄**: 59-C Reasoning Context와 61 Strategy Candidate를 기반으로, 사건에서 부족한 증거를 자동 탐지하고 변호사 검토용 보완자료 요청 후보를 생성한다.

| Sub-phase | Status |
|-----------|--------|
| 62-A Evidence Gap Candidate Schema | COMPLETE · LOCKED · 62-A.1 |
| 62-B Evidence Gap Detection Engine | COMPLETE · LOCKED · 62-B.1 |
| 62-C Supplement Request Draft Generator | COMPLETE · LOCKED · 62-C.1 |
| 62-D Lawyer Approval & Portal Draft Sync | COMPLETE · LOCKED · 62-D.1 |
| 62-E Client-visible Send Gate & Litigation Ops Draft Link | COMPLETE · LOCKED · 62-E.1 |
| 62-F Evidence Gap Auto Planner RC | COMPLETE · LOCKED · 62-F.1 |

| 기능 | 설명 |
|------|------|
| 증거공백 탐지 | 주장과 evidence map 비교 |
| 보완자료 후보 | 카톡, 계약서, 입금내역, 녹취, 사진 등 |
| 우선순위 | 입증 중요도·소송 영향도 |
| 의뢰인 요청 초안 | 변호사 승인 전 client-visible 금지 |
| Litigation Ops 연결 | Phase 24·15 보완요청 흐름 |

**경계**: `NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL` · `NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE` · `NO_AI_FINAL_EVIDENCE_JUDGMENT` · `NO_RAW_CLIENT_FACT_GLOBAL_LEARNING` · `LAWYER_REVIEW_REQUIRED_FOR_REQUEST`

**산출물**: `src/features/legal-strategy/evidence-gap-planner/` · `docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md` · `verify:aibeopchin-legal-strategy-phase62a`

---

## Phase 63 — Counter-Argument Draft Engine

**한 줄**: 상대방 주장·답변서·준비서면·증거를 기준으로 반박 논리 구조와 문장 후보를 생성하되, 최종 문서 반영·의뢰인 노출·소송 제출은 변호사 승인 전에는 금지한다.

| Sub-phase | Status |
|-----------|--------|
| 63-A Opponent Argument Schema | COMPLETE · LOCKED · 63-A.1 |
| 63-B Counter-Argument Candidate Builder | COMPLETE · LOCKED · 63-B.1 |
| 63-C Risk & Backfire Check | COMPLETE · LOCKED · 63-C.1 |
| 63-D Draft Paragraph Generator | COMPLETE · LOCKED · 63-D.1 |
| 63-E Lawyer Review & Adoption Gate | COMPLETE · LOCKED · 63-E.1 |
| 63-F Counter-Argument Draft Engine RC | COMPLETE · LOCKED · 63-F.1 |

**경계**: `NO_AUTO_FILED_COUNTER_ARGUMENT` · `NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE` · `NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL` · `NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT` · `LAWYER_REVIEW_REQUIRED_FOR_DOCUMENT_USE` · `CONTROL_TOWER_BRAIN_VERIFY_REQUIRED`

**산출물**: `src/features/legal-strategy/counter-argument-engine/` · `verify:aibeopchin-legal-strategy-phase63a` · `verify:aibeopchin-legal-strategy-phase63b` · `verify:aibeopchin-legal-strategy-phase63c` · `verify:aibeopchin-legal-strategy-phase63d` · `verify:aibeopchin-legal-strategy-phase63e` · `verify:aibeopchin-counter-argument-draft-engine-rc`

---

## Phase 64 — Judgment-backed Reasoning View

**한 줄**: AI 전략·반박·증거공백 후보가 어떤 판례·법령·공부호 항목에 근거하는지 변호사가 추적할 수 있는 reasoning view를 제공한다.

**64-A COMPLETE · LOCKED · 64-A.1**: `JudgmentReasoningSourceMap` schema · `verify:aibeopchin-legal-strategy-phase64a`

**64-B COMPLETE · LOCKED · 64-B.1**: `JudgmentReasoningView` builder · `verify:aibeopchin-legal-strategy-phase64b`

**경계**: `NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE` · `NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE` · `NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW` · `NO_CASE_OUTCOME_PREDICTION_AS_CERTAINTY` · `NO_CLIENT_VISIBLE_JUDGMENT_REASONING_BY_DEFAULT` · `UNCERTAINTY_SIGNAL_REQUIRED` · `CONTROL_TOWER_BRAIN_VERIFY_REQUIRED`

**산출물**: `src/features/legal-strategy/judgment-backed-reasoning/` · `verify:aibeopchin-legal-strategy-phase64a` · `verify:aibeopchin-legal-strategy-phase64`

---

## Phase 65 — Litigation Strategy Workspace

**한 줄**: 약점·반박·증거공백·판례근거·소송일정·업무를 변호사 전용 전략 작업공간에 통합한다.

| 영역 | 설명 |
|------|------|
| Strategy Board | 사건별 전략 후보 |
| Risk Map | 약점·상대방 공격 가능성 |
| Evidence Gap Panel | 보완자료 |
| Counter-Argument Drafts | 반박 초안 |
| Judgment Reasoning | 판례·법령 근거 |
| Task 연결 | Litigation Ops · 기일 |
| Review 상태 | 후보 · 채택 · 수정 · 폐기 |

**경계**: `NO_STRATEGY_WORKSPACE_FOR_CLIENT_BY_DEFAULT` · `LAWYER_ONLY_STRATEGY_BOARD` · `NO_FINAL_STRATEGY_WITHOUT_LAWYER_LOCK` · `NO_TASK_CREATION_WITHOUT_APPROVAL` · `STRATEGY_ACTION_AUDIT_REQUIRED`

**산출물**: `src/features/litigation-strategy-workspace/` · `app/(lawyer)/cases/[caseId]/strategy/` · `verify:aibeopchin-legal-strategy-phase65`

---

## Phase 66 — Client-safe Explanation Layer

**한 줄**: 변호사가 승인한 전략·보완요청·진행상황만 의뢰인이 이해할 수 있는 안전한 설명으로 변환한다.

**경계**: `NO_CLIENT_VISIBLE_INTERNAL_STRATEGY` · `NO_CLIENT_VISIBLE_WEAKNESS_LABEL_BY_DEFAULT` · `NO_CLIENT_EXPLANATION_WITHOUT_LAWYER_APPROVAL` · `NO_OVERPROMISE_CASE_OUTCOME` · `CLIENT_SAFE_SUMMARY_ONLY`

**산출물**: `src/features/client-safe-explanation/` · `verify:aibeopchin-client-safe-explanation-phase66`

---

## Phase 67 — Lawyer Knowledge Studio

**한 줄**: 변호사가 승인·수정한 전략·반박·증거공백·판례연결 패턴을 검토·편집·폐기·승격할 수 있는 지식 운영 스튜디오.

**경계**: `NO_PATTERN_PUBLICATION_WITHOUT_LAWYER_REVIEW` · `NO_RAW_CLIENT_FACT_IN_KNOWLEDGE_STUDIO` · `NO_GLOBAL_PATTERN_WITHOUT_GOVERNANCE` · `NO_STALE_PATTERN_REUSE` · `PATTERN_RETIREMENT_REQUIRED`

**산출물**: `src/features/lawyer-knowledge-studio/` · `verify:aibeopchin-lawyer-knowledge-studio-phase67`

---

## Phase 68 — Enterprise Multi-Case Intelligence

**한 줄**: 기업·기관·대형 로펌 고객을 위해 여러 사건의 쟁점·위험·패턴·증거공백·업무 부하를 tenant 격리 상태에서 집계 분석한다.

**경계**: `TENANT_ISOLATION_REQUIRED` · `NO_CROSS_TENANT_MULTI_CASE_ANALYSIS` · `AGGREGATE_ONLY_BY_DEFAULT` · `NO_RAW_CASE_FACT_IN_EXECUTIVE_REPORT` · `ENTERPRISE_VIEW_AUDIT_REQUIRED`

**산출물**: `src/features/enterprise-multi-case-intelligence/` · `verify:aibeopchin-enterprise-intelligence-phase68`

---

## Phase 69 — Commercial Performance / ROI Intelligence

**한 줄**: AI법친이 시간 절감·검토 품질·보완자료 회수·문서 준비 속도를 ROI 지표로 보여준다.

**경계**: `NO_UNVERIFIED_ROI_CLAIM` · `NO_OUTCOME_GUARANTEE` · `NO_CASE_WIN_RATE_MARKETING_WITHOUT_POLICY` · `AGGREGATE_METRICS_ONLY` · `COMMERCIAL_REPORT_AUDIT_REQUIRED`

**산출물**: `src/features/commercial-roi-intelligence/` · `verify:aibeopchin-commercial-roi-phase69`

---

## Phase 70 — Legal Intelligence Platform RC

**한 줄**: Phase 59~69를 하나의 Legal Intelligence Platform으로 묶어 통합 봉인한다.

### Platform Status (target)

- `LEGAL_INTELLIGENCE_PLATFORM_RC_LOCKED`
- 또는 `AIBEOPCHIN_LEGAL_INTELLIGENCE_PLATFORM_COMPLETE`

### RC 축

| 축 | Phase |
|----|-------|
| Gongbuho Intelligence | 59 |
| Control Tower Brain | 60 |
| AI Legal Strategy | 61 |
| Evidence Gap | 62 |
| Counter Argument | 63 |
| Judgment Reasoning | 64 |
| Litigation Strategy Workspace | 65 |
| Client-safe Explanation | 66 |
| Lawyer Knowledge Studio | 67 |
| Enterprise Intelligence | 68 |
| ROI Intelligence | 69 |

### Phase 70 최종 경계

- `NO_AI_FINAL_LEGAL_JUDGMENT`
- `NO_CLIENT_VISIBLE_STRATEGY_WITHOUT_LAWYER_APPROVAL`
- `NO_RAW_CLIENT_FACT_GLOBAL_LEARNING`
- `NO_CROSS_TENANT_INTELLIGENCE`
- `NO_UNAPPROVED_REAL_TIME_SIGNAL`
- `NO_REUSABLE_PATTERN_WITHOUT_ANONYMIZATION`
- `NO_AUTO_FILING`
- `NO_AUTO_DEPLOY`
- `NO_UNVERIFIED_ROI_CLAIM`
- `AUDIT_EVERY_INTELLIGENCE_ACTION`
- `CONTROL_TOWER_VERIFY_REQUIRED`
- `MASTER_PLATFORM_VERIFY_REQUIRED`

### Master Verify (target)

```bash
npm run verify:aibeopchin-legal-intelligence-platform-rc
```

**Bundled chain (target)**:

- `verify:aibeopchin-gongbuho-intelligence-rc`
- `verify:aibeopchin-control-tower-brain-rc`
- `verify:aibeopchin-legal-strategy-assistant-rc`
- `verify:aibeopchin-evidence-gap-planner-rc`
- `verify:aibeopchin-counter-argument-engine-rc`
- `verify:aibeopchin-judgment-backed-reasoning-rc`
- `verify:aibeopchin-litigation-strategy-workspace-rc`
- `verify:aibeopchin-client-safe-explanation-rc`
- `verify:aibeopchin-lawyer-knowledge-studio-rc`
- `verify:aibeopchin-enterprise-intelligence-rc`
- `verify:aibeopchin-commercial-roi-rc`

---

## 전체 완성 그림

```
Gongbuho Memory Packet
        ↓
Real-time Legal Signal Gate
        ↓
Reasoning Context Bundle
        ↓
AI Legal Strategy Candidate (61-A)
        ↓
Evidence Gap / Counter Argument / Judgment Reasoning (62~64)
        ↓
Lawyer Strategy Workspace (65)
        ↓
Lawyer Review / Approval / Modification
        ↓
Client-safe Explanation (66)
        ↓
Reusable Legal Pattern / Knowledge Studio (67)
        ↓
Enterprise Multi-case Intelligence (68)
        ↓
Commercial ROI Intelligence (69)
        ↓
Legal Intelligence Platform RC (70)
```

## Governance Workflow (모든 Phase 62~ 구현 시)

```
Phase N 구현
  → Control Tower Brain scan
  → boundary conflict check
  → verify
  → evidence sync
```

## Prerequisites (62 착수 전)

- Phase 59-F `verify:aibeopchin-gongbuho-intelligence-rc` PASS
- Phase 60-F `verify:aibeopchin-control-tower-brain-rc` PASS
- Phase 61-A `verify:aibeopchin-legal-strategy-phase61a` PASS

## Next Action

**Phase 64 — Judgment-backed Reasoning View** 구현 착수.
