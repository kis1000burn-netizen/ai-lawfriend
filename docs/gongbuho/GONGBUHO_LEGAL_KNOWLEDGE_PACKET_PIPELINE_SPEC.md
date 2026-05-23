# 공부호 Legal Knowledge 패킷 생성 파이프라인 설계 (GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC)

**상태**: **설계 잠금(Spec LOCKED)** — 구현·Prisma·API **전** 단계. [Legal Knowledge Intake Spec](./GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md)(**Spec LOCKED**)의 `READY_FOR_RESEARCH` handoff 이후, [Legal Knowledge Compiler 헌법](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md) §4 [2]〜[4]를 **운영 가능한 단계·게이트·산출물**로 고정한다.

**한 줄 기준**: 원문 없는 **수요 후보(Intake)** 를 **법령·판례·공공자료 근거(Research Brief)** 와 **변호사 검수(Lawyer Review)** 로 연결해 **`GongbuhoPacket` DRAFT → APPROVED** 까지 보낸다.

**상위 원칙**: [GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md) · [GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md)  
**기존 패킷 SSOT**: [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md) · [GONGBUHO_FIELD_MAPPING.md](./GONGBUHO_FIELD_MAPPING.md)  
**후속(별도 설계)**: 관리자 Intake UI · Research Brief 편집 UI · **파이프라인 Prisma·API 구현**

**증빙 태그**: **`[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-PACKET-PIPELINE-SPEC]`**

---

## 1. 목적

본 문서는 **Legal Knowledge 패킷 생성 파이프라인** — Compiler §4 [2] 근거 확인 · [3] 변호사 검수 · [4] 패킷 생성 — 의 **단계·엔티티·상태·게이트·handoff** 계약을 정의한다.

| 구분 | 본 파이프라인 | 기존 `POST /api/admin/gongbuho` |
| --- | --- | --- |
| 진입 | Intake `READY_FOR_RESEARCH` (수요·매핑 완료) | 운영자가 JSON·샘플 직접 업로드 |
| 중간 산출 | Research Brief · Lawyer Review Decision | *(없음 — 수동 프로세스)* |
| 종료 | `GongbuhoPacket` **DRAFT** → **APPROVED** | 동일 DB·동일 승인 API 재사용 |
| UGC·원문 | **전 구간 금지** (Intake compliance 상속) | Compiler §2 준수 전제 |

Intake가 **“무엇이 수요인가”** 를 고정하면, 본 파이프라인은 **“어떤 공신력 근거로 · 누가 검수해 · 어떤 패킷 구조로 컴파일할 것인가”** 를 고정한다.

---

## 2. 범위·비범위

### 2.1 포함(설계)

- 파이프라인 **5단계** 흐름 및 단계 간 **입·출력 계약**
- `LegalKnowledgeResearchBrief` · `LegalKnowledgeLawyerReviewDecision` 논리 엔티티
- Intake → Brief → Review → Packet **상태·게이트**
- 기존 `GongbuhoPacket` · `approve` API · AuditLog **재사용 경계**
- 금지·준수 메타(UGC·출처 없는 APPROVED 방지)

### 2.2 비포함(후속)

- Prisma 모델·마이그레이션
- Research Brief·Lawyer Review **관리 UI** (별도 UI 설계)
- AI 자동 초안 생성(프롬프트·모델) — 본 설계는 **산출물 형태·게이트**만 고정
- Compiler §4 [5] 제품 반영(QuestionSet project·사건 apply) — **APPROVED 이후** 기존 Phase 3〜4 흐름

---

## 3. 파이프라인 개요

Compiler §4와 1:1 대응:

```text
[1] LegalKnowledgeDemandIntake          ← Intake Spec (Spec LOCKED)
         status: READY_FOR_RESEARCH
              ↓  gate: intakeCompliance.noRawUgcStored === true
              ↓        mappedCaseType 확정 · demandStrength 운영 승인(권장)
[2] LegalKnowledgeResearchBrief         ← Compiler §4 [2] 근거 확인
              ↓  gate: canonicalSourceRefs ≥ 1 · prohibited scan PASS
[3] LegalKnowledgeLawyerReviewDecision  ← Compiler §4 [3] 변호사 검수
              ↓  gate: APPROVE · reviewerAttestation · PII scan PASS
[4] GongbuhoPacket (DRAFT)              ← Compiler §4 [4] 구조화
              ↓  gate: GONGBUHO_STANDARD 필수 블록 · lineage 메타
[5] GongbuhoPacket (APPROVED)           ← 기존 approve API · AuditLog
              ↓  gate: Compiler §5 검수 게이트 전부 · ADMIN+ 승인
[6] 제품 반영 (기존)                    ← QuestionSet project · Case apply · Trace
```

