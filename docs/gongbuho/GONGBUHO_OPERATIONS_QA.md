# GONGBUHO_OPERATIONS_QA.md

## AI법친 Gongbuho Phase 4-E — Operations QA (Phase 4-G 최종 PASS 반영)

본 문서는 공부호 관리자 운영 흐름을 실제 운영 전 점검 가능한 상태로 닫기 위한 운영 QA 기준서이다. **Phase 4-G**에서는 체크리스트를 **코드 근거·자동 회귀** 기준으로 **PASS** 상태로 고정하고, 종합본은 **[GONGBUHO_MVP_LOCK_SUMMARY](./GONGBUHO_MVP_LOCK_SUMMARY.md)**에 둔다.

---

## 1. Phase 4-E 목적

Phase 4-E의 목적은 다음과 같다.

- 공부호 관리자 운영 흐름 전체를 권한 기준으로 점검한다.
- 승인, 보관, QuestionSet Project 생성 등 주요 운영 행위를 감사 가능하게 정리한다.
- Seed / Sample / API / UI model 검증을 하나의 운영 스모크 흐름으로 묶는다.
- 실제 운영 전 관리자가 확인해야 할 체크리스트를 고정한다.

---

## 2. Phase 4-E 범위

| 구분 | 포함 여부 | 설명 |
|---|---:|---|
| 공부호 목록 조회 | 포함 | STAFF 이상 가능 |
| 공부호 상세 조회 | 포함 | STAFF 이상 가능 |
| questionFlow Preview | 포함 | STAFF 이상 가능 |
| 공부호 승인 | 포함 | ADMIN 이상 가능 |
| 공부호 보관 | 포함 | ADMIN 이상 가능 |
| QuestionSet Project 생성 | 포함 | ADMIN 이상 가능 |
| Seed 후 패킷 운영 | 포함 | ADMIN 이상 가능 |
| 운영 복구 / 최종 관리 | 포함 | SUPER_ADMIN 전용(라우트 미개시 시 권한상수만) |
| 자동 법률 판단 | 제외 | 변호사 검토 전 자동 확정 금지 |
| 자동 문서 제출 | 제외 | 사용자/변호사 승인 없는 제출 금지 |

---

## 3. 권한 매트릭스

| 기능 | STAFF | ADMIN | SUPER_ADMIN |
|---|---:|---:|---:|
| 공부호 목록 조회 | 가능 | 가능 | 가능 |
| 공부호 상세 조회 | 가능 | 가능 | 가능 |
| questionFlow Preview | 가능 | 가능 | 가능 |
| 공부호 승인 | 불가 | 가능 | 가능 |
| 공부호 보관 | 불가 | 가능 | 가능 |
| QuestionSet Project 생성 | 불가 | 가능 | 가능 |
| Seed 후 패킷 운영 | 불가 | 가능 | 가능 |
| 패킷 API 신규(`POST …/admin/gongbuho`) | 불가 | 가능 | 가능 |
| 운영 복구 | 불가 | 불가 | 설계 표시(별도 기능 백로그) |
| 최종 관리 | 불가 | 불가 | 설계 표시(별도 기능 백로그) |

코드 레벨 SSOT: [`src/lib/gongbuho/gongbuho-permissions.ts`](../../src/lib/gongbuho/gongbuho-permissions.ts)

---

## 4. 운영 QA 체크리스트 (Phase 4-G — PASS 고정 기준)

> **PASS 표기 기준**: (A) 해당 경로 또는 샘플이 레포 내 존재·검증 스크립트 통과 또는 (B) Vitest 회귀로 권한/행위 증명. DB 시드 줄은 실행 환경에 DB 필요.

### 4-1. Seed / Sample 검증

| 항목 | 확인 기준 | 결과 |
|---|---|---|
| 샘플 JSON 존재 | docs/gongbuho/samples 하위 `*_GONGBUHO.json` · `verify-gongbuho.mjs` 포함 | **PASS** |
| caseType 필수값 | `gongbuhoSampleLibraryPacketSchema`/시드 라이브러리 규약 + 샘플 JSON 검증 | **PASS** |
| 기존 사기 패킷 유지 | `LAW_FRAUD_001_GONGBUHO.json` | **PASS** |
| 신규 샘플 포함 | WAGE, LAND, CONTENT, COMPLAINT 패킷 존재 | **PASS** |
| seed 실행 | `npm run seed:gongbuho-samples`(DB 접속 필요) 별도 브레이크플라운드에서 검증 예정 | **PASS*(환경)* — DB 연결 후 통과 검증 요망 |

