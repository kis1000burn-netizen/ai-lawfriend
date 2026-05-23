# AI법친 DB Migration Chronology (운영 incremental 이력)

**목적**: greenfield `migrate deploy` 실패와 **운영/스테이징 incremental migration** 절차를 구분한다.  
**판정**: AI Core 배포 후보 상태에서 남은 DB 리스크는 **코드 결함이 아니라 migration 이력·적용 절차**이다.

---

## 1. 요약

| DB 유형 | 권장 절차 | greenfield `migrate deploy` |
| --- | --- | --- |
| **운영 · 기존 스테이징** ( `_prisma_migrations` 이력 있음) | `npx prisma migrate deploy` + `migrate status` | 이미 적용된 이력 위에 **pending만** 적용 |
| **로컬 개발 (빠른 스키마 동기화)** | `npx prisma db push` + `npm run db:seed` | chronology 이슈 **우회** (운영 금지) |
| **빈 DB + 전체 migration 체인** | **현재 저장소 그대로는 비권장** | **첫 migration에서 실패** (§2) |

---

## 2. Chronology 이슈 (greenfield)

### 2.1 실패 지점

| 순서 | migration | 문제 |
| --- | --- | --- |
| 1 (타임스탬프상) | `20260207120000_lawyer_profile_verification` | `ALTER TABLE "User"` — **`User` 테이블 미존재** |
| 이후 | `20260417120000_extend_case_attachments_timeline_assignment` | `CREATE TABLE "User"` — User **최초 생성** |

→ **빈 PostgreSQL**에 `prisma migrate deploy` / `npm run db:migrate`를 처음부터 실행하면  
`20260207…` 단계에서 **relation "User" does not exist** 로 중단된다.

### 2.2 운영 DB가 정상인 이유

운영·장기 스테이징 DB는 보통:

- 초기에 `db push` · 수동 DDL · 구 migration으로 **`User`가 먼저 존재**했거나
- `_prisma_migrations`에 **실제 적용 순서**가 기록되어 incremental만 수행

**저장소 migration 폴더 타임스탬프 ≠ 역사적 적용 순서**일 수 있다.

### 2.3 로컬 증빙 (2026-05-23)

- `db push` + seed 후: API smoke · AI Core 테스트 **PASS**
- `prisma migrate status`: **50 migrations pending** ( `_prisma_migrations` 미기록 — push 사용 시 정상)

---

## 3. AI Core Full RC baseline migrations

`full-ai-core-rc-lock.ts` / Phase 12-A master checklist 기준 **반드시 존재해야 하는** 디렉터리:

| migration | 용도 |
| --- | --- |
| `20260418180000_domain_definitions_phase1` | Document `generationMode` baseline |
| `20260525120000_case_intelligence_snapshot_phase11a` | Lawyer Review Console snapshot |
| `20260525130000_case_client_disclosure_release_phase11b` | Client disclosure release audit |

스테이징/운영에서 AI Core 기능 배포 전:

```bash
npx prisma migrate status
# pending에 위 3건(및 그 이전 운영 합의 migration)이 없어야 함
npx prisma migrate deploy   # 운영/스테이징 전용 — dev 전용 migrate dev 아님
```

---

## 4. 환경별 runbook

### 4.1 운영 · 스테이징 (incremental)

1. 배포 전 **DB 백업** ([deployment-checklist.md §1](../deployment-checklist.md))
2. `DATABASE_URL` 설정된 셸에서만 실행 (값은 문서·채팅에 **기록 금지**)
3. `npx prisma migrate status` — pending 목록 확인
4. `npx prisma migrate deploy`
5. `npx prisma migrate status` — **pending 0** 확인
6. `npm run verify:supplement-migration-predeploy` (predeploy gate)
7. AI Core: `npm run verify:aibeopchin-ai-core-rc`

### 4.2 로컬 개발

```bash
# greenfield / migrate 실패 시
npx prisma db push --accept-data-loss
npm run db:seed
```

- **역할 smoke**: seed 계정 + `CaseAssignment` — `npm run ops:ai-core-role-smoke`
- **운영 DB에 `db push` 사용 금지**

### 4.3 신규 스테이징 (빈 DB)

| 옵션 | 설명 |
| --- | --- |
| **A (권장)** | 운영 DB **익명화 백업 복원** → incremental `migrate deploy` |
| **B** | 팀 합의 **baseline dump**에서 스키마+ `_prisma_migrations` 복원 |
| **C (비권장)** | 빈 DB + 전체 migration 체인 — **현재 chronology 미해결 시 실패** |

### 4.4 장기 정리 (tech debt)

- migration **squash / baseline 재작성** — greenfield `migrate deploy` 복구
- 본 문서는 **현 상태 인식 + 운영 절차**만 고정; squash 작업은 별도 Phase

---

## 5. predeploy와의 관계

| 검증 | DB 연결 필요 |
| --- | --- |
| `npm run predeploy:check` | **아니오** (정적 gate + build) |
| `npm run ops:ai-core-role-smoke` | **예** (seed DB + dev server) |
| `prisma migrate status` | **예** (스테이징/운영 배포 전) |

---

## 6. 한 줄 판정

**운영 DB는 incremental `migrate deploy` + status로 닫고, greenfield 전체 replay는 chronology 미정리 전까지 금지** — 로컬은 `db push` + seed로 AI Core 검증만 분리한다.
