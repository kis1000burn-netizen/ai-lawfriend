# submission-flow 스킬

## 목적
견적·주문·접수 폼의 저장·검증 흐름을 점검합니다.  
필수 필드 누락, 중복 접수, 저장 엔드포인트 오류를 감지하고  
접수 차단 플래그를 안전하게 제어합니다.

## 언제 사용하는가
- 주문·접수 폼이 있는 모든 플랫폼  
- `/submissions` 또는 GAS 저장 엔드포인트 오류 감지 시  
- G3 조건(핵심 경로 실패) 진입 전 조기 차단 판단

## 판단 기준
| 조건 | 결과 |
|------|------|
| 접수 엔드포인트 HTTP 오류 | FAIL — critical |
| 응답에 `id` 또는 `receiptId` 없음 | FAIL |
| `SUBMISSION_FREEZE=1` 이미 활성화 | INFO |
| 엔드포인트 latency > 6,000ms | WARN |

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| `SUBMISSION_FREEZE=1` 플래그 전송 | ✅ apply + G3 이상에서 허용 |
| 알림(notify) | ✅ 항상 허용 |
| 접수 데이터 수정·삭제 | ❌ AI 실행 금지 |
| 주문 상태 변경 | ❌ AI 실행 금지 |

## 연관 스킬
- `gas-health` — GAS 저장소 상태 선행 점검 권고  
- `payment-boundary` — 결제 포함 접수 시 병행 필수
