# AI법친 Evidence & Claim Mapping (Phase **13‑F**)

**상태**: Phase **13‑F** — **증거‑주장 매핑 · 충돌 탐지 SSOT**

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13F-EVIDENCE-MAPPING-SPEC]`**

**상위 Spec**: [AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md](./AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md)

## 1. 목적

증거자료는 “요약”보다 **주장과의 연결**이 중요합니다.

AI가 증거 → 주장 → 공백 → 의뢰인 확인 질문까지 연결해야 변호사 검토 효율이 올라갑니다.

**taskType**: `EVIDENCE_EXTRACT`, `CLAIM_EXTRACT`, `CLAIM_EVIDENCE_MAP`, `CASE_RECORD_CONTRADICTION_SCAN`, `CLIENT_CONFIRMATION_QUESTION_GENERATE`

## 2. 증거 유형별 분석 초점

| documentType | 분석할 내용 |
| --- | --- |
| `CONTRACT_EVIDENCE` | 당사자, 금액, 기간, 의무, 위약 |
| `FINANCIAL_EVIDENCE` | 송금일, 금액, 상대 계좌, 반복거래 |
| `MESSAGING_EVIDENCE` | 약속, 인정, 독촉, 변제 언급 |
| `PHOTO_EVIDENCE` | 하자, 현장, 사고 상황 |
| `STATEMENT_TRANSCRIPT` | 인정 발언, 협박, 합의 |
| `SMS_EVIDENCE` | 계약조건, 변제 약속, 통지 |

## 3. `LitigationEvidenceItem`

| 필드 | 설명 |
| --- | --- |
| `id` | PK |
| `caseId` | 사건 |
| `sourceFileId` | 근거 파일 |
| `evidenceKind` | `CONTRACT` · `BANK_TRANSFER` · `MESSAGE` · … |
| `title` | “2024.03.01 계좌이체 내역” |
| `extractedFacts[]` | 구조화 사실 + citation |
| `linkedClaimIds[]` | 연결 주장 |
| `gaps[]` | “변제 대응 입금내역 추가 필요” |
| `confidence` | HIGH/MEDIUM/LOW/NEEDS_REVIEW |
| `analysisStatus` | review gate |

## 4. `LitigationClaim` (문서 출처 주장)

| 필드 | 설명 |
| --- | --- |
| `id` | PK |
| `caseId` | 사건 |
| `sourceFileId` | 추출 문서 |
| `claimText` | 주장 문장 |
| `claimParty` | `CLIENT` · `OPPONENT` · `COURT` · `UNKNOWN` |
| `claimRole` | `PRIMARY` · `DEFENSE` · `ADMISSION` · `DENIAL` |
| `citations[]` | 원문 근거 |
| `linkedEvidenceIds[]` | supporting evidence |
| `contradictsClaimIds[]` | Graph 충돌 edge |

## 5. 주장‑증거 매핑 (`CLAIM_EVIDENCE_MAP`)

### 5.1 연결 규칙

AI 출력 예:

> 이 계좌내역은 “2024.03.01. 3,000만 원 대여” 주장과 **연결**됩니다.  
> 다만 변제 주장에 대응하려면 **2024.08.10 전후 입금내역** 추가 확인이 필요합니다.

| 관계 | `mappingKind` |
| --- | --- |
| 지지 | `SUPPORTS` |
| 반박 | `CONTRADICTS` |
| 불충분 | `INSUFFICIENT` |
| 미연결 | `UNLINKED` |

### 5.2 증거 없는 주장 탐지

- Graph `USER_CLAIM` / `OPPONENT_CLAIM` 중 `linkedEvidenceIds.length === 0`
- Radar signal: `MISSING_EVIDENCE` (9‑E 확장 — **추출 텍스트** 기반)

## 6. 사건기록 충돌 (`CASE_RECORD_CONTRADICTION_SCAN`)

| 대조 축 | 예 |
| --- | --- |
| 인터뷰 vs 업로드 문서 | 의뢰인 “대여” vs 상대 “투자” |
| Claim vs Claim | 동일 날짜 금액 불일치 |
| 증거 vs 주장 | 계좌내역에 반환 흔적 vs “미변제” 주장 |

산출: bundle #3 **사건기록 대조 결과** + Radar edge + Ledger queue

## 7. 의뢰인 확인 질문 생성

`CLIENT_CONFIRMATION_QUESTION_GENERATE` — Supplement Request(7‑1‑B)와 연계:

| 트리거 | 질문 예 |
| --- | --- |
| 상대방 새 주장 | “투자계약서가 있었는가?” |
| 증거 공백 | “2024.08.10 전후 입금내역 추가 업로드” |
| 충돌 | “상대가 말한 반환금 수령 사실이 있는가?” |

상태: `NEEDS_CLIENT_CONFIRMATION` → 보완요청 MVP로 전달 (13‑G+)

## 8. 5분할 bundle — 증거 중심 예

| # | 내용 |
| --- | --- |
| 1 | “계좌내역은 2024.03.01 3천만 원 송금 1건을 보여줌” |
| 2 | `LitigationEvidenceItem` + `extractedFacts` |
| 3 | 인터뷰 대여 주장과 일치 / 변제 내역 공백 |
| 4 | 추가 계좌내역·문자 요청 |
| 5 | 준비서면 — 소비대차 + 송금 증거 목록 |

## 9. Graph · Ledger 편입 (13‑G)

| 신규 `subjectKind` (제안) | 대상 |
| --- | --- |
| `DOCUMENT_CLAIM` | `LitigationClaim` |
| `EVIDENCE_ITEM` | `LitigationEvidenceItem` |
| `DEADLINE` | `LitigationDeadline` |
| `EVIDENCE_MAPPING` | mapping row |

Lawyer Review Console: 탭 **「서류·증거 분석」** (11‑A 확장)

## 10. Out of scope (13‑F Spec)

- 실물 증거 법적 증명력 판단
- 자동 증거설명서 PDF 생성

## 11. 검증 (구현 후)

```bash
npm run verify:aibeopchin-legal-document-intelligence
npm run test -- src/features/document-intelligence/evidence-mapping.test.ts
```
