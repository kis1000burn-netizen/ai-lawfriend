# Data Governance Admin Visibility Runbook (Phase **19-E**)

**원칙**: 실제 purge를 열기 **전에** 운영자가 삭제·만료·legal hold·orphan 후보를 **조회**할 수 있어야 한다.

---

## 1. 한 줄 기준

19-A~D policy 결과를 **Admin Data Governance 화면**에 read-only로 표시. **purge/delete/blob reclaim 실행은 19-F RC 전까지 UI·job 모두 비활성.**

## 2. Admin 경로

| 항목 | 경로 |
| --- | --- |
| Console | `/admin/operations/data-governance` |
| Snapshot API | `GET /api/admin/operations/data-governance-snapshot` |
| 권한 | **ADMIN** / **SUPER_ADMIN** only |

## 3. 표시 항목

| 섹션 | 19-D policy | 운영자 관점 |
| --- | --- | --- |
| LitigationUploadedFile | `evaluateLitigationUploadedFileLifecycleEligibility` | 삭제/보존 후보 · legal hold |
| LitigationExtractedText | `evaluateLitigationExtractedTextLifecycleEligibility` | 추출본문 후보 |
| CaseSharedDocument | `evaluateCaseSharedDocumentExpiryEligibility` | 공유 만료 |
| CaseDocumentDelivery | `evaluateCaseDocumentDeliveryExpiryEligibility` | secure link 만료 |
| CasePackageShare | `evaluateCasePackageShareExpiryEligibility` | 패키지 공유 만료 |
| ExternalMessageLog | `evaluateExternalMessageLogSecureLinkEligibility` | 180d retention · metadata |
| Storage orphan | `detectLitigationStorageOrphanCandidates` | disk↔DB dry-run |

각 row에 **blocked reason** (legal hold · CASE_NOT_CLOSED · PURGE_EXECUTION_LOCKED 등) 표시.

## 4. 실행 잠금

- UI: Purge / Delete / Blob reclaim 버튼 **disabled** (`DATA_GOVERNANCE_PURGE_EXECUTION_UI_LOCKED_PHASE19E`)
- Backend: 19-A · 19-C · 19-D purge lock flags snapshot에 노출
- **19-F RC**에서 unlock 후 job·버튼 연결

## 5. SSOT

- `src/features/data-governance/data-governance-rc-lock.ts`
- `src/features/data-governance/data-governance-visibility.service.ts`
- `src/components/admin/operations/data-governance-console.tsx`

## 6. 선행

- Phase **19-A** · **19-D** (19-C AuditLog export policy는 cross-link)

## 7. 검증

```bash
npm run verify:aibeopchin-data-governance-phase19e
```

**버전** **`19-E.1`**
