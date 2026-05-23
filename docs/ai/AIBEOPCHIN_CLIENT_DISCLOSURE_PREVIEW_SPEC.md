# AI법친 Client Disclosure Preview & Release Control (Phase **11‑B**)

**상태**: Phase **11‑B** — **Preview · Diff · Release audit**

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11B-CLIENT-DISCLOSURE-PREVIEW]`**

## 1. 목적 (하나)

변호사가 승인한 **`CLIENT_VISIBLE` + `CONFIRMED`/`EDITED`** 항목만 **의뢰인 공개 미리보기**로 보여주고, **공개 전 diff**와 **release 기록**을 남긴다.

**선행**: Phase **11‑A** (Ledger judgment persist) · Phase **10‑C** (`projectClientSafeStatements`).

Preview SSOT version: **`11-B.1`** (`CLIENT_DISCLOSURE_PREVIEW_VERSION`).

## 2. 데이터 흐름

```
CaseIntelligenceSnapshot (11-A ledger)
  → projectClientSafeStatements (10-C)
  → Client Disclosure Preview (11-B lawyer view)
  → diff vs CaseClientDisclosureRelease (last)
  → POST RELEASE → audit row
```

## 3. API

| Method | Route | 설명 |
| --- | --- | --- |
| `GET` | `/api/cases/[caseId]/client-disclosure-preview` | preview + diff + history |
| `POST` | `/api/cases/[caseId]/client-disclosure-preview` | `{ action: "RELEASE", releaseNotes? }` |

Auth: view = assigned lawyer/staff/admin · release = assigned lawyer/admin.

## 4. Persist (`CaseClientDisclosureRelease`)

| 필드 | 내용 |
| --- | --- |
| `statementsJson` | release 시점 ClientSafeStatement[] |
| `diffJson` | added/removed/changed |
| `snapshotId` | 11-A snapshot 참조 |
| `releasedByUserId` / `releasedAt` | release audit |

## 5. Diff 규칙

| 유형 | 조건 |
| --- | --- |
| **added** | `sourceEntryId`가 last release에 없음 |
| **removed** | last release에만 존재 |
| **changed** | 동일 `sourceEntryId`, text 변경 |

첫 release: `hasUnreleasedChanges = statements.length > 0` (빈 baseline release 허용).

## 6. UI

| 경로 | 컴포넌트 |
| --- | --- |
| `/cases/[caseId]/client-disclosure-preview` | `ClientDisclosurePreviewPanel` |

- 의뢰인 미리보기 카드
- diff (추가/변경/제거)
- Release 기록 + 이력

## 7. Out of scope (11‑B)

- 의뢰인 포털 실제 반영 (CLIENT summary API wiring은 10-C 유지)
- 자동 release on judgment
- Email/push notification

## 8. 검증

```bash
npm run verify:aibeopchin-client-disclosure-preview
npm run verify:aibeopchin-lawyer-review-console
npm run verify:aibeopchin-client-safe-disclosure
```

## 9. 한 줄 판정

11-B까지 잠기면 변호사는 **공개 전에 의뢰인 시점을 미리보고, diff 확인 후 release audit**을 남길 수 있다.
