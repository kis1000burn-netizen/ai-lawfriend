# OPERATIONS_INDEX.md

## AI법친 운영 문서 인덱스

> **파일명**: `docs/OPERATIONS_INDEX.md`  
> **목적**: 운영 관련 문서를 한곳에서 찾고, 상황별로 어떤 문서를 먼저 볼지 빠르게 판단하기 위한 인덱스  
> **루트 세트**: [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) · [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md) · [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

---

## 1. 문서 목적

이 문서는 AI법친 프로젝트의 운영 관련 문서를 한곳에서 찾고, 상황에 따라 어떤 문서를 먼저 봐야 하는지 빠르게 판단할 수 있도록 만든 운영 문서 인덱스입니다.

이번 인덱스 문서의 목적은 다음과 같습니다.

- 운영 문서의 역할을 명확히 구분
- 장애 대응, 패치 검수, 배포 전 확인 흐름을 빠르게 연결
- 운영 담당자 또는 후속 작업자가 필요한 문서를 즉시 찾을 수 있도록 정리
- 문서 간 중복 확인 시간을 줄이고, 실제 대응 순서를 단순화

---

## 2. 문서 구성

현재 운영 문서 세트는 아래와 같이 구성됩니다. (프로젝트 루트 기준)

- [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)
- [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

**AI Core · predeploy 운영 (2026-05-23)**

- [AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md](./operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md)
- [DB_MIGRATION_CHRONOLOGY.md](./operations/DB_MIGRATION_CHRONOLOGY.md)
- [STAGING_SECRETS_CHECKLIST.md](./operations/STAGING_SECRETS_CHECKLIST.md)
- [STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md](./operations/STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md) — **Phase A (다음)**

---

## 3. 문서별 역할

### 3.1 `OPERATIONS_RECOVERY.md`

운영 장애 또는 반영 실패가 발생했을 때 사용하는 복구 문서입니다.

주요 용도는 다음과 같습니다.

- build 실패 원인 추적
- import / session / role / Prisma 관련 오류 복구
- 최소 롤백 세트 판단
- 앱 재기동 우선 복구
- 권한 흐름 이상 시 우선 점검 순서 확인

다음 상황에서 가장 먼저 확인합니다.

- [ ] 배포 후 앱이 뜨지 않음
- [ ] `/admin` 권한 흐름이 깨짐
- [ ] API가 500 또는 403/401로 비정상 동작
- [ ] route / session / model명 보정이 꼬임
- [ ] 최소 범위 롤백이 필요함

---

### 3.2 `PATCH_FINAL_CHECKLIST.md`

운영 패치를 실제 프로젝트에 반영한 뒤, 최종 검수할 때 사용하는 체크리스트 문서입니다.

주요 용도는 다음과 같습니다.

- 코드 반영 누락 여부 확인
- 정책과 실제 구현 일치 여부 확인
- lint / test / build 확인
- STAFF / ADMIN 권한 스모크 테스트
- 운영 API 및 system page 최종 검수

다음 상황에서 가장 먼저 확인합니다.

- [ ] 패치 반영 직후 최종 점검이 필요함
- [ ] 구현은 끝났지만 배포 가능 여부를 판단해야 함
- [ ] 권한, route, API, 운영 UI를 한 번에 검수해야 함
- [ ] 인수인계 전에 현재 상태를 체크해야 함

---

### 3.3 `DEPLOY_PRECHECK.md`

실제 배포 직전에 꼭 확인해야 하는 항목만 추린 배포 전 점검 문서입니다.

주요 용도는 다음과 같습니다.

- 배포 승인 전 마지막 점검
- 환경 변수 및 build 상태 확인
- release-meta / health 확인
- STAFF / ADMIN 기준 최종 접근 확인
- 운영 계정 및 seed 상태 확인

다음 상황에서 가장 먼저 확인합니다.

- [ ] 배포 직전 마지막 확인 단계
- [ ] 로컬 검수는 끝났고 배포 승인 여부만 판단하면 됨
- [ ] build는 성공했지만 배포 환경 변수/권한 확인이 필요함
- [ ] 배포 후 즉시 확인할 항목을 정리해야 함

---

## 4. 상황별 문서 선택 가이드

### 4.1 앱이 아예 뜨지 않을 때

먼저 볼 문서:

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

확인 순서:

- [ ] import alias / export 누락
- [ ] session 함수명
- [ ] role 타입명
- [ ] Prisma model / field명
- [ ] 최소 롤백 세트

---

### 4.2 구현 반영은 끝났지만 검수가 필요할 때

먼저 볼 문서:

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

확인 순서:

- [ ] 정책 반영 확인
- [ ] 파일별 반영 점검
- [ ] 구버전 흔적 제거 확인
- [ ] lint / test / build
- [ ] 권한 스모크 테스트

---

### 4.3 오늘 바로 배포해야 할 때

먼저 볼 문서:

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)
- [ ] (AI Core) [AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md](./operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md) — **dev 종료 후** predeploy
- [ ] [STAGING_SECRETS_CHECKLIST.md](./operations/STAGING_SECRETS_CHECKLIST.md) — staging env
- [ ] [DB_MIGRATION_CHRONOLOGY.md](./operations/DB_MIGRATION_CHRONOLOGY.md) — 운영 DB migration

확인 순서:

- [ ] **`npm run dev` 종료** → build / predeploy
- [ ] build / predeploy 스크립트
- [ ] 환경 변수
- [ ] health / release-meta
- [ ] STAFF / ADMIN 접근 테스트
- [ ] 배포 승인 여부 판단

---

### 4.4 배포 후 문제가 생겼을 때

먼저 볼 문서:

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

그다음 필요 시:

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

확인 순서:

- [ ] 장애 증상 분류
- [ ] 복구 우선순위
- [ ] 최소 롤백 세트
- [ ] 복구 후 재검수

---

## 5. 추천 사용 순서

일반적인 작업 흐름에서는 아래 순서로 문서를 사용하는 것을 권장합니다.

### 5.1 패치 반영 직후

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

### 5.2 배포 직전

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

### 5.3 장애 또는 이상 발생 시

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

---

## 6. 문서 사용 원칙

아래 원칙을 기준으로 문서를 사용합니다.

- [ ] 구현 자체보다 운영 안정성 확인을 우선한다
- [ ] 새로운 수정 전, 현재 상태를 먼저 문서 기준으로 점검한다
- [ ] 장애 발생 시 추측보다 복구 순서를 먼저 따른다
- [ ] 배포 직전에는 문서 기준으로 누락 여부를 최종 확인한다
- [ ] 문서 내용은 실제 프로젝트 구조 변경 시 함께 갱신한다

---

## 7. 빠른 진입점

가장 자주 보는 핵심 항목은 아래와 같습니다.

### 7.1 권한 문제

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

핵심 파일:

- [ ] `src/middleware.ts`
- [ ] `src/lib/auth/guards.ts`
- [ ] `src/lib/auth/roles.ts`

---

### 7.2 운영 API 문제

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

핵심 파일:

- [ ] `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`
- [ ] `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`
- [ ] `src/app/api/health/route.ts`
- [ ] `src/app/api/release-meta/route.ts`

---

### 7.3 배포 전 확인

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

핵심 항목:

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] 환경 변수
- [ ] health / release-meta
- [ ] STAFF / ADMIN 접근 흐름

---

## 8. 문서 갱신 기준

아래 경우에는 운영 문서를 함께 업데이트합니다.

- [ ] admin 접근 정책 변경
- [ ] session 구조 변경
- [ ] 운영 API 경로 변경
- [ ] health / release-meta 응답 정책 변경
- [ ] seed 계정 정책 변경
- [ ] 배포 전 필수 점검 절차 변경
- [ ] 롤백 우선순위 변경

---

## 9. 최종 메모

- 운영 문서는 구현을 대신하지 않지만, 구현 이후의 **검수 / 복구 / 배포 안정성**을 크게 높여줍니다.
- 가장 자주 보게 되는 문서는 보통 [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md) 와 [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) 입니다.
- 실제 운영 중 장애가 발생하면 새로운 수정부터 하지 말고, 먼저 [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) 기준으로 현재 상태를 정리하는 것이 안전합니다.
