# deploy-preflight 스킬

## 목적
배포 전 빌드 결과물·정적 파일·smoke probe·누리온 G등급 조건을 검사해  
배포 실행 가능 여부를 판단합니다.

## 언제 사용하는가
- `npm run build` 또는 CI 빌드 직후  
- 원격 배포(Netlify, Vercel, GitHub Pages 등) 전  
- G3·G4 등급이 해소된 뒤 재배포 전 재검증

## 판단 기준
| 조건 | 결과 |
|------|------|
| 빌드 출력 디렉토리(`dist/` 또는 `_site/`) 없음 | FAIL — critical |
| `index.html` 미존재 | FAIL — critical |
| smoke probe(HTTP) 중 하나라도 실패 | FAIL — critical 여부는 probe 설정 따름 |
| 현재 엔진 등급이 G3 이상 | WARN — 배포 차단 권고 |
| 현재 엔진 등급이 G4 | FAIL — critical (롤백 우선) |

## 자동조치 (actions.mjs)
| 조치 | 허용 여부 |
|------|-----------|
| 배포 차단 알림(notify) | ✅ 허용 |
| `DEPLOY_BLOCK=1` 플래그 전송 | ✅ apply 모드에서 허용 |
| 실제 배포 실행 또는 취소 | ❌ AI 실행 금지 |

## 연관 스킬
- `gas-health` — GAS 상태도 배포 전 점검 권고  
- `pwa-health` — manifest·sw.js 검사 병행 권고  
- `asset-integrity` — 정적 자산 200 응답 확인 권고
