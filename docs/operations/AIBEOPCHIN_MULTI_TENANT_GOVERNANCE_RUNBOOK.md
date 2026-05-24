# Multi-tenant Governance / Role Delegation Runbook (Product Phase **30-B**)

**한 줄**: tenant별 역할 위임(브랜치 admin·partner viewer·audit delegate 등) 필수 항목 위임 완료율을 집계해 `governanceDelegationReady` 게이트를 판정한다.

## Operator checklist

1. tenant slug 확인
2. `buildMultiTenantGovernanceRoleDelegation` — required delegation 전부 `delegated`
3. `npm run verify:aibeopchin-enterprise-scale-phase30b`

## 검증

```bash
npm run verify:aibeopchin-enterprise-scale-phase30b
```

**버전** **`30-B.1`**
