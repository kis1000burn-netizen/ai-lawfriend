# Real Messaging RC Runbook (Product Phase **20-F**)

**원칙**: Phase 20-F는 **새 기능 추가가 아니라** 20-A~E를 **하나의 배포 전 Real Messaging 게이트**로 묶는 RC 단계입니다.

---

## 1. 한 줄 기준

**ExternalMessageAdapter, Email/Kakao provider, webhook status sync, secure delivery integration, redelivery, redaction, consent gate를 하나의 Real Messaging RC로 묶어 배포 전 검증·운영 체크리스트·실발송 제한 기준을 잠근다.**

## 2. Static RC (배포 전 필수)

```bash
npm run verify:aibeopchin-real-messaging-rc
```

### 포함 검증

| Gate | 내용 |
| --- | --- |
| **20-A** | Adapter contract · dry-run · forbidden send rules |
| **20-B** | Email adapter · SMTP/SendGrid · allowlist · redaction |
| **20-C** | Kakao adapter · template registry · consent guard |
| **20-D** | Webhook signature · idempotency · delivery status sync |
| **20-E** | Secure delivery integration · consent · secure link |
| **18-B** | Safe redelivery compatibility · metadata only |
| **19-B** | Redaction compatibility · payloadSummaryJson |
| **15-F** | Secure delivery hooks · CaseDocumentDelivery |
| **20-F** | env example · operator checklist · limited live send policy |

## 3. Operator checklist (배포 전)

- [ ] `npm run verify:aibeopchin-real-messaging-rc` **PASS**
- [ ] `.env` — `EMAIL_PROVIDER=DRY_RUN` · `KAKAO_PROVIDER=DRY_RUN` (기본)
- [ ] live send **미사용** 시 `EXTERNAL_MESSAGE_LIVE_SEND_ENABLED` unset 또는 `false`
- [ ] webhook secret — staging/prod 각각 설정 (`EXTERNAL_MESSAGE_*_WEBHOOK_SECRET`)
- [ ] consent gate — 의뢰인 알림 preference 동작 확인
- [ ] secure link only — 법률 본문·첨부 원문 **미발송** 확인
- [ ] ExternalMessageLog — SENT/FAILED/SKIPPED 상태 기록 확인
- [ ] Phase 17 monitoring — external message failure triage 경로 확인
- [ ] Phase 18 retry-jobs — 18-B redelivery 경로 확인

## 4. Limited live send policy

**기본**: `DRY_RUN` only.

Live send 허용 조건 (모두 충족):

1. `verify:aibeopchin-real-messaging-rc` 통과
2. Provider 설정 (SMTP/SENDGRID/ALIMTALK)
3. Webhook secret 설정
4. Consent gate · secure link only 확인
5. Operator confirmation: `I ACKNOWLEDGE LIVE EXTERNAL MESSAGE SEND`
6. `EXTERNAL_MESSAGE_LIVE_SEND_ENABLED=true`
7. `EXTERNAL_MESSAGE_LIVE_SEND_RECIPIENT_ALLOWLIST` (쉼표 구분)

## 5. Operator flow (배포 후)

```
Phase 17 triage (/admin/operations/monitoring)
  → external message failure 확인
  → Phase 18 recovery (/admin/operations/retry-jobs)
  → 18-B safe redeliver (metadata only)
  → webhook status sync (20-D) → delivery VIEWED/SENT/FAILED
  → AuditLog 확인
```

## 6. Sub-phase runbooks

- [AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md) — **20-A**
- [AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md) — **20-B**
- [AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md) — **20-C**
- [AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md) — **20-D**
- [AIBEOPCHIN_REAL_MESSAGING_SECURE_DELIVERY_INTEGRATION_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_SECURE_DELIVERY_INTEGRATION_RUNBOOK.md) — **20-E**
- [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) — **18-B**
- [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](./AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) — **19-B**

## 7. Evidence

- `EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC`
- Sub-phase: 20-A~E evidence blocks in `IMPLEMENTATION_EVIDENCE.md`

## 8. 다음

**Product Phase 21** — Client Mobile / PWA Portal

**버전** **`20-F.1`**
