# AI법친 CMB Release Candidate Lock Summary — Phase **6‑G**

**상태**: Phase **6‑G** — CMB **6‑A〜6‑F** (문서 · schema · registry · verify · Admin Preview · Publish/Lock) 전 레이어 **릴리즈 후보(RC) 봉인** — 기능 추가 없음.

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6G-RC-PREDEPLOY-CLOSURE]`**

## 1. 목적

Phase **6‑F(Publish/Lock)** 까지 완료된 CMB Layer를 **배포 레벨 RC**로 고정한다. `npm run verify:aibeopchin-cmb-rc` 가 `verify:aibeopchin-cmb` 선행 + RC 문서 · 증빙 스택 · migration · predeploy 연동을 한 번에 재현한다.

## 2. RC 포함 Phase 매트릭스

| Phase | 요약 | RC 핵심 |
| --- | --- | --- |
| **6‑A** | Architecture · Admin · Verify 정책 | [`AIBEOPCHIN_CMB_ARCHITECTURE.md`](./AIBEOPCHIN_CMB_ARCHITECTURE.md) |
| **6‑B** | schema · registry · validator · runtime | `src/cmb/core/` |
| **6‑C** | Gongbuho 5종 LOCKED config | `src/cmb/case-types/*.cmb.ts` |
| **6‑D** | `verify:aibeopchin-cmb` | [`AIBEOPCHIN_CMB_VERIFY_POLICY.md`](./AIBEOPCHIN_CMB_VERIFY_POLICY.md) |
| **6‑E** | Admin Preview UI | `/admin/cmb` |
| **6‑F** | Publish / Lock | [`cmb-publish-lock.service.ts`](../../src/cmb/publish/cmb-publish-lock.service.ts) · Prisma revision |
| **6‑G** | **본 RC 봉인** | [`AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md`](./AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md) |

## 3. RC Publish/Lock 흐름 (불변)

```
Baseline sync (TS registry → DB LOCKED)
→ verify PASS (validateSingleCmbConfig)
→ LOCKED → PUBLISHED
→ runtime: DB PUBLISHED 우선 · fallback TS registry
```

상태 전이: `DRAFT → REVIEW → VERIFY_PASS → LOCKED → PUBLISHED` (skip 금지)

## 4. RC 불변 기준

1. **CORE gate immutable** — `gate-policy.ts` · gate weakening 차단.
2. **VERIFY_PASS / PUBLISHED** — validator PASS 필수.
3. **LOCKED/PUBLISHED** — configJson 수정 금지.
4. **PublishEvent + Audit** — 전이 이력 · evidenceTag.
5. **정적 게이트** — `npm run verify:aibeopchin-cmb` **PASS** + `npm run verify:aibeopchin-cmb-rc` **PASS**.
6. **DB migration(배포 전 필수)** — `20260524200000_aibeopchin_cmb_publish_lock`.

## 5. 검증 (재현)

| 명령 | 기대 |
| --- | --- |
| `npm run verify:aibeopchin-cmb-rc` | **PASS** (선행 `verify:aibeopchin-cmb` 포함) |
| `npm run verify:canonical-sources` | **PASS** (배포 플라이트 권장) |
| `npm run predeploy:check` | CMB RC gate 포함 |

상세: [`AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md`](./AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md)

## 6. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | Phase **6‑G** CMB RC / Predeploy Closure |
