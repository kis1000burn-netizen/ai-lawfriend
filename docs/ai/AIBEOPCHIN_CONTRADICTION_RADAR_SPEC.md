# AI법친 Contradiction Radar & Graph Runtime (Phase **9‑E**)

**상태**: Phase **9‑E** — **Contradiction Radar · Graph Runtime · summary/generate 편입**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9E-CONTRADICTION-RADAR]`**

## 1. 불변 원칙 (9‑D 계승)

> **AI는 판단하지 않는다.**  
> Radar는 **모순·누락·위험 신호**만 구조화하고, **최종 판단은 변호사**가 한다.

| Radar가 하는 일 | Radar가 하지 않는 일 |
| --- | --- |
| 5축 간 불일치 **신호** 탐지 | 승소/패소·유죄/무죄 **확정** |
| 검토 안 된 핵심 Claim **큐잉** | 변호사 검토 상태 **대체** |
| Graph `contradictions[]` edge 생성 | LLM 기반 “진실 판별” |

**선행**: Phase **9‑D** (`verify:aibeopchin-case-intelligence-graph` PASS).

## 2. 5축 Contradiction Radar

| 축 | 코드 | 관찰 대상 |
| --- | --- | --- |
| 인터뷰 답변 | `INTERVIEW` | `InterviewAnswer.*` |
| 첨부자료 | `ATTACHMENT` | Case attachment meta |
| 공부호 패킷 | `GONGBUHO` | `GongbuhoPacket.*` / trace |
| 요약 Claim | `SUMMARY_CLAIM` | Graph `claims[]` |
| 변호사 메모 | `LAWYER_MEMO` | `LawyerMemo.*` (optional input) |

## 3. Signal 유형 (`9-E.1`)

| `signalType` | 의미 |
| --- | --- |
| `CROSS_AXIS_MISMATCH` | 축 간 날짜·진술 방향 불일치 가능 |
| `MISSING_EVIDENCE` | 증거 언급 vs 첨부/공부호 출처 부재 |
| `RISKY_ASSERTION` | guardrail 위반 · HIGH confidence 비판단 framing |
| `UNREVIEWED_CRITICAL_ISSUE` | `NOT_REVIEWED` 핵심 USER_CLAIM |
| `CONTRADICTING_CLAIMS` | 동일 주제 상반 Claim pair |

코드 SSOT: [`scanCaseContradictionRadar()`](../../src/features/ai-core/case-contradiction-radar.ts)

## 4. Runtime 통합

### 4.1 `buildCaseIntelligenceGraphRuntime`

1. 인터뷰 → Claim (`buildCaseIntelligenceGraphDraft`)
2. flat summary content → `SYSTEM_DERIVED` Claim
3. Gongbuho resolution → `GONGBUHO_GUIDANCE` Claim
4. (optional) Lawyer memo Claim
5. `scanCaseContradictionRadar` → signals + contradictions
6. Graph에 radar edge projection

### 4.2 API (`summary/generate`)

Phase **9-B** 응답 shape **하위 호환** + additive 필드:

```json
{
  "summary": {
    "content": { "...": "..." },
    "intelligenceGraph": {
      "graph": { "graphVersion": "9-D.1", "claims": [], "contradictions": [] },
      "radar": { "radarVersion": "9-E.1", "signals": [], "signalCount": 0 },
      "radarValidationPassed": true
    }
  }
}
```

`audit`는 기존과 동일하게 **공개 응답에서 제외**.

## 5. 산출물

| # | 파일 | 역할 |
| --- | --- | --- |
| 1 | 본 Spec | Radar · Runtime · API |
| 2 | [`case-contradiction-radar.ts`](../../src/features/ai-core/case-contradiction-radar.ts) | Rule-based scan |
| 3 | [`case-intelligence-graph-runtime.service.ts`](../../src/features/ai-core/case-intelligence-graph-runtime.service.ts) | Graph build + radar |
| 4 | [`case-contradiction-validator.ts`](../../src/features/ai-core/case-contradiction-validator.ts) | Signal guardrail |
| 5 | [`verify-aibeopchin-contradiction-radar.mjs`](../../scripts/verify-aibeopchin-contradiction-radar.mjs) | 정적 게이트 |

## 6. Out of scope (9‑E)

- Lawyer Judgment Boundary Ledger (→ **9‑F**)
- Prisma graph persist / UI radar panel
- LLM contradiction extraction
- tenant/role AI 통제 (→ **10‑A**)

## 7. 검증

```bash
npm run verify:aibeopchin-case-intelligence-graph
npm run verify:aibeopchin-contradiction-radar
npm run test -- src/features/ai-core/case-contradiction-radar.test.ts
npm run test -- src/features/ai-core/case-contradiction-validator.test.ts
npm run test -- src/features/ai-core/case-intelligence-graph-runtime.service.test.ts
npm run test -- src/features/ai-core/case-summary-ai-core-runtime.service.test.ts
```

## 8. Phase 로드맵

| Phase | 목표 |
| --- | --- |
| **9‑F** | Lawyer Judgment Boundary Ledger |
| **10‑A** | tenant/role/case AI 통제 |

## 9. 한 줄 착수 기준

9‑D Graph schema 위에 **5축 Radar + summary/generate runtime 편입**이 `verify:aibeopchin-contradiction-radar`에 잠겼으므로, 변호사 UI에서 **출처·모순·검토 큐**를 안전하게 노출할 수 있다.
