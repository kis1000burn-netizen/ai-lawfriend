# Gongbuho Legal Knowledge RC Predeploy Closure Checklist (Phase **4‑H**)

**증빙 태그**: **`[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-RC-PREDEPLOY-CLOSURE]`**

목적: Legal Knowledge **Compiler → Intake → Pipeline → Implementation → Lawyer Portal** 전 레이어를 **릴리즈 후보(RC)** 로 봉인한 뒤, 배포 직전에 **한 번에** 재확인한다. Gongbuho MVP 단계는 [`GONGBUHO_MVP_LOCK_SUMMARY.md`](./GONGBUHO_MVP_LOCK_SUMMARY.md)(**4‑G**)를 선행 참조한다.

---

## ☐ A. RC 정적 게이트(자동)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:gongbuho-legal-knowledge-rc` | **PASS** — `verify:gongbuho` 선행 + migration·증빙·RC 문서 |
| A2 | `npm run verify:gongbuho` | **PASS** (A1에 포함) |
| A3 | `npm run verify:canonical-sources` | **PASS** (배포 플라이트 권장) |

---

## ☐ B. Vitest RC 묶음

```bash
npm run test -- legal-knowledge-pipeline-gates.test.ts
npm run test -- legal-knowledge-pipeline.service.test.ts
npm run test -- admin-gongbuho-legal-knowledge-ui.test.ts
npm run test -- legal-knowledge-intake-form-defaults.test.ts
```

| 기준(본 헤드) | 결과 |
| --- | --- |
| `legal-knowledge-pipeline-gates.test.ts` | **7** tests **PASS** |
| `legal-knowledge-pipeline.service.test.ts` | **4** tests **PASS** |
| `admin-gongbuho-legal-knowledge-ui.test.ts` | **4** tests **PASS** |
| Gongbuho Vitest 회귀 전체(`run-gongbuho-verify.mjs`) | **127+** tests **PASS** |

---

## ☐ C. DB migration (배포 전 **필수**)

`DATABASE_URL` 설정 후:

```bash
npm run db:migrate
# 또는 prod: npm run db:deploy
```

| migration | 용도 |
| --- | --- |
| `20260524180000_legal_knowledge_pipeline` | `LegalKnowledgeDemandIntake` · `LegalKnowledgeResearchBrief` · `LegalKnowledgeLawyerReviewDecision` |

---

## ☐ D. 권한·gate 스폿 (운영 흐름)

[`GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md`](./GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md) · [`gongbuho-permissions.ts`](../../src/lib/gongbuho/gongbuho-permissions.ts):

| 역할 | 허용 | 금지 |
| --- | --- | --- |
| STAFF | Legal Knowledge Intake/Brief **조회** (`LEGAL_KNOWLEDGE_READ`) | compile · STAFF 단독 Lawyer Review |
| ADMIN+ | Intake 등록 · Brief · ready-for-review · compile · approve | — |
| LAWYER (승인) | `/lawyer/legal-knowledge/reviews` — `READY_FOR_LAWYER_REVIEW`만 | compile · Intake 등록 |
| 미인증 | — | admin/lawyer Legal Knowledge API **401/403** |

Audit: Lawyer Review — `reviewerRole: LAWYER` · `channel: LAWYER_PORTAL` · `GONGBUHO_LEGAL_KNOWLEDGE_LAWYER_REVIEW_RECORDED`

---

## ☐ E. Playwright(범위 분리)

- **Always-on**: `tests/e2e/gongbuho-legal-knowledge-pipeline-smoke.spec.ts` — 미로그인 admin/lawyer API **401/403**
- **옵션(전체 파이프라인)**: `E2E_LEGAL_KNOWLEDGE_PIPELINE_SMOKE=1` + `E2E_ADMIN_EMAIL`/`PASSWORD` + `db:migrate` — Intake → Brief → Review → compile → `PACKET_APPROVED`
- **옵션(UI Intake 폼)**: 동일 env + dev 서버 — `/admin/gongbuho/legal-knowledge/new` 제출

---

## ☐ F. 문서 교차 참조

- RC 잠금: [`GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md`](./GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md)
- MVP 잠금: [`GONGBUHO_MVP_LOCK_SUMMARY.md`](./GONGBUHO_MVP_LOCK_SUMMARY.md)
- 증빙 SSOT: [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md) · `[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-RC-PREDEPLOY-CLOSURE]`
