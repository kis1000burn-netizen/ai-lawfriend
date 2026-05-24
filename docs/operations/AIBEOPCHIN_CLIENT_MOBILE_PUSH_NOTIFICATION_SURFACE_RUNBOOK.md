# Client Mobile Push Notification Surface Runbook (Product Phase **21-D**)

**한 줄**: 의뢰인 모바일/PWA 포털에서 알림 권한·구독 상태·알림함 surface를 준비하되, 실제 push 발송은 consent·template·redaction·Phase 20 messaging 정책과 연결된 뒤 제한적으로 연다.

---

## 1. 범위 (21-D)

| 항목 | 산출물 |
| --- | --- |
| Permission 상태 | `ClientPortalPushNotificationPanel` — `Notification.permission` 표시 |
| Push subscription API | `POST/DELETE /api/client/push-subscriptions` |
| Notification preference | `GET/PATCH /api/client/notification-preferences` · `webPushOptIn` |
| 알림함 surface | `GET /api/client/notifications` · `ClientPortalNotificationCenter` |
| Phase 20 연결 | `ExternalMessageLog` + IN_APP center entry on portal notify |
| Push payload 정책 | metadata-only · secure portal link · forbidden keys |
| SW push skeleton | `public/client/sw.js` — `push` · `notificationclick` |
| Live send gate | `CLIENT_PORTAL_WEB_PUSH_LIVE_SEND` — **기본 OFF** |

## 2. 보안 · payload

| 원칙 | 구현 |
| --- | --- |
| 민감 본문 금지 | `CLIENT_PORTAL_PUSH_FORBIDDEN_PAYLOAD_KEYS` |
| secure link 중심 | `buildClientPortalPushPayload()` → `/client/cases/...` only |
| API cache 금지 | 21-C cache denylist + push API paths |
| consent | `webPushOptIn` + browser permission |

SSOT: `client-portal-push-notification.policy.ts`

## 3. Operator / env

| 변수 | 기본 | 설명 |
| --- | --- | --- |
| `CLIENT_PORTAL_WEB_PUSH_LIVE_SEND` | unset (=OFF) | `true`일 때만 실발송 준비 경로 활성 |
| `CLIENT_PORTAL_VAPID_PUBLIC_KEY` | unset | 브라우저 구독용 public key |
| `NEXT_PUBLIC_FF_CLIENT_PORTAL_PUSH_SURFACE` | ON | `false`면 surface UI 비활성 |

**주의**: VAPID 미설정 시에도 알림함·preference·구독 intent는 동작. 실 push는 live send + VAPID + provider 후속.

## 4. Crosswalk

| Phase | 문서 |
| --- | --- |
| **21-C** | [AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md) |
| **20-E/F** | Secure delivery · Real Messaging RC |
| **21-E** | Mobile Accessibility / Low-end Device Smoke (다음) |

## 5. 검증

```bash
npm run verify:aibeopchin-client-mobile-phase21d
npm run verify:aibeopchin-client-mobile-phase21c   # 회귀
npm run verify:aibeopchin-real-messaging-rc          # Phase 20 선행
```

## 6. 다음

**21-E Mobile Accessibility / Low-end Device Smoke** (완료)

**21-F Client Mobile / PWA RC** (완료)

**Product Phase 22** Tenant / Plan / Metering (다음)

**버전** **`21-D.1`**
