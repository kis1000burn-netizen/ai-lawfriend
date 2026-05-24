# Client Mobile Accessibility / Low-end Device Smoke Runbook (Product Phase **21-E**)

**한 줄**: 의뢰인이 저사양 모바일·느린 네트워크·작은 화면·접근성 환경에서도 보완요청 확인, 자료 업로드, 공유문서 열람, 대화, 기일 확인을 끊김 없이 수행할 수 있는지 smoke 기준으로 검증한다.

---

## 1. 범위 (21-E)

| 항목 | 검증 포인트 |
| --- | --- |
| Mobile viewport 회귀 | `/client/layout.tsx` — `device-width` · `viewportFit: cover` · safe-area |
| 큰 글씨/작은 화면 | `text-base leading-relaxed` · `sm:` responsive typography |
| 키보드 focus | `focus-visible:outline` on primary controls |
| 최소 touch target | `min-h-11` / bottom nav `min-h-14` (≥44px) |
| 업로드 slow network UX | `slow-network-hint` after 4s · `aria-live` status · slow network 안내 |
| Offline fallback a11y | `<main>` · labelled heading · retry/link labels |
| Bottom nav labels | per-tab `aria-label` · `aria-current="page"` |
| Push permission panel a11y | `aria-labelledby` · button labels · live status |
| 저사양 smoke shell | `data-testid="client-portal-low-end-smoke-shell"` |
| 민감 cache denylist 회귀 | policy ↔ `public/client/sw.js` sync |

SSOT: `client-portal-mobile-a11y.policy.ts`

## 2. 수동 smoke (현장)

1. **Android Chrome (저사양)** — DevTools CPU 4x · Network Slow 3G  
   - `/client/cases` → 사건 진입 → 5탭 bottom nav 전환  
   - 업로드 1건 → slow hint · departure warning 확인  
   - 알림 패널 · PWA 배너 버튼 터치 영역 확인  

2. **iOS Safari (작은 화면)** — SE 클래스 viewport  
   - Dynamic Type / 큰 글씨에서 텍스트 잘림 없는지  
   - Offline (`/client/offline`) 링크·retry focus  

3. **Keyboard / screen reader smoke**  
   - Tab으로 bottom nav · upload · push 버튼 focus ring  
   - VoiceOver/TalkBack: 탭 이름·업로드 상태 읽힘  

4. **Reduced motion**  
   - OS “동작 줄이기” ON → upload progress transition 없음 · nav blur off  

## 3. Crosswalk

| Phase | 문서 |
| --- | --- |
| **21-A~D** | Mobile portal · upload · PWA · push surface |
| **21-F** | Client Mobile / PWA RC (다음) |

## 4. 검증

```bash
npm run verify:aibeopchin-client-mobile-phase21e
npm run verify:aibeopchin-client-mobile-phase21a   # viewport 회귀
npm run verify:aibeopchin-client-mobile-phase21b   # upload 회귀
npm run verify:aibeopchin-client-mobile-phase21c   # cache denylist 회귀
npm run verify:aibeopchin-client-mobile-phase21d   # push surface 회귀
```

## 5. 다음

**21-F Client Mobile / PWA RC** (완료)

**Product Phase 22** Tenant / Plan / Metering (다음)

**버전** **`21-E.1`**
