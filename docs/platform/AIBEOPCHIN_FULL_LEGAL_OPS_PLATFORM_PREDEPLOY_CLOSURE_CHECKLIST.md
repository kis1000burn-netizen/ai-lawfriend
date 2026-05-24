# AI법친 Full Legal Ops Platform Predeploy Closure Checklist (Phase **16‑A**)

**상태**: **Full Platform RC LOCKED** — `verify:aibeopchin-full-legal-ops-platform-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC]`**

---

## ☐ A. Domain RC (7축 — master verify에 포함)

| # | Domain | verify |
| --- | --- | --- |
| A1 | Voice RC | `verify:aibeopchin-voice-rc` |
| A2 | Gongbuho Legal Knowledge RC | `verify:gongbuho-legal-knowledge-rc` |
| A3 | CMB RC | `verify:aibeopchin-cmb-rc` |
| A4 | AI Core RC | `verify:aibeopchin-ai-core-rc` |
| A5 | Legal Document Intelligence RC | `verify:aibeopchin-legal-document-intelligence-rc` |
| A6 | Litigation Command Center RC | `verify:aibeopchin-litigation-command-center-rc` |
| A7 | Client Collaboration Portal Full RC | `verify:aibeopchin-client-collaboration-portal-full-rc` |

---

## ☐ B. Platform integrity

| # | Gate | 명령 |
| --- | --- | --- |
| B1 | Supplement migration | `verify:supplement-migration-predeploy` |
| B2 | CaseStatus SSOT | `verify:canonical-sources` |
| B3 | TypeScript | `npx tsc --noEmit` |
| B4 | ESLint | `npm run lint` |
| B5 | Unit tests | `npm run test` |

---

## ☐ C. Production build (predeploy-check)

| # | 확인 |
| --- | --- |
| C1 | `npm run dev` **종료** 후 build |
| C2 | `npm run predeploy:check` **PASS** (master RC + build) |

---

## ☐ D. Role smoke (ops — dev server 필요)

| # | 확인 |
| --- | --- |
| D1 | `scripts/ops-ai-core-role-smoke.mjs` 존재 |
| D2 | seed DB + `npm run dev` 후 `npm run ops:ai-core-role-smoke` **PASS** (staging/로컬) |

---

## ☐ E. SSOT

| # | 파일 |
| --- | --- |
| E1 | `src/features/platform/full-legal-ops-platform-rc-lock.ts` |
| E2 | `scripts/predeploy-check.ts` → **master gate only** |
| E3 | `IMPLEMENTATION_EVIDENCE.md` Phase 16-A 블록 |

---

**한 줄**: 16-A는 신규 기능 착수 전, 전 플랫폼 RC·품질·build를 하나의 predeploy 축으로 봉인한다.
