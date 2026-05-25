# Legal Reliability Lawyer Workbench UX RC Runbook (Product Phase **48-F**)

## Operator checklist

1. `npm run verify:aibeopchin-legal-reliability-lawyer-workbench-phase48a` … `phase48e`
2. Bundled prerequisite: `npm run verify:aibeopchin-legal-reliability-rc` (47-RC)
3. `npm run verify:aibeopchin-legal-reliability-lawyer-workbench-rc`

## UI route

`/cases/[caseId]/lawyer-workbench`

## 6대 경계

**NO_AI_FINAL_STRATEGY / NO_CLIENT_VISIBLE_STRATEGY_GRAPH / LAWYER_REVIEW_REQUIRED / JUDGMENT_CLICKTHROUGH_REQUIRED / NO_COURT_AUTO_SUBMISSION / NO_UNEXPLAINED_WORKBENCH_ITEM**

```bash
npm run verify:aibeopchin-legal-reliability-lawyer-workbench-rc
```

**버전** **`48-F.1`**
