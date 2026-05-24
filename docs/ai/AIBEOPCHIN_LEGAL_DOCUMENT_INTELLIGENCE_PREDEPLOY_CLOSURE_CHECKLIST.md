# AI법친 Legal Document Intelligence RC Predeploy Closure Checklist (Phase **13‑I**)

**상태**: **RC LOCKED** — `verify:aibeopchin-legal-document-intelligence-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13I-RC-PREDEPLOY-CLOSURE]`**

---

## ☐ A. 선행 Full AI Core RC (불변)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-full-ai-core-rc` | Tier 1〜4 master **PASS** |
| A2 | `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE]` | IMPLEMENTATION_EVIDENCE 존재 |

---

## ☐ B. Legal Document Intelligence RC 정적 게이트

| # | 명령 | 기대 |
| --- | --- | --- |
| B1 | `npm run verify:aibeopchin-legal-document-intelligence-rc` | **PASS** |
| B2 | `verify:aibeopchin-legal-document-intelligence` (13-A) | **PASS** (B1에 포함) |
| B3 | `verify:aibeopchin-legal-document-intelligence-phase13b`〜`13h` | **PASS** (B1에 포함) |

---

## ☐ C. Vitest Document Intelligence 묶음

```bash
npm run test -- src/features/document-intelligence
```

| 기준 | 결과 |
| --- | --- |
| document-intelligence feature tests | **52+** tests **PASS** |

---

## ☐ D. Migration 순서 (13-B〜13-H)

Greenfield `npm run db:deploy` 시 아래 순서 SSOT:

| # | migration dir |
| --- | --- |
| D1 | `20260524160000_litigation_document_intelligence_phase13b` |
| D2 | `20260524170000_litigation_document_classification_phase13c` |
| D3 | `20260524180000_litigation_document_analysis_phase13d` |
| D4 | `20260524190000_litigation_opponent_brief_analysis_phase13e` |
| D5 | `20260524200000_litigation_evidence_mapping_phase13f` |
| D6 | `20260524210000_litigation_document_intelligence_review_phase13g` |
| D7 | `20260524220000_litigation_operations_integration_phase13h` |

---

## ☐ E. 권한 · confirmed-only · AuditLog

| # | 검증 | 기대 |
| --- | --- | --- |
| E1 | `document-extraction-policy.ts` | upload/extract read/write gate |
| E2 | `document-classification-policy.ts` | classify gate |
| E3 | `document-analysis-policy.ts` | analyze gate |
| E4 | `opponent-brief-analysis-policy.ts` | opponent brief gate |
| E5 | `evidence-mapping-policy.ts` | evidence-map gate |
| E6 | `document-intelligence-review.policy.ts` | review queue + `assertConfirmedForDownstreamUse` |
| E7 | `litigation-operations.policy.ts` | ops sync + confirmed-only |
| E8 | Audit actions | upload → extract → classify → analyze → opponent → evidence → review → ops |

---

## ☐ F. UI smoke (Lawyer Review Console)

| testid | 화면 |
| --- | --- |
| `doc-intel-review-tab` | intelligence-review **서류·증거 분석** 탭 |
| `document-intelligence-review-console` | 검토 큐 콘솔 |
| `doc-intel-ops-sync` | **운영 연동 (13-H)** 버튼 |

경로: `/cases/[caseId]/intelligence-review`

---

## ☐ G. operations/sync smoke (API)

| # | Route | Method | 기대 |
| --- | --- | --- | --- |
| G1 | `.../document-intelligence/review-queue` | GET | LAWYER/STAFF read |
| G2 | `.../document-intelligence/operations` | GET | sync 상태 |
| G3 | `.../document-intelligence/operations/sync` | POST | confirmed-only sync |

미확정 항목 → `skippedItems[{ reason: "NOT_LAWYER_CONFIRMED" }]`.

---

## ☐ H. Predeploy 통합

```bash
npm run verify:aibeopchin-legal-document-intelligence-rc
npm run predeploy:check
```

`predeploy:check` gate 순서: Voice → Gongbuho LK → CMB → AI Core RC → **Legal Document Intelligence RC** → **Litigation Command Center RC (14-E)** → Supplement migration → …

---

## ☐ I. 증빙 태그 (13-A〜13-I)

| Phase | 태그 |
| --- | --- |
| 13-A | `EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13A-LEGAL-DOCUMENT-INTELLIGENCE-SPEC-LOCK` |
| 13-B | `EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13B-UPLOAD-EXTRACT` |
| 13-C | `EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13C-CLASSIFICATION` |
| 13-D | `EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13D-LEGAL-ANALYSIS` |
| 13-E | `EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13E-OPPONENT-BRIEF` |
| 13-F | `EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13F-EVIDENCE-MAPPING` |
| 13-G | `EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13G-LAWYER-REVIEW-GATE` |
| 13-H | `EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13H-LITIGATION-OPS-INTEGRATION` |
| 13-I | `EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13I-RC-PREDEPLOY-CLOSURE` |
