# AI법친 Lawyer Review Console (Phase **11‑A**)

**상태**: Phase **11‑A** — **Lawyer Review Console · Snapshot persist · Judgment API · UI**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11A-LAWYER-REVIEW-CONSOLE]`**

## 1. 목적

Phase **9‑D**〜**10‑D**까지 구축한 **Graph · Radar · Ledger · Governance** 내부 엔진을, 변호사가 **실제로 확인·승인·수정**하는 작업대로 연결한다.

> AI는 구조화했고, **변호사가 판단한다** — 9-F Ledger의 `PENDING` → `CONFIRMED` / `REJECTED` / `EDITED` 전이를 UI·API·DB로 승격.

**선행**: Phase **10‑D** (`verify:aibeopchin-ai-governance-rc` PASS).

## 2. UX 진입

| 경로 | 역할 |
| --- | --- |
| `/cases/[caseId]` | 인터뷰 완료 + LAWYER/ADMIN/STAFF → 「Lawyer Review Console 열기」 |
| `/cases/[caseId]/intelligence-review` | Graph · Radar · Ledger queue 콘솔 |

STAFF: **조회 전용** · LAWYER(배정)/ADMIN: **판단 저장**

## 3. API

| Method | Route | 설명 |
| --- | --- | --- |
| `GET` | `/api/cases/[caseId]/intelligence-review` | 최신 snapshot 조회 |
| `POST` | `/api/cases/[caseId]/intelligence-review` | graph/radar/ledger **refresh** (이전 non-PENDING 판단 merge) |
| `POST` | `/api/cases/[caseId]/intelligence-review/judgments` | ledger entry 판단 저장 |

Auth: `getCaseAccessContext` — view: assigned lawyer/staff/admin · persist: assigned lawyer/admin.

## 4. Persist (`CaseIntelligenceSnapshot`)

| 필드 | 내용 |
| --- | --- |
| `contentJson` | flat summary (rule-based baseline) |
| `graphJson` / `radarJson` / `ledgerJson` | 9-D〜9-F bundle |
| `gongbuhoResolutionJson` | optional |

Refresh 시 **`subjectKind + subjectId`** 로 이전 판단 merge (`entryId` drift 대응). 판단 적용 SSOT: [`applyLawyerJudgmentDecision()`](../../src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts).

## 5. Ledger 판단 (UI)

| 액션 | `judgmentState` | 비고 |
| --- | --- | --- |
| 확인 | `CONFIRMED` | |
| 확인 + 의뢰인 공개 | `CONFIRMED` + `clientVisible: true` | 10-C gate 선행 |
| 기각 | `REJECTED` + `rejectionReason` | |
| 수정 | `EDITED` + `lawyerEditedText` | |

## 6. Out of scope (11‑A)

- Client Disclosure Preview (Phase **11‑B**)
- Cross-case review dashboard
- Real-time collaboration / websocket
- Automatic case status transition on review complete

## 7. 검증

```bash
npm run verify:aibeopchin-lawyer-review-console
npm run test -- src/features/ai-core/case-intelligence-review.service.test.ts
npm run test -- src/features/ai-core/case-intelligence-review.api.validators.test.ts
npm run verify:aibeopchin-ai-governance-rc
```

## 8. 한 줄 판정

11-A까지 잠기면 AI법친은 **내부 지능 엔진**을 넘어, 변호사가 **Graph/Radar/Ledger를 조작하는 작업대**를 갖춘다. 11-B Client Preview 착수 가능.
