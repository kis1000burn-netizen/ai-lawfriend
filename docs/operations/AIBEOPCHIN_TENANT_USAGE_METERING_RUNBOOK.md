# Tenant Usage Metering Runbook (Product Phase **22-C**)

**한 줄**: tenant별 AI 호출, 외부 메시징, 문서 처리, 파일 업로드, 모바일 포털 사용량을 metering event로 기록하고, 22-B plan limit과 비교 가능한 usage summary를 제공한다.

---

## 1. 범위 (22-C)

| 항목 | 산출물 |
| --- | --- |
| Prisma | `TenantUsageEvent` — append-only metering events |
| Event kinds | AI tokens · LLM call · external message · document processing · file upload · client portal active |
| Monthly window | UTC `YYYY-MM` (`resolveTenantUsagePeriodKey`) |
| Aggregation | `aggregateTenantUsageTotals` · `getTenantUsageSummary` |
| Plan comparison | 22-B limits vs usage · over-limit · approaching-limit warnings |
| Wire hooks | external messaging send · AI governance invoke bridge |

**의도적 제외 (22-D~F)**: billing-safe usage ledger · admin console · bundled RC

**Billing ledger 분리**: `TenantUsageEvent`는 metering 전용. 과금 원장(billing ledger, 22-D)과 **별도 테이블·서비스**

---

## 2. TenantUsageEvent

| Field | 설명 |
| --- | --- |
| `tenantId` | tenant FK |
| `periodKey` | monthly window `YYYY-MM` |
| `kind` | `AI_TOKEN_USAGE` · `LLM_CALL` · `EXTERNAL_MESSAGE` · `DOCUMENT_PROCESSING` · `FILE_UPLOAD` · `CLIENT_PORTAL_ACTIVE` |
| `quantity` | count or token/byte amount |
| `unit` | `COUNT` · `TOKENS` · `BYTES` |
| `caseId` | optional case scope |
| `metadata` | e.g. `{ channel, bytesEstimate, feature, surface }` |

---

## 3. Usage summary dimensions

| Metric | Source kind |
| --- | --- |
| AI token usage | `AI_TOKEN_USAGE` (unit TOKENS) |
| LLM call count | `LLM_CALL` |
| External message count | `EXTERNAL_MESSAGE` |
| Document processing count | `DOCUMENT_PROCESSING` |
| File upload count | `FILE_UPLOAD` (unit COUNT) |
| Storage estimate | `FILE_UPLOAD.metadata.bytesEstimate` sum |
| Client portal active usage | `CLIENT_PORTAL_ACTIVE` |

---

## 4. Plan limit comparison (22-B)

`getTenantUsageSummary({ tenantId, periodKey? })` returns:

- `totals` — aggregated usage
- `limitComparisons` — e.g. `monthlyAiTokenBudget`, `maxLlmCallsPerCase:{caseId}`
- `warnings` — `TENANT_USAGE_APPROACHING_LIMIT` (≥80%) · `TENANT_USAGE_OVER_LIMIT`

---

## 5. Record API

```typescript
import {
  recordTenantAiTokenUsage,
  recordTenantLlmCall,
  recordTenantExternalMessageUsage,
  recordTenantDocumentProcessingUsage,
  recordTenantFileUploadUsage,
  recordTenantClientPortalActiveUsage,
  getTenantUsageSummary,
} from "@/features/platform/tenant-metering/tenant-metering.service";
```

**Auto-record hooks**:

- `sendExternalMessageViaAdapter` — when `payload.tenantId` set
- `recordAiGovernanceInvokeAudit` — when `case.tenantId` set (bridge)

---

## 6. Crosswalk

| Phase | 문서 |
| --- | --- |
| **22-B** | Plan / Feature Entitlement |
| **22-D** | Billing-safe Usage Ledger (다음) |
| **22-F** | Tenant / Plan / Metering RC |

---

## 7. 검증

```bash
npm run verify:aibeopchin-tenant-phase22c
```

**버전** **`22-C.1`**
