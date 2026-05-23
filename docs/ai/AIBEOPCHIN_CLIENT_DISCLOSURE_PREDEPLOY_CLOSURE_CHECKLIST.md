# AI법친 Client Disclosure RC Predeploy Closure Checklist (Phase **11‑D**)

**상태**: **RC LOCKED** — `verify:aibeopchin-client-disclosure-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11D-CLIENT-DISCLOSURE-RC-CLOSURE]`**

---

## ☐ A. 선행 AI Core RC (Tier 1〜3 — 불변)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-ai-core-rc` Tier 1 | Document 8‑E |
| A2 | `npm run verify:aibeopchin-ai-core-rc` Tier 2 | Case Summary 9‑C |
| A3 | `npm run verify:aibeopchin-ai-core-rc` Tier 3 | Governance 10‑D |
| A4 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE]` | IMPLEMENTATION_EVIDENCE 존재 |

---

## ☐ B. Client Disclosure RC 정적 게이트 (Tier 4)

| # | 명령 | 기대 |
| --- | --- | --- |
| B1 | `npm run verify:aibeopchin-client-disclosure-rc` | **PASS** |
| B2 | `npm run verify:aibeopchin-lawyer-review-console` | **PASS** (B1에 포함) |
| B3 | `npm run verify:aibeopchin-client-disclosure-preview` | **PASS** (B1에 포함) |
| B4 | `npm run verify:aibeopchin-client-disclosure-delivery` | **PASS** (B1에 포함) |

---

## ☐ C. Vitest Client Disclosure 묶음

```bash
npm run test -- src/features/ai-core/case-intelligence-review.service.test.ts
npm run test -- src/features/ai-core/case-intelligence-review.api.validators.test.ts
npm run test -- src/features/ai-core/client-disclosure-preview.service.test.ts
npm run test -- src/features/ai-core/client-disclosure-delivery.service.test.ts
```

| 기준 | 결과 |
| --- | --- |
| review + preview + delivery tests | **4** test files **PASS** |

---

## ☐ D. Prisma / migration (11-A/11-B baseline)

| Migration | 모델 |
| --- | --- |
| `20260525120000_case_intelligence_snapshot_phase11a` | `CaseIntelligenceSnapshot` |
| `20260525130000_case_client_disclosure_release_phase11b` | `CaseClientDisclosureRelease` |

Greenfield: `npm run db:migrate` / `db:deploy` 로 baseline 적용.

---

## ☐ E. Route · UI 스폿

- `intelligence-review` — 11-A Lawyer Review Console
- `client-disclosure-preview` — 11-B (LAWYER/STAFF/ADMIN only)
- `client-disclosure-delivery` — 11-C (owner CLIENT only)
- `summary/generate` — CLIENT → delivery branch (no graph)
- `case-detail-client` — CLIENT → `ClientDisclosureDeliveryPanel`

---

## ☐ F. Predeploy 통합

```bash
npm run predeploy:check
```

`scripts/predeploy-check.ts` — gate **`verify:aibeopchin-ai-core-rc`** (Tier 1+2+3+4) 유지.

---

## ☐ G. 문서 교차 참조

- RC 잠금: [`AIBEOPCHIN_CLIENT_DISCLOSURE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_CLIENT_DISCLOSURE_RC_LOCK_SUMMARY.md)
- Review Console: [`AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md`](./AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md)
- Preview: [`AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md`](./AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md)
- Delivery: [`AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md`](./AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md)
- Governance RC: [`AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md`](./AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md)
- 증빙 SSOT: [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md)

---

## RC 이후 (본 체크리스트 **범위 외**)

Release revoke · CLIENT release history UI · notification — 별도 Phase.
