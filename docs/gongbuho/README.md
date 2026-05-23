# 공부호(Gongbuho) · AI법친 Phase 1 문서

**공부호**는 AI법친에 붙는 별도 “챗봇”이 아니라, 사건 유형별 질문·요약·문서·검증·전문가 검토 기준을 **버전 관리 가능한 패킷**으로 묶고, 사건마다 적용 이력을 남기는 **상위 사고 구조 표준**입니다. 지식 구축의 최상위 원칙(**Legal Knowledge Compiler**)은 [GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md)를 따릅니다.

음성 입·출력 레이어는 [`docs/voice/README.md`](../voice/README.md)의 Phase 5 기준을 따르며, 기존 Gongbuho → QuestionSet → Interview 흐름을 변경하지 않고 **입출력 계층으로만** 연결한다.

## Phase 1 (문서 우선 잠금)

| 문서 | 설명 |
|------|------|
| [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md) | 패킷 스키마·버전·Trace·인간 승인 원칙 |
| [samples/](./samples/) | 공부호 샘플 라이브러리(JSON) · 표는 [GONGBUHO_MULTI_PACKET_LIBRARY.md](./GONGBUHO_MULTI_PACKET_LIBRARY.md) §1 참조 |
| [GONGBUHO_ENGINE_SPEC.md](./GONGBUHO_ENGINE_SPEC.md) | 코드베이스 적용 파이프라인(Phase 2 이후 구현 근거) |
| [GONGBUHO_SAFETY_POLICY.md](./GONGBUHO_SAFETY_POLICY.md) | 안전·고지·금지 행위·책임 분리 |
| [GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md) | **지식 구축 헌법** — Legal Knowledge Compiler · 수요 레이더 · 검수·패킷화 |
| [GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md) | **Legal Knowledge Intake** — 수요 신호·매핑·원문 금지 메타 (**Spec LOCKED**) |
| [GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md) | **Legal Knowledge 패킷 파이프라인** — Intake → Research Brief → Lawyer Review → DRAFT → APPROVED (**Spec LOCKED**) |
| [GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md) | **Phase 4-I** — Legal Knowledge Intelligence Dashboard (backlog·funnel·gap·SLA·준수 메타) |

## Phase 2-A (필드명 고정 · Prisma 전)

| 문서 | 설명 |
|------|------|
| [GONGBUHO_FIELD_MAPPING.md](./GONGBUHO_FIELD_MAPPING.md) | JSON Body ↔ 저장소 ↔ Trace ↔ API 이름 계약(SSOT 표) |

작업 코드명 예: **AI법친 Gongbuho Phase 2-A — Field Mapping & Prisma Schema Draft**

## Phase 2-B (Prisma 초안)

- `prisma/schema.prisma`: `GongbuhoPacket`·`GongbuhoTrace`·`GongbuhoPacketStatus`
- 마이그레이션: `prisma/migrations/20260523183000_gongbuho_packet_trace/`
- 증빙: `[EVIDENCE-20260523-GONGBUHO-PHASE2B-PRISMA-SCHEMA-DRAFT]` (`docs/project-governance/IMPLEMENTATION_EVIDENCE.md`)

## Phase 2-C (REST API 최소 골격)

| 문서 | 설명 |
|------|------|
| [GONGBUHO_API_SPEC.md](./GONGBUHO_API_SPEC.md) | 라우트·권한·오류 코드·Trace 정책 |

**엔드포인트 초안**: `GET/POST /api/admin/gongbuho`, `GET /api/admin/gongbuho/[id]`, `POST …/approve`, Phase 4-B `POST …/archive`, Phase 4-C `POST …/question-set/project`(플랫폼 관리자 전용)·`POST …/question-flow/preview`(STAFF+), `POST /api/cases/[caseId]/gongbuho/apply`, `GET …/trace`, …(이하 동일).

작업 코드명: **AI법친 Gongbuho Phase 2-C — Admin & Case Apply API Skeleton**

## Phase 2-D (Seed & 스모크 검증)

| 문서 / 스크립트 | 설명 |
|-----------------|------|
| [GONGBUHO_API_SMOKE_TEST.md](./GONGBUHO_API_SMOKE_TEST.md) | 시드 실행·관리 승인·적용·Trace·실패 분기 체크 |
| `npm run seed:gongbuho-law-fraud-001` | LAW_FRAUD_001 JSON → DB `GongbuhoPacket`(DRAFT)·멱등(라이브러리 검증 포함) |
| `npm run seed:gongbuho-samples` | `docs/gongbuho/samples/*_GONGBUHO.json` 전체 순회 삽입(Phase 4-D) |
| `npm run verify:gongbuho` | Gongbuho 정적 게이트(Phase 4-E〜F)·샘플 `caseType` + Vitest 회귀 묶음 |