**원칙**: 화살표는 **단방향**이다. `APPROVED` 패킷을 Intake 없이 역주입하지 않는다(운영자 수동 JSON 업로드는 **레거시·예외 경로**로 유지하되, 신규 백로그는 본 파이프라인 우선).

---

## 4. 단계별 엔티티

### 4.1 입력: `LegalKnowledgeDemandIntake` (handoff)

Intake Spec SSOT. 파이프라인 **진입 조건**:

| 조건 | 필수 |
| --- | --- |
| `status === READY_FOR_RESEARCH` | 예 |
| `intakeCompliance.noRawUgcStored === true` | 예 |
| `caseTypeMapping.mappedCaseType !== null` | 예 |
| `querySignature`에 금지 필드 없음 | 예 |

진입 시 Intake는 `RESEARCH_IN_PROGRESS` 로 전이(§6).  
`READY_FOR_RESEARCH` **이전** `GongbuhoPacket` 생성 API 호출 **금지**(Intake Spec §6.1과 동일 gate).

### 4.2 `LegalKnowledgeResearchBrief`

**Compiler §4 [2]** 산출물. 법령·판례·공공자료 **포인터·요약**만 담고, UGC·네이버 본문·출처 불명 URL 본문은 담지 않는다.

```ts
/** 설계 SSOT — 구현 전 타입 계약 */
type LegalKnowledgeResearchBrief = {
  id?: string;

  /** 연결 Intake (1:1 기본) */
  intakeId: string;

  /** Intake.querySignature.normalizedKeyword 스냅샷(비식별). 원문 아님 */
  demandKeywordSnapshot: string;

  /** Intake.caseTypeMapping.mappedCaseType */
  targetCaseType: string;

  /** 신규 vs 기존 패킷 확장 */
  packetIntent: "NEW_PACKET" | "EXTEND_EXISTING";

  /** EXTEND_EXISTING 시 기존 code. NEW_PACKET 시 null */
  targetGongbuhoCode: string | null;

  /** 공신력 출처 참조 목록 — 본문 일괄 복붙 금지 */
  canonicalSourceRefs: CanonicalSourceRef[];

  /** 구조화 쟁점·요건 메모(UGC 인용 금지) */
  legalIssueOutline: string;

  /** 질문·출력·금지 규칙 **초안 방향**(문장 템플릿 아님) */
  structureHints: {
    suggestedQuestionThemes: string[];
    suggestedOutputSections: string[];
    suggestedForbiddenThemes: string[];
  };

  /** Research 준수 메타(§5) */
  researchCompliance: ResearchComplianceMeta;

  status: LegalKnowledgeResearchBriefStatus;

  preparedByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

#### `CanonicalSourceRef` — 허용 출처 유형

| `sourceKind` | 예시 식별자 | 저장 허용 |
| --- | --- | --- |
| `STATUTE` | 법령명·조문번호·시행일 | 조문 **포인터**·1〜2문장 요약 |
| `PRECEDENT` | 사건번호·법원·선고일 | 쟁점 **요약**·사건번호 |
| `ADMIN_GUIDANCE` | 행정기관 문서 ID·공고 번호 | 제목·URL(공공)·요약 |
| `OFFICIAL_COMMENTARY` | 공신력 있는 해석 자료 ID | 요약·포인터만 |

**금지 `sourceKind`**: `BLOG`, `CAFE`, `KNOWLEDGE_IN`, `NAVER_SNIPPET`, `UNVERIFIED_URL`.

```ts
type CanonicalSourceRef = {
  sourceKind: "STATUTE" | "PRECEDENT" | "ADMIN_GUIDANCE" | "OFFICIAL_COMMENTARY";
  /** 식별 가능한 공식 키 */
  citationKey: string; // 예 "민법 제565조", "2023다12345"
  /** 공공·공식 URL(선택). 스크래핑 본문 필드 금지 */
  officialUrl?: string | null;
  /** 1〜3문장 구조화 요약. UGC·AI 환각을 그대로 기록 금지 */
  summaryPointer: string;
  verifiedAt?: string; // ISO 8601
  verifiedByUserId?: string;
};
```

### 4.3 `LegalKnowledgeLawyerReviewDecision`

**Compiler §4 [3]** 산출물. 변호사(또는 위임된 법무 검수자)의 **구조·표현·고위험** 판단 기록.

```ts
type LegalKnowledgeLawyerReviewDecision = {
  id?: string;

  researchBriefId: string;
  intakeId: string;

  /** 검수 결과 */
  decision: "APPROVE_FOR_PACKET_DRAFT" | "REQUEST_BRIEF_REVISION" | "REJECT";

  /** APPROVE 시 필수 — 검수자 신원(감사) */
  reviewerAttestation: {
    reviewerUserId: string;
    reviewerRole: "LAWYER" | "DELEGATED_LEGAL_REVIEWER";
    reviewedAt: string;
    /** UGC·PII·확정적 판단 문구 없음 선언 */
    noUgcOrPiiInReviewNotes: true;
  };

  /** 구조화 검수 메모. 사건 실명·연락처·UGC 인용 금지 */
  reviewNotes: string;

  /** 고위험·추가 expertReviewPoints 권고 */
  highRiskFlags?: string[];

  /** REJECT / REQUEST_BRIEF_REVISION 사유 코드 */
  rejectionReasonCode?: string | null;

  status: LegalKnowledgeLawyerReviewStatus;

  createdAt?: string;
  updatedAt?: string;
};
```

**원칙**: `APPROVE_FOR_PACKET_DRAFT` 없이 **`GongbuhoPacket` DRAFT 생성 금지**. STAFF 단독 APPROVE 금지(Compiler §4 표 · [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md)).

### 4.4 `GongbuhoPacket` DRAFT → APPROVED

기존 Prisma `GongbuhoPacket` · `packetJson` · `GongbuhoPacketStatus` 재사용.

| 단계 | DB `status` | 의미 |
| --- | --- | --- |
| 패킷 초안 생성 | `DRAFT` | Brief+Review에서 **컴파일**된 JSON. 사건 apply **불가** |
| 내부 편집(선택) | `DRAFT` \| `REVIEW` | 운영자 미세 수정 · 2차 검토 |
| 승인 | `APPROVED` | `POST …/approve` · `GONGBUHO_PACKET_APPROVED` AuditLog |
| 폐기 | `ARCHIVED` | 기존 archive API |

#### 패킷 lineage 메타(권장 · `packetJson.meta` 또는 별도 컬럼)

파이프라인 출처를 Trace·감사에 연결한다.

```ts
type LegalKnowledgePacketLineage = {
  /** 본 패킷이 Legal Knowledge Pipeline 경유임을 표시 */
  compilerPipelineVersion: "2026-05-23";
  intakeId: string;
  researchBriefId: string;
  lawyerReviewDecisionId: string;
  /** Intake demandKeywordSnapshot (비식별) */
  demandKeywordSnapshot: string;
  /** canonicalSourceRefs citationKey 목록(포인터만) */
  canonicalCitationKeys: string[];
};
```

**패킷 JSON 본문**은 [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md) 필수 블록을 충족해야 하며, Research Brief의 `structureHints`는 **초안 작성 보조**일 뿐 SSOT가 아니다. 최종 `questionFlow`·`forbiddenRules` 등은 **검수 후 패킷 JSON**이 SSOT.

---

## 5. 준수·금지 메타

### 5.1 `ResearchComplianceMeta`

```ts
type ResearchComplianceMeta = {
  compilerPolicyVersion: "2026-05-23";
  intakeComplianceInherited: true;
  /** Brief에 UGC·네이버 본문 없음 */
  noRawUgcStored: true;
  /** canonicalSourceRefs.length >= 1 확인 */
  minCanonicalSourcesMet: true;
  prohibitedFieldScan?: "PASS" | "FAIL" | null;
  attestedByUserId?: string;
  attestedAt?: string;
};
```

### 5.2 파이프라인 전 구간 금지 필드

Intake Spec §5.1 금지 목록 **상속** + 추가:

- `scrapedHtml`, `naverSearchResult`, `knowledgeInQuestion`, `blogExcerpt`
- Research Brief·Review·패킷 `meta`에 **출처 불명 URL 본문**
- Lawyer Review에 **확정적 법률 결론**을 “최종 답변” 형태로 기록(패킷화는 구조·검토 포인트 수준)

### 5.3 Compiler §5 검수 게이트 매핑

| Compiler 게이트 | 파이프라인 확인 지점 |
| --- | --- |
| 출처 검증 | Research Brief `canonicalSourceRefs` + 패킷 lineage |
| 법률 근거 확인 | Brief citationKey + 패킷 `knowledgeMap`·`expertReviewPoints` 연결 |
| 변호사 승인 | Lawyer Review `APPROVE_FOR_PACKET_DRAFT` + 패킷 `humanApproval` + `approve` API |
| 개인정보 제거 | Intake·Brief·Review 금지 필드 스캔 |

**`APPROVED` 전** 위 네 게이트 **모두** PASS. 미충족 시 QuestionSet project·사건 apply **중단**(기존 Phase 3〜4 정책과 동일).

---

## 6. 상태 머신

### 6.1 Intake (파이프라인 구간 확장)

Intake Spec §6.1에 **파이프라인 전용** 상태를 추가한다(구현 Phase에서 Intake Spec bump).

| 상태 | 의미 |
| --- | --- |
| `READY_FOR_RESEARCH` | 파이프라인 **진입 대기** |
| `RESEARCH_IN_PROGRESS` | Research Brief 작성 중 |
| `LAWYER_REVIEW_PENDING` | Brief 완료 · 변호사 검수 대기 |
| `PACKET_DRAFT_LINKED` | `GongbuhoPacket` DRAFT 연결 |
| `PACKET_APPROVED` | 연결 패킷 APPROVED · 파이프라인 **종료** |
| `PIPELINE_REJECTED` | Brief/Review 거부 · Intake 종료 |

`LINKED_TO_PACKET_DRAFT`(Intake Spec)는 **`PACKET_DRAFT_LINKED`** 와 동치로 취급(명칭 통합은 구현 Phase).

### 6.2 `LegalKnowledgeResearchBriefStatus`

| 상태 | 다음 |
| --- | --- |
| `DRAFT` | 근거 수집·편집 |
| `READY_FOR_LAWYER_REVIEW` | `canonicalSourceRefs` ≥ 1 · compliance PASS |
| `REVISION_REQUESTED` | Lawyer Review `REQUEST_BRIEF_REVISION` |
| `SUPERSEDED` | 새 Brief 버전으로 대체 |
| `ARCHIVED` | 이력 보관 |

### 6.3 `LegalKnowledgeLawyerReviewStatus`

| 상태 | 다음 |
| --- | --- |
| `PENDING` | 검수 대기 |
| `APPROVED` | `APPROVE_FOR_PACKET_DRAFT` — 패킷 DRAFT 생성 허용 |
| `REVISION_REQUESTED` | Brief `REVISION_REQUESTED` |
| `REJECTED` | Intake `PIPELINE_REJECTED` |

### 6.4 패킷 DRAFT → APPROVED

기존 [GONGBUHO_ADMIN_APPROVAL_UI.md](./GONGBUHO_ADMIN_APPROVAL_UI.md):

- `approveGongbuhoPacket`: `DRAFT` \| `REVIEW` → `APPROVED` (ADMIN+)
- 파이프라인 출처 패킷도 **동일 API** · 동일 Audit 이벤트 `GONGBUHO_PACKET_APPROVED`

패킷 APPROVED 시 Intake → `PACKET_APPROVED` · Audit `GONGBUHO_LEGAL_KNOWLEDGE_PIPELINE_COMPLETED`(안, §7).

---

## 7. Audit · Trace 경계

| 이벤트(안) | 시점 | payload 원칙 |
| --- | --- | --- |
| `GONGBUHO_LEGAL_KNOWLEDGE_RESEARCH_BRIEF_CREATED` | Brief DRAFT | intakeId, briefId, targetCaseType |
| `GONGBUHO_LEGAL_KNOWLEDGE_RESEARCH_BRIEF_READY` | READY_FOR_LAWYER_REVIEW | citationKey **목록**만 |
| `GONGBUHO_LEGAL_KNOWLEDGE_LAWYER_REVIEW_RECORDED` | Review 저장 | decision, reviewerUserId |
| `GONGBUHO_LEGAL_KNOWLEDGE_PACKET_DRAFT_FROM_PIPELINE` | DRAFT 생성 | packetId, lineage ids |
| `GONGBUHO_PACKET_APPROVED` | 기존 | packetId, actorId |
| `GONGBUHO_LEGAL_KNOWLEDGE_PIPELINE_COMPLETED` | Intake 종료 | intakeId, packetId, code, version |

**GongbuhoTrace**는 **사건 apply 이후**만(기존 Phase 3). 파이프라인 자체는 **AuditLog** 위주.

구현 시 `gongbuho-audit-events.ts` 확장 · [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md) 부록 갱신.

---

## 8. API·저장소 스케치(미구현)

**관리자 전용** (`assertGongbuhoOperation` 패턴). 권한은 Brief=STAFF+ 조회·ADMIN+ 생성, Review=**LAWYER 역할 또는 위임**, 패킷 DRAFT=ADMIN+.

| Method | 경로(안) | 역할 |
| --- | --- | --- |
| `POST` | `/api/admin/gongbuho/legal-knowledge/intake/[intakeId]/research-brief` | Brief 생성 · Intake→`RESEARCH_IN_PROGRESS` |
| `PATCH` | `…/research-brief/[briefId]` | Brief 편집 |
| `POST` | `…/research-brief/[briefId]/ready-for-review` | READY_FOR_LAWYER_REVIEW + compliance 검증 |
| `POST` | `…/research-brief/[briefId]/lawyer-review` | Review 기록 |
| `POST` | `…/lawyer-review/[reviewId]/compile-packet-draft` | Review APPROVE 시 **GongbuhoPacket DRAFT** 생성(lineage 포함) |
| `POST` | `/api/admin/gongbuho/[gongbuhoId]/approve` | **기존** — DRAFT→APPROVED |

**금지**: Intake `READY_FOR_RESEARCH` 미충족 · Review 미승인 · `canonicalSourceRefs` 빈 배열로 DRAFT 생성.

---

## 9. 기존 코드 재사용·경계

| 기존 | 재사용 | 비고 |
| --- | --- | --- |
| `gongbuho-packet.service.ts` | DRAFT insert · approve · archive | lineage 메타 병합만 추가 |
| `POST /api/admin/gongbuho` | 레거시 수동 생성 | 신규 백로그는 pipeline API 우선 |
| `gongbuho-case-candidate.service` | **APPROVED만** | 변경 없음 |
| `project-gongbuho-question-set` | APPROVED 후 | Phase 3-B 그대로 |
| Intake API (Intake Spec §7) | 진입·목록 | 본 파이프라인과 **동일 prefix** 권장 |

---

## 10. 운영 시나리오(요약)

1. Intake `READY_FOR_RESEARCH` (예: `전세보증금 반환` · `JEONSE` · 신규 패킷)
2. 법무 STAFF가 Brief 작성 — `민법`·대법원 판례 **포인터** 2건 이상
3. 담당 변호사 Review `APPROVE_FOR_PACKET_DRAFT`
4. ADMIN이 `compile-packet-draft` → `GongbuhoPacket` DRAFT (`LAW-JEONSE-001` v1.0.0)
5. 패킷 JSON 편집·`humanApproval` 확인 → `approve` → **APPROVED**
6. 기존 QuestionSet project · 사건 apply

**거부 경로**: Review `REJECT` → Intake `PIPELINE_REJECTED` · Brief ARCHIVED. UGC 유입 발견 → compliance FAIL · Compiler §8 RCA.

---

## 11. 정적 게이트(잠금)

`npm run verify:gongbuho`가 검사한다:

- 본 문서 존재 · `Legal Knowledge` · `Research Brief` · `Lawyer Review`
- `canonicalSourceRefs` · `GongbuhoPacket` · `APPROVED` · `READY_FOR_RESEARCH`
- `noRawUgcStored` · `APPROVE_FOR_PACKET_DRAFT` · `NAVER_SNIPPET` · `KNOWLEDGE_IN`
- Intake Spec · Compiler Policy 교차 링크 · README 링크
- `IMPLEMENTATION_EVIDENCE` `[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-PACKET-PIPELINE-SPEC]`

---

## 12. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | Legal Knowledge **패킷 생성 파이프라인** 설계 초안 |
| 2026-05-23 | **Spec LOCKED** — `verify:gongbuho` · IMPLEMENTATION_EVIDENCE 증빙 |
