# slo-budget 스킬

## 목적
플랫폼별 SLO 목표 대비 에러버짓 소진 수준을 검사하고  
배포 제한 수준(OPEN / CAUTION / RESTRICTED / FREEZE)을 결정합니다.

## SLO·에러버짓 개념
| 개념 | 설명 |
|------|------|
| **SLO** | 목표 성공률 (예: 견적 접수 99.5%) |
| **Error Budget** | 허용된 실패 여유분 (99.5% SLO × 30일 = 216분 허용) |
| **Burn Rate** | 버짓 소진 속도 (1× = 30일 안에 소진, 14× = 2일 만에 소진) |

## 언제 사용하는가
- 배포 전 에러버짓 상태 확인  
- 주간·월간 안정성 리뷰  
- 에러버짓 소진 임박 시 자동 배포 제한 적용

## 판단 기준
| 에러버짓 잔여 | 상태 | 배포 정책 |
|--------------|------|-----------|
| > 50% | HEALTHY | DEPLOY_OPEN — 정상 배포 가능 |
| 10~50% | WARNING | DEPLOY_CAUTION — preflight 강화 권고 |
| 0~10% | CRITICAL | DEPLOY_RESTRICTED — G2+ 배포 승인자 필수 |
| 소진 (<0%) | EXHAUSTED | DEPLOY_FREEZE — 신규 기능 배포 차단 |

## 빠른 소진 감지 (Fast Burn Rate)
1시간 창에서 burn rate ≥ 14× → 즉시 에스컬레이션  
(30일치 에러버짓을 2일 만에 소진하는 속도)

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| `DEPLOY_RESTRICT=1` 플래그 전송 (CRITICAL) | ✅ apply 모드에서 허용 |
| `DEPLOY_FREEZE=1` 플래그 전송 (EXHAUSTED) | ✅ apply 모드에서 허용 |
| 알림·에스컬레이션 | ✅ 항상 허용 |
| 배포 파이프라인 직접 차단 | ❌ GitHub Actions 게이트로 위임 |

## 필수 설정
`platform-profiles/[platformId]/slo-targets.json` 이 있어야 합니다.  
없으면 `config/slo-targets.example.json` 을 복사해 사용합니다.
