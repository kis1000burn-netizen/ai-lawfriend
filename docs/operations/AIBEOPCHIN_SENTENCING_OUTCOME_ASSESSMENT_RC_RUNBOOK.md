# Sentencing Outcome Assessment RC Runbook (Product Phase **41-F**)

## Operator checklist

1. `npm run verify:aibeopchin-legal-outcome-assessment-rc` (Phase 40-F 선행)
2. `npm run verify:aibeopchin-litigation-ops-rc` · `verify:aibeopchin-enterprise-security-rc`
3. 41-A ~ 41-E sub-verify
4. `npm run verify:aibeopchin-sentencing-outcome-assessment-rc`

## Cross-link

- Product **40-F** Judgment-Grounded Outcome Assessment
- Product **24-F** Litigation Operations
- Product **32-F** Enterprise Security / Compliance

## 핵심 원칙

- AI가 형량을 단정하지 않는다.
- 실제 판결문의 선고 결과를 먼저 제시한다.
- 양형기준과 판결문상 양형 사유를 분리해 보여준다.
- 유리/불리한 양형 요소를 비교한다.
- 최종 판단은 변호사가 한다.
- 의뢰인에게는 변호사 검토 전 노출하지 않는다.

## 안전한 명칭

- 사용: **판결문 기반 양형결과 검토** · **유사 사건 선고 결과 분포** · **양형 요소 비교**
- 금지: AI 양형예측 · 예상 형량 · 징역 N년 예상

## 경계 (sentencing outcome assessment policy only)

**no automated sentencing prediction / no sentence guarantee / no client-visible sentencing probability / judgment references required / sentencing reason required / lawyer review required**

## 검증

```bash
npm run verify:aibeopchin-sentencing-outcome-assessment-rc
```

**버전** **`41-F.1`**
