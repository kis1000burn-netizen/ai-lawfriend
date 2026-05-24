# Attachment Lifecycle / Expiry Runbook (Phase **19-D**)

**원칙**: 첨부파일·추출본문·공유문서·보안전달 링크는 **사건 보존 정책과 공개/공유 상태**를 기준으로 **만료·보존·삭제 가능성**을 분리해 통제한다.

---

## 1. 한 줄 기준

19-A tier + 기존 runtime expiry 차단 위에 **eligibility · orphan detection · legal hold guard** SSOT. **실제 purge/delete/blob reclaim은 Phase 19-F RC 이후.**

## 2. 대상 모델

| 모델 | disposition (19-A) | 19-D 판정 |
| --- | --- | --- |
| **LitigationUploadedFile** | RETAIN_CASE_LIFECYCLE | case closed + legal hold guard + blob orphan |
| **LitigationExtractedText** | RETAIN_CASE_LIFECYCLE | uploaded file reference + legal hold |
| **CaseSharedDocument** | RETAIN_UNTIL_EXPIRY | `expiresAt` · shareStatus effective |
| **CaseDocumentDelivery** | RETAIN_UNTIL_EXPIRY | `tokenExpiresAt` |
| **CasePackageShare** | RETAIN_UNTIL_EXPIRY | `expiresAt` · REVOKED/EXPIRED |
| **ExternalMessageLog** | PURGE_AFTER_RETENTION (180d) | secure link metadata (`portalPath` + `metadataOnly`) |
| **Storage orphan** | — | disk↔DB mismatch detection (dry-run) |

## 3. 잠금 항목

| 항목 | SSOT | 동작 |
| --- | --- | --- |
| Expiry eligibility | `attachment-lifecycle-policy.ts` | 만료/보존/삭제 **가능 여부만** 판정 |
| Legal hold guard | `guardAttachmentLifecycleLegalHold()` | hold 시 PURGE/DELETE/BLOB_RECLAIM 차단 |
| Orphan detection | `attachment-lifecycle-orphan-detection.service.ts` | DISK_WITHOUT_DB · DB_WITHOUT_DISK 후보 |
| Purge/delete execution | `ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D` | **true** — 19-F까지 job 없음 |

## 4. Runtime crosswalk (기존)

| 영역 | 기존 SSOT | 19-D 연동 |
| --- | --- | --- |
| Case package share | `case-package-share-policy-utils.ts` | `evaluateCasePackageShareExpiryEligibility` |
| Secure document delivery | `secure-document-delivery.service.ts` | `resolveCaseSharedDocumentEffectiveStatus` |
| Litigation blob I/O | `document-intelligence.storage.ts` | orphan detection root segment |
| External message | `external-message-redelivery.schema.ts` | secure link metadata keys |

## 5. Purge / Delete

`ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D = true`

- eligibility 함수는 cutoff·expiry·registry를 평가
- lock이 켜져 있으면 **실행 가능(eligible=true) 결과도 PURGE_EXECUTION_LOCKED로 덮음**
- 19-F RC에서 unlock 후 cron/job 연결

## 6. SSOT 파일

- `src/lib/data-governance/attachment-lifecycle-policy.ts`
- `src/lib/data-governance/attachment-lifecycle-orphan-detection.service.ts`
- `src/lib/data-governance/attachment-lifecycle.validator.ts`

## 7. 선행

- Phase **19-A** Data Retention Policy

## 8. 검증

```bash
npm run verify:aibeopchin-data-governance-phase19d
```

**버전** **`19-D.1`**
