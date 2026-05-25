# Judgment Corpus / Source Registry Runbook (Product Phase **40-A**)

**한 줄**: 공식·허가 DB·내부 검토 판결문 출처 registry를 정의하고 `judgmentCorpusSourceRegistryReady` 게이트를 판정한다.

## 검증

```bash
npm run verify:aibeopchin-legal-outcome-assessment-phase40a
```

**경계**: `OFFICIAL_OR_LICENSED_SOURCE_REQUIRED` — 공식/허가된 판결문 출처만.

**버전** **`40-A.2`**
