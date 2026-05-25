# Evidence Integrity RC Runbook (Product Phase **42-F**)

## Operator checklist

1. `npm run verify:aibeopchin-sentencing-outcome-assessment-rc` (Phase 41-F 선행)
2. `npm run verify:aibeopchin-legal-outcome-assessment-rc` (Phase 40-F)
3. 42-A ~ 42-E sub-verify
4. `npm run verify:aibeopchin-evidence-integrity-rc`

## 핵심 원칙 (Legal Reliability Platform)

목표는 **판사를 설득하는 AI**가 아니라, **절차·근거·출처·검토 이력이 투명한 사건 정리 플랫폼**이다.

- AI 분석 결과가 원본을 대체하면 안 된다.
- 항상 원본 증거로 돌아갈 수 있어야 한다.
- 변호사 검토 전 외부 공개 금지.

## 경계 (evidence integrity policy only)

**no AI extract replaces original / original evidence trace required / tamper warning required / lawyer review required**

## 다음 Phase (로드맵)

- **43** Claim-Evidence-Judgment Graph
- **44** Court-Ready Case Record Pack
- **45** Judicial Transparency / Explainability Layer
- **46** Neutral Litigation Review Pack
- **47** Legal Reliability RC

## 검증

```bash
npm run verify:aibeopchin-evidence-integrity-rc
```

**버전** **`42-F.1`**
