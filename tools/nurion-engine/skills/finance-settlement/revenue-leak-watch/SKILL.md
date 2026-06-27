# revenue-leak-watch 스킬

## 목적
음수 마진, 환불 급증, 업체별 누적 잔액 불일치를 감지합니다.

## 판단 기준
| 조건 | 신호 | 등급 |
|------|------|------|
| 음수 마진 발생 | `finance:negative-margin` | G2 |
| 환불률 ≥ 10% | `finance:refund-spike` | G2 |
| 업체 잔액 불일치 > 10,000원 | `finance:vendor-balance-drift` | G3 |

## 자동조치
알림·에스컬레이션만. 수수료·환불 설정 변경은 운영자 직접 처리.
