# Judgment-Grounded Outcome Assessment RC Runbook (Product Phase **40-F**)

## Operator checklist

1. `npm run verify:aibeopchin-strategic-account-expansion-rc` (commercial track 39-F 선행)
2. `npm run verify:aibeopchin-ai-quality-rc` · `verify:aibeopchin-litigation-ops-rc` (legal track 선행)
3. 40-A ~ 40-E sub-verify
4. `npm run verify:aibeopchin-legal-outcome-assessment-rc`

## Cross-link

- Product **39-F** Strategic Account Expansion (commercial track 종료)
- Product **23-F** AI Quality / Case Pack
- Product **24-F** Litigation Operations
- Product **32-F** Enterprise Security / Compliance

## 핵심 원칙

- AI가 먼저 판단하지 않는다.
- 판결문이 먼저 기준이 된다.
- AI는 판결문과 사건 사실을 연결해 변호사에게 검토 후보를 제시한다.

## 경계 (judgment-grounded outcome assessment policy only)

**no judgmentless legal assessment / no uncited precedent claim / no client-visible judgment prediction / lawyer review required / official or licensed source required** — 판결문 없는 assessment·출처 없는 판례·의뢰인 노출 판단·변호사 검토 생략·비공식 출처 금지.

## 검증

```bash
npm run verify:aibeopchin-legal-outcome-assessment-rc
```

**버전** **`40-F.2`**
