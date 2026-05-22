# 변호사 자격증빙 문서 저장소 보안 전환 설계 (Lawyer verification document storage)

목적: 민감한 변호사 증빙(신분증, 등록증명원, 사무소 증빙 등)에 대해 **공개 URL 장기 저장·직접 리다이렉트** 구조를 **비공개 스토리지 + 짧은 만료 signed URL**로 옮기기 위한 설계 고정 문서.

---

## 1. 현재(MVP 보안 보강 후)

| 항목 | 내용 |
|------|------|
| DB | `LawyerVerificationDocument.fileUrl` — 클라이언트/업로드 파이프라인에서 넘어온 **원본 URL 문자열** 저장 |
| 열람 | `GET /api/admin/lawyer-verifications/[profileId]/documents/[documentId]` — ADMIN/SUPER_ADMIN 세션 확인 → `LAWYER_VERIFICATION_DOCUMENT_ACCESS` 감사 → **http(s)** 대상으로 리다이렉트 |
| JSON | 관리자 프로필 `GET` 응답에서 증빙 배열의 `fileUrl` **미포함** |
| 한계 | 리다이렉트 후 브라우저·네트워크에 **최종 객체 URL 노출**; 링크 유출 시 만료 없이 접근 가능할 수 있음(스토리지 쪽 ACL에 의존) |

---

## 2. 목표 아키텍처

| 항목 | 내용 |
|------|------|
| DB | **`storageKey` / `objectKey`** (버킷 내 경로 또는 provider 파일 ID). 공개 HTTP URL은 **저장하지 않음** |
| 레거시 | 기존 `fileUrl` → 마이그레이션 후 **`legacyExternalUrl`**(읽기 전용·이관용) 또는 일괄 이관 후 컬럼 제거 |
| 열람 흐름 | 관리자 API → **권한 확인** → **감사로그** → 스토리지 SDK로 **signed URL 발급** → 클라이언트에 **일회/단기 URL** 반환 또는 302 |
| 만료 | **권장 1~5분** (운영 정책으로 `LAWYER_VERIFICATION_SIGNED_URL_TTL_SEC` 등 환경변수화) |
| 만료 후 | URL 재사용 불가; 재열람은 동일 API 재호출 |

---

## 3. API 설계(안)

- **기존** 리다이렉트 라우트는 유지하되 내부 구현만 변경:
  - `storageKey`가 있으면 signed URL 생성 후 `NextResponse.redirect(signedUrl)`  
  - `legacyExternalUrl`만 있으면 (이관 전) 기존과 동일 리다이렉트 + 감사로그에 `legacy: true` 메타
- **선택**: `POST /api/admin/lawyer-verifications/.../documents/.../signed-url` 로 JSON `{ url, expiresAt }` 만 반환(프론트가 새 탭 오픈) — 리다이렉트보다 만료 시각을 UI에 표시하기 쉬움

---

## 4. 업로드 파이프라인(가입·보완)

1. 클라이언트는 **직접 공개 URL을 DB에 쓰지 않음**.
2. `POST` 전용 업로드 API(관리자/변호사)가 **서버 측에서만** private 버킷에 put 후 `storageKey` 반환.
3. `signup-lawyer` / 프로필 수정은 **`storageKey` + 표시용 `fileName`·`type`** 만 저장.

---

## 5. DB 마이그레이션(안)

1. `LawyerVerificationDocument`에 `storageKey String?`, `legacyExternalUrl String?` (또는 `fileUrl` rename) 추가.
2. 백필: 가능하면 스크립트로 기존 `fileUrl`을 객체로 복사 후 `storageKey` 채움; 불가 시 `legacyExternalUrl`에 보관.
3. 애플리케이션: `storageKey` 우선, 없으면 `legacyExternalUrl`/`fileUrl` 폴백(deprecated 경고 로그).
4. 안정화 후 `fileUrl` 제거 또는 읽기 전용으로 고정.

---

## 6. 감사·컴플라이언스

- 모든 열람: `LAWYER_VERIFICATION_DOCUMENT_ACCESS` (또는 signed URL **발급** 액션 분리 시 `..._SIGNED_URL_ISSUED`)
- 메타데이터: `lawyerProfileId`, `documentId`, `actorUserId`, TTL, `storageProvider`

---

## 7. 스토리지 후보

- Azure Blob (SAS), S3 compatible (presigned GET), Supabase Storage (signed URL) 등 — 기존 `ILLEGAL_LENDING_STORAGE_DRIVER` 패턴과 별도 버킷/프리픽스 권장 (`lawyer-verification/`).

---

## 9. 구현 Phase 분리 (별도 착수 — 바로 패치 금지 권고)

DB·버킷·이관이 걸리므로 **한 번에 머지하지 말고** 단계별 PR·마이그레이션으로 진행한다.