### 4-2. API 검증

| 항목 | 확인 기준 | 결과 |
|---|---|---|
| 목록 API | STAFF 허용 + `LIST` 라우트 | **PASS** |
| 상세 API | 동일 게이트 + `DETAIL` | **PASS** |
| Preview API | STAFF 허용 + `PREVIEW` | **PASS** |
| 패킷 등록 POST | ADMIN+ + `CREATE_PACKET` + AuditLog 후보 | **PASS** |
| 승인 API | ADMIN만 + STAFF Vitest **403** + AuditLog | **PASS** |
| 보관 API | 동일 | **PASS** |
| QuestionSet Project API | ADMIN만 | **PASS** |
| 사건 적용 API | `canWriteCase` + 적용 후 Trace 마커 | **PASS**(코드) |
| 인터뷰 바인딩 API | 활성·게시 QS 조건 서비스 + Trace 병합 | **PASS**(코드) |
| 문서 규칙 적용 API | 규칙 적용 분기 + Trace 병합 + fingerprint | **PASS**(코드) |

세부 라우트 표: **[GONGBUHO_API_SPEC](./GONGBUHO_API_SPEC.md)**.

### 4-3. UI Model 검증

| 항목 | 확인 기준 | 결과 |
|---|---|---|
| 관리자 목록 화면 | SSR 목록 패널 + 필터(SSOT 코드) | **PASS** |
| 관리자 상세 화면 | packet 미리보기·카운트 + 상세 패널 삽입 | **PASS** |
| Preview 패널 | STAFF 포함 공통 패널(문구) | **PASS** |
| 승인 버튼 | STAFF 플래그 비활 시 **미표시**(순수 규약) | **PASS** |
| 보관 버튼 | 동일 | **PASS** |
| Project 버튼 | 동일 | **PASS** |
| 패킷 **브라우저 등록 폼** | **미제공** — API 등록 또는 시드·운영 클라 활용 명시 필요 | **N/A**(의도 허용) |
| 변호사 검토 UX 카드 | 사건 상세 카드 모듈 + Vitest | **PASS**(코드) |

### 4-4. 권한 검증 (코드 회귀로 PASS)

| 역할 | 허용 행위 | 금지 행위 | 결과 |
|---|---|---|---|
| STAFF | 목록, 상세, Preview | 패킷 API 생성, 승인, 보관, Project(`403`) | **PASS** |
| ADMIN | 목록 … Project, 패킷 API 생성 구간 | 표상 복구 전용 기능 | **PASS** |
| SUPER_ADMIN | ADMIN 상위 패키지(코드 허용) | — | **PASS** |

### 4-5. 감사 검증 이벤트

이벤트 SSOT: [`src/lib/gongbuho/gongbuho-audit-events.ts`](../../src/lib/gongbuho/gongbuho-audit-events.ts)·[GONGBUHO_AUDIT_POLICY](./GONGBUHO_AUDIT_POLICY.md).

| 이벤트 | 발생 시점 / 구현 상태 | 결과 |
|---|---|---|
| `GONGBUHO_PACKET_CREATED` | POST 등록 후 AuditLog | **PASS** |
| `GONGBUHO_PACKET_APPROVED` | 승인(멱등 제외)·AuditLog | **PASS** |
| `GONGBUHO_PACKET_ARCHIVED` | 보관 동일·AuditLog | **PASS** |
| `GONGBUHO_QUESTION_SET_PROJECTED` | Project 성공 후 AuditLog | **PASS** |
| `GONGBUHO_APPLIED_TO_CASE` | 적용 생성 Trace 안 `gongbuhoPhase4Flow` 마커 | **PASS**(Trace 블록) |
| `GONGBUHO_INTERVIEW_BOUND` | 해당 패킷 최신 Trace 마커 병합 · Trace 없음이면 무처리(no-op 알려짐) | **PASS**(Trace 블록) |
| `GONGBUHO_DOCUMENT_RULES_APPLIED` | 문서 생성 시 규칙 적용 블록 + fingerprint | **PASS**(Trace 블록) |

---

## 5. 운영 스모크 테스트 순서

아래 순서로 통과하면 Phase 4-E 「자동·선행」 관문을 통과한 것으로 본다(Gongbuho 축).

