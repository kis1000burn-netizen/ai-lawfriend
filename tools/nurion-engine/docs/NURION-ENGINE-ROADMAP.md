# 누리온 엔진 로드맵 v1.0~v2.0

## v1.0 — 수집·판단·조치·감시
- collector / engine / policy / watch
- G0~G4 등급과 dry-run / apply 모드

## v1.1 — 운영 안전장치
- G3: `SUBMISSION_FREEZE=1`을 안전한 원격 액션으로 전달
- G4: P-0 또는 복수 조건에 기반한 롤백 후보
- incidentId 및 30분 cooldown
- NDJSON 감사 이력

## v1.2 — 진단
- 7일 아카이브 분석
- 신호별 반복·연속 실패 패턴
- CRITICAL 패턴은 CI/CD 차단용 exit 2

## v1.3 — 조언
실행 조건 5개가 모두 충족될 때만 조언을 생성합니다.
1. 총 이벤트 30건 이상
2. G1~G4 실제 이벤트 포함
3. 서로 다른 신호 3종 이상
4. 복구 이력 3건 이상
5. 배포 연결 사례 1건 이상

신뢰도:
- 이력 없음: `0.10`
- 이력 존재: `max(0.10, 성공_해결_수 / (유사_패턴_전체 + 1))`
- 근거 배열이 없으면 조언을 생성하지 않음
- 브랜치 생성 허용: 신뢰도 0.65 이상 + 5조건 동시 충족
- 운영 반영: 사람 승인 전 절대 금지

## v1.4 — Skill Registry + Platform Profile + 권한 정책

