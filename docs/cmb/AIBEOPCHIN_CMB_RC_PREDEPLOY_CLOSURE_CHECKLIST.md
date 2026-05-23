# AI법친 CMB RC Predeploy Closure Checklist (Phase **6‑G**)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6G-RC-PREDEPLOY-CLOSURE]`**

목적: CMB **6‑A〜6‑F** 전 레이어를 **릴리즈 후보(RC)** 로 봉인한 뒤, 배포 직전에 **한 번에** 재확인한다.

---

## ☐ A. RC 정적 게이트(자동)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-cmb-rc` | **PASS** — `verify:aibeopchin-cmb` 선행 + RC 문서 · migration · 증빙 |
| A2 | `npm run verify:aibeopchin-cmb` | **PASS** (A1에 포함) |
| A3 | `npm run verify:canonical-sources` | **PASS** (배포 플라이트 권장) |

---

## ☐ B. Vitest CMB 묶음

```bash
npm run verify:aibeopchin-cmb
# 내부: npx vitest run src/cmb/
```

| 기준(본 헤드) | 결과 |
| --- | --- |
| `src/cmb/**/*.test.ts` | **11+** tests **PASS** |

---

## ☐ C. DB migration (배포 전 **필수**)

`DATABASE_URL` 설정 후:

```bash
npm run db:migrate
# 또는 prod: npm run db:deploy
```

| migration | 용도 |
| --- | --- |
| `20260524200000_aibeopchin_cmb_publish_lock` | `AibeopchinCmbConfigRevision` · `AibeopchinCmbPublishEvent` (6‑F) |

---

## ☐ D. CMB Publish/Lock 운영 1회 (스폿)

Admin UI (`/admin/cmb`):

1. **Baseline sync** — TS registry → DB **LOCKED** revision
2. **verify PASS** — 목록/상세 validator · global verify summary
3. **LOCKED → PUBLISHED** — ADMIN+ · `validateSingleCmbConfig` · PublishEvent 기록

불변 확인:

- skip 전이 **403/400**
- gate 약화 시도 **차단**
- LOCKED config **수정 UI 없음**

---

## ☐ E. Predeploy 통합

```bash
npm run predeploy:check
```

`scripts/predeploy-check.ts`에 **CMB RC gate** (`verify:aibeopchin-cmb-rc`) 포함.

---

## ☐ F. 문서 교차 참조

- RC 잠금: [`AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md)
- Publish 정책: [`AIBEOPCHIN_CMB_ADMIN_POLICY.md`](./AIBEOPCHIN_CMB_ADMIN_POLICY.md)
- 증빙 SSOT: [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md) · `[EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6G-RC-PREDEPLOY-CLOSURE]`
