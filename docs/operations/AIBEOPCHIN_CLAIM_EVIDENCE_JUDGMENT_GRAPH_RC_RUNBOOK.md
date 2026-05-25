# Claim-Evidence-Judgment Graph RC Runbook (Product Phase **43-F**)

## 핵심 구조

```
주장 Claim ↔ 증거 Evidence ↔ 판결문 Judgment ↔ 변호사 검토 상태
```

변호사가 답할 수 있는 질문:
- 이 주장을 뒷받침하는 증거는 무엇인가?
- 이 증거가 약하면 어떤 쟁점이 무너지는가?
- 이 쟁점에 연결된 판결문은 무엇인가?
- 상대방이 공격할 수 있는 지점은 어디인가?
- 변호사가 확인한 연결과 AI 후보 연결은 무엇이 다른가?

## Operator checklist

1. `npm run verify:aibeopchin-evidence-integrity-rc` (42-F)
2. `npm run verify:aibeopchin-legal-outcome-assessment-rc` (40-F)
3. 43-A ~ 43-E sub-verify
4. `npm run verify:aibeopchin-claim-evidence-judgment-graph-rc`

## 경계

**no unlinked claim graph / no judgmentless issue link / AI candidate link not final / no client-visible strategy graph / lawyer review required**

```bash
npm run verify:aibeopchin-claim-evidence-judgment-graph-rc
```

**버전** **`43-F.1`**
