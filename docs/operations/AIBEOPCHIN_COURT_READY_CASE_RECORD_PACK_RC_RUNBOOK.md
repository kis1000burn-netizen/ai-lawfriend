# Court-Ready Case Record Pack RC Runbook (Product Phase **44-F**)

## 핵심 구조

Phase 43 Claim-Evidence-Judgment graph → court-ready pack 정제

```
사건 요약 · 쟁점표 · 증거목록 · 판결문 근거 · 절차 이력 · 변호사 검토 상태
```

## Operator checklist

1. `npm run verify:aibeopchin-claim-evidence-judgment-graph-rc` (43-F)
2. `npm run verify:aibeopchin-evidence-integrity-rc` (42-F)
3. 44-A ~ 44-E sub-verify
4. `npm run verify:aibeopchin-court-ready-case-record-pack-rc`

## 경계

**no automatic court submission / no e-filing auto upload / no court-ready before lawyer review / no internal strategy graph in default pack / no sensitive client counseling auto include**

```bash
npm run verify:aibeopchin-court-ready-case-record-pack-rc
```

**버전** **`44-F.1`**
