# Tenant / Plan / Metering RC Lock Summary — Product Phase **22-F**

**상태**: Product Phase **22-F** — **Tenant / Plan / Metering RC LOCKED** (static RC gate · billing ledger no automatic invoice)

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC]`**

**선행**: Product **20-F** Real Messaging RC · **21-F** Client Mobile / PWA RC · Phase **22-A~E**

## 1. 한 줄 기준

**법무법인·변호사·의뢰인 사용 구조를 tenant 단위로 분리하고, 요금제·기능 권한·사용량 집계·과금 안전 원장·운영자 plan console을 하나의 사업화 RC로 묶어 배포 전 검증·운영 runbook·청구서 미발행 원장 정책을 잠근다.**

## 2. Sub-phases

| Phase | 이름 | 산출물 |
| --- | --- | --- |
| **22-A** | Tenant / Organization Model | `Tenant` · `TenantMembership` · case scope |
| **22-B** | Plan / Feature Entitlement | tier · feature registry · API/UI hooks |
| **22-C** | Usage Metering | `TenantUsageEvent` · usage summary |
| **22-D** | Billing-safe Usage Ledger | `BillingUsageLedger` · period close · **no automatic invoice** |
| **22-E** | Admin Plan Console | `/admin/tenants` · plan · ledger adjustment |
| **22-F** | Tenant / Plan / Metering RC | `verify:aibeopchin-tenant-rc` |

## 3. Bundled verify (배포 전 필수)

```bash
npm run verify:aibeopchin-tenant-rc
```

내부적으로 **22-A~E** sub-verify + runbook/evidence + **20-F/21-F** product cross-link + admin console path + billing no-invoice gate.

## 4. Billing ledger (청구서 미발행)

| Gate | 설명 |
| --- | --- |
| **NO_AUTOMATIC_INVOICE** | 22-D ledger는 metering → billable entry만; invoice/payment 미구현 |
| **PERIOD_CLOSE** | closed period mutation 차단 (API + admin UI) |
| **DUPLICATE_CHARGE_GUARD** | `meteringEventId` unique idempotency |
| **ADMIN_ADJUSTMENT_AUDIT** | `BILLING_LEDGER_ADJUSTED` + 22-D ledger audit |

## 5. Admin console (22-E)

| Path | 역할 |
| --- | --- |
| `/admin/tenants` | tenant list |
| `/admin/tenants/[tenantId]/plan` | plan · entitlement · usage · ledger |

Audit: `TENANT_PLAN_UPDATED` · `TENANT_FEATURE_OVERRIDE_UPDATED` · `BILLING_LEDGER_ADJUSTED`

## 6. Product cross-link (20-F · 21-F)

| Phase | 역할 |
| --- | --- |
| **20-F** | external messaging · `assertExternalMessagingEntitlement` when `tenantId` set |
| **21-F** | client mobile/PWA · push entitlement + global FF |
| **22-B** | tenant plan tier limits messaging/mobile features |

```bash
npm run verify:aibeopchin-real-messaging-rc   # 선행·회귀
npm run verify:aibeopchin-client-mobile-rc    # 선행·회귀
```

## 7. 다음

Product Phase **23** AI Quality / Case Pack — **COMPLETE · LOCKED**

**버전** **`22-F.1`**
