# gas-health 스킬

## 목적
Google Apps Script(GAS) URL, Spreadsheet 연결, 함수 응답, flag 상태를 검사해  
GAS 백엔드 의존 플랫폼의 정상 동작 여부를 확인합니다.

## 언제 사용하는가
- GAS를 API 백엔드로 사용하는 플랫폼 (주문접수, 견적, 재고 등)  
- GAS 배포 또는 Apps Script 코드 수정 후  
- 주기적 감시 중 GAS 응답이 지연·오류를 보일 때

## 판단 기준
| 조건 | 결과 |
|------|------|
| GAS URL 미설정 | WARN |
| GAS health 엔드포인트 HTTP 오류 | FAIL — critical |
| 응답 latency > 5,000ms | WARN |
| 응답 body에 `"status":"ok"` 없음 | WARN |
| `GAS_MAINTENANCE_BANNER` 이미 활성화 | INFO (중복 조치 방지용) |

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| `GAS_MAINTENANCE_BANNER=1` 플래그 전송 | ✅ apply 모드에서 허용 |
| 알림(notify) 발송 | ✅ 허용 |
| GAS 코드 수정 또는 재배포 | ❌ AI 실행 금지 |
| Spreadsheet 데이터 변경 | ❌ AI 실행 금지 |

## skillOptions (profile.json 내 설정)
```json
"gas-health": {
  "gasHealthUrl": "https://script.google.com/macros/s/xxx/exec?health=1",
  "latencyWarnMs": 3000
}
```
