# Data Redaction Runbook (Phase **19-B**)

**원칙**: PII·법률 민감 데이터는 **표시·export·audit·failurePayload·AI metadata** 경로에서 원문 노출되지 않도록 **19-A registry tier** 기반 redaction 정책으로 통제한다.

---

## 1. 한 줄 기준

**19-A 헌법을 실제 운영 출력 경로에 적용** — 마스킹 함수 몇 개가 아니라 output-path registry + service + validator.

## 2. Output paths

| Path | Source model | Surfaces |
| --- | --- | --- |
| `AUDIT_LOG_METADATA` | AuditLog | DISPLAY · EXPORT · AUDIT_PERSIST |
| `RETRY_JOB_FAILURE_PAYLOAD` | RetryJob | OPERATIONS_PAYLOAD |
| `EXTERNAL_MESSAGE_PAYLOAD` | ExternalMessageLog | OPERATIONS_PAYLOAD |
| `DOCUMENT_PIPELINE_FAILURE_PAYLOAD` | DocumentPipelineJob | OPERATIONS_PAYLOAD |
| `AI_AUDIT_METADATA` | AuditLog (AI) | AUDIT_PERSIST |
| `CASE_INTELLIGENCE_SNAPSHOT` | CaseIntelligenceSnapshot | EXPORT |
| `LITIGATION_EXTRACTED_TEXT` | LitigationExtractedText | EXPORT |
| `VOICE_TRANSCRIPT_TEXT` | VoiceTranscript | DISPLAY |

## 3. Integration choke points

- `writeAuditLog` — metadata redact on persist
- `audit-log.service` — list · detail · XLSX export
- `retry-job.service` — `failurePayload` on persist
- `external-message-redelivery.service` — `payloadSummaryJson`
- `ai-audit.ts` · `case-summary-audit.ts` — public-safe + redaction
- `voice-ops.service` — ops API serialize

## 4. Audience

| Audience | Behavior |
| --- | --- |
| `OPERATIONS` | Full redaction policy (default) |
| `LEGAL_WORKSPACE` | Extracted text · intelligence snapshot skip ops redaction |
| `CLIENT` | 10-C client-safe layer (separate) |

## 5. SSOT

- Registry: `src/lib/data-governance/data-redaction-policy.registry.ts`
- Service: `src/lib/data-governance/data-redaction.service.ts`
- Validator: `src/lib/data-governance/data-redaction.validator.ts`
- 선행: Phase **19-A** retention constitution

## 6. 검증

```bash
npm run verify:aibeopchin-data-governance-phase19b
```

**Scope keys**: registry tier · output path · AUDIT_PERSIST · OPERATIONS_PAYLOAD · forbidden raw keys

## 7. Product Phase 20 cross-link

- ExternalMessageLog `payloadSummaryJson` — 20-A~E adapter · webhook · secure delivery
- Real Messaging RC: `npm run verify:aibeopchin-real-messaging-rc` (20-F bundled)

**버전** **`19-B.1`**
