# Tenant Plan / Feature Entitlement Runbook (Product Phase **22-B**)

**한 줄**: tenant별 plan tier, feature flag, seat/case/AI limit, messaging·mobile entitlement를 정의하고, API/UI가 동일한 entitlement 정책으로 기능 접근을 허용·차단한다.

---

## 1. 범위 (22-B)

| 항목 | 산출물 |
| --- | --- |
| Plan tier | `FREE` · `STARTER` · `PRO` · `ENTERPRISE` |
| Registry SSOT | `tenant-plan.registry.ts` — tier limits · default features |
| Prisma | `TenantPlan` — tier · status · `featureFlags` JSON overrides |
| Policy | `tenant-entitlement.policy.ts` |
| Service hooks | `enforceTenantApiEntitlement` · `resolveTenantUiEntitlements` |
| Denial audit | `TENANT_ENTITLEMENT_DENIED` → `AuditLog` |
| External messaging | `assertExternalMessagingEntitlement` in adapter send path |

**의도적 제외 (22-C~F)**: usage metering persist · billing ledger · admin console · bundled RC

---

## 2. Plan tier (기본 limit · feature)

| Tier | Seats | Cases | AI tokens/mo | LLM/case |
| --- | --- | --- | --- | --- |
| FREE | 2 | 5 | 10K | 3 |
| STARTER | 5 | 25 | 100K | 10 |
| PRO | 20 | 100 | 500K | 30 |
| ENTERPRISE | 999 | 9,999 | 5M | 100 |

Feature registry: `TENANT_ENTITLEMENT_FEATURES` in `tenant-plan.schema.ts`

---

## 3. Entitlement feature keys

| Category | Keys |
| --- | --- |
| AI | `AI_CASE_SUMMARY` · `AI_CASE_INTELLIGENCE_GRAPH` · `AI_CONTRADICTION_RADAR` · `AI_LAWYER_JUDGMENT_LEDGER` · `AI_DOCUMENT_PARAGRAPH` |
| Messaging | `EXTERNAL_MESSAGING_EMAIL` · `EXTERNAL_MESSAGING_KAKAO` |
| Client mobile/PWA | `CLIENT_PORTAL_MOBILE` · `CLIENT_PORTAL_PWA` · `CLIENT_PORTAL_PUSH` |

Tenant-level overrides: `TenantPlan.featureFlags` JSON (merged on tier defaults)

---

## 4. API enforcement hook

```typescript
import { enforceTenantApiEntitlement } from "@/features/platform/tenant-entitlement/tenant-entitlement.service";

await enforceTenantApiEntitlement({
  tenantId,
  feature: "EXTERNAL_MESSAGING_KAKAO",
  actorUserId: session.user.id,
});
// ForbiddenError + TENANT_ENTITLEMENT_DENIED audit on deny
```

**Limit hooks**: `enforceTenantSeatLimit` · `enforceTenantCaseLimit`

**External messaging**: `sendExternalMessageViaAdapter` checks entitlement when `payload.tenantId` is set.

---

## 5. UI visibility hook

```typescript
import { resolveTenantUiEntitlements } from "@/features/platform/tenant-entitlement/tenant-entitlement.service";

const visibility = await resolveTenantUiEntitlements(tenantId);
// [{ feature, visible, enabled, denialReason? }, ...]
```

Global kill-switch (e.g. push): `NEXT_PUBLIC_FF_CLIENT_PORTAL_PUSH_SURFACE` + tenant `CLIENT_PORTAL_PUSH`

---

## 6. Denial audit

| Field | Value |
| --- | --- |
| action | `TENANT_ENTITLEMENT_DENIED` |
| entityType | `TENANT` |
| metadata | `feature` · `reason` · `code` |

Codes: `FEATURE_NOT_ENTITLED` · `SEAT_LIMIT_EXCEEDED` · `CASE_LIMIT_EXCEEDED` · `PLAN_SUSPENDED` · `GLOBAL_FEATURE_DISABLED`

---

## 7. Seed

Demo tenant (`aibeopchin-demo`): **PRO** tier + `CLIENT_PORTAL_PUSH: true` override

```bash
npm run db:seed
```

---

## 8. Crosswalk

| Phase | 문서 |
| --- | --- |
| **22-A** | Tenant / Organization Model |
| **22-C** | Usage Metering (다음) |
| **22-F** | Tenant / Plan / Metering RC |

---

## 9. 검증

```bash
npm run verify:aibeopchin-tenant-phase22b
```

**버전** **`22-B.1`**