작업 코드명: **AI법친 Gongbuho Phase 2-D — Sample Seed & API Smoke Verification**

## Phase 3-A (questionFlow 투영)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_QUESTION_FLOW_PROJECTION.md](./GONGBUHO_QUESTION_FLOW_PROJECTION.md) | 필드 매핑·검증·preview 정책 |
| `POST /api/admin/gongbuho/[gongbuhoId]/question-flow/preview` | `QuestionSetQuestion[]` 미리보기(DB 없음·모든 패킷 상태 허용) |
| `src/features/gongbuho/project-gongbuho-question-flow.ts` | `projectGongbuhoQuestionFlowToQuestions()` |

작업 코드명: **AI법친 Gongbuho Phase 3-A — questionFlow to QuestionSet Projection**

## Phase 3-B (공부호 → QuestionSet DRAFT 저장)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_QUESTION_SET_PROJECTION.md](./GONGBUHO_QUESTION_SET_PROJECTION.md) | Preview와 저장 분리 · `definitionJson` envelope · 중복 방지 정책 |
| `POST /api/admin/gongbuho/[gongbuhoId]/question-set/project` | **APPROVED** 패킷만 `QuestionSet` DRAFT 행 저장 |
| `src/features/gongbuho/project-gongbuho-question-set.service.ts` | 패킷 조회 · 중복 검사 · 공부호 전용 투영(`project-gongbuho-question-flow`) 후 `createQuestionSet` 호출 |

작업 코드명: **AI법친 Gongbuho Phase 3-B — QuestionSet Draft Projection**

## Phase 3-C (사건 · Gongbuho 후보)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_CASE_BINDING.md](./GONGBUHO_CASE_BINDING.md) | `Case.category` ↔ `caseType` · 선택 정책 · Trace·초안 플래그 |
| `GET /api/cases/[caseId]/gongbuho/candidates` | APPROVED 후보만 · `AUTO_IF_SINGLE_APPROVED` / `REQUIRE_CODE_VERSION_IF_MULTIPLE` / `NO_APPROVED_PACKET` |
| `src/features/gongbuho/gongbuho-case-candidate.service.ts` | 후보·질문셋 envelope 역스캔·latestTrace 요약 조립 |

작업 코드명: **AI법친 Gongbuho Phase 3-C — Case Gongbuho Candidate Binding**

## Phase 3-D (인터뷰 질문셋 바인딩)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_INTERVIEW_BINDING.md](./GONGBUHO_INTERVIEW_BINDING.md) | DRAFT 비노출 원칙 · `Case.questionSetId` · 게시·활성만 바인딩 |
| `GET /api/cases/[caseId]/gongbuho/interview` | 연결 상태·`questions[]` 조회(`canRead`) |
| `POST /api/cases/[caseId]/gongbuho/interview/bind` | 명시 또는 `{"auto":true}` (`canWriteCase`) |
| `src/features/gongbuho/gongbuho-interview-binding.service.ts` | 정합 검증·자동 단일 후보 바인딩 |
| `src/features/case-interview/case-interview.service.ts` | 사건 `questionSetId` 우선 질문 소스 |

작업 코드명: **AI법친 Gongbuho Phase 3-D — Interview Flow Binding**

## Phase 3-E (사건 요약 outputContract 바인딩)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_SUMMARY_OUTPUT_CONTRACT.md](./GONGBUHO_SUMMARY_OUTPUT_CONTRACT.md) | `outputContract.summary` 적용 우선순위·fallback·고지·Trace 연계 후보 정리 |
| `POST /api/cases/[caseId]/summary/generate` | 인터뷰 기반 1차 요약 · 공부호 있으면 `contractSections` |
| `src/features/gongbuho/gongbuho-summary-contract.service.ts` | 패킷 JSON 조회(trace → envelope) · 섹션 휴리스틱 채우기 |

작업 코드명: **AI법친 Gongbuho Phase 3-E — Summary OutputContract Binding**

