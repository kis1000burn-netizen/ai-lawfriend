# AI법친 Upload File Analysis Pipeline (Phase **13‑B** / **13‑C**)

**상태**: Phase **13‑B** (추출) · **13‑C** (분류) — **13‑A Spec Lock 하위 SSOT**

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13B-UPLOAD-FILE-ANALYSIS-PIPELINE-SPEC]`**

**상위 Spec**: [AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md](./AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md)

## 1. 목적

업로드된 PDF·이미지·HWP·DOCX·XLSX·ZIP 등 **원본을 보존**하면서, AI 분석 가능한 **페이지 단위 텍스트 + 품질 메타**를 생성한다.

법률 플랫폼에서 AI는 “그럴듯하게 요약”하면 안 됩니다. **원문 위치 추적**이 선행되어야 합니다.

## 2. 파이프라인 단계

```
[Upload] → [Store Original] → [Extract Text/OCR] → [Page Split] → [Quality Score]
    → [LEGAL_FILE_CLASSIFY] → [Analysis Eligibility] → [Queue for 13-D+]
```

| 단계 | taskType | 산출 |
| --- | --- | --- |
| 원본 저장 | — | `LitigationUploadedFile` (immutable blob ref) |
| 텍스트 추출 | `LEGAL_TEXT_EXTRACT_VALIDATE` | `LitigationExtractedText` |
| 문서 분류 | `LEGAL_FILE_CLASSIFY` | `documentType`, `partySource`, `sensitivity` |
| 분석 가능 판정 | — | `analysisEligibility`, `blockingReasons[]` |

## 3. 원본 저장 (13‑B)

### 3.1 `LitigationUploadedFile`

| 필드 | 설명 |
| --- | --- |
| `id` | PK |
| `caseId` | 사건 |
| `caseAttachmentId` | 기존 `CaseAttachment` FK (마이그레이션 경로) |
| `originalName` | 업로드 파일명 |
| `mimeType` | MIME |
| `sizeBytes` | 크기 |
| `storageKey` | 불변 저장 경로 |
| `uploadedByUserId` | 업로더 |
| `sha256` | 무결성 |
| `createdAt` | 업로드 시각 |

**원칙**: 원본 파일은 **변경·덮어쓰기 금지**. 재분석은 새 extraction revision.

### 3.2 지원 포맷 (목표)

| 포맷 | 처리 |
| --- | --- |
| PDF (텍스트) | native text extract |
| PDF (스캔) | OCR |
| JPG/PNG | OCR |
| DOCX/DOC | text extract |
| XLSX | sheet/cell extract |
| HWP | converter + extract (provider TBD) |
| ZIP | 내부 파일 재귀 ingest |

현행 `CaseAttachment` 제한(PDF/이미지/DOCX, 10MB)은 **13‑B**에서 단계적 확장.

## 4. OCR · 텍스트 추출 (13‑B)

### 4.1 `LitigationExtractedText`

| 필드 | 설명 |
| --- | --- |
| `uploadedFileId` | FK |
| `revision` | 재추출 버전 |
| `extractionMethod` | `NATIVE` · `OCR` · `HYBRID` |
| `pageCount` | 총 페이지 |
| `pages[]` | `{ pageNumber, text, ocrConfidence?, bboxRegions? }` |
| `fullText` | 검색용 flat (optional) |
| `qualityScore` | 0〜1 분석 가능성 |
| `qualityFlags[]` | `BLUR` · `MISSING_PAGES` · `LOW_RES` · `ENCRYPTED` · `PARTIAL_OCR` |
| `extractedAt` | 시각 |

### 4.2 품질 점수 기준

| 신호 | 영향 |
| --- | --- |
| OCR confidence 평균 | 가중 |
| 빈 페이지 비율 | 감점 |
| 암호화/잠금 | `analysisEligibility: BLOCKED` |
| 흐림·저화질 | `LOW` confidence 상한 |

### 4.3 Citation 기반

모든 후속 분석 citation은 **`pageNumber` + `paragraphIndex` + `charOffset`** (optional)로 `LitigationExtractedText.pages`에 역참조.

예시 표기:

```
분석 근거:
- 피고 답변서 3쪽 2문단
- 을 제1호증 언급 부분
- 변론기일통지서 본문 중 기일 기재 부분
```

## 5. 문서 유형 자동 분류 (13‑C)

### 5.1 taskType: `LEGAL_FILE_CLASSIFY`

AI가 **먼저** 문서 유형을 분류해야 후속 분석 라우팅이 가능합니다.

| 업로드 예시 | AI `documentType` |
| --- | --- |
| 피고답변서.pdf | `OPPONENT_ANSWER` |
| 준비서면.pdf | `OPPONENT_BRIEF` |
| 보정명령.pdf | `COURT_CORRECTION_ORDER` |
| 변론기일통지서.pdf | `COURT_HEARING_NOTICE` |
| 계좌내역.pdf | `FINANCIAL_EVIDENCE` |
| 카카오톡 캡처.zip | `MESSAGING_EVIDENCE` |
| 계약서.pdf | `CONTRACT_EVIDENCE` |
| 판결문.pdf | `JUDGMENT` |
| 내용증명.pdf | `NOTICE_DEMAND_LETTER` |
| 녹취록.docx | `STATEMENT_TRANSCRIPT` |

전체 enum: [`LitigationDocumentType`](../../src/features/document-intelligence/document-intelligence-engine.schema.ts)

### 5.2 출처 분류 (`partySource`)

| 값 | 의미 |
| --- | --- |
| `CLIENT` | 의뢰인 제출 |
| `OPPONENT` | 상대방 제출 |
| `COURT` | 법원 |
| `THIRD_PARTY` | 제3자 |
| `UNKNOWN` | 미확인 |

### 5.3 민감도 (`sensitivity`)

| 값 | 의미 |
| --- | --- |
| `PUBLIC_FILING` | 제출 가능 공개 성격 |
| `PRIVILEGED` | 변호사-의뢰인 |
| `PERSONAL_DATA` | 개인정보 포함 |
| `FINANCIAL` | 금융정보 |

### 5.4 기존 `CaseAttachmentCategory`와의 관계

| Prisma category | AI documentType 힌트 |
| --- | --- |
| `COURT_FILING` | 법원/소송 서류 계열 |
| `EVIDENCE` | 증거 세부 유형 AI 재분류 |
| `FINANCIAL` | `FINANCIAL_EVIDENCE` |
| `CONTRACT` | `CONTRACT_EVIDENCE` |
| `CORRESPONDENCE` | `MESSAGING_EVIDENCE` 등 |

**13‑C**: category는 업로드 UX 힌트, **AI documentType이 분석 SSOT**.

## 6. 이중 분석 대상 (13‑C 플래그)

| documentType | `requiresDualAnalysis` |
| --- | --- |
| `OPPONENT_ANSWER` | true |
| `OPPONENT_BRIEF` | true |
| `COURT_CORRECTION_ORDER` | true |
| `JUDGMENT` | true |
| `SETTLEMENT_DRAFT` | true |
| `STATEMENT_TRANSCRIPT` | true |

구조: **1차 AI 분석 → 2차 validator task → 3차 변호사 확정 (13‑G)**

## 7. API (13‑B 구현 예정)

| Method | Route | 설명 |
| --- | --- | --- |
| `POST` | `/api/cases/[caseId]/attachments` | 기존 업로드 + pipeline enqueue (확장) |
| `POST` | `/api/cases/[caseId]/litigation-files/[fileId]/extract` | 추출 트리거/재시도 |
| `GET` | `/api/cases/[caseId]/litigation-files/[fileId]/extraction` | 추출 상태·페이지 |
| `POST` | `/api/cases/[caseId]/litigation-files/[fileId]/classify` | 분류 (또는 extract 후 자동) |

## 8. Out of scope (13‑B/C Spec)

- Provider vendor lock (Azure DI / Tesseract 등) — 구현 Phase에서 선택
- 실시간 progress websocket

## 9. 검증 (구현 후)

```bash
npm run verify:aibeopchin-legal-document-intelligence
# 13-B+: extraction integration tests
```
