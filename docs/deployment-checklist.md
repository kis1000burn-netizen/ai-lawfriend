# AI법친 OpsQueue 운영 배포 체크리스트

## 0. 운영 배포 전 점검 닫기 순서 (7.1-B·MVP final lock 연계)

아래 순서로 닫으면 DB·마이그레이션·계정·스토리지·증빙까지 한 줄로 추적하기 쉽다. **1번**은 `DATABASE_URL`이 설정된 **스테이징 또는 운영 배포본 저장소 루트**의 셸에서만 수행한다.

**게이트:** ①에서 **exit 0** 및 콘솔 **PASS**를 확인하기 전에는 [422]/[423]을 **PASS로 갱신하지 않으며**, ⑨·⑩도 닫지 않는다. 로컬/Cursor에 `DATABASE_URL` 없이 **exit 1**이면 **앱 코드 결함이 아니라 환경 미충족**이다 — 이 경우 [422] **BLOCKED**·[423] **대기**를 유지하고, **§1.0~§1.4**는 스테이징/운영에서 ①을 닫은 뒤 이어서 진행한다.

**비밀:** `DATABASE_URL` **연결 문자열 값**은 문서·채팅·PR·스크린샷·증빙 본문에 **절대 기록하지 않는다.** 존재 여부·실행 환경(스테이징/운영)·시각만 남긴다 — [423 절차](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260427-423).