## Phase 3-F (문서 초안 validation/forbidden 규칙 바인딩)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_DOCUMENT_RULES_BINDING.md](./GONGBUHO_DOCUMENT_RULES_BINDING.md) | `validationRules`/`forbiddenRules`/expert 검토 플래그 · Trace·스냅샷 · 자동 수정 안 함 |
| `POST /api/cases/[caseId]/documents/generate` | 문서 초안 생성 시 프롬프트 첨부 · 본문 검출 · 응답 `gongbuhoDocumentRules` |
| `src/features/gongbuho/gongbuho-document-rules.service.ts` | 패킷 규칙 파싱 · 탐지 · Trace 병합 |

작업 코드명: **AI법친 Gongbuho Phase 3-F — Document Validation & Forbidden Rules Binding**

## Phase 3-G (사건 상세 검토 카드 UX)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_LAWYER_REVIEW_UX.md](./GONGBUHO_LAWYER_REVIEW_UX.md) | 의뢰인·변호사/스태프·플랫폼 관리자별 문구·노출 계약 |
| `src/features/gongbuho/case-gongbuho-review-ux.ts` | 사건 상세용 공부호 검토 뷰 모델 집계·순수 매퍼 |
| `src/components/cases/case-gongbuho-review-card.tsx` | Trace·후보·outputContract·문서 규칙·risk·검토 포인트 카드 |
| `src/app/(protected)/cases/[caseId]/page.tsx` | 카드 삽입 |

작업 코드명: **AI법친 Gongbuho Phase 3-G — Lawyer Review UX Integration**

- **카드 데이터 신선도**: 검토 카드는 **SSR 시점**(페이지 로드 또는 `router.refresh()` 등으로 서버가 다시 그릴 때) 기준입니다. 같은 화면에서 문서만 생성·재생성한 직후 숫자가 바로 안 바뀔 수 있다는 설명은 [`GONGBUHO_LAWYER_REVIEW_UX.md`](./GONGBUHO_LAWYER_REVIEW_UX.md) §「SSR 렌더 타이밍」 참조. 즉각 반영은 **Phase 3-H(선택)·UX 폴리시**에서 처리.

## Phase 4 (관리자 운영 UI · 계획)

운영자가 공부호를 브라우저에서 등록·검토·승인·투영까지 하려면 관리 화면이 필요합니다(API는 Phase 2-C 이후 대부분 존재).

| 세부 단계 | 작업 코드명(안) | 목표 |
|-----------|-----------------|------|
| **4-A** | AI법친 Gongbuho Phase 4-A — Admin Packet Management UI | `GongbuhoPacket` **목록/상세** 조회 UI (`/admin/gongbuho`) — [GONGBUHO_ADMIN_PACKET_UI.md](./GONGBUHO_ADMIN_PACKET_UI.md) |
| **4-B** | Phase 4-B — Approve / Archive UI | 상세 패널·ADMIN 전용 `approve`/`archive` API·STAFF 버튼 비노출 — [GONGBUHO_ADMIN_APPROVAL_UI.md](./GONGBUHO_ADMIN_APPROVAL_UI.md) |
| **4-C** | Phase 4-C — Preview & QuestionSet Project UI | 미리보기(RSC)·ADMIN 전용 `question-set/project`·중복 초안 표시 — [GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md](./GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md) |
| **4-D** | Phase 4-D — Multi Packet Library Expansion | LAW-WAGE 등 샘플·통합 시드·목록 `status`/`caseType` 필터 SSOT · [GONGBUHO_MULTI_PACKET_LIBRARY.md](./GONGBUHO_MULTI_PACKET_LIBRARY.md) |
| **4-E** | Phase 4-E — Ops QA · Audit Closure | 운영 QA·정책·`verify:gongbuho` 기반 봉인 — [GONGBUHO_OPERATIONS_QA.md](./GONGBUHO_OPERATIONS_QA.md), [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md) |
| **4-F** | Phase 4-F — Route Permission & Audit Wiring | 관리 라우트 `assertGongbuhoOperation`·`writeGongbuhoAuditLog`·사건 Trace `gongbuhoPhase4Flow` 장착 — 증빙 `[EVIDENCE-20260523-GONGBUHO-PHASE4F-ROUTE-PERMISSION-AUDIT-WIRING]` |
| **4-G** | Phase 4-G — MVP Lock & Pre-deploy QA | 기능 추가 없이 산출·검증·운영 QA·UI/API 대조·감사 점검을 **PASS 기준으로 봉인** — [GONGBUHO_MVP_LOCK_SUMMARY.md](./GONGBUHO_MVP_LOCK_SUMMARY.md), 증빙 `[EVIDENCE-20260523-GONGBUHO-PHASE4G-MVP-LOCK-PREDEPLOY-QA]` |
| **4-H** | Phase 4-H — Legal Knowledge RC / Predeploy Closure | Compiler→Intake→Pipeline→Implementation→Lawyer Portal **릴리즈 후보 봉인** — [GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md](./GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md), [`verify:gongbuho-legal-knowledge-rc`](../../package.json), 증빙 `[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-RC-PREDEPLOY-CLOSURE]` |
| **4-I** | Phase 4-I — Legal Knowledge Intelligence Dashboard | Intake·Brief·Review·Packet **backlog·전환율·수요 gap·SLA** — [GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md), `/admin/gongbuho/legal-knowledge/dashboard`, 증빙 `[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTELLIGENCE-DASHBOARD]` |

