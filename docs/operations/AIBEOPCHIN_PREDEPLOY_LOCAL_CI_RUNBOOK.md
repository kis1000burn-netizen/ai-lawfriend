# AI법친 Predeploy 로컬 · CI 실행 런북

**목적**: `npm run predeploy:check` 및 production build를 **코드 결함 없이** 재현하기 위한 실행 절차.  
**범위**: AI Core RC(12-A) 이후 배포 후보 검증 · Windows 로컬 · GitHub Actions CI.

**증빙**: `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PREDEPLOY-OPS-CHECK]`

---

## 1. `predeploy:check` 전 dev 서버 종료 (필수)

`predeploy:check` 마지막 단계는 `npm run build` → 내부에서 `prisma generate`가 실행된다.  
**`npm run dev`가 켜진 상태**에서는 Prisma query engine 바이너리(`.dll.node`)가 잠겨 build가 실패할 수 있다.

### 1.1 실행 순서 (로컬)

1. **`npm run dev` 종료** — 터미널에서 `Ctrl+C`, 또는 dev 전용 터미널 탭 닫기
2. (Windows) node 프로세스가 남았으면 종료 — 작업 관리자 또는 `Get-Process node | Stop-Process` (다른 Node 작업 주의)
3. **`npm run predeploy:check`** 실행
4. PASS 후 역할 API 스모크가 필요하면 **다시** `npm run dev` → `npm run ops:ai-core-role-smoke`

### 1.2 금지 패턴

| 패턴 | 결과 |
| --- | --- |
| 터미널 A: `npm run dev` 유지 + 터미널 B: `predeploy:check` | build 단계 **EPERM** / Prisma generate 실패 가능 |
| build 실패 후 dev 재시작 없이 smoke만 반복 | smoke는 통과해도 **predeploy 미완료** |

### 1.3 CI 원칙

CI 워크플로에는 **`npm run dev` / `next dev` 단계를 넣지 않는다.**  
fresh checkout → `npm ci` → `predeploy:check` (또는 test + production build)만 수행한다.  
→ [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) `predeploy-fresh-build` job.

---

## 2. Windows / 로컬 Prisma DLL lock 대응

### 2.1 증상

- `Error: EPERM: operation not permitted, unlink '...\query_engine-windows.dll.node'`
- `prisma generate` 또는 `next build` 중 Prisma Client 재생성 실패
- dev 서버 실행 중 build/predeploy 병행 시 재현

### 2.2 원인

Next.js dev + Prisma가 **동일 query engine 네이티브 모듈**을 동시에 사용 · 잠금.

### 2.3 복구 절차

1. **dev 서버 종료** (§1)
2. (선택) `.next` 삭제 — `Remove-Item -Recurse -Force .next`
3. **`npx prisma generate`** 단독 실행으로 확인
4. **`$env:NODE_ENV="production"; npm run build`** 또는 **`npm run predeploy:check`**

### 2.4 예방

- predeploy · release build 전에는 **항상 dev 종료**
- IDE/터미널에 백그라운드 `next dev`가 남지 않았는지 확인
- build와 smoke를 **같은 터미널 세션에서 동시에** 돌리지 않음

---

## 3. `NODE_ENV` 분리 (build / test / 로컬 dev)

### 3.1 문제

로컬 `.env` / `.env.local`에 `NODE_ENV=development`가 있으면:

| 명령 | 증상 |
| --- | --- |
| `npm run test` | React 19 + jsdom에서 `React.act is not a function` 등 **간헐적 FAIL** |
| `npm run build` | non-standard `NODE_ENV` 경고 · `/500` prerender 이상 (과거 재현) |

### 3.2 SSOT (`scripts/predeploy-check.ts`)

| 단계 | 강제 `NODE_ENV` |
| --- | --- |
| Unit tests | `test` |
| Build | `production` |

로컬에서 **`npm run predeploy:check`만** 쓰면 위 보정이 자동 적용된다.

### 3.3 로컬 `.env` 권장

- **개발 편의**: `.env`에 `NODE_ENV=development` 유지 가능
- **직접 실행 시**: `npm run build` / `npm run test`는 predeploy 스크립트 경유 또는 수동으로 `NODE_ENV` 지정
- **운영/스테이징/CI**: `.env.production` · GitHub Actions env — **`development`를 build/test에 섞지 않음**

---

## 4. 표준 명령 요약

```bash
# 1) dev 종료 후
npm run predeploy:check

# 2) (선택) AI Core 역할 API — dev + seed DB 필요
npm run dev
npm run ops:ai-core-role-smoke
```

---

## 5. 관련 문서

- [DB migration chronology](./DB_MIGRATION_CHRONOLOGY.md)
- [Staging secrets checklist](./STAGING_SECRETS_CHECKLIST.md)
- [Full AI Core predeploy master checklist](../ai/AIBEOPCHIN_FULL_AI_CORE_PREDEPLOY_MASTER_CHECKLIST.md)
- [DEPLOY_PRECHECK.md](../../DEPLOY_PRECHECK.md)

---

## 6. 한 줄 판정

**predeploy 실패가 Prisma DLL lock 또는 NODE_ENV 혼선이면 앱 결함이 아니라 실행 순서 문제** — dev 종료 · `predeploy:check` 경유 · CI fresh build로 재현한다.
