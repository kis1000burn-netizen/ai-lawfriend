# 공부호 Legal Knowledge Intake 설계 (GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC)

**상태**: **설계 잠금(Spec LOCKED)** — 구현·Prisma·API **전** 단계. [Legal Knowledge Compiler 헌법](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md) §3〜§4의 **수요 감지(레이더)** 입력을 구조화하는 SSOT.

**한 줄 기준**: 네이버 등 검색 생태계에서 감지한 **법률 수요**를 **원문 저장 없이** 질문 유형·사건 유형 **후보**로만 구조화한다.

**상위 원칙**: [GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md)  
**후속(별도 설계)**: [패킷 생성 파이프라인](./GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md) · 관리자 Intake UI

**증빙 태그**: **`[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTAKE-SPEC]`**

---

## 1. 목적

본 문서는 **Legal Knowledge Intake** — Compiler 파이프라인 **1단계(수요 감지)** 의 데이터·매핑·금지 메타데이터 계약을 정의한다.

| 구분 | Legal Knowledge Intake | 기존 `gongbuho-case-candidate` |
| --- | --- | --- |
| 대상 | **시장·검색 생태계** 법률 수요 신호 | **특정 사건**에 매칭 가능한 **APPROVED** 패킷 |
| 저장 | 집계·분류·후보 메타만 | 패킷 코드·버전·Trace 요약 |
| UGC 원문 | **금지** | 해당 없음(패킷은 검수된 구조) |
| API(현재) | *(미구현 · 본 설계)* | `GET /api/cases/[caseId]/gongbuho/candidates` |

Intake는 **패킷 본문을 만들지 않는다.** “무엇이 수요인가”만 기록하고, 패킷화는 Compiler §4 [2]〜[4] **후속 파이프라인**에서 수행한다.

---

## 2. 범위·비범위

### 2.1 포함(설계)

- 수요 신호 **입력 구조**(필드·타입·허용값)
- 검색어·질문 유형·`caseType` **매핑 규칙**
- **원문 저장 금지** 증명·감사용 메타데이터
- Intake 레코드 **상태**·다음 단계 handoff

### 2.2 비포함(후속)

- Prisma 모델·마이그레이션
- 네이버·외부 API 연동 구현
- 변호사 승인 UI(관리자 Intake 화면은 **3단계** 설계)
- `GongbuhoPacket` DRAFT/APPROVED 자동 생성

---

## 3. 수요 감지 입력 구조

### 3.1 개념 엔티티: `LegalKnowledgeDemandIntake`

운영·DB 구현 시 권장 **논리 레코드** 이름. (Prisma 모델명은 구현 Phase에서 확정)

```ts
/** 설계 SSOT — 구현 전 타입 계약 */
type LegalKnowledgeDemandIntake = {
  /** 내부 id (cuid) — 구현 시 부여 */
  id?: string;

  /** 수요 신호 출처 채널(레이더). UGC 본문 URL 저장 금지 */
  signalSource: LegalKnowledgeSignalSource;

  /** 관측 기간(집계 윈도우). ISO 8601 interval 또는 date-only */
  observationWindow: { from: string; to: string };

  /** 비식별·정규화된 검색 표현(원문 스니펫·지식iN 질문 전문 금지) */
  querySignature: QuerySignature;

  /** 질문 유형 분류(§4) */
  questionType: QuestionTypeRef;

  /** 매핑된 사건 유형 후보(§4) */
  caseTypeMapping: CaseTypeMappingRef;

  /** 기존 공부호 코드 후보 제안(없으면 null · 신규 패킷 백로그) */
  suggestedGongbuhoCode: string | null;

  /** 신호 강도(순위용). 원문 빈도가 아닌 **구간·버킷** */
  demandStrength: DemandStrengthBucket;

  /** 원문 미저장·Compiler 준수 선언(§5) */
  intakeCompliance: IntakeComplianceMeta;

  /** Intake 처리 상태(§6) */
  status: LegalKnowledgeIntakeStatus;

  /** 감사·운영 메모(PII·UGC 인용 금지) */
  operatorNote?: string | null;

  createdAt?: string;
  updatedAt?: string;
};
```

### 3.2 `signalSource` — 허용 채널

| 값 | 의미 | 저장 허용 |
| --- | --- | --- |
| `NAVER_SEARCH_TREND_AGGREGATE` | 네이버 검색 트렌드 **집계** 지표 | 키워드·버킷·기간만 |
| `NAVER_QUESTION_TYPE_AGGREGATE` | 질문 **유형** 분류 결과(수동·반자동 태깅) | 유형 코드·건수 버킷 |
| `INTERNAL_PRODUCT_SIGNAL` | AI법친 인터뷰·보완·CS **집계**(비식별) | 집계 키만 |
| `MANUAL_RESEARCH_BRIEF` | 운영·법무 **수동** 수요 브리프 | 구조화 필드만 · URL 본문 금지 |

