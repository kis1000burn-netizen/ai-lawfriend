# AI법친 Client Disclosure Delivery / Client Portal Binding (Phase **11‑C**)

**상태**: Phase **11‑C** — **Release-only client portal delivery**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11C-CLIENT-DISCLOSURE-DELIVERY]`**

## 1. 목적 (하나)

**Release된 `CaseClientDisclosureRelease`만** 의뢰인 포털에서 조회 가능하게 하고, **unreleased preview**나 **내부 `intelligenceGraph`**는 **절대 노출하지 않는다**.

**선행**: Phase **11‑B** (release audit) · Phase **10‑C** (statement projection).

## 2. 바인딩 규칙

| Audience | 데이터 소스 | 금지 |
| --- | --- | --- |
| **CLIENT** (사건 owner) | latest `CaseClientDisclosureRelease.statementsJson` | preview API · ledger live · graph |
| LAWYER/STAFF/ADMIN | 11-B preview / 11-A console | client-delivery API (owner CLIENT only) |

## 3. API

| Method | Route | 설명 |
| --- | --- | --- |
| `GET` | `/api/cases/[caseId]/client-disclosure-delivery` | release-only delivery |
| `POST` | 동일 | summary/generate 호환 shape (CLIENT) |

`POST /api/cases/[caseId]/summary/generate` — **CLIENT 분기**: `invokeCaseSummaryGenerate` **호출 안 함** → delivery only.

## 4. UI

| 컴포넌트 | 대상 |
| --- | --- |
| `ClientDisclosureDeliveryPanel` | case detail · `currentUser.role === CLIENT` |

내부 역할은 `CaseSummaryPanel` (generate) 유지.

## 5. Delivery SSOT

- Version: **`11-C.1`**
- Service: [`client-disclosure-delivery.service.ts`](../../src/features/ai-core/client-disclosure-delivery.service.ts)
- `getClientDisclosureDelivery()` — latest release lookup · CLIENT portal entry
- `buildClientDisclosureDeliveryPayloadFromRelease()` — release snapshot only

## 6. Out of scope (11‑C)

- Push/email notification on release
- Release rollback UI
- Multi-release history picker for CLIENT (latest only)

## 7. 검증

```bash
npm run verify:aibeopchin-client-disclosure-delivery
npm run verify:aibeopchin-client-disclosure-preview
npm run test -- src/features/ai-core/client-disclosure-delivery.service.test.ts
```

## 8. 한 줄 판정

의뢰인 포털은 **release audit에 묶인 공개 정보만** 본다 — preview·graph·unreleased ledger는 **구조적으로 차단**된다.
