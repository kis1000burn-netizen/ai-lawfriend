# Evidence / Timeline / Issue Pack Runbook (Product Phase **23-D**)

**한 줄**: 사건 증거(attachments)·타임라인 메모·쟁점 후보를 하나의 내부 검토 pack으로 묶고 evidence↔issue cross-link를 생성한다.

---

## 1. 범위 (23-D)

| 항목 | 산출물 |
| --- | --- |
| Service | `buildEvidenceTimelineIssuePackForCase` |
| Sections | evidenceItems · timelineItems · issueItems · crossLinks |
| Disclaimer | 변호사 검토용 — AI/운영 추정 |

---

## 2. 권한

- STAFF_NOTE 타임라인: 담당 변호사·ADMIN만 포함
- evidence: ACTIVE attachment만

---

## 3. 검증

```bash
npm run verify:aibeopchin-ai-quality-phase23d
```

**버전** **`23-D.1`**
