# incident-report 스킬

## 목적
장애 발생 시 원인·영향·조치·재발방지 항목을 포함한  
구조화된 인시던트 보고서를 자동 생성하고 파일로 저장합니다.

## 언제 사용하는가
- G3 또는 G4 등급이 해소된 직후  
- 운영자가 사후 보고서(Post-mortem) 초안이 필요할 때  
- 7일 아카이브에 충분한 이력이 쌓였을 때

## 생성 조건
| 조건 | 설명 |
|------|------|
| 활성 인시던트 존재 | `_nurion_events/active-incident.json` |
| 아카이브 이벤트 5건 이상 | 보고서 근거로 사용 |
| 현재 등급 G2 이상 | G0·G1 에서는 생성 안 함 |

## 생성되는 보고서 구조
```json
{
  "incidentId": "...",
  "grade": "G3",
  "detectedAt": "...",
  "resolvedAt": null,
  "cause": "핵심 경로 실패 — api:submissions HTTP 502",
  "impact": "접수 차단 활성화 중 (SUBMISSION_FREEZE=1)",
  "actions": ["접수 엔드포인트 복구 필요", "GAS 상태 확인"],
  "prevention": ["GAS 이중화 검토", "배포 전 smoke 추가"]
}
```

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| 보고서 파일 저장 | ✅ 항상 허용 |
| 알림(notify) | ✅ 항상 허용 |
| 장애 원인 코드 수정 | ❌ AI 실행 금지 |
| 보고서 외부 발송 | ❌ 운영자 검토 후 직접 발송 |
