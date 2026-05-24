# AI법친 Legal Document Intelligence Engine (Phase **13‑A**)

**상태**: Phase **13‑A** — **Spec Lock** (업로드 자료 → 지능형 사건 데이터 전환 SSOT)

**한글명**: **AI 서류·증거 분석 엔진**

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13A-LEGAL-DOCUMENT-INTELLIGENCE-SPEC-LOCK]`**

## 1. 한 줄 기준

> **업로드된 모든 법률 서류와 증거는 단순 첨부파일이 아니라, AI가 분류·분석·대조·근거표시·변호사 검토를 거쳐 사건 운영 데이터로 전환해야 한다.**

이 엔진이 없으면 변호사는 **파일함**만 보게 됩니다.  
이 엔진이 있어야 변호사는 **사무장·보조직원·기록관리자·사건분석 보조자**로서 AI법친을 쓸 수 있습니다.

**선행**: Phase **12‑A** Full AI Core RC (`verify:aibeopchin-full-ai-core-rc` PASS).

## 2. 흐름 전환 (Before → After)

### 2.1 기존 (12‑A까지)

```
상담 → 인터뷰 → 사건요약 → 문서작성 → 변호사 검토
```

첨부(`CaseAttachment`)는 **메타데이터**(파일명·분류·MIME)만 Graph/Radar에 연결됩니다. **본문 추출·OCR·문서별 분석 없음**.

### 2.2 목표 (13‑A〜13‑H)

```
자료 업로드
  → AI 문서분류
  → OCR/텍스트 추출
  → 문서별 구조 분석
  → 사건기록과 대조
  → 쟁점·증거·기한·위험 신호 추출
  → 변호사 검토 큐 등록
  → 서면작성 / 의뢰인 보완요청 / 기일관리로 연결
