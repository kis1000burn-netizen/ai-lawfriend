# Criminal Judgment / Sentencing Corpus Registry Runbook (Product Phase **41-A**)

**한 줄**: 형사 판결문·선고 결과·양형 이유 corpus registry를 정의하고 `criminalJudgmentSentencingCorpusRegistryReady` 게이트를 판정한다.

## 검증

```bash
npm run verify:aibeopchin-sentencing-outcome-assessment-phase41a
```

**경계**: `JUDGMENT_REFERENCES_REQUIRED` — 양형 검토에 실제 판결문 근거 필수.

**버전** **`41-A.1`**
