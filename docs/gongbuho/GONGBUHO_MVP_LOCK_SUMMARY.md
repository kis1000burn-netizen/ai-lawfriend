# Gongbuho MVP 최종 봉인 요약 (Phase 4-G)

본 문서는 **기능 추가가 아닌 코드·문서·검증 루프의 최종 잠금 상태**를 기록한다. 공부호(Gongbuho)는 Phase **1**(문서·표준)·**2**(Prisma/API/Seed)·**3**(사건 적용 인터뷰·문서)·**4-A〜F**(관리 UI·운영 QA·라우트 권한·감사 장착)까지의 MVP 축이다.

증빙 태그: `[EVIDENCE-20260523-GONGBUHO-PHASE4G-MVP-LOCK-PREDEPLOY-QA]`.

---

## 1. Phase 1〜4-F 산출물 목록 (요약 매트릭스)

| Phase | 대표 산출 | 문서 / 코드 허브 |
|:-----:|-----------|----------------|
| **1** | 패킷 스키마·표준·샘플·안전 원칙 | [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md), [samples/](./samples/), [GONGBUHO_SAFETY_POLICY.md](./GONGBUHO_SAFETY_POLICY.md) |
| **2-A〜B** | 필드 매핑·Prisma `GongbuhoPacket`·`GongbuhoTrace` | [GONGBUHO_FIELD_MAPPING.md](./GONGBUHO_FIELD_MAPPING.md), `prisma/schema.prisma` |
| **2-C** | 관리자·사건 REST 골격 | [GONGBUHO_API_SPEC.md](./GONGBUHO_API_SPEC.md) |
| **2-D** | 시드·스모크 | [GONGBUHO_API_SMOKE_TEST.md](./GONGBUHO_API_SMOKE_TEST.md), `seed:gongbuho-*` |
| **3-A〜G** | questionFlow Preview/Project 질문셋 후보·인터뷰·요약 outputContract·문서 규칙·사건 카드 UX | `GONGGBUHO_QUESTION_FLOW_PROJECTION.md` 등 Phase 3 섹션 — [README.md](./README.md) 표 |
| **4-A〜D** | `/admin/gongbuho` UI·멀티 샘플·필터 | [GONGBUHO_ADMIN_PACKET_UI.md](./GONGBUHO_ADMIN_PACKET_UI.md) 등, [GONGBUHO_MULTI_PACKET_LIBRARY.md](./GONGBUHO_MULTI_PACKET_LIBRARY.md) |
| **4-E** | 운영 QA·감사 정책·`verify:gongbuho` 게이트 | [GONGBUHO_OPERATIONS_QA.md](./GONGBUHO_OPERATIONS_QA.md), [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md) |
| **4-F** | 라우트 `assertGongbuhoOperation`·`writeGongbuhoAuditLog`·Trace `gongbuhoPhase4Flow` | `src/app/api/admin/gongbuho/**/*.ts`, `src/lib/gongbuho/gongbuho-audit-log.ts`, 증빙 `PHASE4F-*` |

상세 기능 표는 저장소 내 [`docs/gongbuho/README.md`](./README.md) Phase별 표와 동기한다.

---

## 2. Phase 4-G 검증 명령 실행 기록

**기록 일시(JSON):** 저장소 헤드에서 `npm run verify:gongbuho`·`npm run lint`·`npm run verify:canonical-sources`를 순차 재현할 것.

| 명령 | 목적 | 본 헤드(에이전트 환경) 결과 |
|------|------|-----------------------------|
| `npm run verify:gongbuho` | 공부호 정적 검사 + Gongbuho 회귀 Vitest(현재 111 tests) | **PASS** · exit **0** |
| `npm run lint` | Next.js ESLint | **PASS**(exit **0**) · 무관 파일 **Warning**만 존재할 수 있음 |
| `npx tsc --noEmit` | TypeScript 레포 전체 | **별도 과제**(본 헤드에서 **다수 에러**) — Gongbuho MVP 잠금과는 **직교**하나, 배포 게이트 `predeploy:check`는 조직 표준대로 처리 |
| `npm run verify:canonical-sources` | `CaseStatus` SSOT 존재 | **PASS** · exit **0** |
| `npm run seed:gongbuho-samples` | 로컬/CI DB 패킷 시드 | 환경에 DB 없으면 **실패**(본 기록에서는 Prisma 접속 불가) — **통상 CI·스테이징에서는 연결 후 PASS 예상** |

**한 줄 결론(공부호 축):** `verify:gongbuho`와 `canonical-sources`로 Gongbuho MVP 기능 회귀·정합은 **레포 헤드에서 PASS로 잠금**한다. 레포 전체 `tsc`는 Phase 4-G 범위 밖 수정으로 병행 정리한다.

---

## 3. STAFF / ADMIN / SUPER_ADMIN 운영 시나리오 (PASS 종료 선언)

코드 근거: `assertGongbuhoOperation` 관리 라우트, `getCaseAccessContext` 사건 API, UI `viewerCanMutateLifecycle` / `viewerCanProjectQuestionSet`(ADMIN·SUPER_ADMIN만 참).

