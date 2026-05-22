# 스테이징 E2E 실행 지시

스테이징 배포 후 아래 순서로 확인해 주세요.

**전제:** **스테이징 오리진**이 없으면 Playwright를 **실행하지 말고 대기**합니다.

## 1. Playwright 브라우저 설치(최초 1회 또는 CI/새 머신)

```bash
npx playwright install
```

## 2. 스테이징 오리진 설정

`PLAYWRIGHT_BASE_URL`에 **스테이징 HTTPS(또는 허용된) 오리진만** 넣습니다. 기본값 `http://localhost:3000`만으로는 `npm run test:e2e:staging`이 **실행되지 않습니다**(의도적 거부).

**PowerShell**

```powershell
$env:PLAYWRIGHT_BASE_URL="https://your-staging-host.example.com"
```

**bash**

```bash
export PLAYWRIGHT_BASE_URL="https://your-staging-host.example.com"
```

## 3. 스테이징 E2E 실행

프로젝트 루트에서:

```bash
npm run test:e2e:staging
```

## 4. 자동 검증 범위(현재 저장소)

| 구분 | 내용 |
|------|------|
| 포함 | `GET /api/health` — 200·`{ ok: true, status: "ok" }`(DB 정상 가정) |
| 포함 | 비인증 시 `GET /api/release-meta` — 401 또는 403 |
| 포함 | 비인증 시 `POST /api/admin/alerts/ops-queue/bulk-edit` — 401 또는 403 |
| 제외 | `tests/e2e/admin-role-access.spec.ts` — 로그인 헬퍼 준비 전까지 **skip** |
| **조건부** | `tests/e2e/lawyer-verification-smoke.spec.ts` — **[EVIDENCE-20260427-425]** `IMPLEMENTATION_EVIDENCE.md` 참고. 미로그인 lookup **401**은 항상 실행·**PASS** 목표. PENDING/APPROVED 흐름은 `E2E_LAWYER_VERIFICATION_SMOKE=1` + 계정 env 4개 + 스테이징 계정 준비 시에만 실행; 미준비 시 **BLOCKED**(스킵). |

테스트 경로: [`tests/e2e`](../tests/e2e)

**변호사 자격검증 스모크만 스테이징에서 돌리려면**(위 조건부 env 설정 후):

```bash
npx playwright test tests/e2e/lawyer-verification-smoke.spec.ts
```

실행 뒤 **[425]** 표·완료 판정은 [`IMPLEMENTATION_EVIDENCE.md` §\[EVIDENCE-20260427-425\]](./project-governance/IMPLEMENTATION_EVIDENCE.md)에 반영합니다. **판정·증빙 문구·PASS/BLOCKED/FAIL 정의**는 동일 절을 따릅니다.

## 5. [EVIDENCE-20260427-425] 변호사 자격검증 E2E — 실행 런북(상세)

핵심은 **실제 계정·환경변수·실행 명령·PASS/BLOCKED/FAIL**을 개발팀이 그대로 따라 할 수 있게 두는 것이다. **비밀값(`DATABASE_URL`, 비밀번호, 스토리지 키 등)은 문서·채팅·PR에 적지 않는다.**

### 5.0 실행 체크리스트 (5단계)

1. 스테이징에 **PENDING** 변호사 계정 준비
2. 스테이징에 **APPROVED** 변호사 계정 준비
3. CI Secret 또는 실행 셸에 **실제 env** 설정 — §5.3(`PLAYWRIGHT_BASE_URL`, `E2E_LAWYER_VERIFICATION_SMOKE=1`, 계정 4개)
4. `npx playwright test tests/e2e/lawyer-verification-smoke.spec.ts` 실행
5. [`IMPLEMENTATION_EVIDENCE.md` [425]](./project-governance/IMPLEMENTATION_EVIDENCE.md) **결과 표**를 **PASS** / **BLOCKED** / **FAIL** 중 하나로 갱신

### 5.1 스테이징/CI 실행에 필요한 준비물

**필수 준비물**

