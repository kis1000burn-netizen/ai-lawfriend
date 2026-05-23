# AI법친 운영 복구 체크리스트

> **파일명**: `OPERATIONS_RECOVERY.md`  
> **목적**: 운영 패치 적용 이후 오류 발생 시 원인 분류 → 긴급 안정화 → 최소 복구 → 정상화 검수까지 한 번에 수행하기 위한 운영 복구 문서  
> **함께 볼 문서**: [PATCH_FINAL_CHECKLIST.md](./PATCH_FINAL_CHECKLIST.md) (마감 검수), [DEPLOY_PRECHECK.md](./DEPLOY_PRECHECK.md) (배포 직전)

---

## 1. 문서 목적

이 문서는 AI법친 프로젝트 운영 패치 적용 이후, 오류 발생 시 **원인 분류 → 긴급 안정화 → 최소 복구 → 정상화 검수**까지 한 번에 수행할 수 있도록 만든 운영 복구 문서입니다.

이번 복구 문서의 목적은 다음과 같습니다.

- 운영 패치 반영 이후 장애 발생 시 우선순위를 빠르게 판단
- 권한, API, build, route, session 관련 오류를 최소 범위로 복구
- 앱을 다시 띄우기 위한 최소 롤백 경로를 확보
- 배포 전후 장애 대응 흐름을 표준화

---

## 2. 적용 범위

이번 복구 문서의 적용 범위는 아래와 같습니다. (App Router는 **`src/app/...`** 기준입니다.)

- `src/middleware.ts`
- `src/lib/auth/roles.ts`
- `src/lib/auth/guards.ts`
- `src/lib/auth/ops-admin-paths.ts`
- `src/components/auth/RoleGate.tsx`
- `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`
- `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/release-meta/route.ts`
- `src/lib/release-meta.ts`
- `src/lib/env-zod.ts`
- `src/app/layout.tsx`
- `src/app/(protected)/admin/system/page.tsx`
- `src/components/admin/alerts/ops-queue/OpsQueueKanbanBoard.tsx`
- `prisma/seed.ts`
- `package.json`

---

## 3. 초기 대응 원칙

아래 원칙을 먼저 지킵니다.

- [ ] 장애 발생 시 먼저 **build 오류인지 런타임 오류인지** 구분한다
- [ ] 새 기능 확장보다 **앱 재기동 가능 상태 복구**를 우선한다
- [ ] Prisma schema / migration 은 이번 단계에서 건드리지 않는다
- [ ] route 경로 체계를 추가 변경하지 않는다
- [ ] import alias / session 함수명 / model명 / field명 보정부터 확인한다

---

## 4. 증상 분류

### 4.1 컴파일 단계 실패

- [ ] `Cannot find module ...`
- [ ] `Module has no exported member ...`
- [ ] `Property ... does not exist on type ...`
- [ ] `redirect is not defined`
- [ ] `headers() should be awaited ...`

### 4.2 런타임 단계 실패

- [ ] `/admin` 접근 시 권한 흐름 이상
- [ ] `/api/health` 비정상 응답
- [ ] `/api/release-meta` 접근 권한 이상
- [ ] bulk-edit / rebalance-apply 400 / 403 / 429 / 500
- [ ] STAFF / ADMIN 권한 분기 오류

### 4.3 배포 후 실패

- [ ] 로컬 build 는 성공했지만 서버에서만 실패
- [ ] env 누락 또는 release meta 문제
- [ ] 세션 판독 방식 차이
- [ ] 배포 환경의 alias / build 순서 차이

---

## 5. 1차 복구 절차

### 5.1 import / export 복구

- [ ] 새로 추가한 import 경로가 실제 alias 규칙과 일치하는지 확인 (`@/*` → `./src/*` 이면 **`@/lib/...`**)
- [ ] `@/src/lib/...` 오타·혼용 여부 확인
- [ ] `requireRoleApi`, `AppRole`, `getReleaseMetaInline` export 누락 여부 확인
- [ ] session 함수명이 실제 프로젝트 export와 일치하는지 확인

### 5.2 session / role 복구

- [ ] `getSessionUser` / `getCurrentUser` / `getServerSessionUser` 중 실제 함수명 확인
- [ ] session user 에 `role` 이 포함되는지 확인
- [ ] `STAFF`, `ADMIN`, `SUPER_ADMIN` 문자열 표기가 통일되었는지 확인
- [ ] `requireRolePage(...)` 반환형이 실제 페이지 코드와 일치하는지 확인 (본 레포: 실패 시 `redirect`, 성공 시 `user`)

### 5.3 Prisma 복구

- [ ] prisma singleton import 경로 확인
- [ ] route 에서 사용한 model명이 `schema.prisma` 와 일치하는지 확인 (본 레포 예: `OpsQueueTicket`)
- [ ] update/create 필드명이 실제 schema와 일치하는지 확인
- [ ] priority enum 값이 실제 enum 과 일치하는지 확인

---

## 6. 원인별 복구 우선순위

### 6.1 앱이 아예 빌드되지 않을 때

- [ ] **`npm run dev` 실행 중이면 종료** — Windows Prisma `query_engine-*.dll.node` EPERM → [Predeploy 로컬 · CI 런북](docs/operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md) §2
- [ ] import alias부터 수정
- [ ] export 누락 수정
- [ ] 타입명 보정
- [ ] prisma model / field명 보정
- [ ] 다시 `npm run build` 확인

### 6.2 앱은 뜨지만 `/admin` 권한 흐름이 깨질 때

