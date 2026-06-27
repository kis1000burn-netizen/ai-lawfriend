# 누리온 엔진 v1.5 Finance & Settlement

독립 실행형 플랫폼 운영·정산 감시 엔진입니다.  
v1.4의 Skill Registry + Platform Profile + SLO·에러버짓 위에 **Finance & Settlement 모듈**을 추가했습니다.

> **원칙**: 돈의 흐름이 한 푼이라도 어긋나면 멈추고 근거를 보여줍니다.  
> 누리온은 실제 송금, 가격 변경, 계좌 변경, 환불 확정, 세금계산서 발행을 하지 않습니다.

---

## 요구사항

- Node.js 20.x 이상 (외부 npm 패키지 없음)

---

## 빠른 시작

```powershell
# 1. 설정 파일 생성
Copy-Item config\nurion.config.example.json config\nurion.config.json
# config/nurion.config.json 에서 platformId, probe URL 설정

# 2. 플랫폼 프로필 생성 (신규 플랫폼)
Copy-Item platform-profiles\future-template\profile.json platform-profiles\MY-PLATFORM\profile.json
Copy-Item platform-profiles\future-template\slo-targets.json platform-profiles\MY-PLATFORM\slo-targets.json
# MY-PLATFORM 폴더명과 profile.json 의 platformId 를 일치시키세요

# 3. 첫 실행
npm run nurion
```

---

## AI법친 적용 메모

이 복사본은 AI법친 워크스페이스의 `tools/nurion-engine/`에 격리된 운영 검증 도구입니다.

- 기본 설정 파일은 `config/nurion.config.json`이며 `platformId`는 `aibeopchin`입니다.
- AI법친 프로필은 `platform-profiles/aibeopchin/profile.json`에 있습니다.
- 기본 실행은 외부 HTTP 호출 없이 manual probe와 로컬 정산 이벤트만 검사합니다.
- 수임료·파트너 정산에 대해서는 대사, 중복 지급 탐지, 승인 매트릭스, 세금계산서 기한 감시, 월마감 증빙 초안만 수행합니다.
- 실제 송금, 계좌 변경, 환불 확정, 세금계산서 발행, 가격·수수료 변경은 누리온이 수행하지 않습니다.

루트 프로젝트에서는 다음 명령으로 실행합니다.

```bash
npm run nurion:aibeopchin
npm run nurion:aibeopchin:finance:test
npm run verify:aibeopchin-nurion-finance
```

운영 정산 이벤트를 연결할 때는 `_nurion_events/settlements/aibeopchin-YYYY-MM-DD.ndjson` 형식으로 저장하거나, `platform-profiles/aibeopchin/profile.json`의 `settlementApiUrl`을 승인된 내부 API로 연결하세요.

---

## 명령

| 명령 | 설명 |
|------|------|
| `npm run nurion` | 1회 판단 dry-run (코어 + 스킬 + Finance + SLO 통합) |
| `npm run nurion:apply` | 1회 판단 + 자동조치 실행 |
| `npm run nurion:watch` | 주기 감시 (pollIntervalMs, 기본 5분) — Finance 스킬 포함 |
| `npm run nurion:watch:apply` | 주기 감시 + 자동조치 |
| `npm run nurion:slo` | SLO·에러버짓 대시보드 출력 |
| `npm run nurion:slo:json` | SLO 결과 JSON 출력 (CI 파이프라인용) |
| `npm run nurion:diagnose` | 아카이브 기반 반복 장애 진단 |
| `npm run nurion:advise` | 조언 생성 조건 확인 |
| `npm run nurion:core` | 코어 신호만 판단 (스킬 제외, 디버깅용) |
| `npm run nurion:finance:test` | Finance 시나리오 25건 검증 |
| `npm run nurion:finance:test:v` | 위와 동일, 상세 출력 |
| `npm run nurion:test` | 전체 테스트 (단위 + Finance 시나리오) |
| `npm run nurion:test:lib` | _lib.mjs 단위 테스트만 실행 |

