# AI Extract-to-Source Linkage Runbook (Product Phase **42-C**)

**한 줄**: AI 추출 텍스트를 원본 증거 page/paragraph/timestamp anchor에 연결하고 `aiExtractToSourceLinkageReady` 게이트를 판정한다.

## 검증

```bash
npm run verify:aibeopchin-evidence-integrity-phase42c
```

**경계**: `NO_AI_EXTRACT_REPLACES_ORIGINAL` — AI 분석 결과가 원본을 대체하지 않음.

**버전** **`42-C.1`**