- [ ] `src/middleware.ts` 우선 확인
- [ ] STAFF 허용 경로 유틸 확인
- [ ] 느슨한 prefix 허용 코드 제거 여부 확인
- [ ] 세션에서 role을 실제로 읽고 있는지 확인

### 6.3 API만 실패할 때

- [ ] `src/lib/auth/guards.ts` 의 `requireRoleApi(...)` 확인
- [ ] route body schema 와 프론트 body shape 일치 여부 확인
- [ ] requestId / logger / rate limit 로직 확인
- [ ] 실제 Prisma mutation 대상 model / field 재확인

### 6.4 system / health / release-meta 만 실패할 때

- [ ] `src/app/api/health/route.ts` 최소 응답 구조 확인
- [ ] `/api/release-meta` 의 ADMIN 보호 확인
- [ ] `src/app/(protected)/admin/system/page.tsx` 의 self-fetch 제거 여부 확인
- [ ] `src/app/layout.tsx` 의 env 강제 실행 제거 여부 확인

---

## 7. 최소 롤백 세트

앱을 다시 띄우는 것이 최우선일 때, 아래 순서로 최소 롤백합니다.

### 7.1 1순위 롤백

- [ ] `src/middleware.ts`
- [ ] `src/lib/auth/guards.ts`
- [ ] `src/lib/auth/roles.ts`

### 7.2 2순위 롤백

- [ ] `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`
- [ ] `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`

### 7.3 3순위 롤백

- [ ] `src/app/(protected)/admin/system/page.tsx`
- [ ] `src/app/api/release-meta/route.ts`
- [ ] `src/app/api/health/route.ts`

### 7.4 마지막 롤백

- [ ] `src/components/auth/RoleGate.tsx`
- [ ] `src/components/admin/alerts/ops-queue/OpsQueueKanbanBoard.tsx`
- [ ] `prisma/seed.ts`
- [ ] `package.json`

---

## 8. grep 기반 빠른 확인

아래 검색으로 흔한 실수를 빠르게 찾습니다. (Windows에서는 **`rg`** 권장.)

```bash
rg 'from "@/src/' src
rg "getSessionUser|getCurrentUser|getServerSessionUser|requireRoleApi" src
rg 'pathname\.startsWith\("/admin/alerts/ops"\)' src
rg "/api/admin/ops-queue/" src
rg "fetch.*release-meta|/api/release-meta" src
rg "parseProductionEnv\(\)" src app
rg -n "^model " prisma/schema.prisma
```

**점검 결과**

- [ ] alias 충돌 없음
- [ ] session 함수명 충돌 없음
- [ ] 느슨한 STAFF 허용 코드 없음
- [ ] 중복 ops route 없음
- [ ] self-fetch 없음
- [ ] layout 강제 env 실행 흔적 없음
- [ ] schema 기준 model명 확인 완료

---

## 9. 복구 후 검수 절차

### 9.1 Lint

```bash
npm run lint
```

- [ ] 통과

### 9.2 Test

```bash
npm run test
```

- [ ] 통과

### 9.3 Build

```bash
npm run build
```

- [ ] 통과

### 9.4 Dev 실행

```bash
npm run dev
```

- [ ] 정상 실행

---

## 10. 복구 후 수동 스모크 테스트

### 10.1 STAFF 계정

- [ ] `/admin/alerts/ops-queue` 접근 가능
- [ ] `/admin/alerts/ops-dashboard` 접근 가능
- [ ] `/admin/audit-logs` 접근 가능
- [ ] `/admin/system` 접근 시 `/dashboard` 로 이동
- [ ] 조회 전용 배너 노출

### 10.2 ADMIN 계정

- [ ] `/admin/system` 접근 가능
- [ ] `/admin/*` 전체 접근 가능
- [ ] `/api/release-meta` 정상 응답
- [ ] bulk-edit 정상 동작
- [ ] rebalance-apply 정상 동작

### 10.3 공통 API

- [ ] `/api/health` 정상
- [ ] 응답에 `requestId` 포함 확인(해당 route 기준)
- [ ] 잘못된 입력 시 검증 오류 응답 확인 가능

---

## 11. 복구 완료 판정

### 정상 복구

- [ ] 앱 정상 기동
- [ ] build 성공
- [ ] 권한 분기 정상
- [ ] 운영 API 정상
- [ ] 배포 진행 가능

### 부분 복구

- [ ] 앱은 기동되지만 권한 분기 미세 보정 필요
- [ ] build는 성공하지만 route body shape 재보정 필요
- [ ] 운영 API 일부 추가 검수 필요

### 복구 실패

- [ ] 최소 롤백 세트 적용 필요
- [ ] patch 적용 범위를 재분리 필요
- [ ] 세션/모델명/필드명 원본 기준 재대조 필요

---

## 12. 운영 메모

운영 장애 시 가장 먼저 볼 파일은 **`src/middleware.ts`** 입니다. 그다음은 **`guards.ts`**, **bulk-edit**, **rebalance-apply** 순서입니다.

구조를 더 바꾸기보다, **원래 동작하던 코드로 최소 범위 복구**하는 것이 우선입니다.

---

## 관련 문서

- [PATCH_FINAL_CHECKLIST.md](./PATCH_FINAL_CHECKLIST.md) — 패치 마감 검수
- [DEPLOY_PRECHECK.md](./DEPLOY_PRECHECK.md) — 배포 직전 확인
- [docs/operations-recovery-checklist.md](./docs/operations-recovery-checklist.md) — 요약 체크리스트
- [docs/post-patch-verification.md](./docs/post-patch-verification.md) — 패치 직후 명령
- [docs/minimum-rollback-playbook.md](./docs/minimum-rollback-playbook.md) — 최소 롤백 플레이북
