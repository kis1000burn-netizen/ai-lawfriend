# Judicial Transparency / Explainability RC Runbook (Product Phase **45-F**)

## 핵심: AI가 왜 이렇게 정리했는지

```
사용한 증거 · 참조한 판결문 · 제외한 자료 · 연결한 주장
유사/차이 분석 · 불확실성 · 변호사 수정 이력 · 최종 검토자
```

Phase 44 court-ready pack 항목별 explainability trace.

## Operator checklist

1. `npm run verify:aibeopchin-court-ready-case-record-pack-rc` (44-F)
2. `npm run verify:aibeopchin-claim-evidence-judgment-graph-rc` (43-F)
3. 45-A ~ 45-E sub-verify
4. `npm run verify:aibeopchin-judicial-transparency-explainability-rc`

## 경계

**no unexplained AI output / no hidden source omission / no client-visible explainability without lawyer review / lawyer review required**

```bash
npm run verify:aibeopchin-judicial-transparency-explainability-rc
```

**버전** **`45-F.1`**
