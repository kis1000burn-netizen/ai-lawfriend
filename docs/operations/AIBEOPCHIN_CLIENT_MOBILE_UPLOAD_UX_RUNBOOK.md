# Client Mobile Upload UX Runbook (Product Phase **21-B**)

**한 줄**: 의뢰인이 모바일에서 카메라 촬영·사진/파일 다중 선택·업로드 진행률·실패 재시도·제출 완료 확인까지 한 흐름으로 증거자료를 제출할 수 있게 한다.

---

## 1. 범위 (21-B)

| 항목 | 구현 |
| --- | --- |
| `capture=environment` | 카메라 촬영 input |
| 다중 선택 | gallery input `multiple` |
| 크기·형식 안내 | 15MB · PDF/Word/이미지/TXT · 사건당 30개 |
| 업로드 진행률 | XHR `upload.onprogress` |
| 개별 실패/재시도 | queue item별 retry |
| 제출 완료 반영 | `refreshAll()` → 제출 이력 탭 |
| 보완요청 연결 | supplement submit + `litigationFileIds` |
| 이탈 방지 | `beforeunload` + 화면 안내 배너 |
| 19-B / 19-D | metadata-only failure meta · litigation intake |
| 17/18 | `client_portal_upload` failure domain · retryEligible |

## 2. SSOT

| 파일 | 역할 |
| --- | --- |
| `client-portal-mobile-upload.policy.ts` | limits · validation · failure meta |
| `client-portal-mobile-upload.client.ts` | XHR upload + progress |
| `use-client-portal-mobile-upload-queue.ts` | queue · retry · departure guard |
| `client-mobile-upload-panel.tsx` | mobile upload UI |

## 3. Operator / triage

- 실패 코드: `FILE_TOO_LARGE` · `UNSUPPORTED_MIME` · `NETWORK_ERROR` · `SERVER_REJECTED` · `CASE_FILE_LIMIT`
- Phase 17 monitoring: external/document axis에서 `client_portal_upload` domain 검색
- Phase 18 retry: 네트워크/5xx는 operator 재시도 가능 (클라이언트 UI retry 1차)

## 4. Crosswalk

| Phase | 문서 |
| --- | --- |
| **21-A** | [AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md](./AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md) |
| **19-B** | [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](./AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) |
| **19-D** | [AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md](./AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md) |
| **18-B** | [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) |

## 5. 검증

```bash
npm run verify:aibeopchin-client-mobile-phase21b
```

## 6. 다음

**21-C PWA Install / Home Screen** (완료)

**21-D Push-ready Notification Surface** (다음)

**버전** **`21-B.1`**
