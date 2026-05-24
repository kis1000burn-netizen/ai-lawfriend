# AI법친 Court Document Analysis (Phase **13‑D** / **13‑E**)

**상태**: Phase **13‑D** (추출) · **13‑E** (법원 문서 특화) — **법원 명령·기일·보정 SSOT**

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13D-COURT-DOCUMENT-ANALYSIS-SPEC]`**

**상위 Spec**: [AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md](./AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md)

## 1. 목적

**보정명령·석명명령·기일통지서·결정문** 등 법원 문서에서 **기한·요구사항·불이익 위험**을 추출하여, 변호사 업무 큐·기일관리(13‑H)로 연결한다.

**taskType**: `COURT_ORDER_ANALYZE`, `DEADLINE_EXTRACT`, `LAWYER_ACTION_RECOMMEND`

## 2. 대상 documentType

| documentType | 설명 |
| --- | --- |
| `COURT_CORRECTION_ORDER` | 보정명령 |
| `COURT_CLARIFICATION_ORDER` | 석명·보완 명령 |
| `COURT_HEARING_NOTICE` | 변론·선고·조정 기일 통지 |
| `COURT_DECISION` | 결정·명령 |
| `COURT_JUDGMENT_NOTICE` | 판결 선고 통지 (판결문 본문은 `JUDGMENT`) |

## 3. 추출 항목

| 항목 | 필드 | 설명 |
| --- | --- | --- |
| 문서 종류 | `courtDocumentKind` | 보정·기일·결정 등 |
| 재판부 | `courtName`, `caseNumber`, `division` | 법원·사건번호·재판부 |
| 기한 | `deadlines[]` | `LitigationDeadline` row |
| 요구사항 | `requirements[]` | 보정 내용·제출 자료 |
| 불이행 위험 | `nonComplianceRisks[]` | 각하·불출석·불이익 |
| 자동 업무 | `recommendedActions[]` | 보정서·자료요청·일정 등록 |

## 4. `LitigationDeadline` 모델

| 필드 | 설명 |
| --- | --- |
| `id` | PK |
| `caseId` | 사건 |
| `sourceFileId` | 근거 문서 |
| `citationId` | 원문 citation FK |
| `deadlineKind` | `CORRECTION` · `HEARING` · `APPEAL` · `SUBMISSION` · `OTHER` |
| `dueDate` | 절대일 (nullable) |
| `dueRule` | “송달일로부터 7일” 등 상대 규칙 |
| `anchorEvent` | `SERVICE_DATE` 등 기준 이벤트 |
| `description` | 사람이 읽을 설명 |
| `riskLevel` | `HIGH` · `MEDIUM` · `LOW` |
| `analysisStatus` | Lawyer review gate |

## 5. 예시 — 보정명령 분석

```
법원 보정명령 분석 결과

- 보정 대상: 피고 주소 보정
- 기한: 송달일로부터 7일
- 필요 업무: 주민등록초본 또는 주소보정 대응자료 확보
- 추천 조치: 의뢰인에게 피고 최신 주소 확인 요청
- 위험도: 높음
```

구조화:

```json
{
  "documentType": "COURT_CORRECTION_ORDER",
  "requirements": [{ "text": "피고 주소 보정", "citations": [...] }],
  "deadlines": [{
    "deadlineKind": "CORRECTION",
    "dueRule": "송달일로부터 7일",
    "anchorEvent": "SERVICE_DATE",
    "riskLevel": "HIGH"
  }],
  "nonComplianceRisks": ["각하", "불이익"],
  "recommendedActions": [
    "의뢰인에게 피고 최신 주소 확인",
    "주민등록초본 요청",
    "보정서 작성 준비"
  ]
}
```

## 6. 판결문 (`JUDGMENT`) 특수 규칙

| 추출 | taskType |
| --- | --- |
| 항소·상고 기한 | `DEADLINE_EXTRACT` |
| 이유 요약 (비판단) | `LEGAL_DOCUMENT_SUMMARIZE` |
| 주문·청구 인용 | `CLAIM_EXTRACT` |

**이중 분석 필수** — 기한 오류는 치명적.

## 7. 5분할 bundle에서의 위치

| # | 법원 문서 특화 |
| --- | --- |
| 1 요약 | “○○법원 보정명령 — 피고 주소 보정 요구” |
| 2 구조화 | deadlines + requirements JSON |
| 3 대조 | 기존 제출 서류·당사자 정보와 불일치 |
| 4 업무 추천 | 보정서·자료요청·일정 |
| 5 서면 연결 | 보정서 초안 context |

## 8. Litigation Operations 연계 (13‑H)

| 산출 | 13‑H 소비 |
| --- | --- |
| `LitigationDeadline` | 기일관리 캘린더 |
| `recommendedActions` | 변호사 업무 큐 |
| `riskLevel: HIGH` | 대시보드 priority card |

## 9. Out of scope (Spec)

- 전자소송 API 직접 연동
- 송달일 자동 확정 (의뢰인/변호사 입력 필요)

## 10. 검증 (구현 후)

```bash
npm run verify:aibeopchin-legal-document-intelligence
```
