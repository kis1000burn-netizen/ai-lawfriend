# Client Mobile / PWA RC Lock Summary — Product Phase **21-F**

**상태**: Product Phase **21-F** — **Client Mobile / PWA RC LOCKED** (static RC gate · web push live send OFF default)

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC]`**

**선행**: Product **20-F** Real Messaging RC · Phase **21-A~E**

## 1. 한 줄 기준

**모바일 의뢰인 포털, 업로드 UX, PWA 설치, push-ready surface, 접근성·저사양 smoke를 하나의 Client Mobile / PWA RC로 묶어 배포 전 검증·운영 runbook·보안 cache 정책을 잠근다.**

## 2. Sub-phases

| Phase | 이름 | 산출물 |
| --- | --- | --- |
| **21-A** | Mobile Client Portal Baseline | `/client` layout · deep link · bottom nav |
| **21-B** | Mobile Upload UX | camera · progress · retry · departure guard |
| **21-C** | PWA Install / Home Screen | manifest · SW denylist · offline fallback |
| **21-D** | Push-ready Notification Surface | subscription API · notification center |
| **21-E** | Accessibility / Low-end Smoke | focus · touch · slow network UX |
| **21-F** | Client Mobile / PWA RC | `verify:aibeopchin-client-mobile-rc` |

## 3. Bundled verify (배포 전 필수)

```bash
npm run verify:aibeopchin-client-mobile-rc
```

내부적으로 **21-A~E** sub-verify + runbook/evidence + **Phase 20-F** deep-link cross-link + PWA cache denylist + push live send OFF gates.

## 4. Web push live send (기본 OFF)

| Gate | 설명 |
| --- | --- |
| **BUNDLED_RC_VERIFY** | `verify:aibeopchin-client-mobile-rc` 통과 |
| **PUSH_LIVE_SEND_OFF_DEFAULT** | `CLIENT_PORTAL_WEB_PUSH_LIVE_SEND` unset = OFF |
| **VAPID_OPTIONAL** | 구독 surface는 VAPID 없이도 준비; 실발송은 VAPID + live send 필요 |
| **METADATA_ONLY_PAYLOAD** | push payload · notification center — 본문/첨부 미포함 |
| **SECURE_PORTAL_LINK** | deep link `/client/cases/...` only |

## 5. PWA cache denylist (보안)

- SSOT: `client-portal-pwa.policy.ts` ↔ `public/client/sw.js`
- 금지: `/api/` · `/client/cases/` · shared-documents · messages · attachment · push API

## 6. Phase 20 cross-link

| Phase | 역할 |
| --- | --- |
| **20-F** | Real Messaging RC · secure delivery deep links |
| **20-E** | `buildSecureDeliveryPortalPath` → 21-A tab alias |
| **알림 흐름** | 카카오/이메일 링크 → `/client/cases/{id}?tab=` → mobile portal |

```bash
npm run verify:aibeopchin-real-messaging-rc   # 선행·회귀
```

## 7. 다음

Product Phase **22** Tenant / Plan / Metering

**버전** **`21-F.1`**