### 핵심 설계 원칙
- **core/** (엔진): 판단·안전정책 담당
- **skills/**: 실제 업무 기능 담당 (재사용 가능한 업무 단위)
- **platform-profiles/**: 플랫폼별 스킬 조합 선언

### 디렉토리 구조
```
nurion-engine/
├─ core/
│  └─ skill-registry.mjs      # 스킬 로더·실행기
│
├─ skills/
│  ├─ deploy-preflight/        # 배포 전 검사
│  ├─ gas-health/              # GAS URL·함수·flag 확인
│  ├─ payment-boundary/        # P-0 결제 경계 보호
│  ├─ submission-flow/         # 견적·주문·접수 저장 검증
│  ├─ vendor-flow/             # 업체·배달·미디어 검증
│  ├─ media-review/            # 승인 전 노출 차단·이력
│  ├─ pwa-health/              # manifest·icon·sw.js 검사
│  ├─ asset-integrity/         # CSS·JS·이미지 200 확인
│  ├─ rollback/                # 마지막 정상 릴리스 롤백
│  └─ incident-report/         # 장애 보고서 자동 생성
│
└─ platform-profiles/
   ├─ dosirak-store/           # 도시락 가게
   ├─ yeomgane-jokbal/         # 염가네 족발
   └─ future-template/         # 신규 플랫폼 템플릿
```

### 각 스킬 구조 (최소 4개 파일)
```
skills/payment-boundary/
├─ SKILL.md          # 언제 쓰는지, 판단 기준
├─ checks.mjs        # 검사 로직
├─ actions.mjs       # 허용된 자동조치
└─ policy.json       # 안전 정책 (또는 examples.json)
```

### 플랫폼 온보딩 흐름
```
플랫폼 생성
→ platform-profiles/[id]/profile.json 작성
→ enabledSkills 선택
→ skillOptions 설정 (URL, 임계값 등)
→ npm run nurion:skill 로 첫 실행
→ 누리온 감시 시작
```

### 새 스크립트
- `npm run nurion:skill`       — 스킬 파이프라인 dry-run
- `npm run nurion:skill:apply` — 스킬 파이프라인 + 자동조치 실행

### 플랫폼별 스킬 조합 예시
| 플랫폼 | 활성화 스킬 |
|--------|------------|
| dosirak-store | deploy-preflight, gas-health, **payment-boundary**, submission-flow, vendor-flow, media-review, pwa-health, rollback |
| yeomgane-jokbal | deploy-preflight, gas-health, submission-flow, vendor-flow, pwa-health, asset-integrity, rollback, incident-report |
| future-template | deploy-preflight, gas-health, pwa-health, asset-integrity, rollback |

### 플랫폼 간 장애 패턴 비교
개인정보·비밀정보가 제거된 요약 신호만 사용합니다.

### SLO·에러버짓 (v1.4 추가)

G등급이 "지금 이 순간" 판단이라면, SLO는 "이번 달 얼마나 안정적이었는가"를 수치화합니다.
둘이 합쳐져야 배포 속도와 안정성을 균형 있게 통제할 수 있습니다.

#### 새 파일
| 파일 | 역할 |
|------|------|
| `core/slo-engine.mjs` | SLO 계산·에러버짓·burn rate 핵심 엔진 |
| `skills/slo-budget/` | SLO 상태를 스킬 신호로 변환 |
| `config/slo-targets.example.json` | SLO 목표 정의 템플릿 |
| `platform-profiles/[id]/slo-targets.json` | 플랫폼별 SLO 목표 |
| `scripts/nurion-slo.mjs` | 텍스트 대시보드 CLI |

#### 배포 정책 자동 결정
| 에러버짓 잔여 | 배포 정책 | 조치 |
|--------------|-----------|------|
| > 50% | `DEPLOY_OPEN` | 자동 배포 가능 |
| 10~50% | `DEPLOY_CAUTION` | preflight 강화 권고 |
| < 10% | `DEPLOY_RESTRICTED` | G2+ 배포 승인자 필수 |
| 소진 | `DEPLOY_FREEZE` | 신규 기능 배포 차단 |

#### 빠른 소진 감지 (Fast Burn Rate)
1시간 창 burn rate ≥ 14× → 즉시 에스컬레이션  
(30일치 에러버짓을 2일 만에 소진하는 속도 = 구글 SRE 권고 임계값)

#### 새 스크립트
```bash
npm run nurion:slo          # 텍스트 대시보드 출력
npm run nurion:slo:json     # JSON 원본 출력 (CI 파이프라인용)
npm run nurion:slo -- --window 7  # 최근 7일 기준
```

#### SLO 목표 예시 (dosirak-store)
| SLO | 목표 | 단위 |
|-----|------|------|
| 견적·주문 접수 성공률 | 99.5% | availability |
| 운영 목록 API 가용성 | 99.0% | availability |
| GAS 백엔드 가용성 | 95.0% | availability |
| P-0 결제 경계 위반 | 0건 | zero-violation |

---

## Nurion Finance & Settlement 모듈 (v1.5~v2.0)

> "돈의 흐름이 한 푼이라도 어긋나는 순간 멈추고 근거를 보여준다"
>
> 설계 원칙: **자동 대사 + 이상 감지 + 승인 게이트** 중심.  
> 지급 실행·세금계산서 확정·환불 처리는 반드시 운영자가 직접 수행.

### 정산 상태 머신
```
draft → approved → payment_waiting → paid → reconciled → closed

예외: disputed / refund_pending / chargeback_pending / hold / failed
```
- **paid 이후 금액 수정 금지** — adjustment 거래로만 처리, 원본 보존
- 변경 이력과 승인자 기록 필수

### Finance 신호 ↔ G등급 매핑
| 신호 | 조건 | G등급 |
|------|------|-------|
| `finance:payout-duplicate` | 동일 settlementId 2회 지급 | G4 (P-0) |
| `finance:payout-mismatch` | 예상액·실제액 불일치 | G3 |
| `finance:tax-invoice-late` | 세금계산서 기한 초과 | G3 |
| `finance:vendor-balance-drift` | 업체 누적 잔액 불일치 | G3 |
| `finance:cashflow-risk` | 가용 현금 < 지급 예정 | G3 |
| `finance:negative-margin` | 주문 단위 마진 음수 | G2 |
| `finance:missing-invoice` | 증빙 미수집 기한 초과 | G2 |
| `finance:refund-spike` | 환불률 급증 | G2 |

### 누리온이 자동 수행하는 것
- 지급 예정액 계산
- 증빙·정산내역 대사
- 이상 발견 → 인시던트 저장
- 승인 요청 생성·이력 저장
- 지급 초안 생성

### 누리온이 절대 하지 않는 것
- 계좌번호 변경
- 실제 송금 실행
- 세금계산서 확정 발행
- 환불 확정
- 가격·수수료율 변경
- 정산금 상계

---

## v1.5 — Finance Collector

**목표:** 회계·정산 데이터 수집 기반 구축

- 주문·PG·업체·배송·환불 데이터 수집 커넥터
- `settlementId ↔ orderId ↔ traceId ↔ vendorId` 연결 구조 확립
- `_nurion_events/settlements/` NDJSON 저장 포맷 표준화
- 업체 정산 프로필 온보딩 폼 (`vendor-profiles.json`)

#### Trace ID 연결 예시
```json
{
  "traceId":      "quote_20260620_a1",
  "orderId":      "order_20260620_b1",
  "paymentId":    "pay_20260620_c1",
  "settlementId": "settle_20260625_d1",
  "vendorId":     "vendor_32"
}
```

---

## v1.6 — Settlement Reconciliation ⭐ **최우선**

**목표:** 예상액 vs 실제액 자동 대사 + 불일치 즉시 탐지

- `finance-settlement/ledger-reconcile` 스킬 — 대사 핵심 엔진
- `finance-settlement/payout-control` 스킬 — 중복 지급·상태 머신 위반 차단
- `finance-settlement/vendor-settlement` 스킬 — 업체 프로필 완성도 감시

#### 대사 공식
```
payout = 주문금액
       - 할인
       - 취소·환불
       - PG 수수료
       - 배송비 (vendor_borne 시)
       - 플랫폼 수수료
```

#### 인시던트 포맷
```json
{
  "type":                   "SETTLEMENT_MISMATCH",
  "settlementId":           "settle_20260625_001",
  "orderId":                "order_20260620_001",
  "vendorId":               "vendor_32",
  "traceId":                "quote_20260620_a1",
  "expectedVendorPayout":   48000,
  "actualVendorPayout":     45000,
  "difference":             3000,
  "sign":                   "underpaid",
  "status":                 "pending_review"
}
```

---

## v1.7 — Approval Matrix

**목표:** 지급 금액·종류별 승인 단계 강제

- `finance-settlement/approval-matrix` 스킬

| 금액 | 필요 승인 |
|------|-----------|
| 0 ~ 100,000원 | 담당자 1인 |
| 100,001 ~ 1,000,000원 | 운영자 + 재무 |
| 1,000,001원 초과 | 대표 또는 임원 |
| 예외·수동·환불 | 무조건 2인 |

---

## v1.8 — Tax Invoice Watch

**목표:** 세금계산서·증빙 기한 감시 및 수정 필요 감지

- `finance-settlement/tax-invoice-watch` 스킬
- 발급 기한 3일 전 경보 → 초과 시 G3
- 수정 발급 필요 건 감지 (자동 발행 금지)
- 전자세금계산서 전송 기한·불이익 리스크 모니터링

---

## v1.9 — Cashflow & Margin

**목표:** 업체별·주문별 마진과 지급 예정 현금흐름 예측

- `finance-settlement/revenue-leak-watch` 스킬 — 음수 마진·환불 급증
- `finance-settlement/cashflow-forecast` 스킬 — 단기 현금 부족 경보
- 7일·30일 지급 예정액 vs 가용 현금 비교
- 안전 여유(safety buffer) 설정 가능

---

## v2.0 — Monthly Close

**목표:** 월 마감 보고서·감사 증빙 패키지 자동 생성

- `finance-settlement/audit-evidence` 스킬

#### 생성 파일 (`_nurion_events/month-close/YYYY-MM/`)
```
settlement-summary.csv
vendor-payout-register.csv
refund-adjustment-register.csv
tax-invoice-checklist.csv
exception-log.json
approval-audit.ndjson
month-close-report.md
```

#### 월 마감 보고서 포함 항목
- 총 매출 / 취소·환불 / PG 수수료 / 업체 지급 예정액
- 미정산 잔액 / 세금계산서 누락 건 / 이상 거래 / 승인 대기 건
- 다음 달 현금유출 예상

> ⚠️ 누리온이 생성하는 보고서는 초안입니다. 재무팀 검토·서명 후 확정하세요.

---

## v2.1+ — 운영 고도화 (장기 로드맵)

### Trace ID 기반 고객 흐름 추적
- `traceId` 로 고객 폼 → Netlify → GAS → Spreadsheet → 정산 전체 흐름 연결
- OpenTelemetry 구조 참조 (trace·metric·log 공통 문맥)

### 카나리 배포·자동 중단
- 새 배포를 5% 트래픽으로 10분 감시 → 이상 시 자동 중단·롤백

### 변경 영향 분석
- 변경 파일 → 영향받는 스킬·기능 자동 계산

### 장애 리허설·카오스 테스트
- 스테이징에서만 장애 주입 → G등급·조치·롤백 사전 검증

### GitHub 승인 게이트
- 누리온 G등급·SLO → GitHub Actions 환경 보호 규칙 연동
- G0~G1: 자동 배포 / G2: 운영자 승인 / G3~G4: 배포 차단
