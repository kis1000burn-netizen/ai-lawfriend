# pwa-health 스킬

## 목적
Progressive Web App 필수 요소(manifest, 아이콘, service worker)의  
존재·유효성·scope 설정을 검사합니다.

## 언제 사용하는가
- PWA 배포 전 필수 검사  
- manifest.json 또는 sw.js 수정 후  
- 설치 프롬프트가 뜨지 않거나 오프라인 동작이 안 될 때

## 판단 기준
| 조건 | 결과 |
|------|------|
| manifest.json 없음 또는 HTTP 오류 | FAIL — critical |
| manifest `name`, `start_url`, `icons` 누락 | FAIL |
| 아이콘 중 192x192 없음 | WARN |
| sw.js 없음 또는 HTTP 오류 | FAIL — critical |
| manifest `scope` 설정 없음 | WARN |

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| 알림(notify) | ✅ 항상 허용 |
| manifest·sw.js 내용 수정 | ❌ AI 실행 금지 |

## skillOptions (profile.json)
```json
"pwa-health": {
  "manifestUrl": "https://example.com/manifest.json",
  "swUrl": "https://example.com/sw.js"
}
```