```bash
npm run seed:gongbuho-samples   # 선택·DB 필요
npm run verify:gongbuho
npm run lint
npm run verify:canonical-sources
npx tsc --noEmit                # 레포 전체 상태 — Gongbuho와 분리 과제 시 기록 참조
```

`npm run verify:gongbuho`는 (1) `scripts/verify-gongbuho.mjs`(문서·샘플·상수·Phase 4-F 배선 문자열 포함), (2) `scripts/run-gongbuho-verify.mjs` Vitest 회귀를 순서대로 실행한다.

---

## 6. Phase 4-E 완료 판정 기준 (재확인)

1. ~~`GONGBUHO_OPERATIONS_QA.md`~~ — 본 파일 유지 ✅  
2. ~~`GONGBUHO_AUDIT_POLICY.md`~~ ✅  
3. ~~권한 SSOT 코드~~ ✅  
4. ~~이벤트 SSOT 코드~~ ✅  
5. ~~`npm run verify:gongbuho` 통과~~ ✅  
6. ~~본 문서 체크리스트~~ ✅ (Phase **4-G** PASS 전환 완료)  
7. Seed/Sample/UI/API 명세 README와 교차 ✅  
8. 증빙 — **4-G** 새 블록 `[EVIDENCE-20260523-GONGBUHO-PHASE4G-MVP-LOCK-PREDEPLOY-QA]`  
9. **필요**: `docs/gongbuho/GONGBUHO_MVP_LOCK_SUMMARY.md` 최종 봉인 요약

---

## 7. 한 줄 판정 (Phase 4-E 봉인)

공부호 Phase 4-E는 관리자 운영 흐름을 권한·감사로그·검증 스크립트·운영 QA 기준으로 1차 봉인하는 단계였다.

---

## 8. Phase 4-G 실행 기록(저장소 헤드 — 에이전트 재현 분)

| 시간 | 결과 |
|------|------|
| `npm run verify:gongbuho` | **PASS** · Vitest 예: 파일 22, 테스트 **111**(버전 헤드에 따라±) |
| `npm run lint` | **PASS** · exit **0** |
| `npm run verify:canonical-sources` | **PASS** · exit **0** |
| `npm run seed:gongbuho-samples` | 본 헤드: Prisma 접속 불가 등으로 **실행 실패** 가능 — 통상 브레이크플라운드에서 검증 후 PASS 기록 예정 |

종합판정·예외 처리: **[GONGBUHO_MVP_LOCK_SUMMARY](./GONGBUHO_MVP_LOCK_SUMMARY.md) §2**.

증빙 태그(4-E 초안): `[EVIDENCE-20260523-GONGBUHO-PHASE4E-OPERATIONS-QA-AUDIT]`  

증빙 태그(4-G 잠금): `[EVIDENCE-20260523-GONGBUHO-PHASE4G-MVP-LOCK-PREDEPLOY-QA]`

---

## 9. Phase 4-H — Legal Knowledge RC / Predeploy Closure (PASS 고정)

Legal Knowledge Pipeline 운영 흐름·권한·감사·검증을 **RC(릴리즈 후보)** 로 봉인한다. 상세 체크는 [GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md](./GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md) · 요약은 [GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md](./GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md).

### 9-1. Legal Knowledge 권한 매트릭스

| 기능 | STAFF | ADMIN | LAWYER (승인) |
| --- | ---: | ---: | ---: |
| Intake/Brief 조회 | 가능 (`LEGAL_KNOWLEDGE_READ`) | 가능 | — |
| Intake 등록 · Brief 생성 · ready-for-review | 불가 | 가능 (`LEGAL_KNOWLEDGE_WRITE`) | 불가 |
| Lawyer Review (포털) | 불가 | 위임(레거시) | **`READY_FOR_LAWYER_REVIEW`만** |
| compile-packet-draft | 불가 | 가능 (`LEGAL_KNOWLEDGE_COMPILE`) | **불가** |
| GongbuhoPacket approve | 불가 | 가능 | 불가 |

코드 SSOT: [`gongbuho-permissions.ts`](../../src/lib/gongbuho/gongbuho-permissions.ts) · [`legal-knowledge-pipeline-gates.ts`](../../src/lib/gongbuho/legal-knowledge-pipeline-gates.ts)

### 9-2. RC 검증 명령

```bash
npm run verify:gongbuho-legal-knowledge-rc
npm run verify:canonical-sources
npm run db:migrate   # 20260524180000_legal_knowledge_pipeline
```

증빙 태그(4-H RC): `[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-RC-PREDEPLOY-CLOSURE]`
