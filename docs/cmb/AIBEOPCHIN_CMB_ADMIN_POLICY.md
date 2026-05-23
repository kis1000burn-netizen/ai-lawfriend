# AI법친 CMB Admin Policy

**Phase 6-E〜F** — Admin Preview UI + Publish/Lock workflow

## 1. Admin이 수정 가능한 영역 (후속 UI)

- 사건 유형별 질문 **순서** · optional/required 표시
- 문서 템플릿 **연결** (registry 내 code@version)
- Gongbuho 패킷 **연결** (APPROVED 패킷 code)
- Voice gate **사용 여부** (finalize gate 모듈)
- UI **block** 노출 순서
- 보완 요청 조건 (workflow block)

## 2. Admin이 수정 불가능한 영역 (CORE)

| 항목 | 이유 |
| --- | --- |
| `requireApprovedPacketsOnly: false` | Gongbuho APPROVED 기준 |
| `requireLawyerReviewBeforeFinalize: false` | 변호사 승인 책임 |
| Voice enabled + finalize gate off | Voice RC (5-J) |
| 권한·역할 매트릭스 | CORE RBAC |
| AuditLog / privacy retention | 운영 정책 |
| client UI에 admin-only block | 정보 노출 |

## 3. Publish / Lock (Phase 6-F)

```
DRAFT → REVIEW → VERIFY_PASS → LOCKED → PUBLISHED
```

- **VERIFY_PASS**: `npm run verify:aibeopchin-cmb` PASS 필수
- **LOCKED**: evidenceTag · changeReasonRequired
- **PUBLISHED**: 운영 반영 — `AibeopchinCmbPublishEvent` 이력 · `evidenceTag` 기록
- **전이 API**: `POST /api/admin/cmb/revisions/[revisionId]/transition` (ADMIN+)
- **Baseline sync**: `POST /api/admin/cmb/sync-baseline` — TS registry → DB `LOCKED`

## 4. 계획 경로

| 경로 | 역할 |
| --- | --- |
| `/admin/cmb` | 목록 · global verify summary |
| `/admin/cmb/case-types/[caseType]` | Preview (LOCKED = read-only) |
| `/admin/cmb/question-flows` | Interview block (Phase 6-F+) |
| `/admin/cmb/document-templates` | Template 연결 |
| `/admin/cmb/gates` | Gate preview (read-only CORE gates) |

## 5. 한 줄 기준

Admin은 **구성**만 조정하고, CORE gate·권한·승인 책임은 CMB schema/policy에서 **immutable** 으로 유지한다.
