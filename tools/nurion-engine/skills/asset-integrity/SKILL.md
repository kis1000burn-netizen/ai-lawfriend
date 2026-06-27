# asset-integrity 스킬

## 목적
CSS, JS, 이미지 등 정적 자산이 HTTP 200으로 정상 응답하는지 확인하고  
누락된 자산 참조를 감지합니다.

## 언제 사용하는가
- 배포 직후 자산 서빙 확인  
- CDN 캐시 purge 후  
- 빌드 해시 변경으로 기존 참조가 끊어질 수 있을 때

## 판단 기준
| 조건 | 결과 |
|------|------|
| 설정된 자산 URL이 404/오류 | FAIL |
| 자산 URL이 redirect (3xx) | WARN |
| 자산 응답 latency > 3,000ms | WARN |
| 자산 probe 미설정 | WARN |

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| 알림(notify) | ✅ 항상 허용 |
| `GAS_MAINTENANCE_BANNER=1` 설정 (다수 자산 실패 시) | ✅ apply 모드에서 허용 |
| 자산 파일 수정·재업로드 | ❌ AI 실행 금지 |

## skillOptions (profile.json)
```json
"asset-integrity": {
  "assetUrls": [
    "https://example.com/style.css",
    "https://example.com/app.js",
    "https://example.com/sw.js"
  ],
  "latencyWarnMs": 2000
}
```
