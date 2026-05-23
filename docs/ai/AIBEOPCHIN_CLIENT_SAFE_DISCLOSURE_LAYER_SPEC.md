# AI법친 Client-Safe Disclosure Layer (Phase **10‑C**)

**상태**: Phase **10‑C** — **Client Disclosure Schema · Filter · Validator · Summary Runtime**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10C-CLIENT-SAFE-DISCLOSURE-LAYER]`**

## 1. 목적

> **의뢰인에게 보여도 되는 것만 보여준다.**

| 절대 노출 금지 | 이유 |
| --- | --- |
| Contradiction **Radar** | 내부 리스크 신호 |
| **Intelligence Graph** / Claim provenance | 변호사 내부 지능 |
| **변호사 내부 메모** | LAWYER_MEMO 축 |
| **PENDING / 미검토 Ledger** | 변호사 판단 전 |

**공개 조건 (AND)**:

1. Ledger entry `CLIENT_VISIBLE` lane  
2. `judgmentState` = `CONFIRMED` \| `EDITED`  
3. 10-A `clientVisibleMinCaseStatus` 통과 (`canReleaseLedgerEntryToClient`)

**선행**: Phase **10-B** (`verify:aibeopchin-ai-governance-audit` PASS).

## 2. 내부 vs 의뢰인 분리

| Audience | payload |
| --- | --- |
| LAWYER / STAFF / ADMIN | `intelligenceGraph` (graph · radar · ledger) |
| **CLIENT** | `clientSafeDisclosure` + filtered `content` only |

CLIENT 응답에서 제거: `intelligenceGraph` · `gongbuhoResolution` · `contractSections`

## 3. 모델 (`10-C.1`)

### `ClientSafeStatement`

| 필드 | 설명 |
| --- | --- |
| `text` | 공개 승인 문장 |
| `sourceEntryId` | Ledger entry |
| `judgmentState` | `CONFIRMED` \| `EDITED` |
| `releaseGatePassed` | 10-A case status gate |

### `ClientSafeDisclosureLayer`

- `statements[]` — 공개 가능 문장만  
- `blockedCategories[]` — 문서화된 차단 카테고리  
- `emptyReleaseNotice` — 공개 항목 없을 때

코드 SSOT: [`projectClientSafeStatements()`](../../src/features/ai-core/client-safe-disclosure.service.ts)

## 4. Runtime

`invokeCaseSummaryGenerate` → `applyClientSafeDisclosureToSummaryResult`

- CLIENT: ledger 기반 `clientSafeDisclosure` + summary content 필터  
- 비 CLIENT: unchanged

## 5. 산출물

| # | 파일 |
| --- | --- |
| 1 | 본 Spec |
| 2 | [`client-safe-disclosure.schema.ts`](../../src/features/ai-core/client-safe-disclosure.schema.ts) |
| 3 | [`client-safe-disclosure.service.ts`](../../src/features/ai-core/client-safe-disclosure.service.ts) |
| 4 | [`client-safe-disclosure-validator.ts`](../../src/features/ai-core/client-safe-disclosure-validator.ts) |
| 5 | [`verify-aibeopchin-client-safe-disclosure.mjs`](../../scripts/verify-aibeopchin-client-safe-disclosure.mjs) |

## 6. Out of scope (10‑C)

- 의뢰인 UI 전용 panel (후속)
- Prisma disclosure snapshot persist
- 다국어 disclosure copy

## 7. 검증

```bash
npm run verify:aibeopchin-ai-governance-audit
npm run verify:aibeopchin-client-safe-disclosure
npm run test -- src/features/ai-core/client-safe-disclosure.schema.test.ts
npm run test -- src/features/ai-core/client-safe-disclosure.service.test.ts
npm run test -- src/features/ai-core/client-safe-disclosure-validator.test.ts
```

## 8. 파이프라인 완성

```
요약 → Graph → Radar → Ledger → Governance → Audit → Client Disclosure
```

## 9. 한 줄 판정

10‑C까지 잠기면 AI법친은 **내부 법률 지능**과 **의뢰인 공개 정보**가 완전히 분리된다.