1. 스테이징 또는 CI에서 접근 가능한 AI법친 배포 URL — Playwright에는 `PLAYWRIGHT_BASE_URL`로 전달한다.
2. 해당 배포가 연결된 스테이징 DB(앱 서버 `DATABASE_URL` 등은 배포 설정·Secret으로만 관리).
3. **PENDING** 상태의 변호사 테스트 계정
4. **APPROVED** 상태의 변호사 테스트 계정
5. Playwright 실행 환경(`npm install`, `npx playwright install` 또는 CI에서 `--with-deps`)
6. 아래 **§5.3** E2E 전용 환경변수
7. 비밀값을 넣을 **CI Secret** 또는 로컬 `.env.e2e`(저장소에 커밋 금지)

### 5.2 스테이징 테스트 계정 기준

**PENDING 변호사 계정**

| 항목 | 내용 |
|------|------|
| 목적 | 미승인 변호사가 전문 기능에 접근하지 못하고 `/lawyer/verification-pending`으로 이동하는지 확인 |
| 필수 상태 | `User.role` = `LAWYER`, `User.status` = `ACTIVE`, `LawyerProfile.verificationStatus` = `PENDING` |

**APPROVED 변호사 계정**

| 항목 | 내용 |
|------|------|
| 목적 | 승인된 변호사가 변호사 포털과 대시보드에 접근 가능한지 확인 |
| 필수 상태 | `User.role` = `LAWYER`, `User.status` = `ACTIVE`, `LawyerProfile.verificationStatus` = `APPROVED` |

### 5.3 필요한 환경변수 (저장소 스펙과 일치)

[`tests/e2e/lawyer-verification-smoke.spec.ts`](../tests/e2e/lawyer-verification-smoke.spec.ts) 및 [`playwright.config.ts`](../playwright.config.ts) 기준이다. **다른 이름(`E2E_BASE_URL` 등)은 쓰지 않는다** — 스테이징 오리진은 반드시 `PLAYWRIGHT_BASE_URL`이다.

CI Secret 또는 실행 셸에 설정한다:

| 변수 | 설명 |
|------|------|
| `E2E_LAWYER_VERIFICATION_SMOKE` | `1`로 설정 시 PENDING/APPROVED 분기 실행 |
| `PLAYWRIGHT_BASE_URL` | 예: `https://스테이징호스트` |
| `E2E_LAWYER_PENDING_EMAIL` | CI Secret (문서에 평문 기록 금지) |
| `E2E_LAWYER_PENDING_PASSWORD` | CI Secret |
| `E2E_LAWYER_APPROVED_EMAIL` | CI Secret |
| `E2E_LAWYER_APPROVED_PASSWORD` | CI Secret |

### 5.4 로컬에서 스테이징 대상으로 실행

저장소 루트에서:

```bash
npm install
npx playwright install
```

**Windows PowerShell**

```powershell
$env:PLAYWRIGHT_BASE_URL="https://스테이징도메인"
$env:E2E_LAWYER_VERIFICATION_SMOKE="1"
$env:E2E_LAWYER_PENDING_EMAIL="(CI Secret 또는 로컬 전용 값 — 문서 미기록)"
$env:E2E_LAWYER_PENDING_PASSWORD="(비공개)"
$env:E2E_LAWYER_APPROVED_EMAIL="(비공개)"
$env:E2E_LAWYER_APPROVED_PASSWORD="(비공개)"

npx playwright test tests/e2e/lawyer-verification-smoke.spec.ts
```

**macOS/Linux**

```bash
export PLAYWRIGHT_BASE_URL="https://스테이징도메인"
export E2E_LAWYER_VERIFICATION_SMOKE=1
export E2E_LAWYER_PENDING_EMAIL="(비공개)"
export E2E_LAWYER_PENDING_PASSWORD="(비공개)"
export E2E_LAWYER_APPROVED_EMAIL="(비공개)"
export E2E_LAWYER_APPROVED_PASSWORD="(비공개)"

npx playwright test tests/e2e/lawyer-verification-smoke.spec.ts
```

### 5.5 CI에서 실행하는 예시 (GitHub Actions)

