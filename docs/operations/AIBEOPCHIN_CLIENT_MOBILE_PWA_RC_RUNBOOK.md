# Client Mobile / PWA RC Runbook (Product Phase **21-F**)

**원칙**: Phase 21-F는 **새 기능 추가가 아니라** 21-A~E를 **하나의 배포 전 모바일/PWA RC 게이트**로 묶는 단계입니다.

---

## 1. 한 줄 기준

**모바일 의뢰인 포털, 업로드 UX, PWA 설치, push-ready surface, 접근성·저사양 smoke를 하나의 Client Mobile / PWA RC로 묶어 배포 전 검증·운영 runbook·보안 cache 정책을 잠근다.**

## 2. Static RC (배포 전 필수)

```bash
npm run verify:aibeopchin-client-mobile-rc
```

### 포함 검증

| Gate | 내용 |
| --- | --- |
| **21-A** | mobile layout · Phase 20 deep link alias · bottom nav |
| **21-B** | camera upload · progress · retry · departure warning |
| **21-C** | manifest · SW · offline · last visit restore |
| **21-D** | push subscription API · notification center · Phase 20 IN_APP link |
| **21-E** | a11y smoke · touch target · slow network UX |
| **21-F** | bundled verify · evidence · env example · cache denylist sync |
| **20-F** | Real Messaging RC prerequisite · secure delivery deep link regression |
| **Push** | `CLIENT_PORTAL_WEB_PUSH_LIVE_SEND` default **push live send OFF** |

## 3. Operator checklist (배포 전)

- [ ] `npm run verify:aibeopchin-client-mobile-rc` PASS
- [ ] `npm run verify:aibeopchin-real-messaging-rc` PASS (Phase 20 선행)
- [ ] `CLIENT_PORTAL_WEB_PUSH_LIVE_SEND` unset 또는 `false` (실 push 미개방)
- [ ] PWA SW denylist에 API·사건본문·첨부 경로 포함 확인
- [ ] Staging에서 `/client/cases` · 업로드 · offline fallback smoke

## 4. Sub-phase runbooks

- [AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md) — **21-A**
- [AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md) — **21-B**
- [AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md) — **21-C**
- [AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md) — **21-D**
- [AIBEOPCHIN_CLIENT_MOBILE_ACCESSIBILITY_SMOKE_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_ACCESSIBILITY_SMOKE_RUNBOOK.md) — **21-E**

## 5. Phase 20 Real Messaging (cross-link)

- RC lock: [AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md](../platform/AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md)
- Verify: `npm run verify:aibeopchin-real-messaging-rc`
- Deep link SSOT: `client-portal-mobile.policy.ts` + `secure-delivery-message-builder.ts`

## 6. Env (push surface · live send gate)

| 변수 | 기본 | 설명 |
| --- | --- | --- |
| `CLIENT_PORTAL_WEB_PUSH_LIVE_SEND` | OFF | `true`일 때만 실 push 발송 준비 |
| `CLIENT_PORTAL_VAPID_PUBLIC_KEY` | unset | 브라우저 구독용 public key |
| `NEXT_PUBLIC_FF_CLIENT_PORTAL_PUSH_SURFACE` | ON | `false`면 push UI surface 비활성 |

## 7. Evidence

- `EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC`
- Sub-phase: 21-A ~ 21-E evidence blocks in `IMPLEMENTATION_EVIDENCE.md`

**버전** **`21-F.1`**
