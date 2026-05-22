# AI법친 (aibeopchin) — Agent Instructions

## 프로젝트 개요

법률 플랫폼 SaaS. 의뢰인이 사건을 등록하면 AI가 인터뷰를 진행하고, 변호사가 문서를 작성·검토·전달하는 워크플로우.

**기술 스택**: Next.js 15 (App Router) · React 19 · Prisma 6 + PostgreSQL · Tailwind CSS 4 · Vitest · Playwright

---

## 빌드 & 테스트 명령

```bash
npm run dev              # 개발 서버
npm run build            # prisma generate + next build
npm run lint             # ESLint
npm run test             # Vitest 단위 테스트
npm run test:e2e         # Playwright E2E
npm run db:migrate       # Prisma 마이그레이션 (dev)
npm run db:deploy        # Prisma 마이그레이션 (prod)
npm run verify:canonical-sources  # CaseStatus 정합성 검증 (필수)
npm run verify:gongbuho     # Gongbuho 정적 증거(문서·샘플·상수) + Vitest 회귀
npm run verify:aibeopchin-voice  # Phase 5 Voice transcript 스키마 정적 게이트
npm run predeploy:check  # 배포 전 전체 체크
```

---

## 디렉터리 구조

```
src/
  app/           # Next.js App Router (route groups별 역할 분리)
    (public)/    # 비인증 페이지
    (protected)/ # USER 로그인 필요
    (lawyer)/    # LAWYER 역할
    (admin)/     # ADMIN/STAFF 역할
    api/         # Route Handlers
  lib/           # 서버 전용 유틸리티 (도메인 로직, 에러, 응답 헬퍼)
  features/      # 도메인별 repository·service·validator 묶음
  components/    # 공용 UI 컴포넌트
  hooks/         # 클라이언트 커스텀 훅
  types/         # 전역 TypeScript 타입
aibeopchin_patchset/  # 배포 전 패치 파일 스테이징 영역
prisma/          # schema, migrations, seed
docs/            # 도메인 표준 문서 (예: `docs/gongbuho/`, `docs/voice/`)
```

---

## 핵심 컨벤션

### 역할(Role) 체계

Prisma DB 역할 `USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN`과 UI 4분할 역할 `CLIENT | LAWYER | STAFF | ADMIN`은 다릅니다.
변환 함수: `src/lib/role-map.ts` → `prismaRoleToDefinitionRole()`

### CaseStatus 단일 진실원

`CaseStatus` 열거형은 두 곳에서 정의되며 **반드시 일치**해야 합니다:
- Prisma 스키마: `prisma/schema.prisma`
- Zod 정의: `src/lib/definitions/case-status.ts` → `CaseStatusEnum`

변경 후 항상 실행: `npm run verify:canonical-sources`

### API Route 패턴

```ts
// 성공 응답
import { ok, created, handleApiError } from "@/lib/api-response";
return ok(data);

// 에러 클래스
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
throw new ForbiddenError();
```

모든 Route Handler는 `handleApiError(error)`로 에러를 처리합니다.

### 인증 & 세션

- JWT는 `aibupchin_access_token` 쿠키에 저장
- 서버 컴포넌트/Route Handler에서: `requireSessionUser()` → `src/lib/auth/require-session-user.ts`
- 미들웨어: `src/middleware.ts` — 경로 보호만 담당, 상태 전이 로직 없음

### Feature Flags

환경변수로 제어: `src/lib/feature-flags.ts`
prefix: `NEXT_PUBLIC_FF_`

### 문서 생성 아키텍처

`document-template-registry.ts` → `document-template-engine.ts` → `document-generation-trace.ts` 순서로 추적.
질문셋: `question-set-registry.ts` / `question-set-engine.ts`

---

## 주의사항

- **`aibeopchin_patchset/`** 내 파일은 배포 전 스테이징 파일입니다. 운영 코드와 직접 연결하지 말고 [DEPLOY_PRECHECK.md](DEPLOY_PRECHECK.md)를 먼저 확인하세요.
- Prisma 스키마 변경 시 마이그레이션 파일을 함께 생성하고 `prisma generate`를 실행하세요.
- 소셜 로그인 Provider 추가는 [docs/social-login-provider-setup.md](docs/social-login-provider-setup.md) 참고.
- 장애 대응 절차: [OPERATIONS_RECOVERY.md](OPERATIONS_RECOVERY.md)
- 운영 문서 전체 인덱스: [docs/OPERATIONS_INDEX.md](docs/OPERATIONS_INDEX.md)
- 배포 직전 체크리스트: [DEPLOY_PRECHECK.md](DEPLOY_PRECHECK.md)

---

## 테스트 작성 위치

| 종류 | 위치 |
|------|------|
| 단위 (Vitest) | `src/__tests__/` 또는 `src/lib/*.test.ts` |
| 도메인 정의 | `aibeopchin_patchset/tests/` |
| E2E (Playwright) | `tests/e2e/` |
