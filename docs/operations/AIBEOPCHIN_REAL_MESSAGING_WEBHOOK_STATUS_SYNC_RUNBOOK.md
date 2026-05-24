# Real Messaging Webhook / Status Sync Runbook (Product Phase **20-D**)

**한 줄**: 이메일·카카오 provider의 delivery callback/webhook을 **metadata only**로 수신하고, signature·idempotency·status mapping·redaction을 거쳐 ExternalMessageLog와 delivery 상태를 안전하게 동기화한다.

---

## 1. 범위 (20-D)

- Webhook signature 검증 (`EXTERNAL_MESSAGE_*_WEBHOOK_SECRET`)
- `providerMessageId` 기준 log lookup · `providerEventId` idempotency
- SENT / DELIVERED / FAILED / BOUNCED / REJECTED / READ 매핑
- raw webhook payload 저장 **금지**
- recipient phone/email 원문 저장 **금지**
- ExternalMessageLog 상태 업데이트
- CaseDocumentDelivery 상태 **연결 준비** (SENT · FAILED · VIEWED)
- AuditLog `EXTERNAL_MESSAGE_WEBHOOK_STATUS_SYNC`
- **18-B** redelivery eligibility 재평가

## 2. SSOT

| 파일 | 역할 |
| --- | --- |
| `external-message-webhook.schema.ts` | event schema · parser |
| `external-message-webhook-signature.ts` | HMAC signature |
| `external-message-webhook-status-mapper.ts` | status mapping |
| `external-message-webhook.service.ts` | sync orchestration |
| `api/webhooks/external-messages/email/route.ts` | email webhook ingress |
| `api/webhooks/external-messages/kakao/route.ts` | kakao webhook ingress |

## 3. 환경 변수

| 변수 | 설명 |
| --- | --- |
| `EXTERNAL_MESSAGE_EMAIL_WEBHOOK_SECRET` | Email webhook HMAC secret |
| `EXTERNAL_MESSAGE_KAKAO_WEBHOOK_SECRET` | Kakao webhook HMAC secret |
| `EXTERNAL_MESSAGE_WEBHOOK_AUDIT_ACTOR_USER_ID` | AuditLog system actor user id |

## 4. API

| Method | Path |
| --- | --- |
| POST | `/api/webhooks/external-messages/email` |
| POST | `/api/webhooks/external-messages/kakao` |

Header: `x-webhook-signature` (HMAC-SHA256 hex)

## 5. Crosswalk

| Phase | 문서 |
| --- | --- |
| **20-A~C** | adapter · email · kakao runbooks |
| **18-B** | [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) |
| **19-B** | [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](./AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) |
| **15-F** | secure document delivery |

## 6. 검증

```bash
npm run verify:aibeopchin-real-messaging-phase20d
```

## 7. 다음

**20-E Secure Delivery Integration** — 15-F secure link · consent gate · view audit wiring (완료)

**20-F Real Messaging RC**

**버전** **`20-D.1`**