---

## 프로젝트 구조 (v1.5)

```
nurion-engine-v1.5-finance/
├─ core/
│  ├─ skill-registry.mjs      # 스킬 로더·실행기
│  └─ slo-engine.mjs          # SLO·에러버짓 계산 엔진
│
├─ scripts/
│  ├─ nurion-skill-run.mjs    # ★ 메인 엔트리 (npm run nurion)
│  ├─ nurion-engine.mjs       # 코어 전용 (디버깅)
│  ├─ nurion-collector.mjs    # HTTP probe 수집
│  ├─ nurion-policy.mjs       # G등급별 자동조치 정책
│  ├─ nurion-state.mjs        # NDJSON 아카이브·인시던트·보존 정책
│  ├─ nurion-utils.mjs        # 공통 유틸 (ROOT, isMainScript 등)
│  ├─ nurion-watch.mjs        # 주기 감시 (nurion-skill-run 호출)
│  ├─ nurion-diagnostics.mjs  # 7일 이력 패턴 진단
│  ├─ nurion-advisor.mjs      # 조건부 조언 생성
│  ├─ nurion-slo.mjs          # SLO 대시보드 CLI
│  └─ nurion-finance-test.mjs # Finance 시나리오 테스트 러너
│
├─ skills/                    # 재사용 가능한 업무 단위 (19개)
│  ├─ slo-budget/             # SLO → 배포 정책 결정
│  ├─ deploy-preflight/       # 배포 전 빌드·smoke 검사
│  ├─ gas-health/             # GAS URL·응답·latency
│  ├─ payment-boundary/       # P-0 결제 경계 보호
│  ├─ submission-flow/        # 견적·주문·접수 API 검증
│  ├─ vendor-flow/            # 업체·배달 데이터 검증
│  ├─ media-review/           # 미승인 미디어 공개 차단
│  ├─ pwa-health/             # manifest·sw.js 검사
│  ├─ asset-integrity/        # CSS·JS·이미지 200 확인
│  ├─ rollback/               # 마지막 정상 릴리스 롤백
│  ├─ incident-report/        # 장애 보고서 자동 생성
│  │
│  └─ finance-settlement/     # ★ v1.5 Finance 모듈
│     ├─ _lib.mjs             # 공유: KRW 정수, 상태 머신, Idempotency, 해시체인
│     ├─ ledger-reconcile/    # 예상 vs 실제 지급액 대사 → G3 신호
│     ├─ payout-control/      # 중복 지급 차단 (Idempotency) → G4/P-0
│     ├─ approval-matrix/     # 금액별 승인 단계 강제
│     ├─ tax-invoice-watch/   # 세금계산서 기한·누락 감시
│     ├─ vendor-settlement/   # 업체 프로필 완성도 검사
│     ├─ revenue-leak-watch/  # 음수 마진·환불 급증 감지
│     ├─ cashflow-forecast/   # 7일/30일 현금 부족 경보
│     └─ audit-evidence/      # 월 마감 증빙 패키지 확인
│
├─ platform-profiles/
│  ├─ dosirak-store/          # profile.json + slo-targets.json (Finance 풀셋)
│  ├─ yeomgane-jokbal/        # profile.json + slo-targets.json
│  └─ future-template/        # 신규 플랫폼 시작 템플릿
│
├─ config/
│  ├─ nurion.config.example.json      # 설정 템플릿 (→ nurion.config.json 으로 복사)
│  ├─ nurion-rules.json               # 진단 패턴 규칙
│  ├─ reconciliation-policy.json      # 정산 오차 허용 정책 (기본 0원)
│  ├─ slo-targets.example.json        # SLO 목표 템플릿
│  └─ vendor-profiles.example.json    # 업체 정산 프로필 예시
│
├─ tests/
│  ├─ nurion-diagnostics.test.mjs     # 진단 함수 단위 테스트 (4케이스)
│  └─ finance-lib.test.mjs            # ★ _lib.mjs 단위 테스트 (40+ 케이스)
│
└─ docs/
   └─ NURION-ENGINE-ROADMAP.md        # v1.0 ~ v2.1+ 로드맵
```

