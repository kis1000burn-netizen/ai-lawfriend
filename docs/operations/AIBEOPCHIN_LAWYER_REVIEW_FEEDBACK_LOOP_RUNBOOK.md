# Lawyer Review Feedback Loop Runbook (Product Phase **23-B**)

**한 줄**: 변호사가 AI 출력에 대해 ACCEPT/MINOR_EDIT/MAJOR_EDIT/REJECT 피드백을 기록하고, MAJOR_EDIT·REJECT 시 quality regression 트리거 플래그를 반환한다.

---

## 1. 범위 (23-B)

| 항목 | 산출물 |
| --- | --- |
| Prisma | `AiLawyerReviewFeedback` |
| Service | `recordLawyerReviewFeedback` · `getLawyerReviewFeedbackForCase` |
| Audit | `AI_LAWYER_REVIEW_FEEDBACK_RECORDED` |
| Hash | `aiOutputHash` (SHA-256) |

---

## 2. 권한

- 담당 변호사 · ADMIN만 피드백 기록
- 사건 read 권한으로 목록 조회

---

## 3. 검증

```bash
npm run verify:aibeopchin-ai-quality-phase23b
```

**버전** **`23-B.1`**
