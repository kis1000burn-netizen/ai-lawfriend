# Gongbuho Legal Knowledge Intelligence Dashboard (Phase 4-I)

**상태**: Phase **4-I** — Legal Knowledge **4-H RC** 이후 운영 가시성 레이어

**증빙 태그**: **`[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTELLIGENCE-DASHBOARD]`**

## 1. 목적

공부호 Legal Knowledge Compiler 파이프라인(Intake → Research Brief → Lawyer Review → GongbuhoPacket)이 **잘 돌아가고 있는지** STAFF/ADMIN이 **한눈에** 확인한다. Voice Phase **7-A** 운영 대시보드와 동일하게 **본문·UGC 원문·PII는 저장·표시하지 않고 메타만** 노출한다.

## 2. 범위 (7항)

| # | 지표 | 설명 |
| --- | --- | --- |
| 1 | **Backlog** | Intake / Brief / Review 상태별 미결 건수 |
| 2 | **Funnel 전환율** | Intake → Brief → Approved Review → Packet Draft → `PACKET_APPROVED` |
| 3 | **caseType 수요** | `mappedCaseType` / `targetCaseType` 기준 분포 |
| 4 | **수요 gap** | `PACKET_APPROVED` 대비 미처리·병목 구간 backlog |
| 5 | **Lawyer Review SLA** | 대기·초과·평균 처리 시간 · bottleneck stage |
| 6 | **UGC·PII 준수 메타** | `noRawUgcStored` · `noUgcOrPiiInReviewNotes` 집계 |
| 7 | **본문 금지** | `legalIssueOutline` · `reviewNotes` · `operatorNote` · `draftText` · raw snippet 필드 API/UI 미노출 |

## 3. 화면 · API

| 경로 | 역할 |
| --- | --- |
| `/admin/gongbuho/legal-knowledge/dashboard` | Intelligence Dashboard UI |
| `GET /api/admin/gongbuho/legal-knowledge/dashboard` | 집계 JSON (STAFF+ · `LEGAL_KNOWLEDGE_READ`) |

## 4. 메트릭 SSOT

- Policy: [`legal-knowledge-intelligence-policy.ts`](../../src/lib/gongbuho/legal-knowledge-intelligence-policy.ts)
- Service: [`legal-knowledge-intelligence.service.ts`](../../src/features/gongbuho/legal-knowledge-intelligence.service.ts)
- SLA 기본값: `LEGAL_KNOWLEDGE_LAWYER_REVIEW_SLA_HOURS_DEFAULT = 72`

### 4.1 Funnel 분모·분자

| 단계 | 분자 |
| --- | --- |
| Intake → Brief | Brief ≥1 인 Intake / 전체 Intake |
| Brief → Approved Review | Review `APPROVED` ≥1 / Brief ≥1 Intake |
| Approved → Packet Draft | Review `gongbuhoPacketId` 존재 / Approved Review |
| Intake → `PACKET_APPROVED` | Intake `status=PACKET_APPROVED` / 전체 Intake |

### 4.2 수요 gap

- **activePipeline**: 종료(`ARCHIVED`·`REJECTED`·`PIPELINE_REJECTED`·`PACKET_APPROVED`) 제외 Intake
- **withoutBrief**: `READY_FOR_RESEARCH` \| `RESEARCH_IN_PROGRESS` 이고 Brief 0건
- **awaitingLawyerReview**: Brief `READY_FOR_LAWYER_REVIEW` 또는 Intake `LAWYER_REVIEW_PENDING`
- **approvedNotCompiled**: Review `APPROVED` & `gongbuhoPacketId` null
- **packetDraftNotApproved**: Intake `PACKET_DRAFT_LINKED`

### 4.3 Bottleneck

위 gap 구간 중 **건수 최대** stage 코드 1개 (`INTAKE_PRE_BRIEF` · `BRIEF_AWAITING_REVIEW` · `REVIEW_APPROVED_NO_PACKET` · `PACKET_DRAFT_NOT_APPROVED`).

## 5. 검증

```bash
npm run verify:gongbuho
npm run test -- src/features/gongbuho/legal-knowledge-intelligence.service.test.ts
```

E2E always-on: `GET /api/admin/gongbuho/legal-knowledge/dashboard` → 401/403

Optional: `E2E_LEGAL_KNOWLEDGE_DASHBOARD_SMOKE=1` + ADMIN

## 6. 관련 문서

- [GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md)
- [GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md)
- Voice Phase 7-A: [`VOICE_PHASE7A_OPS_E2E_SPEC.md`](../voice/VOICE_PHASE7A_OPS_E2E_SPEC.md) (운영 대시보드 패턴 참고)

## 7. 한 줄 착수 기준

AI법친은 Voice 7-A에서 운영 대시보드·민원·E2E hardening까지 완료했으므로, 공부호 Legal Knowledge **4-I**에서 Intake·Brief·Review·Packet 흐름의 backlog·전환율·병목·수요 gap을 **본문 없이 메타 기반**으로 보여주는 Intelligence Dashboard를 구축한다.
