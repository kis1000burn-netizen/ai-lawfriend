# Client Mobile PWA Install Runbook (Product Phase **21-C**)

**한 줄**: 의뢰인이 모바일 홈 화면에 AI법친 client portal을 설치하고, 로그인 후 사건 포털·제출·공유·대화·기일 화면으로 빠르게 재진입할 수 있게 한다.

---

## 1. 범위 (21-C)

| 항목 | 산출물 |
| --- | --- |
| Web manifest | `public/manifest.webmanifest` — app name · icon · theme · `start_url` |
| Service worker | `public/client/sw.js` — shell-only cache · scope `/client/` |
| Install prompt | `ClientPortalPwaInstallBanner` — `beforeinstallprompt` 안내 |
| Offline fallback | `/client/offline` — 본문/첨부 미캐시 안내 |
| Last visit restore | `localStorage` last visit record · `ClientPortalPwaRestoreRedirect` |
| Home screen launch | `start_url`: `/client/cases?source=pwa` |

## 2. 보안 (offline cache 금지)

| 금지 대상 | denylist term |
| --- | --- |
| API · 인증 | `/api/`, `/login` |
| 사건 본문·상세 | `/client/cases/` |
| 업로드 · 첨부 | `files/upload`, `attachment`, `document` |
| 공유 · 제출 · 대화 · 기일 | `shared-documents`, `submissions`, `messages`, `deadlines`, `supplement-requests` |

SSOT: `client-portal-pwa.policy.ts` · `public/client/sw.js` (동일 cache denylist)

**원칙**: 사건 본문·첨부·대화·민감 API 응답은 service worker cache에 넣지 않는다. 오프라인 시 shell + `/client/offline`만 제공.

## 3. 재진입 흐름

1. 홈 화면 아이콘 → `/client/cases?source=pwa`
2. 로그인 세션 유지 시 `ClientPortalPwaRestoreRedirect`가 `localStorage`의 마지막 `caseId` + `tab`으로 replace
3. 사건 상세 탭 전환 시 `saveClientPortalLastVisit` 갱신

## 4. Operator / triage

- **설치 배너 미표시**: Chrome/Android는 HTTPS + manifest + SW 필요. iOS Safari는 `beforeinstallprompt` 미지원 → 공유 → 홈 화면에 추가 수동 안내.
- **아이콘**: 현재 SVG (`/pwa/client-portal-icon.svg`). iOS 구형 기기에서 PNG 192/512 필요 시 후속 패치.
- **오프라인**: `/client/offline`만 캐시. 사건 데이터는 네트워크 복구 후 재시도.
- **캐시 의심**: DevTools → Application → Service Workers → Unregister 후 hard refresh.

## 5. Crosswalk

| Phase | 문서 |
| --- | --- |
| **21-A** | [AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md) |
| **21-B** | [AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md) |
| **21-D** | [AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md) |

## 6. 검증

```bash
npm run verify:aibeopchin-client-mobile-phase21c
npm run verify:aibeopchin-client-mobile-phase21a   # 회귀
npm run verify:aibeopchin-client-mobile-phase21b   # 회귀
```

## 7. 다음

**21-D Push-ready Notification Surface** (완료)

**21-E Mobile Accessibility / Low-end Device Smoke** (다음)

**버전** **`21-C.1`**
