# vendor-flow 스킬

## 목적
업체(vendor) 등록 데이터, 배송 상태 전환, 미디어 참조 무결성을 검증합니다.  
잘못된 업체 데이터가 주문·배달 흐름에 영향을 주기 전에 격리합니다.

## 언제 사용하는가
- 신규 업체 등록 후  
- 배달·배송 상태 전환 오류 감지 시  
- vendor 데이터에 미디어(이미지·메뉴) 참조가 포함된 플랫폼

## 판단 기준
| 조건 | 결과 |
|------|------|
| vendor 목록 엔드포인트 HTTP 오류 | FAIL — critical |
| 등록 vendor에 필수 필드 누락 (name, category, contact) | FAIL |
| 배달 상태가 유효 범위(`pending/processing/delivered/cancelled`) 밖 | WARN |
| 미디어 URL 참조가 404 | WARN |

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| 알림(notify) | ✅ 항상 허용 |
| 문제 업체 격리 알림(quarantine notice) | ✅ 허용 |
| 업체 데이터 수정·삭제 | ❌ AI 실행 금지 |
| 결제 정보 변경 | ❌ AI 실행 금지 |
