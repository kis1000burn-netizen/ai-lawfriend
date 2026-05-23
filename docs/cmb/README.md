# AI법친 CMB Layer (Legal Service Composition Engine)

**CMB** = Case · Module · Block 구성 엔진  
**AI법친 적용형** = CaseType · Module · Block 방식의 법률 서비스 구성 레이어

## Phase 로드맵

| Phase | 상태 | 설명 |
| --- | --- | --- |
| **6-A** | **LOCKED** | Architecture Spec — 본 디렉터리 문서 |
| **6-B** | **IMPLEMENTED** | Schema · Registry · Validator · Runtime (`src/cmb/core/`) |
| **6-C** | **IMPLEMENTED** | CaseType config 1차 — Gongbuho 5종 SSOT |
| **6-D** | **IMPLEMENTED** | `verify:aibeopchin-cmb` 정적·Vitest gate |
| **6-E** | **IMPLEMENTED** | Admin Preview UI (`/admin/cmb`) |
| **6-F** | **IMPLEMENTED** | Publish / Lock · Prisma revision + transition API |
| **6-G** | **RC LOCKED** | RC summary · predeploy checklist · `verify:aibeopchin-cmb-rc` |
| **6-H** | **IMPLEMENTED** | Operations Studio — revision·publish·queue·coverage (`/admin/cmb/operations-studio`) |

## RC (Phase 6-G)

| 문서 | 내용 |
| --- | --- |
| [AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md) | RC 매트릭스 · 불변 기준 |
| [AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md](./AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md) | 배포 전 체크 · db:migrate · Baseline sync |

```bash
npm run verify:aibeopchin-cmb-rc
npm run predeploy:check
```

증빙: `[EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6G-RC-PREDEPLOY-CLOSURE]`

## 핵심 원칙

```
CORE는 고정 · CMB는 구성 · Admin은 조정 · Verify는 잠금
```

- **CORE**: 권한 · 상태 · 승인 · 감사 · 보안 · Voice privacy
- **CMB**: 질문·문서·공부호·Voice gate·화면 block **구성만**
- CMB는 법률 판단·권한 우회·APPROVED 기준 완화·privacy 변경 **금지**

## 문서

| 문서 | 내용 |
| --- | --- |
| [AIBEOPCHIN_CMB_ARCHITECTURE.md](./AIBEOPCHIN_CMB_ARCHITECTURE.md) | 레이어 경계 · 7대 관리 대상 · 적용 순서 |
| [AIBEOPCHIN_CMB_SCHEMA.md](./AIBEOPCHIN_CMB_SCHEMA.md) | `AibeopchinCmbCaseConfig` SSOT |
| [AIBEOPCHIN_CMB_ADMIN_POLICY.md](./AIBEOPCHIN_CMB_ADMIN_POLICY.md) | Admin 수정 가능/불가 영역 · Publish 흐름 |
| [AIBEOPCHIN_CMB_VERIFY_POLICY.md](./AIBEOPCHIN_CMB_VERIFY_POLICY.md) | `verify:aibeopchin-cmb` 검사 항목 |
| [AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md](./AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md) | **Phase 6-H** — Operations Studio · backlog · coverage |

## 코드

```
src/cmb/
  core/          schema · registry · validator · runtime
  case-types/    *.cmb.ts (LOCKED configs)
  blocks/        interview · document · voice · gongbuho · approval
  policies/      gate · role · evidence
  admin/         cmb-admin-adapter (stub)
  ops/           Phase 6-H Operations Studio
```

## 검증

```bash
npm run verify:aibeopchin-cmb
```

증빙: `[EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6-FOUNDATION]`