저장소가 GitHub Actions를 쓰지 않으면 **동일 개념**으로 Secret 이름만 맞추면 된다.

```yaml
name: Lawyer Verification E2E

on:
  workflow_dispatch:

jobs:
  lawyer-verification-e2e:
    runs-on: ubuntu-latest

    env:
      E2E_LAWYER_VERIFICATION_SMOKE: "1"
      PLAYWRIGHT_BASE_URL: ${{ secrets.PLAYWRIGHT_BASE_URL }}
      E2E_LAWYER_PENDING_EMAIL: ${{ secrets.E2E_LAWYER_PENDING_EMAIL }}
      E2E_LAWYER_PENDING_PASSWORD: ${{ secrets.E2E_LAWYER_PENDING_PASSWORD }}
      E2E_LAWYER_APPROVED_EMAIL: ${{ secrets.E2E_LAWYER_APPROVED_EMAIL }}
      E2E_LAWYER_APPROVED_PASSWORD: ${{ secrets.E2E_LAWYER_APPROVED_PASSWORD }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npx playwright install --with-deps

      - run: npx playwright test tests/e2e/lawyer-verification-smoke.spec.ts
```

### 5.6 PASS 기준 ([425] B 옵션을 PASS로 쓰려면)

아래가 **모두** 만족되어야 [425] **B**를 **PASS**로 기록한다.

1. Playwright 명령 **exit 0**
2. 미로그인 lookup API가 **401**
3. PENDING 변호사 계정 로그인 성공
4. PENDING 변호사는 `/lawyer` 또는 `/lawyer/case-packages/lookup` 접근 시 `/lawyer/verification-pending`으로 이동
5. PENDING 변호사의 case-package lookup API가 **403** `LAWYER_VERIFICATION_REQUIRED`
6. APPROVED 변호사 계정 로그인 성공
7. APPROVED 변호사는 `/lawyer`에서 **「변호사 포털」** 확인
8. APPROVED 변호사는 `/dashboard` 접근 가능

**A(상시)** 는 위 스펙 파일 내 “미로그인 lookup 401” 테스트만으로도 PASS/BLOCKED를 구분한다(실행·exit 0 전제).

### 5.7 BLOCKED 기준

아래 **하나라도** 해당하면 **PASS가 아니라 BLOCKED**다.

1. 스테이징 URL 미준비
2. `PLAYWRIGHT_BASE_URL` 미설정(또는 잘못된 오리진)
3. `E2E_LAWYER_VERIFICATION_SMOKE` 미설정(또는 `1` 아님)으로 **B가 스킵**된 경우
4. PENDING 변호사 계정 없음
5. APPROVED 변호사 계정 없음
6. 계정 비밀번호 또는 Secret 미설정
7. 스테이징 DB/배포 접속 불가로 검증 불가
8. 테스트 계정 상태가 §5.2 기준과 다름
9. Playwright 실행 환경 미준비
10. 네트워크 또는 배포 접근 제한으로 테스트 미수행

**BLOCKED**는 “실패”가 아니라 **실행 조건 미충족**이다. 다만 **테스트를 실행했는데** 기능이 기대와 다르면 BLOCKED가 아니라 **FAIL**(§5.8)로 남긴다.

### 5.8 FAIL 기준

기능 오류 가능성이 있으므로 **FAIL**로 본다.

1. PENDING 변호사가 변호사 포털에 접근 가능
2. PENDING 변호사의 case-package lookup API가 **200** 반환
3. PENDING 변호사 접근 차단이 **500** 등으로 비정상 응답
4. APPROVED 변호사가 `/lawyer` 접근 불가
5. APPROVED 변호사가 `/dashboard` 접근 불가
6. 로그인 성공 후 세션 쿠키가 기대대로 동작하지 않음
7. `ACCOUNT_PENDING` 또는 `LAWYER_VERIFICATION_REQUIRED` 등이 잘못된 문구·코드로 표시됨

**FAIL** 시 [425]를 **PASS로 바꾸지 않는다.** 실행 로그를 남기고 원인 분석으로 넘긴다.

