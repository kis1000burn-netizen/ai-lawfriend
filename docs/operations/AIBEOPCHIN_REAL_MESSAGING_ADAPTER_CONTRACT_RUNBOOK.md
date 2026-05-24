# Real Messaging Adapter Contract Runbook (Product Phase **20-A**)

**한 줄**: 카카오·이메일 provider가 달라도 AI법친 내부는 **동일한 ExternalMessageAdapter 계약**으로 발송 요청·검증·결과 매핑·오류 분류·로그 기록을 처리한다.

---

## 1. 범위 (20-A)

- **실제 카카오/이메일 발송 없음** — dry-run adapter만
- External message channel · provider 표준화
- Adapter contract · result · error SSOT
- Template / idempotency 검증
- Recipient masking · raw response redaction 필드
- ExternalMessageLog 연동 **준비** (safe summary builder)
- **18-B** safe redelivery · **19-B** redaction 호환

## 2. SSOT

| 파일 | 역할 |
| --- | --- |
| `external-message-adapter.schema.ts` | channel · provider · payload |
| `external-message-adapter.contract.ts` | `ExternalMessageAdapter` |
| `external-message-adapter-result.ts` | provider result |
| `external-message-provider-error.ts` | error codes · redelivery flags |
| `external-message-channel-policy.ts` | forbidden send rules |
| `external-message-template-policy.ts` | template variables |
| `external-message-dry-run-adapter.ts` | DRY_RUN implementation |
| `external-message-adapter.service.ts` | orchestration · log safe summary |

## 3. 금지 원칙 (봉인)

- provider raw payload 원문 저장 금지
- 법률 본문 직접 발송 금지
- 첨부파일 직접 발송 기본 금지
- 동의 없는 외부 발송 금지
- templateKey / idempotencyKey 없는 발송 금지
- recipient 원문 로그 금지
- failurePayload PII 금지

## 4. Crosswalk

| Phase | 문서 |
| --- | --- |
| **18-B** | [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) |
| **19-B** | [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](./AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) |
| **15-F** | secure document delivery |
| **Product 20** | [AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md](../platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md) |

## 5. Operator confirmation phrase (20-F dry-run)

20-A에는 해당 없음. 19-F data governance dry-run과 별개.

## 6. 검증

```bash
npm run verify:aibeopchin-real-messaging-phase20a
```

## 7. 다음

**20-B Email Adapter** — [AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md)

**버전** **`20-A.1`**
