# Sentencing Factor Extraction Runbook (Product Phase **41-B**)

**한 줄**: 유리/불리/중립 양형 요소·비교 요소·양형 이유 문단 추출을 정의하고 `sentencingFactorExtractionReady` 게이트를 판정한다.

## 검증

```bash
npm run verify:aibeopchin-sentencing-outcome-assessment-phase41b
```

**경계**: `SENTENCING_REASON_REQUIRED` — 선고 결과만이 아니라 양형 이유 함께.

**버전** **`41-B.1`**