**금지**: `NAVER_UGC_BODY`, `BLOG_FULLTEXT`, `CAFE_SCRAPE`, `KNOWLEDGE_IN_ANSWER_COPY` 등 **본문 수집**을 나타내는 source 값.

### 3.3 `querySignature` — 검색어 표현(원문 금지)

UGC·검색 결과 **전문** 대신 **정규화 서명**만 저장한다.

```ts
type QuerySignature = {
  /** 정규화 키(소문자·공백 정리·특수문자 제거). PII 패턴 제거 후 */
  normalizedKeyword: string;

  /** 선택: SHA-256 등 **단방향** 해시(원문 복원 불가 목적 아님 — 중복 탐지용) */
  keywordHash?: string;

  /** 집계 언어 */
  locale: "ko-KR" | string;

  /** 스니펫·제목·본문 필드 — 항상 null/omit (정적 게이트 검증 대상) */
  rawSnippet?: never;
  rawTitle?: never;
  sourceUrl?: never;
};
```

**예(허용)**: `normalizedKeyword: "전세보증금 반환 소송"`, `keywordHash: "a1b2…"`  
**예(금지)**: 지식iN 질문 전문, 블로그 단락, 네이버 API `description` 필드 복사

### 3.4 `demandStrength` — 수요 강도 버킷

절대 클릭·검색량 원시값 대신 **운영 등급**만 저장(외부 지표 유출·재식별 최소화).

| `DemandStrengthBucket` | 의미 |
| --- | --- |
| `LOW` | 백로그 참고 |
| `MEDIUM` | 분기 검토 |
| `HIGH` | 우선 Intake 검토 |
| `CRITICAL` | 긴급 패킷·질문셋 gap (드물게) |

---

## 4. 검색어 · 질문 유형 · 사건 유형 매핑

### 4.1 질문 유형 taxonomy (`QuestionTypeRef`)

Compiler 레이더 출력을 **고정 vocabulary**로 분류한다. (초안 코드表 — 운영 확장 시 버전 bump)

| `questionTypeCode` | 한글 라벨 | 설명 |
| --- | --- | --- |
| `QT_FACT_GATHERING` | 사실관계 확인 | 누가·언제·어디서·얼마 |
| `QT_PROCEDURE` | 절차·기한 | 소송·신고·제출 절차 |
| `QT_LIABILITY` | 책임·성립 요건 | 법적 요건·요소 (판단 확정 아님) |
| `QT_REMEDY` | 구제·반환·손해 | 반환·배상·가압류 등 |
| `QT_EVIDENCE` | 증거·입증 | 증빙·기록 확보 |
| `QT_DOCUMENT` | 서면·내용증명 | 문서 작성·송달 |
| `QT_OTHER` | 기타 | 수동 검수 필수 |

```ts
type QuestionTypeRef = {
  questionTypeCode: string; // 위 코드表 또는 확장(버전 필드 권장)
  taxonomyVersion: string; // 예 "2026.05"
  confidence: "LOW" | "MEDIUM" | "HIGH"; // 분류 신뢰(ML/수동)
};
```

### 4.2 사건 유형 매핑 (`CaseTypeMappingRef`)

AI법친 **`caseType`** · 공부호 `caseType` SSOT([GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md) §2)와 연결.

```ts
type CaseTypeMappingRef = {
  /** 앱 Case 카테고리 키. 미매핑 시 null */
  mappedCaseType: string | null;

  /** 매핑 근거(구조화). UGC 인용 금지 */
  mappingRationale: string; // 예 "전세·임대차 분쟁 수요 클러스터"

  /** 매핑 신뢰 */
  mappingConfidence: "LOW" | "MEDIUM" | "HIGH";

  /** 기존 APPROVED 패킷 code 후보. 없으면 null → 신규 패킷 과제 */
  suggestedGongbuhoCode: string | null; // 예 LAW-LAND-001
};
```

### 4.3 매핑 규칙(운영)

1. **1 Intake 레코드 : N 후보 금지(기본)** — primary `mappedCaseType` 하나. 복수 후보는 **별도 레코드**로 분리(감사 단순화).
2. `mappedCaseType`이 null이면 status는 최소 `MAPPING_PENDING` (§6).
3. `suggestedGongbuhoCode`는 **기존 라이브러리**([GONGBUHO_MULTI_PACKET_LIBRARY.md](./GONGBUHO_MULTI_PACKET_LIBRARY.md)) 역조회 · 수동 지정만. 자동 생성 금지.
4. 키워드 → `questionTypeCode` → `caseType` 순 **결정 트리**는 부록 표(§4.4)를 SSOT로 유지하고, 예외는 `operatorNote`가 아닌 **taxonomyVersion bump**로 관리.

### 4.4 예시 매핑(샘플 · 비 exhaustive)

