# Tenant / Organization Baseline Runbook (Product Phase **22-A**)

**한 줄**: 법무법인·변호사·스태프 사용 구조를 **tenant** 단위로 분리하고, 멤버십·사건 tenant 스코프의 Prisma·policy·seed 기준선을 잠근다.

---

## 1. 범위 (22-A)

| 항목 | 산출물 |
| --- | --- |
| Prisma | `Tenant` · `TenantMembership` · `Case.tenantId` |
| Policy SSOT | `tenant-organization.policy.ts` |
| Repository | `tenant-organization.repository.ts` |
| Seed | `seed-tenant-organization.ts` — demo tenant `aibeopchin-demo` |
| Zod schema | `tenant-organization.schema.ts` |

**의도적 제외 (22-B~F)**: Plan · entitlement enforcement · usage metering · billing ledger · admin console · bundled RC

---

## 2. Tenant 모델

| 필드 | 설명 |
| --- | --- |
| `slug` | URL·운영 식별자 (kebab-case, unique) |
| `legalName` | 법인 정식 명칭 |
| `displayName` | UI 표시명 |
| `status` | `ACTIVE` · `SUSPENDED` · `ARCHIVED` |

---

## 3. Membership 역할

| Role | 용도 |
| --- | --- |
| `OWNER` | tenant 생성자 · 최고 관리 |
| `ADMIN` | tenant 운영 관리 |
| `LAWYER` | 변호사 seat |
| `STAFF` | 사무 staff |

Platform `UserRole` → membership role 매핑: `suggestTenantMembershipRoleForPlatformRole()`

---

## 4. Case tenant 스코프

- `Case.tenantId` — optional FK (기존 사건은 null 허용)
- 신규 사건 tenant 부여: `resolveTenantScopedCaseTenantId()` (explicit → owner primary tenant)

---

## 5. Seed

```bash
npm run db:seed
```

Demo tenant: slug **`aibeopchin-demo`**, owner **`lawyer@aibupchin.com`**, staff/admin 멤버십 upsert.

---

## 6. Crosswalk

| Phase | 문서 |
| --- | --- |
| **22-B** | Plan / Feature Entitlement (다음) |
| **22-C** | Usage Metering |
| **22-D** | Billing-safe Usage Ledger |
| **22-E** | Admin Plan Console |
| **22-F** | Tenant / Plan / Metering RC |

---

## 7. 검증

```bash
npm run verify:aibeopchin-tenant-phase22a
```

---

## 8. Phase 22 한 줄 기준 (전체)

AI법친 Product Phase 22는 법무법인·변호사·의뢰인 사용 구조를 tenant 단위로 분리하고, 요금제·기능 권한·사용량 집계·과금 안전 원장을 하나의 사업화 RC로 잠그는 단계다.

**버전** **`22-A.1`**