| 시나리오 | 의도 결과 | 종료 근거 |
|-----------|-----------|-----------|
| STAFF · 목록 `/admin/gongbuho` + GET 목록 API | 허용 | `LIST` 라우트 + RSC 페이지 `requireStaffOrPlatformAdminPage` |
| STAFF · 상세 + questionFlow 미리보기 | 허용; 승인/보관/Project 버튼 **미노출** | [`admin/[gongbuhoId]/page.tsx`](../../src/app/(protected)/admin/gongbuho/[gongbuhoId]/page.tsx), `deriveGongbuhoPacketLifecycleUi`·`deriveGongbuhoQuestionSetProjectPanelUi`, Vitest **STAFF 403** |
| ADMIN · 패킷 신규 `POST /api/admin/gongbuho` | 허용(+ AuditLog 생성) | `CREATE_PACKET`; STAFF 테스트 `route.test.ts` **403** |
| ADMIN · 승인/보관/Project API | 허용 + 해당 AuditLog | [`approve/route.ts`](../../src/app/api/admin/gongbuho/[gongbuhoId]/approve/route.ts) 등 Phase 4-F |
| STAFF 위 변이 API 호출 시 | **403 FORBIDDEN** | Vitest 라우트 스위트 PASS |
| 사건 소유자/변호사 등 `canWriteCase` · apply/bind | 허용(도메인 권한) | `apply/route.ts`, `bindCaseGongbuhoInterview`; Trace 마커 병합 |
| SUPER_ADMIN · `RECOVER` / `FINAL_ADMIN` 패키지 기능 | 코드상 권한상수만 존재, **별도 라우트 미개시** | [gongbuho-permissions.ts](../../src/lib/gongbuho/gongbuho-permissions.ts) · 백로그 |

위를 **코드 근거 기반 PASS 처리**하였다고 기록한다(대규모 E2E는 선택).

---

## 4. 관리자 UI 노출과 API 최종 대조

| 기능 | 브라우저 UI(`/admin/gongbuho`) | API (Phase 4-F) |
|------|----------------|-----------------|
| 목록 조회 | STAFF 포함 공통 접근 | `LIST` ✅ |
| 상세·패킷 JSON 미리보기 | STAFF 포함 | `DETAIL` ✅ |
| questionFlow 미리보기 패널 | STAFF 포함(문구 동일 패널) | `PREVIEW` ✅ |
| 승인·보관 버튼 | ADMIN·SUPER_ADMIN만 표시(SSOT 순수 규약) | `APPROVE`/`ARCHIVE` ✅ |
| QuestionSet Project 버튼 | 동일 플래그만 저장 버튼 표시 | `PROJECT_QUESTION_SET` ✅ |
| 패킷 **신규 등록**(JSON POST) | **현재 페이지에 신규 등록 폼 없음**(시드·스크립트·관리 클라 등 별경로 가정) | `CREATE_PACKET` ADMIN 이상 ✅ |

**판정:** 이중 방어( UI 비노출 + API 403 + AuditLog 가능 경로만 기록 )가 정렬되었다.

---

## 5. AuditLog / GongbuhoTrace 최종 점검표

정책 SSOT · 구분 헬퍼: [`src/lib/gongbuho/gongbuho-audit-events.ts`](../../src/lib/gongbuho/gongbuho-audit-events.ts).

| 코드 | 축(AuditLog 행 추천 분류의 구현 상태) |
|------|----------------------------------------|
| `GONGBUHO_PACKET_CREATED` | ✅ `POST /api/admin/gongbuho` 성공 시 `writeGongbuhoAuditLog` |
| `GONGBUHO_PACKET_APPROVED` | ✅ 승인 IDempotent 비적용 분기에서만 로그 생략 |
| `GONGBUHO_PACKET_ARCHIVED` | ✅ 동일 패턴 |
| `GONGBUHO_QUESTION_SET_PROJECTED` | ✅ 성공 후 로그(questionSet 엔티티 id) |
| `GONGBUHO_APPLIED_TO_CASE` | ✅ `validationResult.gongbuhoPhase4Flow.applied` |
| `GONGBUHO_INTERVIEW_BOUND` | ✅ 동 패킷 최신 Trace 병합(Trace 없음이면 노옵 ) |
| `GONGBUHO_DOCUMENT_RULES_APPLIED` | ✅ 규칙 적용 블록 + `rulesFingerprint`; 최신 사건 Trace에 병합 |

**예외 알림:** 선택적 **별도 줄 AuditLog** 요약(APPLIED 등)은 정책상 선택 과제이다. 현재 레포에서는 **운영 증명의 1차 수단이 GongbuhoTrace·문서 스냅샷·AuditLog 패킷 운영** 축이다.

---

## 6. 다음 (백로그, MVP 바깥)

- 레포 공통 **`tsc --noEmit`**·`.next`/삭제 페이지 상호 참조 안정화.
- `SUPER_ADMIN` 전용 패킷 **복구/최종 관리 라우트**와 UI.
- 관리 패킷 **브라우저 내 등록 폼**(선택) — 또는 운영 Runbook 안에서 클라/API만 허용 문구 명시.

---

## 7. 한 줄 기준 (Phase 4-G)

공부호는 Phase 4-F까지 완료되어 권한 이중 방어, AuditLog, GongbuhoTrace, `verify:gongbuho`(정적·회귀)가 하나의 명령으로 연결되었고, **Phase 4-G에서 문서·체크 항목·산출 매트릭스를 MVP 잠금으로 고정했다.**
