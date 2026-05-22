# 공부호 Phase 4-A — 관리자 패킷 UI (Admin Packet Management UI)

**목적**: 운영자(STAFF)·플랫폼 관리자가 **GongbuhoPacket** 목록·상세를 브라우저에서 조회하고, `packetJson` 구조를 안전하게 검토할 수 있는 **읽기 중심** 화면을 제공한다.

## 경로

| URL | 설명 |
|-----|------|
| `/admin/gongbuho` | 패킷 목록 — `packetJson` **미포함** · **`GET ?status=&caseType=&code=`** 필터(Phase 4-D) |
| `/admin/gongbuho/[gongbuhoId]` | 패킷 상세 — `packetJson` **미리보기** + 구조별 카운트 |

## 권한

- **허용**: `STAFF`, `ADMIN`, `SUPER_ADMIN` — `requireStaffOrPlatformAdminPage()`·`requireStaffOrPlatformAdminApi()` 및 동일 축.
- **미들웨어**: `/admin/gongbuho` 접두사가 `STAFF_ADMIN_ALLOWED_PREFIXES`에 등재되어 STAFF도 통과한다.
- **차단**: 의뢰인(USER)·변호사 등 — `/admin` 라우트 규칙에 따라 `access-denied`.

## 목록 화면 표시 항목

- `code`, `version`, `name`, `domain`, `caseType`, `status`
- `createdAt`, `approvedAt`
- 상태는 **배지**(DRAFT / REVIEW / APPROVED / ARCHIVED) 로 구분
- `packetJson` 은 **절대 노출하지 않음**

## 상세 화면 표시 항목

- 기본 메타(행 컬럼 + 승인자·작성자 id)
- **packetJson 미리보기** — 길이 상한(`truncateGongbuhoPacketJsonPreview`)으로 브라우저 부담 완화
- **구조 요약 카운트**(순수 파서 `summarizeGongbuhoPacketJsonForAdmin`):
  - `questionFlow` 배열 길이
  - `outputContract.summary` 헤딩 수(`parseGongbuhoSummaryHeadings`)
  - `validationRules`, `forbiddenRules`, `expertReviewPoints` 문자열 배열 길이(`extractGongbuhoRuleStringArrays`)

## Phase 4-A에서만 제외로 두던 항목(후속 적용 상태)

- 패킷 **승인 / ARCHIVE**: **Phase 4-B 적용 완료** — [GONGBUHO_ADMIN_APPROVAL_UI.md](./GONGBUHO_ADMIN_APPROVAL_UI.md)
- **questionFlow Preview / QuestionSet Project** UI → **Phase 4-C 적용 완료** — [GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md](./GONGBUHO_ADMIN_PREVIEW_PROJECT_UI.md)

### 상세에 추가되는 Phase 4-C 요소 요약

- `questionFlow` 투영 **미리보기 패널**(STAFF+)
- `APPROVED` 전용 **Project** 패널(ADMIN+) · 중복 초안 시 링크

## 연관 코드

- `src/app/(protected)/admin/gongbuho/page.tsx`
- `src/app/(protected)/admin/gongbuho/[gongbuhoId]/page.tsx`
- `src/components/admin/gongbuho/gongbuho-packet-list.tsx`
- `src/components/admin/gongbuho/gongbuho-packet-detail.tsx`
- `src/features/gongbuho/admin-gongbuho-ui-model.ts`
- `src/lib/auth/require-staff-or-platform-admin-page.ts`
- `src/lib/auth/ops-admin-paths.ts` — STAFF 화이트리스트

증빙 태그: `[EVIDENCE-20260523-GONGBUHO-PHASE4A-ADMIN-PACKET-UI]`
