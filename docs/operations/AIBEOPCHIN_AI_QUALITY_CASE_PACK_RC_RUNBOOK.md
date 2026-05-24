# AI Quality / Case Pack RC Runbook (Product Phase **23-F**)

**한 줄**: Product Phase 23-A~E를 bundled verify로 묶어 배포 전 AI quality·Case Pack 게이트를 운영한다.

---

## 1. Operator checklist

1. 선행 RC PASS 확인: `npm run verify:aibeopchin-tenant-rc`
2. Sub-phase verify (자동 순차):
   - 23-A `verify:aibeopchin-ai-quality-phase23a`
   - 23-B `verify:aibeopchin-ai-quality-phase23b`
   - 23-C `verify:aibeopchin-ai-quality-phase23c`
   - 23-D `verify:aibeopchin-ai-quality-phase23d`
   - 23-E `verify:aibeopchin-ai-quality-phase23e`
3. Master RC: `npm run verify:aibeopchin-ai-quality-rc`
4. 증빙: `IMPLEMENTATION_EVIDENCE.md` 23-A~F tags

---

## 2. Crosswalk

| Phase | Runbook |
| --- | --- |
| **23-A** | AIBEOPCHIN_AI_OUTPUT_QUALITY_EVALUATION_RUNBOOK.md |
| **23-B** | AIBEOPCHIN_LAWYER_REVIEW_FEEDBACK_LOOP_RUNBOOK.md |
| **23-C** | AIBEOPCHIN_CASE_PACK_BUILDER_RUNBOOK.md |
| **23-D** | AIBEOPCHIN_EVIDENCE_TIMELINE_ISSUE_PACK_RUNBOOK.md |
| **23-E** | AIBEOPCHIN_CLIENT_SAFE_CASE_PROGRESS_PACK_RUNBOOK.md |

---

## 3. 검증

```bash
npm run verify:aibeopchin-ai-quality-rc
```

**버전** **`23-F.1`**
