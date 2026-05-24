# Real Messaging Email Adapter Runbook (Product Phase **20-B**)

**한 줄**: Dry-run 계약 위 EMAIL provider를 연결하되, 법률 본문 원문 없이 **보안 링크 중심**으로 발송하고, provider 응답은 **redaction 후 ExternalMessageLog**에 SENT/FAILED로 기록한다.

---

## 1. 범위 (20-B)

- `EMAIL_PROVIDER` env 분기 — `DRY_RUN` · `SMTP` · `SENDGRID`
- **SMTP adapter** (1차) · SendGrid HTTP adapter (env 분기)
- Safe subject/body builder — portal link only · no legal body · no attachment
- templateKey **allowlist**
- recipient email **masking**
- provider raw response **redaction**
- ExternalMessageLog **SENT/FAILED** 기록 (`recordExternalMessageAdapterResult`)
- **18-B** redelivery · **19-B** redaction 호환

## 2. SSOT

| 파일 | 역할 |
| --- | --- |
| `external-message-email-config.ts` | EMAIL_PROVIDER · SMTP/SendGrid env |
| `external-message-email-template-allowlist.ts` | templateKey allowlist |
| `external-message-email-body-builder.ts` | safe subject/body |
| `external-message-provider-response-redaction.ts` | provider response redaction |
| `external-message-email-transport.ts` | injectable SMTP transport |
| `external-message-smtp-adapter.ts` | SMTP adapter |
| `external-message-sendgrid-adapter.ts` | SendGrid adapter |
| `external-message-log.service.ts` | ExternalMessageLog SENT/FAILED |
| `external-message-adapter.service.ts` | adapter registry · env bootstrap |

## 3. 환경 변수

| 변수 | 설명 |
| --- | --- |
| `EMAIL_PROVIDER` | `DRY_RUN` (default) · `SMTP` · `SENDGRID` |
| `SMTP_HOST` | SMTP host (SMTP 모드) |
| `SMTP_PORT` | SMTP port (default 587) |
| `SMTP_SECURE` | `true` for TLS |
| `SMTP_USER` / `SMTP_PASS` | SMTP auth (optional) |
| `SMTP_FROM_ADDRESS` | 발신 주소 |
| `SMTP_FROM_NAME` | 발신 이름 (default AI법친) |
| `SENDGRID_API_KEY` | SendGrid API key |
| `SENDGRID_FROM_ADDRESS` | SendGrid 발신 주소 |
| `SENDGRID_FROM_NAME` | SendGrid 발신 이름 |

**운영 기본값**: `EMAIL_PROVIDER=DRY_RUN` — 실발송 없이 20-A dry-run과 동일하게 안전.

## 4. 금지 원칙 (20-A 계승 + 20-B)

- 법률 본문·첨부 **이메일 본문에 포함 금지**
- allowlist 밖 templateKey 발송 금지
- provider raw response·recipient 원문 로그 금지
- failurePayload PII 금지

## 5. Crosswalk

| Phase | 문서 |
| --- | --- |
| **20-A** | [AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md) |
| **18-B** | [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) |
| **19-B** | [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](./AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) |
| **Product 20** | [AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md](../platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md) |

## 6. 검증

```bash
npm run verify:aibeopchin-real-messaging-phase20b
```

## 7. 다음

**20-C Kakao Adapter** — [AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md)

**버전** **`20-B.1`**
