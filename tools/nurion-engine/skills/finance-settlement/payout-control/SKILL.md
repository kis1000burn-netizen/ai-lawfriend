# payout-control 스킬

## 목적
중복 지급 시도, 상태 머신 위반, paid 이후 금액 수정 시도를 감지해 차단합니다.

## 판단 기준
| 조건 | 신호 | 등급 |
|------|------|------|
| 동일 settlementId paid 2회 이상 | `code:p0-boundary` | G4 |
| 허용되지 않은 상태 전환 | `finance:payout-mismatch` | G3 |
| paid 이후 금액 수정 시도 | `code:p0-boundary` | G4 |
| 미승인 payment_waiting | warn | — |

## 자동조치
| 조치 | 허용 여부 |
|------|-----------|
| `PAYOUT_BLOCK=1` 플래그 | ✅ apply + G3/G4 |
| 에스컬레이션 | ✅ 항상 |
| 계좌번호 변경 | ❌ **절대 금지** |
| 실제 송금 실행 | ❌ **절대 금지** |
| 지급 취소 | ❌ **절대 금지** |
