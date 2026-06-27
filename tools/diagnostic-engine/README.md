# Diagnostic Engine — 첫 실전 적용

AI법친을 **첫 진단 프로젝트**로 등록하고, 기준문서·MVP 자동 테스트·patchset 검증·승격 게이트·플랫폼 확장·압축 번들까지 한 번에 실행하는 도구입니다.

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Required gates for the **current execution mode** passed |
| `1` | Environment/security/hard gate failure |
| `2` | `--require-promotion` run finished but promotion requirements are incomplete |

`exitReason`는 `executionMode`와 함께 해석합니다. `INCOMPLETE` / `BLOCKED`인데 `"All required gates passed"`가 나오면 안 됩니다.

### `STRUCTURE_ONLY` (기본·operational-gates·verify 스크립트)

```json
{
  "executionMode": "STRUCTURE_ONLY",
  "diagnosticStatus": "INCOMPLETE",
  "promotionStatus": "BLOCKED",
  "blockingReasons": [
    "INTEGRATION_PASS is PENDING",
    "E2E_PASS is PENDING"
  ],
  "exitCode": 0,
  "exitReason": "Structural gates passed; promotion was not requested."
}
```

### `STAGING_FULL` (`npm run diagnostic:staging-full` 전용)

성공 시에만 아래 조합이 가능합니다.

```json
{
  "executionMode": "STAGING_FULL",
  "diagnosticStatus": "COMPLETE",
  "promotionStatus": "READY",
  "exitCode": 0,
  "exitReason": "All required staging gates passed."
}
```

`verify:aibeopchin-first-practical-application` PASS는 **엔진 구조·차단 규칙 정상**만 의미합니다. `diagnosticStatus: INCOMPLETE` · `promotionStatus: BLOCKED`가 정상입니다.

## Top-level status (summary + run-manifest)

```json
{
  "executionMode": "STRUCTURE_ONLY",
  "diagnosticStatus": "INCOMPLETE",
  "promotionStatus": "BLOCKED",
  "blockingReasons": ["INTEGRATION_PASS is PENDING", "E2E_PASS is PENDING"]
}
```

## Promotion requires

`PROMOTION_READY`는 아래를 모두 만족해야 합니다.

- `ALLOWLIST_DATABASE_PASS`
- `INTEGRATION_PASS`
- `E2E_PASS`
- `FIXTURE_CLEANUP_PASS`
- `NO_SECURITY_HARD_FAIL`
- (+ static/patchset/platform contract gates)

`CLEANUP_FAILED`가 기록되면 E2E가 PASS여도 `FIXTURE_CLEANUP_PASS_FAILED`로 `PROMOTION_READY`는 **BLOCKED**입니다.

## Staging DB allowlist

운영처럼 보이면 차단보다 **등록된 staging 조건을 모두 만족할 때만 허용**합니다.

- 허용 DB host / host suffix
- DB name suffix: `_staging`, `_test`
- runtime schema: `diagnostic_test` (`current_database()`, `current_schema()`)
- `DIAGNOSTIC_TEST_ENV=staging`

## Run-scoped fixtures

모든 staging fixture는 `runId` 접두를 사용합니다.

- `diag-YYYYMMDD-HHMMSS-lawyer-a`
- `diag-YYYYMMDD-HHMMSS-case-cross-access`

테스트 종료 시 cleanup을 기록하고, 실패하면 `CLEANUP_FAILED`를 `_runtime/staging-fixture-cleanup.json`에 남깁니다.

## Pass 레벨 (Phase 2)

| 레벨 | 의미 |
|------|------|
| `STATIC_PASS` | 파일 구조·명세·금지 규칙·canonical sources |
| `PATCHSET_PASS` | `aibeopchin_patchset/` Vitest 샌드박스 |
| `INTEGRATION_PASS` | staging DB 격리 + 권한 단위/API 흐름 |
| `E2E_PASS` | Playwright 브라우저·API 접근 통제 |
| `PROMOTION_READY` | 위 4종 + 플랫폼 계약 + promotion gate |

Vitest PASS만으로는 `PROMOTION_READY`가 되지 않습니다. `run-manifest.json`에 레벨별 결과가 분리 기록됩니다.

## 첫 실전 적용 순서

1. AI법친 전체 소스를 첫 진단 프로젝트로 등록
2. 기획서·번호체계 문서를 엔진 기준문서로 등록
3. 회원가입·로그인·권한·사건접수 흐름 자동 테스트 생성 (`aibeopchin_patchset/`)
4. 실제 오류와 누락 리포트 확인
5. 수정안을 별도 테스트 공간(patchset)에서 검증
6. 통과한 수정만 원본 프로젝트 반영 후보로 승격
7. 도시락.store · 아침햇살 · 기타 플랫폼 확장 **계약** 검증
8. 다른 환경으로 옮길 진단 번들 압축

## 실행

```bash
# 로컬 골격 검증 (STATIC + PATCHSET, promotion은 BLOCKED 가능)
npm run diagnostic:first-practical

# MVP patchset 테스트 포함
npm run diagnostic:first-practical:with-tests

# staging 전체 (integration + e2e + promotion 필수)
# PowerShell 예:
#   $env:DIAGNOSTIC_TEST_ENV="staging"
#   $env:TEST_DATABASE_URL="postgresql://..."
#   $env:PLAYWRIGHT_BASE_URL="https://staging.example.com"
#   npm run diagnostic:staging-full
npm run diagnostic:staging-full

# 정적 + 워크플로 게이트 (promotion BLOCKED 허용)
npm run verify:aibeopchin-first-practical-application
```

## Staging 환경 (필수)

운영 DB를 직접 검사·수정하지 않습니다.

```text
운영 서비스
  └─ 읽기 전용 정보만 확인

진단 전용 Staging
  ├─ DIAGNOSTIC_TEST_ENV=staging
  ├─ TEST_DATABASE_URL
  ├─ DIAGNOSTIC_TEST_ADMIN_EMAIL (값은 로그·증빙에 미기록)
  ├─ DIAGNOSTIC_TEST_LAWYER_EMAIL
  ├─ DIAGNOSTIC_TEST_CLIENT_EMAIL
  └─ 매 실행 후 데이터 초기화 (runbook)
```

`DATABASE_URL`이 운영 패턴(`prod`, `rds.amazonaws.com` 등)이면 즉시 중단합니다.

## 산출물

| 경로 | 설명 |
|------|------|
| `tools/diagnostic-engine/_runtime/run-manifest.json` | 실행 단위 증빙 (runId, gitCommit, sourceHash, pass levels) |
| `tools/diagnostic-engine/_runtime/runs/diag-*.json` | 실행별 불변 스냅샷 |
| `tools/diagnostic-engine/_runtime/*.json` | 단계별 상세 결과 |
| `aibeopchin_patchset/tests/mvp-flow-first-practical.*` | MVP 자동 테스트·manifest |
| `tools/diagnostic-engine/platform-expansion/contracts/*.json` | 플랫폼별 필수 계약 |
| `tests/e2e/diagnostic-case-access-control.spec.ts` | 권한·404 우선 E2E |
| `tools/diagnostic-engine/_bundles/*.zip` | 확장용 압축 번들 |

## 가드레일

- 원본 `src/`·`prisma/`는 자동 수정하지 않습니다.
- patchset + integration + e2e + promotion gate 통과 후에만 원본 반영 후보로 표시합니다.
- 플랫폼 확장은 nurion profile만으로 승인하지 않고 **contracts/** 계약을 검증합니다.
- 도시락.store·아침햇살은 AI법친 CaseStatus 규칙을 그대로 복사하지 않습니다.
