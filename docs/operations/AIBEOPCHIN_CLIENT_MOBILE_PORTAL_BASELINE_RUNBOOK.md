# Client Mobile Portal Baseline Runbook (Product Phase **21-A**)

**한 줄**: Phase 20 알림 링크로 진입한 의뢰인이 모바일에서 `/client` 포털을 바로 쓸 수 있도록 모바일 셸·딥링크·기일 탭·사건 목록 진입점을 잠근다.

---

## 1. 범위 (21-A)

| 항목 | 산출물 |
| --- | --- |
| Mobile layout | `/client` route layout · viewport · safe-area padding |
| Case list | `/client/cases` — `GET /api/client/cases` |
| Deep link | `?tab=` · `?share=` → UI tab alias (Phase 20 알림 URL 호환) |
| Deadlines tab | `GET /api/client/cases/{id}/deadlines` |
| Bottom nav | 요청 · 제출 · 공유 · 대화 · 기일 (mobile bottom nav) |

## 2. Deep link alias (Phase 20 호환)

| 알림 URL `tab` | UI tab |
| --- | --- |
| `supplement` | `supplements` |
| `messages` | `chat` |
| `shared` + `share` | `shared` + 자동 열람 |
| `deadlines` | `deadlines` |

SSOT: `client-portal-mobile.policy.ts`

## 3. 라우트

| Path | 역할 |
| --- | --- |
| `/client/cases` | 의뢰인 사건 목록 (모바일 진입) |
| `/client/cases/{caseId}` | 사건별 포털 (딥링크 지원) |

## 4. Crosswalk

| Phase | 문서 |
| --- | --- |
| **15-F / 15-G** | Client Collaboration Portal Full RC |
| **20-E** | Secure delivery notification deep links |
| **21-B** | Mobile Upload UX (다음) |

## 5. 검증

```bash
npm run verify:aibeopchin-client-mobile-phase21a
```

## 6. 다음

**21-B Mobile Upload UX** — camera · multi-select · progress (완료)

**21-C PWA Install / Home Screen** (완료)

**버전** **`21-A.1`**
