# Document Pipeline Recovery Runbook (Phase **18-C**)

**원칙**: **단계 보존형 안전 재개** — “재분석”이 아니라 실패한 단계만, 이미 성공한 단계는 건너뜁니다.

---

## 1. Flow

```
DocumentPipelineJob FAILED
  → RetryJob linkage (sourceType: DOCUMENT_PIPELINE)
  → stage safety policy
  → resumeFromStage
  → duplicate processing guard
  → operator POST recover
  → audit
```

## 2. API (ADMIN)

```bash
POST /api/admin/operations/document-pipeline-jobs/{id}/recover
```

Optional body:

```json
{ "operatorNote": "OCR timeout — resume from CLASSIFY" }
```

## 3. Safety rules

| Rule | 동작 |
| --- | --- |
| 원본 파일 재업로드 | **금지** — UPLOAD stage recovery 불가 |
| OCR/추출 성공 결과 | **덮어쓰기 금지** — EXTRACT skip |
| 분석 실패 | **해당 task만** 재시도 (ANALYZE 또는 OPPONENT_BRIEF) |
| 변호사 확정 (`LAWYER_CONFIRMED` / `LAWYER_CORRECTED`) | **자동 재분석 차단** |
| 의뢰인 공개/공유 문서 | **공개 상태 자동 변경 차단** |
| 중복 처리 | `duplicateGuardKey` = `{uploadedFileId}:{failedStage}` |
| 모든 재처리 | AuditLog `DOCUMENT_PIPELINE_OPERATOR_RECOVERED` |

## 4. Stage resume matrix

| failedStage | resumeFromStage (when prior stages OK) |
| --- | --- |
| EXTRACT (no text yet) | EXTRACT |
| EXTRACT (text exists) | CLASSIFY |
| CLASSIFY | CLASSIFY |
| ANALYZE | ANALYZE |
| OPPONENT_BRIEF | OPPONENT_BRIEF |

## 5. RetryJob sync

`/admin/operations/retry-jobs` 페이지 로드 시 `syncFailedDocumentPipelineJobs` (18-A 큐 연동)

## 6. Audit actions

- `DOCUMENT_PIPELINE_OPERATOR_RECOVERED` — success
- `DOCUMENT_PIPELINE_RECOVERY_FAILED` — stage execution error

## 7. 검증

```bash
npm run verify:aibeopchin-reliability-phase18c
```

**Scope keys (RC static gate)**: stage-preserving · no re-upload · no overwrite · duplicate guard · resumeFromStage · DOCUMENT_PIPELINE_OPERATOR_RECOVERED

**선행**: Phase **18-A** · **18-B**

**버전** **`18-C.1`**