1. **DB runtime PASS** — `npm run verify:aibeopchin-7-1-b-supplement-db-runtime` ([`IMPLEMENTATION_EVIDENCE.md` §422·423](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260427-422))
2. **Prisma migration 상태 확인** — §1.1 (`migrate status` 또는 배포 파이프 기준 `migrate deploy`)
3. **관리자 계정 확인** — §1.2
4. **환경변수 확인** — §1 기본 항목
5. **첨부파일 저장소 확인** — §1.3
6. **운영 DB 백업 확인** — [`predeploy-lock-results.json`](./project-governance/predeploy-lock-results.json) 등
7. **롤백 커밋 확인** — 동 파일 `rollback` 또는 릴리즈 노트
8. **smoke test 실행** — §2·§3
9. **[423] PASS 완료** — `IMPLEMENTATION_EVIDENCE.md` [#evidence-20260427-423](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260427-423) 절차대로 갱신
10. **배포 evidence 추가** — 팀 합의 위치(증빙·릴리즈 기록)

**§1.0~§1.4:** 위 ①이 **PASS**이고 [`IMPLEMENTATION_EVIDENCE.md`](./project-governance/IMPLEMENTATION_EVIDENCE.md) **[422]/[423]**을 절차대로 갱신한 뒤, **같은 스테이징/운영 맥락**에서 §1.0 공통 env → §1.1~1.4 순으로 체크박스를 닫는다.

## 1. 배포 전

### 1.0 공통 환경변수·앱

- [ ] `.env.production` 값 점검
- [ ] `DATABASE_URL` 확인
- [ ] `JWT_SECRET` / `CRON_SECRET` 확인
- [ ] 사용할 소셜 로그인 provider의 `CLIENT_ID` / `CLIENT_SECRET` 이 모두 적용됨
- [ ] `APP_BASE_URL` 이 실제 배포 도메인과 일치함
- [ ] `NEXT_PUBLIC_APP_VERSION` 갱신
- [ ] feature flag 확인 (`NEXT_PUBLIC_FF_*`)

### 1.1 Prisma 마이그레이션

DB runtime 검증만으로는 **적용된 마이그레이션 이력·배포 절차**까지는 커버되지 않을 수 있으므로, 배포 전에 아래를 병행한다.

- [ ] `npx prisma migrate status` — 대기 마이그레이션·스키마 드리프트 없음 확인
- [ ] 필요 시 `npx prisma generate` — 클라이언트와 스키마 동기화
- [ ] **운영/스테이징:** 배포는 **`npx prisma migrate deploy`** 기준. **`migrate dev`는 개발 전용**이며 운영에서 무작정 사용하지 않는다.

### 1.2 Seed·관리자·데모·테스트 계정

운영에서는 기능보다 **접속 가능한 관리자 계정**과 **불필요한 테스트/데모 노출** 여부가 우선될 때가 많다.

- [ ] **ADMIN** 또는 **SUPER_ADMIN** 역할을 가진 운영용 계정 존재
- [ ] 초기 관리자 계정 생성 방식(seed·수동·Entra 등) 문서·런북과 일치
- [ ] **운영 환경에서 데모 프리패스 없음** 확인 — demo-access 관련 증빙과 정합
- [ ] 데모·테스트 전용 계정이 **운영 DB에 잔류하지 않음**(있다면 비활성화 또는 제거 정책)
- [ ] 최초 배포 등에서 seed가 합의되어 있으면 `npm run db:seed` **실행 대상이 스테이징/운영 중 어디인지**·데이터 영향 범위 확인

### 1.3 첨부파일·스토리지

사건·증거·첨부가 핵심이므로 DB 점검과 **저장소·권한**을 같이 본다. (기획상: 첨부 **직접 URL 노출 금지**, 열람/다운로드 로그, 공유 만료, 취소 접근 차단 등 보안 정책과 정합.)

- [ ] 업로드 경로 또는 객체 스토리지 버킷·리전·Credential 설정
- [ ] 첨부 **직접 URL 노출** 여부 — 공개 링크가 아닌 **가드된 다운로드 경로**인지
- [ ] 다운로드 권한 가드(역할·사건 소유·토큰 만료 등)
- [ ] 파일 크기 제한
- [ ] 허용 확장자·MIME 화이트리스트
- [ ] **백업 범위**에 DB뿐 아니라 **첨부·오브젝트**가 포함되는지

### 1.4 법률·플랫폼 고지문

배포 직전 **화면·약관·AI 고지 문구**를 최종 확인한다.

- [ ] AI는 **변호사를 대체하지 않음**
- [ ] **최종 법률 판단**은 변호사 또는 적법한 전문가가 수행한다는 취지가 드러남
- [ ] AI 결과물은 **사건 정리·초안 보조**용임을 명시
- [ ] **승소/패소 단정** 표현 없음
- [ ] **법률 자문 자동화**처럼 읽히는 표현 없음

## 2. 코드 검증

- [ ] **`npm run dev` 종료** 후 `npm run predeploy:check` — [Predeploy 로컬 · CI 런북](./operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md)
- [ ] `npm run predeploy:check`
- [ ] `npm run test:e2e` 주요 흐름 통과(로컬 서버 기준)
- [ ] **스테이징 E2E:** [스테이징 E2E 실행 지시](./staging-e2e-runbook.md) — `npx playwright install`(1회) → `PLAYWRIGHT_BASE_URL` → `npm run test:e2e:staging` · 상세는 런북 참고
- [ ] 보드 / 상세 / 대량편집 / 재분배 / WIP 설정 주요 화면 수동 점검 — **N/M 구체화·최종 판정 회신:** [§6](#deployment-qa-nm-reply)

## 3. 배포 직후

- [ ] `GET /api/health` 확인
- [ ] `GET /api/release-meta` 확인
- [ ] 일반 이메일 로그인 확인
- [ ] 활성화된 소셜 로그인 확인
- [ ] `/admin/alerts/ops-dashboard` 운영 대시보드 진입 확인
- [ ] `/admin/alerts/ops-queue/board` OpsQueue 보드 조회 확인
- [ ] 상세 슬라이드오버 확인
- [ ] 재분배 추천 표시 확인
- [ ] cron secret 동작 확인 (내부 cron 엔드포인트)

**N/M 구체화:** §3 항목은 위 체크박스 **8건**을 기준으로 총/완료를 적거나, 팀 내부 정의가 있으면 그 정의를 §6 회신에 명시한다.

## 4. 배포 후 1차 모니터링

- [ ] 서버 로그 에러 급증 여부 확인
- [ ] 운영 큐 수정/이동 감사로그 적재 확인
- [ ] 타임라인 적재 확인
- [ ] WIP 초과 알림 / SLA 알림 적재 확인

## 5. 롤백 기준

- [ ] 로그인 불가
- [ ] 운영 대시보드 진입 불가
- [ ] OpsQueue 보드 500 에러 지속
- [ ] 감사로그/타임라인 적재 실패
- [ ] cron 관련 과도한 중복 알림 발생

<a id="deployment-qa-nm-reply"></a>

## 6. 배포 전 QA 수동 N/M 구체화 (팀 회신)

스테이징 E2E 자동 스모크가 끝난 뒤, **배포 전 QA 전체를 닫기** 위해서는 **§2·§3 수동 점검**의 N/M과 차단 이슈를 아래 형식으로 **회신**한다.

**§2 수동:** 본 문서 §2에서 해당 항목은 체크박스 **1줄**이지만, 운영상 **보드·상세·대량편집·재분배·WIP** 등으로 **세부 항목 수를 정한 뒤** 총/완료를 적는 것을 권장한다.

**§3:** 기본적으로 위 **§3 체크박스 8건**을 총 항목 수의 기준으로 삼는다.

### 절차: 템플릿 전송 → 회신 → 확정

1. **전송:** [`#deployment-qa-nm-request-copy`](#deployment-qa-nm-request-copy)의 **`text` 블록**을 **그대로** 개발/운영팀에 보낸다(빈 칸 상태).  
2. **회신:** 팀이 총/완료·미완·P0·**최종 판정**(세 선택지 중 **하나**)을 채워 돌려준다.  
3. **확정:** 수신 측(릴리즈·운영 책임 등)이 회신을 바탕으로 배포 전 QA를 **아래 셋 중 하나로만** 공식 확정한다.  
   - **닫힘** — 회신이 **배포 전 QA 닫음 가능**에 해당. §2·§3 수동이 합의 기준을 충족하고 **P0 없음**.  
   - **후속** — 회신이 **비차단 후속만 남기고 배포 가능**에 해당. 배포는 진행하되, 미완·비차단 항목은 **별도 후속**(티켓·증빙·스프린트)으로 분리한다.  
   - **보류** — 회신이 **차단 이슈가 있어 배포 보류**에 해당. **P0** 해소 전까지 배포하지 않는다.  
4. **기록:** 확정일·회신 요약(또는 원문 위치)을 공식 기록에 남긴다. **권장 앵커:** [`IMPLEMENTATION_EVIDENCE.md` `#evidence-20260428-predeploy-qa-closure`](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) **「확정 기록」** 표·회신 원문 줄. (추가로 릴리즈 회의록 등 팀 관례가 있으면 병행.)

<a id="deployment-qa-nm-request-copy"></a>

### 배포 전 QA 최종 판정 회신 요청 (팀에 그대로 전달)

**상태 (고정):** 본 절·아래 `text` 복사 블록 정리 **완료** · **팀 회신 대기**. 기준·절차는 **`#deployment-qa-nm-reply`**(§6). **다음 행동:** `text` 블록**만** 팀에 보낸다. 회신을 받으면 §6 **절차**대로 닫힘/후속/보류를 확정하고, [`IMPLEMENTATION_EVIDENCE.md` `#evidence-20260428-predeploy-qa-closure`](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) **「확정 기록」** 표·**회신 원문** 줄**만** 갱신한다(§2·§3 총/완료/미완/P0·최종 판정).

**잠금 (회신 전·확정):** `#deployment-qa-nm-request-copy`의 **`text` 블록 형식**과 **바깥 설명**은 팀 회신이 올 때까지 원칙적으로 **변경하지 않는다**.

릴리즈·운영 담당이 아래 블록을 **복사**해 개발/운영팀에 보낸다.

**원본 위치(발신 측 참고, 팀 메시지에 넣지 않음):** 이 파일 → **`#deployment-qa-nm-request-copy`**

```text
배포 전 QA 최종 판정 회신 요청

아래 항목을 채워 회신해 주세요.

## §2 수동 점검
- 총 항목 수:
- 완료 항목 수:
- 미완 항목:
  - 없음 또는 항목명 기재
- 차단 이슈(P0):
  - 없음 또는 내용 기재

## §3 배포 직후/운영 확인 항목
- 총 항목 수:
- 완료 항목 수:
- 미완 항목:
  - 없음 또는 항목명 기재
- 차단 이슈(P0):
  - 없음 또는 내용 기재

## 최종 판정
아래 중 하나로 선택해 주세요.
- 배포 전 QA 닫음 가능
- 비차단 후속만 남기고 배포 가능
- 차단 이슈가 있어 배포 보류
```

---

**양식 단일화:** 회신 항목 전문은 위 **`text` 블록**에만 둔다. 동일 내용을 §6 다른 곳에 중복 두지 않는다(잠금·유지보수 혼선 방지).
