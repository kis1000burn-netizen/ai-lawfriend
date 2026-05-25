# Judgment Drawer / Precedent Viewer Runbook (Product Phase **48-D**)

**한 줄**: AI법친 Phase 48은 Phase 40~47의 판결문 기반 판단, 양형결과, 증거 무결성, 주장-증거-판결문 graph, court-ready pack, explainability trace, 중립 사건 정리 pack을 변호사 사건 상세 화면에서 하나의 업무 흐름으로 사용할 수 있게 재구성하는 Lawyer Workbench UX 단계다

**UI route**: `/cases/{caseId}/lawyer-workbench?drawer=judgment`

```bash
npm run verify:aibeopchin-legal-reliability-lawyer-workbench-phase48d
```

**경계**: JUDGMENT_CLICKTHROUGH_REQUIRED / LAWYER_REVIEW_REQUIRED / NO_UNEXPLAINED_WORKBENCH_ITEM

**버전** **`48-D.1`**
