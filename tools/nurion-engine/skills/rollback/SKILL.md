# rollback 스킬

## 목적
마지막으로 검증 통과한 release 태그로 롤백할 수 있는지 판단하고  
G4 조건 충족 시 롤백 조치를 실행합니다.

## 언제 사용하는가
- G4 등급 진입 시 (P-0 위반 또는 복합 장애)  
- 최근 배포 후 즉각적인 회귀 감지 시  
- 운영자가 롤백 가능 여부를 확인하고자 할 때

## 판단 기준
| 조건 | 결과 |
|------|------|
| `release/LAST_RELEASE.json` 없음 | WARN — 롤백 기준 없음 |
| LAST_RELEASE에 `tag`, `releasedAt` 없음 | FAIL |
| 현재 등급이 G4 | FAIL — 롤백 후보 활성화 |
| `rollbackWebhook` 미설정 | WARN — 자동 롤백 불가 |

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| 롤백 후보 알림(notify) | ✅ 항상 허용 |
| `rollbackWebhook` 호출 (G4 + apply + remoteActions) | ✅ 조건부 허용 |
| 배포 취소·코드 변경·데이터 마이그레이션 | ❌ AI 실행 금지 |

## skillOptions (profile.json)
```json
"rollback": {
  "rollbackWebhook": "https://api.example.com/rollback",
  "requireGrade": "G4"
}
```