| Phase | 범위 | 산출물 |
|-------|------|--------|
| **P0 동결** | 본 문서 + 증빙([425] E2E·MVP 열람 경로) | 운영·보안 합의 |
| **P1 스키마** | `storageKey`(nullable), `legacyExternalUrl` 또는 `fileUrl` deprecate 주석 | Prisma 마이그레이션 설계서·`migrate` |
| **P2 업로드** | 서버 전용 업로드 API, private 버킷 프리픽스 `lawyer-verification/` | `signup-lawyer`/보완 UI가 URL 대신 `storageKey` 저장 |
| **P3 열람** | 관리자 API: 권한 → 감사 → **짧은 만료 signed URL** (리다이렉트 또는 JSON) | `fileUrl` 폴백 유지 기간 명시 |
| **P4 이관** | 기존 행 백필·검증·`fileUrl` 읽기 전용·제거 일정 | 런북·롤백 |

**P1 완료(2026-04-27, 저장소 반영):** `LawyerVerificationDocument`에 `storageKey`, `bucket`, `mimeType`, `sizeBytes`, `checksum`, `migratedAt` 추가; `fileUrl`은 **nullable**·**legacy** 주석으로 유지(기존 행 데이터 유지). 마이그레이션: `prisma/migrations/20260504100000_lawyer_verification_document_private_storage`. **미포함:** 업로드 파이프라인(P2), signed URL 열람(P3), `fileUrl` 이관(P4), 감사 분리(P5). 증빙: `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P1]**.

**P2 완료(2026-04-27, 저장소 반영):** `POST /api/lawyer/verification-documents`, `lawyer-verification/` 키·`ILLEGAL_LENDING` 스토리지 재사용, 가입 JSON `documents`는 `storageKey` 메타+무결성 검증만. (P2 시점) 관리자 `storageKey` 전용 열람은 **409** `STORAGE_ACCESS_NOT_READY` 로 두었으며, **P3에서 제거.** 증빙: **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P2]**.

**P3 완료(2026-04-27, 저장소 반영):** 관리자 열람 `GET .../documents/[documentId]` — `requireAdminApi` → `LAWYER_VERIFICATION_DOCUMENT_ACCESS` 감사 → **짧은 만료** presigned/supabase signed 또는 로컬 **content-token** 대상으로 **302**. 레거시 http(s) `fileUrl` **302 유지**. `STORAGE_ACCESS_NOT_READY` **미사용**. TTL: `LAWYER_VERIFICATION_SIGNED_URL_TTL_SEC`. 증빙: **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P3]**.

**P4 정책(P4-1~P4-3, 2026-04-27 확정·코드 반영):**

- **신규:** `fileUrl` 에 **새 증빙을 저장하지 않는다**(가입 스키마·업로드 API 무 `fileUrl`; DB 주석 동일). 기존 `fileUrl` 은 **legacy 외부 URL** 성격(컬럼명은 당분간 `fileUrl` 유지; 별도 `legacyExternalUrl` 필드는 P4-3에서 검토).
- **열람:** `storageKey` 가 있으면 **signed URL(또는 content-token) 우선**; http(s) `fileUrl` 만 있으면 **legacy 302**. 감사 `accessMode`: **`signed_redirect` / `local_content_token` / `legacy_access`**(P5 metadata 표준).
- **UI:** 관리자 목록에 `fileUrl`만 있는 증빙 건수 **Legacy** 배지, 상세에 **Legacy URL (이관 권장)** / 이관 완료 시 안내.
- **P4 이관 전:** legacy 행 **삭제용 관리자 API 없음**(실수 방지).
- **P4-2 스크립트:** `scripts/migrate-lawyer-verification-documents-to-private-storage.ts` — 대상: `fileUrl` 있음 + `storageKey` null. 기본 **dry-run**; 적용 **`--apply`**. 실패 **`--failures-out=*.json`**, 요약 **`--summary-out=*.json`**. 갱신: `storageKey`, `bucket`, `mimeType`, `sizeBytes`, `checksum`, `migratedAt`; **`fileUrl` 유지**.
- **스테이징·운영 이관 실행 순서·증빙 표:** 본 문서 **§12**, `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-MIGRATION-EXEC]**.
- **스테이징·운영(백업·롤백):** 운영 **apply 전** DB·스토리지 백업 및 롤백 기준 확인. 산출 JSON·URL·키는 **Git/공개 문서에 두지 않음**.
- **P4-3(후속):** `fileUrl` null 정책, 컬럼 rename, legacy redirect 차단은 이관 검증 후 별도 합의.

**P5 완료(2026-04-27, 저장소 반영):** `LAWYER_VERIFICATION_DOCUMENT_ACCESS` metadata **`schemaVersion`·`accessMode`(`signed_redirect`|`local_content_token`|`legacy_access`)·`hasStorageKey`·`signedUrlTtlSec`·`legacyUrlHost`만(전체 URL 금지)**. 이관 스크립트 **`--summary-out`** 및 실패 **`documentId`/`reason`/`stage`**. UI 증빙 필터·배지 보강. 증빙: **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P5]**.

---

## 10. 결론

Private storage 전환 축은 **저장소 기준 최종 고정 완료**로 닫는다.

**현재 최종 판정:** 구현 **완료** · 문서 **완료** · 증빙 틀 **완료** · 코드 저장소 추가 수정 **없음** · 남은 작업 **운영 환경에서 실제 실행**만(`남은 작업` 표기 오타 「운명」 금지).

