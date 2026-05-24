# Enterprise Deployment Model Runbook (Product Phase **30-A**)

**한 줄**: 엔터프라이즈 tenant의 배포 옵션(dedicated VPC·SSO·data residency·DR tier 등) 구성 완료율을 집계해 `deploymentModelReady` 게이트를 판정한다.

## Operator checklist

1. tenant slug 확인 (기본: `enterprise-law-network-001`)
2. `buildEnterpriseDeploymentModel` — required 옵션 전부 `configured`
3. `npm run verify:aibeopchin-enterprise-scale-phase30a`

## 검증

```bash
npm run verify:aibeopchin-enterprise-scale-phase30a
```

**버전** **`30-A.1`**
