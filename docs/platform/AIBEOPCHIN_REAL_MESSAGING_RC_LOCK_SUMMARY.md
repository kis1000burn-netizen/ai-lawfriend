# Real Messaging RC Lock Summary — Product Phase **20-F**

**상태**: Product Phase **20-F** — **Real Messaging RC LOCKED** (static RC gate · live send DRY_RUN default)

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC]`**

**선행**: Phase **15-F** Secure Delivery · Phase **18-B** Redelivery · Phase **19-B** Redaction · Product **20-A~E**

## 1. 한 줄 기준

**ExternalMessageAdapter, Email/Kakao provider, webhook status sync, secure delivery integration, redelivery, redaction, consent gate를 하나의 Real Messaging RC로 묶어 배포 전 검증·운영 체크리스트·실발송 제한 기준을 잠근다.**

## 2. Sub-phases

| Phase | 이름 | 산출물 |
| --- | --- | --- |
| **20-A** | External Message Adapter Contract | dry-run · channel policy · safe summary |
| **20-B** | Email Adapter | SMTP/SendGrid · ExternalMessageLog |
| **20-C** | Kakao Adapter | Alimtalk registry · consent guard |
| **20-D** | Provider Webhook / Status Sync | signature · idempotency · delivery sync |
| **20-E** | Secure Delivery Integration | 15-F hooks · consent · secure link |
| **20-F** | Real Messaging RC | `verify:aibeopchin-real-messaging-rc` |

## 3. Bundled verify (배포 전 필수)

```bash
npm run verify:aibeopchin-real-messaging-rc
```

내부적으로 **20-A~E** sub-verify + runbook/evidence + **15-F / 18-B / 19-B** compatibility + env example + live send policy gates.

## 4. Limited live send policy (기본 DRY_RUN)

| Gate | 설명 |
| --- | --- |
| **BUNDLED_RC_VERIFY** | `verify:aibeopchin-real-messaging-rc` 통과 |
| **DRY_RUN_DEFAULT** | EMAIL/KAKAO provider 기본 DRY_RUN |
| **PROVIDER_CONFIG_READY** | SMTP/SENDGRID/ALIMTALK 설정 |
| **WEBHOOK_SECRET_CONFIGURED** | email/kakao webhook secret |
| **CONSENT_GATE_ACK** | consent gate · secure link only |
| **OPERATOR_CONFIRMATION** | `I ACKNOWLEDGE LIVE EXTERNAL MESSAGE SEND` |
| **LIMITED_LIVE_SEND_FLAG** | `EXTERNAL_MESSAGE_LIVE_SEND_ENABLED=true` |
| **RECIPIENT_ALLOWLIST** | `EXTERNAL_MESSAGE_LIVE_SEND_RECIPIENT_ALLOWLIST` |

**기본**: `DRY_RUN` — live provider send **차단**.

## 5. Cross-link

| Phase | 역할 | 경로·verify |
| --- | --- | --- |
| **15-F** | Secure delivery | `secure-document-delivery.service.ts` |
| **18-B** | Safe redelivery | `/admin/operations/retry-jobs` · `verify:aibeopchin-reliability-rc` |
| **19-B** | Redaction | `payloadSummaryJson` · `verify:aibeopchin-data-governance-rc` |
| **17** | Ops triage | `/admin/operations/monitoring` |

## 6. Operator flow

```
Phase 17 triage (monitoring)
  → Phase 18 retry-jobs (18-B redeliver)
  → Phase 20 secure delivery dispatch (consent · link only)
  → ExternalMessageLog + webhook sync (20-D)
  → AuditLog 확인
```

## 7. Product Phase 21 (완료 · RC)

- Roadmap: [AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md](./AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md) §21 — Client Mobile / PWA
- **21-F** RC: `npm run verify:aibeopchin-client-mobile-rc`
- 20-E secure delivery deep links → 21-A mobile portal tab alias

**버전** **`20-F.1`** (Product 21 **`21-F.1`**)