---

## 실행 순서 (npm run nurion)

```
설정·릴리스·이전 보고서 로드
  → 코어 신호 수집 (HTTP probe)
  → 스킬 검사 (enabledSkills 전체, Finance 포함)
  → 코어 + 스킬 신호 병합
  → 최종 G등급 계산  ← 모든 신호 포함, previousReport 반영
  → 최종 보고서 아카이브 + 만료 파일 정리 (retentionDays)
  → 자동조치 실행  ← 최종 등급 기준
  → 결과 JSON 출력  (G3/G4 시 exit code 2)
```

---

## G등급 판정 기준

| 등급 | 조건 | 대표 상황 |
|------|------|-----------|
| **G4** | P-0 신호 OR (핵심+정적 복수 실패 + 재시도 실패 + 최근 배포) | 중복 지급, 전면 장애 |
| **G3** | `critical: true` 신호 1건 이상 | 대사 불일치, 결제 경계 이상 |
| **G2** | `critical: false` 실패 신호 1건 이상 | 음수 마진, 세금계산서 누락 |
| **G1** | warn 신호 1건 이상 | 현금흐름 주의, 프로필 미완성 |
| **G0** | 전체 정상 | — |

---

## Finance & Settlement G등급 신호 매핑

| Finance 신호 | 등급 | 설명 |
|-------------|------|------|
| `finance:payout-duplicate` | **G4 / P-0** | 중복 지급 감지 |
| `finance:payout-mismatch` | G3 | 예상 vs 실제 지급액 불일치 |
| `finance:tax-invoice-late` | G3 | 세금계산서 기한 초과 |
| `finance:vendor-balance-drift` | G3 | 업체 잔액 드리프트 |
| `finance:cashflow-risk` | G3 | 7일 내 현금 부족 |
| `finance:negative-margin` | G2 | 음수 마진 |
| `finance:missing-invoice` | G2 | 세금계산서 누락 |
| `finance:refund-spike` | G2 | 환불 급증 |

---

## 실제 운영 연결 전 필수 사항

1. `config/nurion.config.json` 의 URL을 운영 환경에 맞게 설정합니다.
2. `platform-profiles/[platformId]/profile.json` 의 `enabledSkills` 를 필요한 스킬만 남깁니다.
3. `platform-profiles/[platformId]/slo-targets.json` 의 `signalId` 를 실제 probe id에 맞게 수정합니다.
4. `skillOptions.cashflow-forecast.availableCash` 를 실제 가용 현금으로 주기적으로 갱신합니다.
5. `vendor_002.bankAccountVerified` 를 계좌 인증 완료 후 `true` 로 변경합니다.
6. `remoteActions.enabled` 는 기본 `false` 입니다. 원격 액션은 `NURION_REMOTE_ACTIONS=1` 환경변수도 함께 필요합니다.
7. `set_flag` 수신 서버는 인증·권한 검증·감사 로그·idempotency를 구현해야 합니다.
8. 결제, 고객정보, 가격, 권한, 데이터 삭제는 누리온이 직접 변경하지 않도록 유지하십시오.

---

## 이벤트 보관

`_nurion_events/archive/*.ndjson` 에 실행 이력이 저장됩니다.  
`retentionDays` (기본 7일) 이 지난 파일은 다음 실행 시 자동 삭제됩니다.  
운영 환경에서는 이 폴더를 Git에 커밋하지 말고, 접근 제어된 저장소로 이전하는 것을 권장합니다.

`_nurion_events/settlements/*.ndjson` 에 정산 이벤트가 저장됩니다.  
샘플 데이터(`dosirak-store-2026-06-20.ndjson`)는 25건의 시나리오(S1~S7+부가)를 포함합니다.
