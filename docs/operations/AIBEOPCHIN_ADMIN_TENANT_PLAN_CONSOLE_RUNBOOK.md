# Admin Tenant Plan Console Runbook (Product Phase **22-E**)

**한 줄**: 운영자가 tenant별 plan, feature entitlement, usage summary, billing ledger, period close 상태를 한 화면에서 조회하고, 허용된 범위 안에서 plan 변경·feature override·ledger adjustment를 감사 기록과 함께 수행할 수 있게 한다.

---

## 1. 범위 (22-E)

| 항목 | 경로 |
| --- | --- |
| Tenant list | `/admin/tenants` |
| Plan console | `/admin/tenants/[tenantId]/plan` |
| List API | `GET /api/admin/tenants` |
| Snapshot API | `GET /api/admin/tenants/[tenantId]/plan` |
| Plan update | `PATCH /api/admin/tenants/[tenantId]/plan` |
| Feature overrides | `PATCH /api/admin/tenants/[tenantId]/feature-overrides` |
| Ledger adjustment | `POST /api/admin/tenants/[tenantId]/billing-ledger/adjustment` |

**Role**: ADMIN only (`requireAdmin` · `requireRoleApi("ADMIN")`)

**의도적 제외 (22-F)**: bundled tenant RC · invoice issuance · payment

---

## 2. Console surfaces

| Surface | Source |
| --- | --- |
| Plan tier/status | 22-B `TenantPlan` |
| Feature overrides | 22-B `featureFlags` JSON |
| Usage summary | 22-C `getTenantUsageSummary` |
| Billing ledger | 22-D `getTenantBillingLedgerSummary` |
| Period close | 22-D `BillingLedgerPeriodClose` |

---

## 3. Mutations & audit

| Action | Audit |
| --- | --- |
| Plan tier/status change | `TENANT_PLAN_UPDATED` |
| Feature flag override | `TENANT_FEATURE_OVERRIDE_UPDATED` |
| Manual ledger adjustment | `BILLING_LEDGER_ADJUSTED` (+ 22-D ledger audit) |

---

## 4. Period close UI guard

- `periodClosed` badge on plan console
- `billingMutationsBlocked` — manual adjustment form disabled when period closed
- Closed period list displayed when `closedPeriodKeys` non-empty

**no automatic invoice**: ledger adjustments do not issue invoices.

---

## 5. Crosswalk

| Phase | 문서 |
| --- | --- |
| **22-D** | Billing-safe Usage Ledger |
| **22-F** | Tenant / Plan / Metering RC (다음) |

---

## 6. 검증

```bash
npm run verify:aibeopchin-tenant-phase22e
```

**버전** **`22-E.1`**
