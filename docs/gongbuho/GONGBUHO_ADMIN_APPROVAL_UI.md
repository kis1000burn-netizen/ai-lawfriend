# 공부호 Phase 4-B — 관리자 승인·보관 UI (Approval & Archive)

**목적**: 플랫폼 관리자가 `/admin/gongbuho/[id]` 에서 패킷을 **APPROVED** 승인하거나 **ARCHIVED** 보관 처리할 수 있는 운영 액션을 제공한다. 조회 계약은 Phase 4-A와 동일하게 STAFF 허용, **변경**은 ADMIN·SUPER_ADMIN 전용이다.

## 권한

| 역할 | 조회 페이지 | 라이프사이클 버튼(API 호출) |
|------|--------------|------------------------------|
| **STAFF** | 허용(미들웨어 화이트리스트) | **불가** — 안내 배너만 표시 |
| **ADMIN / SUPER_ADMIN** | 허용 | 승인·보관 패널에서 `fetch` + `router.refresh()` |

- API 축은 `approve` 라우트와 동일하게 **`assertAdminOnly`** (`case.permissions`)를 사용한다.
- **Archive** 라우트: `POST /api/admin/gongbuho/[gongbuhoId]/archive` · STAFF 에게는 **403**.

## 상태별 UI 규칙(SSOT)

구현 참조: `deriveGongbuhoPacketLifecycleUi` (`admin-gongbuho-lifecycle-ui.ts`).

| 패킷 `status` | 승인 버튼(UI) | 보관 버튼(UI) |
|---------------|----------------|----------------|
| `DRAFT` | 활성(클릭 시 approve API) | 활성 |
| `REVIEW` | 활성 | 활성 |
| `APPROVED` | 비활성 · “이미 승인됨” 설명 | 활성(보관으로 후보 제외 가능) |
| `ARCHIVED` | 비활성 | 비활성 · “이미 보관됨” · Archive API 호출 불필요(멱등) |

백엔드 승인 조건과 정합:

- **`approveGongbuhoPacket`**: `DRAFT` 또는 `REVIEW`만 갱신, `ARCHIVED` → `400/GONGBUHO_PACKET_NOT_APPROVABLE`, `APPROVED` → 멱등 `alreadyApproved`.
- **`archiveGongbuhoPacket`**: 그 외 모든 상태에서 `ARCHIVED`로 업데이트 가능, 이미 ARCHIVED 면 멱등 `alreadyArchived`.

## 삭제 및 적용 이력

- **패킷 삭제**(DB cascade Trace 제거 등) 기능은 제공하지 않는다 — 적용 이력(`GongbuhoTrace`) 보존과 정렬.
- **보관**(ARCHIVED)은 신규 **사건 적용 후보**에서만 제외(`findApprovedPacketForApply` 등이 `status: APPROVED`만 선택).

## 액션 후 UX

클라이언트 패널(`gongbuho-packet-lifecycle-panel.tsx`)은 성공 시 **`router.refresh()`** 로 서버 컴포넌트를 다시 가져와 배지·승인일시 등을 즉시 맞춘다.

## 연관 코드

- `POST /api/admin/gongbuho/[id]/approve` · `POST /api/admin/gongbuho/[id]/archive`
- `gongbuho-packet.service.ts` — `archiveGongbuhoPacket`
- `gongbuho-packet-lifecycle-panel.tsx` · `admin-gongbuho-lifecycle-ui.ts`(순수·테스트)
- 단위 테스트: `admin-gongbuho-lifecycle-ui.test.ts`, `gongbuho-packet.service.test.ts`, `archive/route.test.ts`, 기존 `approve/route.test.ts`

증빙 태그: `[EVIDENCE-20260523-GONGBUHO-PHASE4B-ADMIN-APPROVAL-ARCHIVE-UI]`