**이제 남은 것은 운영 환경에서의 실제 실행뿐이다.**

**현재 상태(본 문서 축):** **P1~P5 반영** + 이관 절차 증빙 **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-MIGRATION-EXEC]**. Private storage 전환 축은 저장소에서 **최종 고정 완료**; 실행 결과는 그 증빙 **표**와 내부 산출물로만 남긴다(기록 금지 항목은 MIGRATION-EXEC·§12와 동일).

**다음 단계(제품):** MIGRATION-EXEC 표 완료 후 **P4-3**(`fileUrl` 정리 등) 합의.

---

## 11. 참고 코드·증빙

- 업로드(P2): `POST /api/lawyer/verification-documents`, `src/lib/lawyer/lawyer-verification-storage.ts`, `src/lib/lawyer/lawyer-verification-document-upload.ts`
- **열람:** `documents/[documentId]/route.ts` — 감사 metadata **P5 표준**(`schemaVersion`, `accessMode`, `hasStorageKey`, `legacyUrlHost` 등). `signed-get.ts` — `local_content_token` vs `signed_redirect` 구분.
- P4 이관 스크립트: `scripts/migrate-lawyer-verification-documents-to-private-storage.ts`, `src/lib/lawyer/lawyer-verification-fileurl-migration.ts`, `src/lib/lawyer/lawyer-verification-legacy-policy.ts`
- 스키마·P1 마이그레이션: `prisma/schema.prisma` — `LawyerVerificationDocument`; `prisma/migrations/20260504100000_lawyer_verification_document_private_storage`
- E2E: `tests/e2e/lawyer-verification-smoke.spec.ts`, `IMPLEMENTATION_EVIDENCE.md` [EVIDENCE-20260427-425]
- P1 증빙: `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P1]**
- P2 증빙: `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P2]**
- P3 증빙: `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P3]**
- P4 증빙: `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P4]**
- P5 증빙: `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-P5]**
- 이관 실행(MIG): `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-MIGRATION-EXEC]**, 본 문서 §12

---

## 12. 스테이징/운영 — 레거시 `fileUrl` 이관 실행 순서

**저장소 기준 최종 고정 완료.** **현재 최종 판정:** 구현·문서·증빙 틀 **완료** · 코드 저장소 추가 수정 **없음** · 남은 작업 **운영 환경에서 실제 실행**만.

**운영 실행은 아래 순서만 따르면 된다.**

명령: `npm run migrate:lawyer-verification-docs`(=`tsx scripts/migrate-lawyer-verification-documents-to-private-storage.ts`). `<내부경로>`는 Git 밖·접근 제한 경로.

**운영 실행 순서** — **운영 환경**(스테이징·운영)에서 저장소 루트·환경 변수 준비 후:

1. **스테이징 dry-run** — 환경 변수 로드 후:

```bash
npm run migrate:lawyer-verification-docs -- --summary-out=<내부경로>/summary.json --failures-out=<내부경로>/failures.json
```

2. **결과 확인** — 내부에서만.

3. **스테이징 apply:**

```bash
npm run migrate:lawyer-verification-docs -- --apply --summary-out=<내부경로>/summary.json --failures-out=<내부경로>/failures.json
```

4. **UI 확인**  
5. **열람 확인** — 최종 URL·키·비밀은 문서에 남기지 않음.

6. **운영 dry-run** — 동일 dry-run 명령(운영 env).

7. **결과 확인** — 내부에서만.

8. **운영 apply 직전** — DB·스토리지 **백업** 및 **롤백 기준** 확인.

9. **운영 apply** — 동일 `--apply` 명령(운영 env).

10. **`IMPLEMENTATION_EVIDENCE.md` [EVIDENCE-20260427-LAWYER-DOC-PRIVATE-STORAGE-MIGRATION-EXEC] 표 기입** — 일시·환경(`스테이징` / `운영`)·scanned·migrated·failed·skipped·UI 확인(OK/NG)·열람 확인(OK/NG)만.

**로컬·에이전트 환경:** DB 접근 거절은 **실행 환경 미충족**이지 이관 실패가 아니다.

**기록 금지 목록(유지, 문서·채팅·PR):** 비밀값 · 전체 URL · storageKey 전체값 · signed URL · summary/failures 원문 · DATABASE_URL · 스토리지 secret · 계정 비밀번호.

**한 줄 정리:** Private storage 전환은 **저장소 기준으로 완전히 닫혔고**, 이제 **운영 실행**만 남았다. 순서는 **위 10단계** — 끝나면 **`IMPLEMENTATION_EVIDENCE.md`의 MIGRATION-EXEC 표만** 채우면 된다.

**계속 열어둘 기준 파일:** `c:\Users\NEW\Desktop\AI법친\tools\aibeopchin_navigator.py` · `c:\Users\NEW\Desktop\AI법친\docs\project-governance\IMPLEMENTATION_EVIDENCE.md` · `c:\Users\NEW\Desktop\AI법친\docs\project-governance\LAWYER_VERIFICATION_DOCUMENT_STORAGE_SECURITY_PLAN.md`(§12).
