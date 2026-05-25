# Lawyer Judgment Review Workspace Runbook (Product Phase **40-E**)

**한 줄**: 판결문 Drawer·원문·관련 문단·적용 분석·검토 완료/수정/제외·메모 workspace를 정의하고 `lawyerJudgmentReviewWorkspaceReady` 게이트를 판정한다.

## 검증

```bash
npm run verify:aibeopchin-legal-outcome-assessment-phase40e
```

**경계**: `LAWYER_REVIEW_REQUIRED` — 변호사 검토 전 확정 금지.

**버전** **`40-E.2`**