### 5.9 개발팀 전달용 지시문 ([425])

스테이징 또는 CI에서 실제 PENDING/APPROVED 변호사 계정을 준비한 뒤 아래를 실행한다.

```bash
npx playwright test tests/e2e/lawyer-verification-smoke.spec.ts
```

**필수 환경변수:** `E2E_LAWYER_VERIFICATION_SMOKE=1`, `PLAYWRIGHT_BASE_URL`, `E2E_LAWYER_PENDING_EMAIL`, `E2E_LAWYER_PENDING_PASSWORD`, `E2E_LAWYER_APPROVED_EMAIL`, `E2E_LAWYER_APPROVED_PASSWORD`

**PASS 요약:** 미로그인 lookup **401**; PENDING 전문 기능 차단·API **403** `LAWYER_VERIFICATION_REQUIRED`; APPROVED는 `/lawyer`·`/dashboard` 접근 가능.

계정/Secret/스테이징 미준비로 **실행하지 못하면 BLOCKED**. 기능 기대와 다르면 **FAIL**. 비밀번호·`DATABASE_URL`·스토리지 키는 문서·채팅·PR에 기록하지 않는다. 실행 후 `IMPLEMENTATION_EVIDENCE.md` **[425]** 표와 완료 판정을 갱신한다.

**한 줄:** 스테이징/CI에는 PENDING·APPROVED 계정, 위 Secret·`PLAYWRIGHT_BASE_URL`, Playwright 실행, 그리고 **[425] PASS/BLOCKED/FAIL** 증빙 기준이 필요하다.

## 6. 수동 점검(전체 품질)

자동 스모크만으로는 UI·업무 흐름 전체를 덮지 않습니다. [배포 체크리스트 `docs/deployment-checklist.md`](./deployment-checklist.md) **§2·§3**의 보드·로그인·대시보드 등 수동 항목을 **스테이징 호스트** 기준으로 진행해 주세요.

## 7. 증빙 전달 (`IMPLEMENTATION_EVIDENCE.md`)

**[425] 변호사 자격검증 E2E:** 실행 후 [`IMPLEMENTATION_EVIDENCE.md`](./project-governance/IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260427-425]** 의 **스테이징/CI 실행 결과** 표 및 **완료 판정**을 갱신한다(PASS/BLOCKED/FAIL은 §5.6–5.8).

스테이징 E2E(일반)를 **실행한 뒤**, **실행 결과 표 데이터 4행**의 **상태·비고**와 **실행 일시 (KST)** 만 실측으로 **전달**합니다. **전달받은 값**은 [`IMPLEMENTATION_EVIDENCE.md`](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260428-staging-e2e) **`#evidence-20260428-staging-e2e`** 안에서 **그 표 4행**과 **실행 일시** 줄에만 반영하고, **다른 문단은 수정하지 않습니다.**

- **스테이징 오리진이 없으면** Playwright를 돌리지 않고, 전달·표는 **대기**로 둡니다.

**배포 전 QA 전체 닫기:** 자동 스모크만으로는 부족하다. `deployment-checklist.md` **[`#deployment-qa-nm-request-copy`](./deployment-checklist.md#deployment-qa-nm-request-copy)** 의 **`text` 블록만** 팀에 보내고, 답을 받으면 **[§6 절차](./deployment-checklist.md#deployment-qa-nm-reply)** 대로 **닫힘 / 후속 / 보류** 중 하나로 확정한다. 확정·회신 요약은 [`IMPLEMENTATION_EVIDENCE.md` `#evidence-20260428-predeploy-qa-closure`](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure)에 기록한다.

## 참고

- 로컬에서 앱을 띄운 뒤 같은 스펙(헬스 제외)을 돌리려면: `npm run test:e2e` — 이때 `PLAYWRIGHT_BASE_URL` 미설정 시 기본은 `http://localhost:3000`입니다.
- `.env.example`의 `PLAYWRIGHT_BASE_URL` 주석과 [`scripts/run-e2e-staging.mjs`](../scripts/run-e2e-staging.mjs) 동작을 함께 참고하면 됩니다.
