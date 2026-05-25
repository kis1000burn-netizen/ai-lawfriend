# Lawyer Sentencing Review Workspace Runbook (Product Phase **41-E**)

**한 줄**: 판결문 카드·원문·양형 이유·유사/차이·요소 비교표·변호사 메모 workspace를 정의하고 `lawyerSentencingReviewWorkspaceReady` 게이트를 판정한다.

## 검증

```bash
npm run verify:aibeopchin-sentencing-outcome-assessment-phase41e
```

**경계**: `NO_CLIENT_VISIBLE_SENTENCING_PROBABILITY` · `clientVisibleBeforeReview: false`

**버전** **`41-E.1`**
