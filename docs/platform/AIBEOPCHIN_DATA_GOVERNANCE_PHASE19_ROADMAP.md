# AI법친 Phase 19 — Data Governance / Retention / Privacy Roadmap

**핵심**: 운영 중 쌓이는 **민감 데이터·로그·첨부·AI 사용 기록**을 분류하고, **보존·삭제·마스킹·감사**를 SSOT로 통제한다.

**한 줄 기준**: 운영 중 쌓이는 민감 데이터·로그·첨부·AI 사용 기록을 분류하고, 보존·삭제·마스킹·감사를 안전 정책 SSOT로 통제한다.

**선행**: Phase **18-E** Reliability RC · Phase **17** Operations Monitoring

---

## 19-B — PII / Legal Sensitive Redaction

| 항목 | 내용 |
| --- | --- |
| 목적 | 19-A tier → **운영 출력 경로** redaction (display · export · audit · ops payload) |
| SSOT | `data-redaction-policy.registry.ts` · `data-redaction.service.ts` |
| Verify | `npm run verify:aibeopchin-data-governance-phase19b` |
| Runbook | [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](../operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) |

**선행**: 19-A

---

## 19-A — Data Retention Policy (헌법 · **완료**)

| 항목 | 내용 |
| --- | --- |
| 목적 | **purge job 이전** 데이터 분류·보존·purge eligibility SSOT 잠금 |
| SSOT | `src/lib/data-governance/data-retention-policy.registry.ts` |
| Schema | `src/lib/data-governance/data-retention-policy.schema.ts` |
| Verify | `npm run verify:aibeopchin-data-governance-phase19a` |
| 원칙 | **실제 purge job 금지** — registry·validator만 (헌법) |

**앵커 crosswalk**: Voice 5-I · case-package expiry · secure delivery · supplement masked audit · client-safe 10-C

---

## 19-B — PII / Legal Sensitive Redaction

- 표시·export·metadata redaction allowlist
- `illegal-lending-mask`, case-package serializer 패턴 일반화
- **선행**: 19-A tier 분류

---

## 19-C — AuditLog Retention & Export

- **한 줄**: AuditLog는 운영 감사 핵심 증거 — 보존·export 권한·마스킹·다운로드 감사 정책 통제
- `audit-log-retention-policy.ts` · `audit-log-export-policy.ts` · `audit-log-export-redaction.service.ts`
- XLSX export → `AUDIT_LOG_XLSX_EXPORTED` AuditLog (누가 export했는지)
- Runbook: `docs/operations/AIBEOPCHIN_AUDIT_LOG_RETENTION_EXPORT_RUNBOOK.md`
- **검증**: `npm run verify:aibeopchin-data-governance-phase19c`
- **선행**: 19-A · 19-B

---

## 19-D — Attachment Lifecycle / Expiry

- **한 줄**: 첨부·추출본문·공유문서·보안전달 링크 — 만료·보존·삭제 가능성 분리 통제
- `attachment-lifecycle-policy.ts` · `attachment-lifecycle-orphan-detection.service.ts`
- 대상: LitigationUploadedFile · LitigationExtractedText · CaseSharedDocument · CaseDocumentDelivery · CasePackageShare · ExternalMessageLog secure link · storage orphan
- **purge/delete 실행 잠금** — eligibility + orphan + legal hold만 (job은 19-F)
- Runbook: `docs/operations/AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md`
- **검증**: `npm run verify:aibeopchin-data-governance-phase19d`
- **선행**: 19-A

---

## 19-E — Admin Data Governance Visibility

- **한 줄**: 19-A~D policy 결과를 Admin 화면에 read-only 표시 — purge 전 운영자 triage
- `/admin/operations/data-governance` · `data-governance-visibility.service.ts`
- 삭제·만료·공유·ExternalMessageLog retention·orphan dry-run·legal hold 차단 사유
- **실행 버튼 비활성** — purge/delete/blob reclaim은 19-F RC
- Runbook: `docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_VISIBILITY_RUNBOOK.md`
- **검증**: `npm run verify:aibeopchin-data-governance-phase19e`
- **선행**: 19-A · 19-D

---

## 19-E (후속) — AI Usage Log Privacy Guard

- AI audit metadata · governance meter · public-safe strip 강화
- **선행**: 19-A · 19-B
- Admin Visibility(위) 완료 후 병행 또는 19-F 전

---

## 19-F — Data Governance RC / Purge Execution Unlock

- **한 줄**: 19-A~E bundled RC · purge unlock 8 gate · **dry-run 기본**
- `verify:aibeopchin-data-governance-rc` (19-A~E sub-verify bundle)
- Preview · legal hold recheck · dry-run export · confirmation phrase · audit log · limited flag · rollback warning
- Runbook: `docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md` · `AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md`
- **실제 purge/delete/blob reclaim 미실행** — `actualExecutionPerformed: false`
- **선행**: 19-A~E · Phase 18-E Reliability RC

---

## Operator cross-link

| Phase | 역할 |
| --- | --- |
| **17** | 무엇이 쌓였는가 (Phase 17 monitoring triage) |
| **18** | 실패 후 어떻게 복구할 것인가 (Phase 18 recovery) |
| **19** | 쌓인 데이터를 어떻게 보관·삭제·마스킹할 것인가 |

**버전** **`19-A.1`**
