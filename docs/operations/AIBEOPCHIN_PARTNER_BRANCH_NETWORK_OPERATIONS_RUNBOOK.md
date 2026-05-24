# Partner / Branch Network Operations Runbook (Product Phase **30-C**)

**한 줄**: partner·branch network 노드(허브·지사·공동 수행 사무소) 운영 준비 상태를 집계해 `branchNetworkOpsReady` 게이트를 판정한다.

## Operator checklist

1. network slug 확인 (기본: `enterprise-law-network-001`)
2. `buildPartnerBranchNetworkOperations` — required node 전부 `operational`
3. `npm run verify:aibeopchin-enterprise-scale-phase30c`

## 검증

```bash
npm run verify:aibeopchin-enterprise-scale-phase30c
```

**버전** **`30-C.1`**