## Gongbuho Phase 4-E — Operations QA, Permissions & Audit Closure

공부호 Phase 4-E는 Phase 4-D까지 확장된 다중 공부호 샘플 라이브러리를 실제 운영 전 점검 가능한 상태로 봉인하는 단계이다.

### 목표

- 관리자 운영 흐름의 권한 기준 정리(SSOT 코드: `src/lib/gongbuho/gongbuho-permissions.ts`)
- AuditLog와 GongbuhoTrace 역할 분리(SSOT 코드: `src/lib/gongbuho/gongbuho-audit-events.ts`)
- Seed / Sample / API / UI model 검증 묶음 정리
- 운영 스모크 체크리스트 작성(GONGBUHO_OPERATIONS_QA.md)
- `npm run verify:gongbuho` 검증 스크립트 추가(정적 게이트 + Vitest 회귀)
- `IMPLEMENTATION_EVIDENCE.md` 증빙 추가

### 핵심 문서

- [GONGBUHO_OPERATIONS_QA.md](./GONGBUHO_OPERATIONS_QA.md)
- [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md)

### 핵심 검증

```bash
npm run seed:gongbuho-samples
npm run verify:gongbuho
npm run lint
npx tsc --noEmit
```

권장 추가 검증:

```bash
npm run verify:canonical-sources
```

### 권한 기준 요약

| 역할 | 허용 |
|------|------|
| STAFF | 목록/상세 조회, questionFlow Preview |
| ADMIN | STAFF 권한 + 패킷 **API 신규 생성**(`CREATE_PACKET`)·승인·보관·QuestionSet Project / 시드 패킷 운영 |
| SUPER_ADMIN | ADMIN 권한 + 운영 복구/최종 관리 |

### 한 줄 기준

공부호 Phase 4-E는 운영 QA·권한·감사로그·검증 스크립트로 공부호 MVP를 1차 운영 봉인하는 단계이다.

다음 권장 착수: **Phase 3-H**(선택)·사건 카드 신선도 등 UX 폴리시. 신규 공부호 **패킷 수정 API**(버전 업 전략)는 운영 백로그.

## Gongbuho Phase 4-F — Route Permission & Audit Wiring

Phase 4-F는 Phase 4-E 정책을 **실제 REST 라우트**에 장착한다.

- 관리 API: 각 엔드포인트별 `assertGongbuhoOperation` (STAFF는 조회·Preview만 등).
- **패킷 생성** `POST /api/admin/gongbuho`: **ADMIN 이상만** 가능(`CREATE_PACKET`).
- 생성·승인·보관·QuestionSet Project 성공 시 `writeGongbuhoAuditLog` → `auditLog`.
- 사건 적용 시 Trace `validationResult.gongbuhoPhase4Flow.applied`에 실행자(`actorUserId`)·정책 이벤트 코드.
- 인터뷰 바인딩 시 동일 패킷 최신 Trace에 `interviewBound` 마커 병합.
- 문서 생성 시 적용 규칙 블록이 있으면 `documentRulesApplied`·`rulesFingerprint`를 최신 Trace에 병합(기존 `documentDraftGenerations` 확장 유지).

`npm run verify:gongbuho` 정적 게이트에 Phase 4-F 라우트/서비스 마커가 포함된다.

증빙: `[EVIDENCE-20260523-GONGBUHO-PHASE4F-ROUTE-PERMISSION-AUDIT-WIRING]`

## Gongbuho Phase 4-G — MVP Lock & Pre-deploy QA

Phase 4-G는 신규 API·UI 기능이 아니라 **운영 진입 가능한 MVP 축을 문서와 검증 루프로 최종 고정**하는 단계이다.

