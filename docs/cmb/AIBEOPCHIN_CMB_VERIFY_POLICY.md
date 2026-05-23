# AI법친 CMB Verify Policy

**명령**: `npm run verify:aibeopchin-cmb`

## 1. 정적 게이트 (`scripts/verify-aibeopchin-cmb.mjs`)

1. 필수 문서 4종 + `docs/cmb/README.md` 존재·마커
2. `src/cmb/core/*` · case-types · blocks · policies 존재
3. `IMPLEMENTATION_EVIDENCE.md` — `EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6-FOUNDATION`
4. Gongbuho 5종 sample JSON 존재 (caseType 교차)

## 2. Vitest (`src/cmb/**/*.test.ts`)

[`cmb-validator.ts`](../../src/cmb/core/cmb-validator.ts) 가 검사:

| # | 검사 |
| --- | --- |
| 1 | 모든 `AIBEOPCHIN_CMB_CASE_TYPES` 에 config 존재 |
| 2 | `questionSetCode@version` registry 존재 |
| 3 | `templateCode@version` registry 존재 |
| 4 | `gongbuho.requiredPacketCodes` 가 SSOT `CMB_GONGBUHO_PACKET_CODES` 와 일치 |
| 5 | voiceEnabled 시 `requireVoiceFinalizeGate` true |
| 6 | `requireLawyerApproval` 시 gate key `REQUIRE_LAWYER_APPROVAL_BEFORE_DELIVERY` |
| 7 | client UI에 admin-only block 없음 |
| 8 | LOCKED config — `evidenceTag` EVIDENCE- prefix |
| 9 | immutable gate policy (`gate-policy.ts`) 위반 없음 |

## 3. immutable gate (CMB가 끌 수 없음)

- `gongbuho.requireApprovedPacketsOnly === true`
- `gates.requireLawyerReviewBeforeFinalize === true`
- `interview.voiceEnabled` → `gates.requireVoiceFinalizeGate === true`

## 4. 배포 권장

```bash
npm run verify:aibeopchin-cmb
npm run verify:canonical-sources
```

RC gate: `npm run verify:aibeopchin-cmb-rc` · `npm run predeploy:check` (Phase **6-G**).

## 6. RC (Phase 6-G)

```bash
npm run verify:aibeopchin-cmb-rc
```

[`AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md`](../cmb/AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md) 참조.

## 7. 한 줄 기준

CMB Verify는 **누락·불일치·gate 약화·역할 노출 오류**를 배포 전에 차단한다.
