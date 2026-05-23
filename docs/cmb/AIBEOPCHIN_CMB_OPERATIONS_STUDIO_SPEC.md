# AI법친 CMB Operations Studio (Phase 6-H)

**상태**: Phase **6-H** — CMB **6-G RC** 이후 운영 가시성 레이어

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6H-OPERATIONS-STUDIO]`**

## 1. 목적

Voice **7-A** · Gongbuho **4-I**와 동일하게, CMB Publish/Lock 파이프라인(6-F〜G) 위에 **운영자가 한눈에 보는 Operations Studio**를 둔다. **`configJson` 본문은 API/UI에 노출하지 않고** revision·publish event·상태 큐·caseType 커버리지만 표시한다.

## 2. 범위

| # | 지표 | 설명 |
| --- | --- | --- |
| 1 | **Revision backlog** | `AibeopchinCmbConfigRevision` 상태별 건수 |
| 2 | **Status queue** | DRAFT → REVIEW → VERIFY_PASS → LOCKED → PUBLISHED 큐·비종료 backlog |
| 3 | **Publish events** | 최근 `AibeopchinCmbPublishEvent` 타임라인(메타) |
| 4 | **caseType 커버리지** | TS registry 5종 대비 DB revision·PUBLISHED 유무 |
| 5 | **커버리지 gap** | `NO_REVISION` · `NO_PUBLISHED` · `VALIDATION_FAIL` |
| 6 | **전이 funnel** | VERIFY_PASS / LOCKED / PUBLISHED 도달율 |
| 7 | **Bottleneck** | backlog 최대 stage |
| 8 | **본문 금지** | `configJson` · gate/block 상세 미노출 |

## 3. 화면 · API

| 경로 | 역할 |
| --- | --- |
| `/admin/cmb/operations-studio` | Operations Studio UI |
| `GET /api/admin/cmb/operations-studio` | 집계 JSON (STAFF+) |

## 4. 메트릭 SSOT

- Policy: [`cmb-operations-studio-policy.ts`](../../src/cmb/ops/cmb-operations-studio-policy.ts)
- Service: [`cmb-operations-studio.service.ts`](../../src/cmb/ops/cmb-operations-studio.service.ts)

### 4.1 caseType 커버리지 gap

| 코드 | 조건 |
| --- | --- |
| `NO_REVISION` | registry에 있으나 DB revision 0건 |
| `NO_PUBLISHED` | revision 있으나 `PUBLISHED` 없음 |
| `VALIDATION_FAIL` | registry `validateSingleCmbConfig` 실패 |
| `NONE` | PUBLISHED 존재 · validation OK |

## 5. 검증

```bash
npm run verify:aibeopchin-cmb
npm run test -- src/cmb/ops/cmb-operations-studio.service.test.ts
```

E2E always-on: `GET /api/admin/cmb/operations-studio` → 401/403

Optional: `E2E_CMB_OPERATIONS_STUDIO_SMOKE=1` + ADMIN

## 6. 한 줄 착수 기준

AI법친은 Voice 7-A와 Gongbuho 4-I로 운영 가시성 레이어를 확보했으므로, CMB **6-H Operations Studio**에서 revision·publish event·상태 큐·caseType 커버리지를 운영자가 **본문 없이** 한눈에 확인하도록 확장한다.

## 7. 관련 문서

- [AIBEOPCHIN_CMB_ADMIN_POLICY.md](./AIBEOPCHIN_CMB_ADMIN_POLICY.md) — Publish/Lock
- [AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md) — 6-G RC