- 단일 허브: [GONGBUHO_MVP_LOCK_SUMMARY.md](./GONGBUHO_MVP_LOCK_SUMMARY.md) — Phase 1〜4-F 산출 매트릭스, `verify:gongbuho`·`lint`·`canonical-sources`·(`tsc`·seed는 환경/별도 과제), 역할별 시나리오·UI/API 대조·AuditLog·GongbuhoTrace 최종 표.
- 스크립트: `scripts/verify-gongbuho.mjs` 에 MVP 요약 파일·증빙 태그·운영 QA **Phase 4-G**/`PASS` 키워드 게이트 포함.
- Governance: [`docs/project-governance/IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md) 상단 `[EVIDENCE-20260523-GONGBUHO-PHASE4G-MVP-LOCK-PREDEPLOY-QA]`.

증빙: `[EVIDENCE-20260523-GONGBUHO-PHASE4G-MVP-LOCK-PREDEPLOY-QA]`

## Gongbuho Phase 4-H — Legal Knowledge RC / Predeploy Closure

Phase 4-H는 Legal Knowledge **전 운영 흐름**을 **릴리즈 후보(RC)** 로 봉인한다. 신규 기능 추가 없이 문서·정적 게이트·predeploy hook으로 배포 직전 재현 가능하게 고정한다.

- RC 잠금: [GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md](./GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md) — Compiler·Intake·Pipeline·Implementation·Lawyer Portal 매트릭스 · 불변 gate 7항
- Predeploy 체크: [GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md](./GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md)
- 마커: [`gongbuho-legal-knowledge-rc-lock.ts`](../../src/lib/gongbuho/gongbuho-legal-knowledge-rc-lock.ts)
- 정적 게이트: `npm run verify:gongbuho-legal-knowledge-rc` (`verify:gongbuho` 선행)
- Predeploy: [`scripts/predeploy-check.ts`](../../scripts/predeploy-check.ts) — Voice RC 다음 Gongbuho Legal Knowledge RC gate

증빙: `[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-RC-PREDEPLOY-CLOSURE]`

## Gongbuho Phase 4-I — Legal Knowledge Intelligence Dashboard

Phase **4-I**는 **4-H RC** 이후 Legal Knowledge 파이프라인 **운영 가시성**을 추가한다. Voice Phase **7-A**와 동일하게 **본문·UGC 원문 없이 메타만** 표시한다.

- Spec: [GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md)
- UI: `/admin/gongbuho/legal-knowledge/dashboard`
- API: `GET /api/admin/gongbuho/legal-knowledge/dashboard` (STAFF+ · `LEGAL_KNOWLEDGE_READ`)
- 검증: `npm run verify:gongbuho` Phase 4-I 블록 · E2E dashboard API 401 gate

증빙: `[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTELLIGENCE-DASHBOARD]`

## Phase 4-A 산출물 (적용됨)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_ADMIN_PACKET_UI.md](./GONGBUHO_ADMIN_PACKET_UI.md) | `/admin/gongbuho` 목록·상세·권한·패킷 노출 원칙 |
| `src/app/(protected)/admin/gongbuho/page.tsx` | 목록(`packetJson` 미포함) · Phase 4-D `GET` 필터 바 |
| `src/app/(protected)/admin/gongbuho/[gongbuhoId]/page.tsx` | 상세 + 미리보기 + 구조 카운트 |
| `src/components/admin/gongbuho/*` · `admin-gongbuho-ui-model.ts` · `require-staff-or-platform-admin-page.ts` | UI·집계·RSC 진입 게이트 |

작업 코드명: **AI법친 Gongbuho Phase 4-A — Admin Packet Management UI**

## Phase 4-B 산출물 (적용됨)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_ADMIN_APPROVAL_UI.md](./GONGBUHO_ADMIN_APPROVAL_UI.md) | 승인·보관·역할 노출(SSOT)·삭제 불가 원칙 |
| `POST /api/admin/gongbuho/[id]/approve`(기존) · `POST /api/admin/gongbuho/[id]/archive`(신규) | ADMIN·SUPER_ADMIN 전용 (`assertGongbuhoOperation`) · 성공 시 `writeGongbuhoAuditLog` (Phase 4-F) |
| `archiveGongbuhoPacket` · `admin-gongbuho-lifecycle-ui.ts` · `gongbuho-packet-lifecycle-panel.tsx` | 서버 전이 · 순수 버튼 결정 로직 · `router.refresh()` |

작업 코드명: **AI법친 Gongbuho Phase 4-B — Admin Approval & Archive UI**

## Phase 4-C 산출물 (적용됨)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md](./GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md) | 권한(SSOT)·UI 규약·오류 표시 |
| `deriveGongbuhoQuestionFlowPreview` · `deriveGongbuhoQuestionSetProjectPanelUi` | 순수 규약 + Vitest |
| `gongbuho-question-flow-preview-panel.tsx` · `gongbuho-question-set-project-panel.tsx` | 미리보기(RSC)·저장 패널(Client, `router.refresh()`) |
| `POST …/question-set/project` · `assertGongbuhoOperation` (`PROJECT_QUESTION_SET`) | STAFF 403 · 성공 시 `GONGBUHO_QUESTION_SET_PROJECTED` AuditLog (Phase 4-F) |

작업 코드명: **AI법친 Gongbuho Phase 4-C — Admin Preview & QuestionSet Project UI**

## Phase 4-D 산출물 (적용됨)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_MULTI_PACKET_LIBRARY.md](./GONGBUHO_MULTI_PACKET_LIBRARY.md) | 멀티 패킷 운영 규약·샘플 표·시드·필터 후보 |
| `docs/gongbuho/samples/` | `LAW_WAGE_001` 등 + 기존 `LAW_FRAUD_001` |
| `seed:gongbuho-samples` · `scripts/seed-gongbuho-samples.ts` | 라이브러리 Zod·questionFlow 검증 후 멱등 삽입 |
| `gongbuhoSampleLibraryPacketSchema` | 샘플 `caseType` 필수 |
| `gongbuho-packet-list-filters.tsx` | `status`·`caseType`·`code` 쿼리 |
| Vitest | 샘플 디렉터리 순회·네거티브 케이스 |

작업 코드명: **AI법친 Gongbuho Phase 4-D — Multi Packet Library Expansion**

## Phase 4-E 산출물 (적용됨)

| 문서 · 코드 | 설명 |
|-------------|------|
| [GONGBUHO_OPERATIONS_QA.md](./GONGBUHO_OPERATIONS_QA.md) | 권한 매트릭스·운영 QA 체크리스트(PENDING)·운영 스모크 순서·`verify:gongbuho` 설명 |
| [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md) | AuditLog vs GongbuhoTrace 목적표·금지 원칙·이벤트 SSOT 교차링크 |
| `src/lib/gongbuho/gongbuho-permissions.ts` | 공부호 운영 행위(`GongbuhoOperation`)·역할 허용·`canOperateGongbuho` |
| `src/lib/gongbuho/gongbuho-audit-events.ts` | `GONGBUHO_AUDIT_EVENTS` 및 Audit/Trace 분할 헬퍼 |
| `scripts/verify-gongbuho.mjs` | 필수 문서·소스·샘플 존재·키워드·샘플 `caseType` 정적 검증 |
| `scripts/run-gongbuho-verify.mjs` | Gongbuho Vitest 회귀 묶음(Web `[caseId]` 경로 회피) |
| `npm run verify:gongbuho` | 위 두 단계 순차 실행(`package.json`) |

작업 코드명: **AI법친 Gongbuho Phase 4-E — Operations QA, Permissions & Audit Closure**

## Phase 4-F 산출물 (적용됨)

| 코드 | 설명 |
|------|------|
| `src/lib/gongbuho/gongbuho-audit-log.ts` | `writeGongbuhoAuditLog` — AuditLog 클래스 이벤트만 필터링하여 기록 |
| 관리 Gongbuho 라우트 | `assertGongbuhoOperation` + 승인/보관/Project/목록 생성 감사 |
| `mergeLatestGongbuhoTraceInterviewBinding` 등 | 인터뷰·문서 규칙 Trace `gongbuhoPhase4Flow` 마커 |
| `scripts/verify-gongbuho.mjs` | Phase 4-F 배선 정적 문자열 검사 |

작업 코드명: **AI법친 Gongbuho Phase 4-F — Route Permission & Audit Wiring Closure**

## 개발팀 전달 요약 문장

> AI법친의 공부호 적용은 사건 유형별 질문셋·인터뷰·요약·문서 템플릿·위험검증·변호사 검토 포인트를 하나의 버전 관리 가능한 사고 구조 패킷으로 통합하고, 사건별 적용 이력을 **GongbuhoTrace**로 남기는 작업이다.

`GongbuhoPacket`(또는 동등 개념)은 **정의 원본**, `GongbuhoTrace`는 **사건 적용 스냅샷**이다.