| normalizedKeyword (예) | questionTypeCode | mappedCaseType | suggestedGongbuhoCode |
| --- | --- | --- | --- |
| `사기 고소 절차` | `QT_PROCEDURE` | `FRAUD` | `LAW-FRAUD-001` |
| `전세보증금 반환` | `QT_REMEDY` | `JEONSE` | *(null → 신규 후보)* |
| `내용증명 작성` | `QT_DOCUMENT` | `CONTENT_CERT` | `LAW-CONTENT-001` |
| `임금 체불 신고` | `QT_PROCEDURE` | `WAGE` | `LAW-WAGE-001` |

---

## 5. 원문 저장 금지 메타데이터 (`IntakeComplianceMeta`)

Compiler §2·§7과 **감사 게이트** 연동. Intake 레코드마다 **필수**.

```ts
type IntakeComplianceMeta = {
  /** Compiler 정책 준수 마커(정적 verify 대상) */
  compilerPolicyVersion: "2026-05-23";

  /** 본 레코드에 UGC·네이버 본문·URL 스크래핑 텍스트가 없음을 선언 */
  noRawUgcStored: true;

  /** noRawUgcStored=false 는 스키마상 금지(validator reject) */

  /** 입력 경로 */
  intakeMethod: "MANUAL_FORM" | "AGGREGATE_IMPORT" | "INTERNAL_ETL";

  /** aggregate import 시: 원본 파일에 본문 컬럼 없음 확인자(운영 id) */
  attestedByUserId?: string | null;

  attestedAt?: string; // ISO 8601

  /** 금지 필드 스캔 결과(구현 Phase). 설계 단계에서는 null 허용 */
  prohibitedFieldScan?: "PASS" | "FAIL" | null;
};
```

### 5.1 금지 필드 목록(스키마·API 공통)

다음 키는 Intake JSON·DB·Audit payload **어디에도** 존재하면 **FAIL**:

- `rawSnippet`, `rawBody`, `rawTitle`, `htmlBody`, `sourceUrl`, `naverDocumentId`
- `knowledgeInAnswer`, `blogPostContent`, `cafePostContent`
- 임의 `*_fullText`, `*_originalContent`

### 5.2 허용 필드(요약)

- §3 `querySignature.normalizedKeyword` · `keywordHash`
- §4 taxonomy·caseType·`suggestedGongbuhoCode`
- §3 `demandStrength` · `observationWindow`
- §5 compliance 블록

---

## 6. Intake 상태 · Compiler handoff

### 6.1 `LegalKnowledgeIntakeStatus`

| 상태 | 의미 | 다음 단계 |
| --- | --- | --- |
| `DRAFT` | 입력 중 | 검증·매핑 |
| `MAPPING_PENDING` | caseType 미확정 | 운영 분류 |
| `READY_FOR_RESEARCH` | Intake 완료 · **근거 조사** 대기 | Compiler §4 [2] |
| `LINKED_TO_PACKET_DRAFT` | 패킷 DRAFT와 연결(후속) | 변호사 검수 |
| `REJECTED` | 수요 부적절·중복·정책 위반 | 종료 |
| `ARCHIVED` | 이력 보관 | — |

**원칙**: `READY_FOR_RESEARCH` 이전에는 **GongbuhoPacket** 생성 API 호출 금지(후속 파이프라인 gate).

### 6.2 Compiler 파이프라인 handoff

```text
LegalKnowledgeDemandIntake (READY_FOR_RESEARCH)
    → LegalKnowledgeResearchBrief (법령·판례·공공자료 포인터) — [패킷 파이프라인 §4.2](./GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md)
    → LegalKnowledgeLawyerReviewDecision
    → GongbuhoPacket DRAFT → APPROVED
```

본 Intake Spec은 **첫 화살표 왼쪽(Intake)** 을 고정한다. 이후 단계는 [GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md).

---

## 7. API·저장소 스케치(미구현)

구현 Phase에서 아래를 **관리자 전용**으로 추가할 것을 권장한다.

| Method | 경로(안) | 역할 |
| --- | --- | --- |
| `GET` | `/api/admin/gongbuho/legal-knowledge/intake` | Intake 목록·필터(status, caseType) |
| `POST` | `/api/admin/gongbuho/legal-knowledge/intake` | 수동 Intake 생성(compliance 필수) |
| `PATCH` | `…/intake/[intakeId]` | 매핑·상태 갱신 |
| `POST` | `…/intake/[intakeId]/reject` | REJECTED + 사유(메타만) |

**권한**: STAFF 조회 · ADMIN 생성/상태 변경([GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md) 패턴).  
**AuditLog(안)**: `GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_CREATED` 등 — 구현 시 `gongbuho-audit-events.ts` 확장.

---

## 8. 정적 게이트(잠금)

`npm run verify:gongbuho`가 검사한다:

- 본 문서 존재 · `Legal Knowledge Intake` · `noRawUgcStored` · `normalizedKeyword`
- `querySignature` · `questionType` · `caseTypeMapping` · `demandStrength`
- Compiler 정책 교차 링크 · README 링크
- `IMPLEMENTATION_EVIDENCE` `[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTAKE-SPEC]`

---

## 9. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | Legal Knowledge Intake **설계** 초안 |
