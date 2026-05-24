# Billing-safe Usage Ledger Runbook (Product Phase **22-D**)

**한 줄**: tenant usage metering event를 과금 가능한 ledger entry로 변환하되, 중복 청구 방지·정정·void·audit·period lock을 통해 청구 분쟁에 안전한 원장 구조를 만든다.

---

## 1. 범위 (22-D)

| 항목 | 산출물 |
| --- | --- |
| Prisma | `BillingUsageLedger` · `BillingLedgerPeriodClose` |
| Idempotency | `meteringEventId` unique — duplicate charge guard |
| Snapshots | `unitCostSnapshot` · `planSnapshot` (22-B tier frozen) |
| Status | `DRAFT` · `POSTED` · `VOIDED` · `ADJUSTED` |
| Period lock | `BillingLedgerPeriodClose` — closed period mutations blocked |
| Manual adjustment | `createManualBillingLedgerAdjustment` + audit |
| Auto-promote | metering record → DRAFT ledger (bridge) |

**22-D는 청구서 발행이 아니다 (no automatic invoice).**  
안전한 사용량 원장 — 이후 청구서·결제·세금계산서(22-E 이후)로 이어질 수 있는 기반.

**의도적 제외**: automatic invoice issuance · payment capture · tax invoice · admin console (22-E~F)

---

## 2. BillingUsageLedger

| Field | 설명 |
| --- | --- |
| `meteringEventId` | 22-C event FK · unique (idempotency) |
| `billingPeriodKey` | `YYYY-MM` monthly window |
| `chargeCategory` | AI_TOKEN · LLM_CALL · EXTERNAL_MESSAGE · … · MANUAL_ADJUSTMENT |
| `billableQuantity` | billable units (tokens, count, bytes) |
| `unitCostSnapshot` | `{ currency, amountMinor, unit, capturedAt }` |
| `planSnapshot` | `{ tier, status, limits, capturedAt }` |
| `status` | DRAFT → POSTED/VOIDED · POSTED → VOIDED/ADJUSTED |

---

## 3. Guards

| Guard | Code |
| --- | --- |
| Duplicate charge | `DUPLICATE_CHARGE` — same `meteringEventId` |
| Period closed | `PERIOD_CLOSED` — no promote/post/void/adjust |
| Invalid transition | `INVALID_STATUS_TRANSITION` |

---

## 4. Service API

```typescript
import {
  promoteMeteringEventToBillingLedger,
  postBillingLedgerEntry,
  voidBillingLedgerEntry,
  createManualBillingLedgerAdjustment,
  closeTenantBillingPeriod,
  getTenantBillingLedgerSummary,
} from "@/features/platform/billing-ledger/billing-usage-ledger.service";
```

**Auto bridge**: `recordTenantUsageEvent` → `promoteMeteringEventToBillingLedgerDraft` (DRAFT only)

---

## 5. Audit actions

| Action | When |
| --- | --- |
| `BILLING_LEDGER_PROMOTED` | metering → DRAFT |
| `BILLING_LEDGER_POSTED` | DRAFT → POSTED |
| `BILLING_LEDGER_VOIDED` | void |
| `BILLING_LEDGER_MANUAL_ADJUSTMENT` | manual ADJUSTED row |
| `BILLING_LEDGER_PERIOD_CLOSED` | period lock |

All audit metadata includes `noAutomaticInvoice: true`.

---

## 6. Crosswalk

| Phase | 문서 |
| --- | --- |
| **22-C** | Usage Metering |
| **22-E** | Admin Plan Console (다음) |
| **22-F** | Tenant / Plan / Metering RC |

---

## 7. 검증

```bash
npm run verify:aibeopchin-tenant-phase22d
```

**버전** **`22-D.1`**
