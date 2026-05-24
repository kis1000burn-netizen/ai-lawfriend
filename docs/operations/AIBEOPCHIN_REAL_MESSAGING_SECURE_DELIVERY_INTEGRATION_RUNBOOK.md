# Real Messaging Secure Delivery Integration Runbook (Product Phase **20-E**)

**한 줄**: 15-F의 보안 문서 전달·보완요청·기일 알림·포털 메시지를 20-A~D 실 메시징 계층에 연결하되, consent gate·secure link·view audit·ExternalMessageLog·webhook status sync가 하나의 안전한 전달 흐름으로 이어지게 한다.

---

## 1. 범위 (20-E)

| 흐름 | 진입점 | ExternalMessageLog |
| --- | --- | --- |
| CaseDocumentDelivery | `dispatchCaseDocumentDeliveryNotification` | deliveryId 연결 |
| SupplementRequest SENT | `notifySupplementRequestSent` | requestId idempotency |
| Court deadline reminder | `notifyCourtDeadlineReminder` | notificationId idempotency |
| Client portal message | `notifyClientPortalMessage` | messageId idempotency |

### 잠금 원칙

- **secure portal link만** 발송 (법률 본문·첨부 원문 금지)
- **consent gate** 통과 필수 (`documentShareNoticeEnabled` · `litigationDeadlineReminderEnabled` · kakao/email opt-in)
- **delivery view audit** — 15-F `markDeliveryViewed` + `auditSharedDocumentViewed`
- **webhook status** → CaseDocumentDelivery SENT / FAILED / VIEWED (20-D `prepCaseDocumentDeliveryFromWebhook`)
- **18-B** redelivery 대상화 (`evaluateSecureDeliveryRedeliveryEligibility`)
- **19-B** redaction 유지 (`redactExternalMessagePayload` · safe summary only)

## 2. SSOT

| 파일 | 역할 |
| --- | --- |
| `secure-delivery-message-policy.ts` | consent · safe-link policy |
| `secure-delivery-message-builder.ts` | surface → template · portal path · payload |
| `secure-delivery-message.service.ts` | dispatch orchestration · AuditLog |
| `case-document-delivery-notification.service.ts` | CaseDocumentDelivery wrapper |
| `client-portal-notification.service.ts` | supplement · deadline · message notify |

## 3. Surface → Template

| Surface | templateKey | Portal tab |
| --- | --- | --- |
| DOCUMENT_DELIVERY | `CLIENT_DOC_SHARE_V1` | `?tab=shared` |
| SUPPLEMENT_REQUEST | `SUPPLEMENT_REQUEST_V1` | `?tab=supplement` |
| COURT_DEADLINE_REMINDER | `COURT_DEADLINE_REMINDER_V1` | `?tab=deadlines` |
| CLIENT_PORTAL_MESSAGE | `CLIENT_PORTAL_MESSAGE_V1` | `?tab=messages` |

## 4. Audit

- `SECURE_DELIVERY_EXTERNAL_MESSAGE_DISPATCH` — metadata only
- 15-F delivery audit — `auditDocumentDeliverySent` · `auditDocumentDeliverySkipped`

## 5. Crosswalk

| Phase | 문서 |
| --- | --- |
| **15-F** | secure document delivery service |
| **20-A~D** | adapter · email · kakao · webhook runbooks |
| **18-B** | [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) |
| **19-B** | [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](./AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) |

## 6. 검증

```bash
npm run verify:aibeopchin-real-messaging-phase20e
```

## 7. 다음

**20-F Real Messaging RC** — bundled verify · operator checklist (완료)

**Product Phase 21** — Client Mobile / PWA Portal

**버전** **`20-E.1`**
