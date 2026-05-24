# AI법친 Opponent Brief Analysis (Phase **13‑E**)

**상태**: Phase **13‑E** — **상대방 서면 분석 SSOT**

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13E-OPPONENT-BRIEF-ANALYSIS-SPEC]`**

**상위 Spec**: [AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md](./AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md)

## 1. 목적

상대방 **답변서·준비서면**을 AI가 구조화하여, 변호사가 **반박 쟁점·의뢰인 확인·준비서면 대응**을 즉시 시작할 수 있게 한다.

**taskType**: `OPPONENT_BRIEF_ANALYZE` (+ `CLAIM_EXTRACT`, `LAWYER_ACTION_RECOMMEND`, `CLIENT_CONFIRMATION_QUESTION_GENERATE`)

## 2. 대상 documentType

| documentType | 분석 프로파일 |
| --- | --- |
| `OPPONENT_ANSWER` | 답변서 전용 |
| `OPPONENT_BRIEF` | 준비서면 전용 |
| `OPPONENT_MOTION` | 각종 신청서 (후속) |

## 3. 추출 항목 (답변서 · 준비서면 공통)

| 항목 | 필드 | 설명 |
| --- | --- | --- |
| 인정한 사실 | `admissions[]` | 상대방이 인정한 부분 + citation |
| 부인한 사실 | `denials[]` | 다투는 부분 + citation |
| 항변 | `defenses[]` | 변제·소멸시효·계약부존재·과실상계 등 |
| 새 주장 | `newClaims[]` | 기존 사건기록에 없던 주장 |
| 증거 언급 | `evidenceRefs[]` | 을 제1호증, 갑 제2호증 등 |
| 반박 필요 쟁점 | `rebuttalIssues[]` | 준비서면 대응 포인트 |
| 의뢰인 확인 질문 | `clientConfirmationQuestions[]` | 변호사→의뢰인 질문 후보 |
| 위험도 | `riskLevel` | `HIGH` · `MEDIUM` · `LOW` |

각 항목: `text`, `confidence`, `citations[]`, `analysisStatus: NEEDS_LAWYER_REVIEW`

## 4. 예시 출력 (Spec SSOT)

### 4.1 문서 요약

> 이 문서는 피고가 제출한 답변서로, 금전 수령 사실은 인정하나 대여가 아닌 투자금이라고 주장합니다.

### 4.2 구조화 데이터

```json
{
  "documentType": "OPPONENT_ANSWER",
  "party": "DEFENDANT",
  "claims": ["투자금 주장", "변제기 부존재 주장"],
  "admissions": ["금전 수령 사실 인정"],
  "denials": ["대여금이라는 점 부인"],
  "evidenceRefs": ["을 제1호증"],
  "deadlines": []
}
```

### 4.3 사건기록 대조

```
기존 의뢰인 진술과 충돌:
- 의뢰인: 대여금 / 상대방: 투자금

추가 확인 필요:
- 투자계약서 또는 투자 설명자료 존재 여부
- 대여 당시 이자·변제기 약정 여부
```

### 4.4 변호사 업무 추천

1. 의뢰인에게 투자계약서 존재 여부 확인
2. 계좌이체 당시 메모·문자 원본 요청
3. 준비서면에서 소비대차 성격 주장 보강
4. 상대방 투자금 주장 반박 구조 작성

### 4.5 서면작성 연결

```json
{
  "draftKind": "PREPARatory_BRIEF",
  "responseIssues": ["금전의 법적 성격"],
  "requiredEvidence": ["계좌내역", "문자", "통화녹취"],
  "missingMaterials": ["대여 당시 약정 관련 자료"]
}
```

## 5. UI — 분석 결과 화면 (13‑E+)

```
피고 답변서 분석 결과

핵심 요약: …

상대방 주장: (numbered, citation link)
인정한 사실: …
다투는 사실: …

의뢰인 확인 필요: …
추천 업무: …
```

## 6. 이중 분석 (필수)

| 차수 | 역할 |
| --- | --- |
| 1차 | `OPPONENT_BRIEF_ANALYZE` — 주장·항변·증거 추출 |
| 2차 | `CASE_RECORD_CONTRADICTION_SCAN` + validator — 새 주장·충돌 재검 |
| 3차 | 변호사 Review Gate (13‑G) |

## 7. Graph · Radar · Ledger 연계

| 산출 | 편입 |
| --- | --- |
| `newClaims[]` | Graph `OPPONENT_CLAIM` nodes |
| `rebuttalIssues[]` | Radar `OPPOSING_BRIEF` signal |
| 각 extract row | Ledger `subjectKind: DOCUMENT_CLAIM` (13‑G) |

## 8. Out of scope (13‑E Spec)

- 자동 준비서면 LLM 생성 (→ `LITIGATION_DRAFT_CONTEXT_BUILD` + document generate)
- 상대방 서면 OCR 품질 개선 (→ 13‑B)

## 9. 검증 (구현 후)

```bash
npm run verify:aibeopchin-legal-document-intelligence
npm run test -- src/features/document-intelligence/opponent-brief-analyzer.test.ts
```
