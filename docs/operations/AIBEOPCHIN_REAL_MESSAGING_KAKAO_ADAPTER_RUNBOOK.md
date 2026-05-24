# Real Messaging Kakao Adapter Runbook (Product Phase **20-C**)

**한 줄**: 20-A adapter 계약 위 KAKAO 알림톡 provider를 연결하되, **승인된 templateCode**와 **allowlisted variables**만 사용하고, **동의·phone masking·response redaction** 후 ExternalMessageLog에 SENT/FAILED로 기록한다.

---

## 1. 범위 (20-C)

- `KAKAO_PROVIDER` env 분기 — `DRY_RUN` (default) · `ALIMTALK`
- **Kakao Alimtalk adapter** — registry · consent · transport
- **template code registry** — 승인 templateCode SSOT
- **template variables allowlist** — registry entry별 허용 키만
- **phone masking** · **consent guard** (`consentVerified === true` 필수)
- provider raw response **redaction**
- ExternalMessageLog **SENT/FAILED** (`KAKAO` → `KAKAO_ALIMTALK` channel mapping)
- **18-B** redelivery · **19-B** redaction 호환

## 2. SSOT

| 파일 | 역할 |
| --- | --- |
| `external-message-kakao-config.ts` | KAKAO_PROVIDER · BSP env |
| `external-message-kakao-template-registry.ts` | templateCode registry · variable allowlist |
| `external-message-kakao-consent-guard.ts` | Kakao consent guard |
| `external-message-kakao-message-builder.ts` | allowlisted variables · secure link |
| `external-message-kakao-alimtalk-transport.ts` | injectable BSP transport |
| `external-message-kakao-alimtalk-adapter.ts` | Alimtalk adapter |
| `external-message-log.service.ts` | SENT/FAILED · channel mapping |

## 3. 환경 변수

| 변수 | 설명 |
| --- | --- |
| `KAKAO_PROVIDER` | `DRY_RUN` (default) · `ALIMTALK` |
| `KAKAO_ALIMTALK_API_URL` | BSP HTTP endpoint |
| `KAKAO_ALIMTALK_API_KEY` | BSP API key |
| `KAKAO_ALIMTALK_SENDER_KEY` | 발신 프로필 sender key |
| `KAKAO_ALIMTALK_PLUS_FRIEND_ID` | 플러스친구 ID (optional) |

## 4. 금지 원칙 (20-B보다 엄격)

- registry 미등록 templateKey / templateCode 발송 금지
- allowlist 밖 template variable 금지
- `consentVerified !== true` 발송 금지
- 법률 본문·첨부·raw provider payload 저장 금지
- phone 원문 로그 금지

## 5. Crosswalk

| Phase | 문서 |
| --- | --- |
| **20-A** | [AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md) |
| **20-B** | [AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md) |
| **18-B** | [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) |
| **19-B** | [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](./AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) |
| **15-F** | secure document delivery · kakaoOptIn |

## 6. 검증

```bash
npm run verify:aibeopchin-real-messaging-phase20c
```

## 7. 다음

**20-D Webhook / Status Sync** — [AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md](./AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md)

**버전** **`20-C.1`**