```

**핵심**: 업로드 자료가 **사건의 지능형 데이터**로 바뀝니다.

## 3. 변호사가 가능해지는 업무

| # | 업무 |
| --- | --- |
| 1 | 의뢰인이 올린 자료 **자동 분류** |
| 2 | 상대방 **답변서·준비서면** 분석 |
| 3 | 법원 문서에서 **기일·마감·보정사항** 추출 |
| 4 | 증거자료가 **어떤 주장과 연결**되는지 정리 |
| 5 | 기존 의뢰인 진술과 업로드 문서 **충돌 확인** |
| 6 | 변호사가 검토해야 할 **위험 신호** 표시 |
| 7 | 필요한 **보완자료·의뢰인 확인 질문** 자동 생성 |
| 8 | **준비서면·보정서·증거설명서 초안** 컨텍스트로 연결 |

## 4. 불변 원칙 (9‑D〜11‑A와 정렬)

| 원칙 | 내용 |
| --- | --- |
| **AI는 판단하지 않는다** | 분석 **후보**만 제시. 확정은 변호사 |
| **근거 없는 분석 금지** | 모든 주장·추출에 **원문 citation** 필수 |
| **확정 전 “사실” 금지** | `LAWYER_CONFIRMED` 전까지 Graph·서면·의뢰인 공개에 사용 불가 |
| **이중 분석** | 답변서·준비서면·보정명령·판결문·합의안·녹취록은 1차 분석 + 2차 validator |
| **Ledger 정렬** | 분석 항목은 Phase **9‑F** Judgment Boundary Ledger `subjectKind` 확장으로 편입 (→ **13‑G**) |

> AI는 구조화했고, **변호사가 판단한다** — Phase 9‑F motto 유지.

## 5. 분석 결과 5분할 (공통 출력 계약)

업로드 파일 1건당 AI 파이프라인 최종 산출은 **단일 요약이 아니라 5개 결과물**:

| # | 산출물 | 설명 |
| --- | --- | --- |
| 1 | **문서 요약** | 변호사가 30초 안에 파악할 narrative summary |
| 2 | **구조화 데이터** | `documentType`, claims, admissions, denials, evidenceRefs, deadlines 등 JSON |
| 3 | **사건기록 대조** | 인터뷰·기존 Claim·Graph와 충돌·공백·추가 확인 |
| 4 | **변호사 업무 추천** | 준비서면·보정·자료요청·의뢰인 확인 등 action queue |
| 5 | **서면작성 연결 데이터** | 준비서면/보정서/증거설명서 초안용 context bundle |

코드 SSOT: [`document-intelligence-engine.schema.ts`](../../src/features/document-intelligence/document-intelligence-engine.schema.ts) — `litigationDocumentAnalysisBundleSchema`

## 6. 분석 상태 (Lawyer Review Gate)

| 상태 | 의미 |
| --- | --- |
| `AI_ANALYZED` | AI 1차(+2차 validator) 분석 완료 |
| `NEEDS_LAWYER_REVIEW` | 변호사 검토 큐 등록 (기본) |
| `LAWYER_CONFIRMED` | 변호사 확정 |
| `LAWYER_CORRECTED` | 변호사 수정 후 확정 |
| `REJECTED` | 분석 폐기 |
| `NEEDS_CLIENT_CONFIRMATION` | 의뢰인 확인 필요 (보완요청 연계) |

**13‑G**에서 Ledger·AuditLog·Lawyer Review Console과 연결.

## 7. 신뢰도 · Citation (정확도 장치)

| 신뢰도 | 의미 |
| --- | --- |
| `HIGH` | 원문에 명확한 문장·표기 |
| `MEDIUM` | 문맥상 추정 가능, 확인 권장 |
| `LOW` | OCR 불명확·간접 추정 |
| `NEEDS_REVIEW` | AI가 확정하면 안 되는 영역 |

Citation 필수 필드: `pageNumber`, `paragraphIndex`, `excerpt`, `sourceFileId`, `confidence`.

UI: 분석 항목 클릭 → **원문 위치** 하이라이트 (13‑D+).

## 8. AI Core taskType (13‑A SSOT)

| taskType | 역할 |
| --- | --- |
| `LEGAL_FILE_CLASSIFY` | 파일 유형·출처·민감도 분류 |
| `LEGAL_TEXT_EXTRACT_VALIDATE` | OCR/텍스트 추출 품질 검증 |
| `LEGAL_DOCUMENT_SUMMARIZE` | 문서 요약 |
| `OPPONENT_BRIEF_ANALYZE` | 상대방 서면 분석 |
| `COURT_ORDER_ANALYZE` | 법원 명령·기일·보정 분석 |
| `DEADLINE_EXTRACT` | 기일·마감 추출 |
| `EVIDENCE_EXTRACT` | 증거항목 추출 |
| `CLAIM_EXTRACT` | 주장 추출 |
| `CLAIM_EVIDENCE_MAP` | 주장‑증거 매핑 |
| `CASE_RECORD_CONTRADICTION_SCAN` | 기존 기록 충돌 탐지 |
| `LAWYER_ACTION_RECOMMEND` | 변호사 업무 추천 |
| `CLIENT_CONFIRMATION_QUESTION_GENERATE` | 의뢰인 확인 질문 |
| `LITIGATION_DRAFT_CONTEXT_BUILD` | 준비서면 등 초안 컨텍스트 |

코드 SSOT: [`document-intelligence-task-types.ts`](../../src/features/document-intelligence/document-intelligence-task-types.ts)

Governance feature (10‑A 확장 예정): `DOCUMENT_INTELLIGENCE`

## 9. DB 모델 (13‑A 설계 · 13‑B〜 구현)

| 모델 | 역할 |
| --- | --- |
| `LitigationUploadedFile` | 원본 파일 (기존 `CaseAttachment` 확장 또는 1:1 연계) |
| `LitigationExtractedText` | OCR/텍스트 추출·페이지 단위 |
| `LitigationDocumentAnalysis` | AI 분석 bundle persist |
| `LitigationAnalysisCitation` | 원문 근거 위치 |
| `LitigationClaim` | 문서에서 추출한 주장 |
| `LitigationEvidenceItem` | 증거 항목 |
| `LitigationDeadline` | 기일·마감 |
| `LitigationAnalysisReview` | 변호사 확인·수정·기각 |

Prisma migration은 **13‑B**부터. 13‑A는 schema TypeScript SSOT + 본 Spec.

## 10. Phase 로드맵 (13‑A〜13‑H)

| Phase | 제목 | 산출 |
| --- | --- | --- |
| **13‑A** | **Legal Document Intelligence Engine Spec Lock** | 본 Spec + 하위 4 Spec + schema SSOT + verify |
| **13‑B** | Upload & Text Extraction | 업로드 API · 원본 저장 · OCR/추출 · 페이지 텍스트 · 품질 점수 |
| **13‑C** | Document Classification | 유형·출처·민감도·분석 가능 여부 |
| **13‑D** | Legal Document Analysis | 요약·주장·쟁점·기한·증거언급·citation |
| **13‑E** | Opponent Brief Analyzer | 답변서·준비서면 · 인정/부인/항변 · 새 주장 · 반박 쟁점 |
| **13‑F** | Evidence & Claim Mapping | 주장‑증거 연결 · 충돌 · 의뢰인 질문 |
| **13‑G** | Lawyer Review Gate | 변호사 승인/수정/기각 · Ledger · AuditLog |
| **13‑H** | Litigation Operations Integration | 기일관리 · 업무 큐 · 서면 초안 · 의뢰인 요청 · 진행 리포트 |

> **Litigation Operations**의 심장부는 본 엔진(13‑A〜G)입니다. **13‑H**에서 소송수행 레이어와 연결합니다.

## 11. 하위 Spec (13‑A 분할)

| 문서 | Phase | 내용 |
| --- | --- | --- |
| [AIBEOPCHIN_UPLOAD_FILE_ANALYSIS_PIPELINE_SPEC.md](./AIBEOPCHIN_UPLOAD_FILE_ANALYSIS_PIPELINE_SPEC.md) | 13‑B/C | 업로드 → 추출 → 분류 파이프라인 |
| [AIBEOPCHIN_OPPONENT_BRIEF_ANALYSIS_SPEC.md](./AIBEOPCHIN_OPPONENT_BRIEF_ANALYSIS_SPEC.md) | 13‑E | 상대방 서면 분석 |
| [AIBEOPCHIN_COURT_DOCUMENT_ANALYSIS_SPEC.md](./AIBEOPCHIN_COURT_DOCUMENT_ANALYSIS_SPEC.md) | 13‑D/E | 법원 문서·기한·보정 |
| [AIBEOPCHIN_EVIDENCE_MAPPING_SPEC.md](./AIBEOPCHIN_EVIDENCE_MAPPING_SPEC.md) | 13‑F | 증거‑주장 매핑·충돌 |

## 12. 기존 AI Core 통합 지점

| 기존 | 13‑x 편입 |
| --- | --- |
| `CaseAttachment` + category | → `LitigationUploadedFile` + AI `documentType` |
| Graph `ATTACHMENT_META` | → `ATTACHMENT_EXTRACT` Claim + citation |
| Contradiction Radar | → 인터뷰 vs **추출 텍스트** 축 |
| Ledger `subjectKind` | → `DOCUMENT_CLAIM` · `DEADLINE` · `EVIDENCE_ITEM` (13‑G) |
| Lawyer Review Console | → Document Analysis review queue 탭 |
| Supplement Request | → `CLIENT_CONFIRMATION_QUESTION` 자동 생성 연계 |
| Document generate | → `LITIGATION_DRAFT_CONTEXT_BUILD` 컨텍스트 |

## 13. UI 개요 (13‑D+ 구현)

### 업로드 후 분석 화면

- 문서 유형 분류 완료
- 텍스트 추출 완료 (쪽수 / OCR 신뢰도)
- 핵심 주장·인정·부인·새 쟁점 카운트
- 의뢰인 확인 질문·준비서면 대응 필요 플래그

### 분석 결과 화면

- 핵심 요약 · 상대방 주장 · 인정/부인 · 의뢰인 확인 · 추천 업무
- 항목별 citation 링크 · 신뢰도 배지
- 변호사 승인/수정/기각 액션 (13‑G)

## 14. In scope (13‑A)

- 본 Master Spec + 4 하위 Spec
- TypeScript schema SSOT + taskType registry
- `verify:aibeopchin-legal-document-intelligence` 정적 게이트
- `docs/ai/README.md` Phase 13 로드맵 행

## 15. Out of scope (13‑A)

- Prisma migration / runtime API
- OCR provider 연동
- Lawyer UI 구현
- Litigation Operations (13‑H)

## 16. 검증

```bash
npm run verify:aibeopchin-legal-document-intelligence
npm run test -- src/features/document-intelligence/document-intelligence-engine.schema.test.ts
```

## 17. 한 줄 판정

13‑A Spec Lock까지 잠기면 AI법친은 **첨부파일 보관함**에서 **법률 서류·증거 지능형 분석 플랫폼**으로의 설계 기준을 갖춘다. 13‑B Upload & Extraction 착수 가능.
