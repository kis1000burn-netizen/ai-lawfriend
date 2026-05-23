# AI법친 CMB Architecture (AIBEOPCHIN_CMB_LAYER)

**증빙 태그**: `[EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6-FOUNDATION]`

## 1. 목적

AI법친에 **CMB Layer (Legal Service Composition Engine)** 를 두어, 사건 유형별 **질문셋 · 문서템플릿 · 공부호 · Voice gate · 화면 block · 승인 흐름**을 JSON/TS 설정으로 관리한다. 개발팀은 CORE 로직을 건드리지 않고 설정과 (후속) Admin UI로 운영 조정이 가능해진다.

## 2. 레이어 경계

```
┌─────────────────────────────────────────┐
│  Admin Layer  — draft · preview · publish│
├─────────────────────────────────────────┤
│  Verify Layer — verify:aibeopchin-cmb    │
├─────────────────────────────────────────┤
│  CMB Layer    — CaseType · Module · Block│
├─────────────────────────────────────────┤
│  CORE         — 권한 · 상태 · 감사 · 승인│
└─────────────────────────────────────────┘
```

| 레이어 | 고정(CORE) | 구성(CMB) |
| --- | --- | --- |
| 사용자·세션 | ✅ | — |
| CaseStatus 전이 | ✅ | — |
| 변호사 승인 책임 | ✅ | flow **연결**만 |
| Gongbuho APPROVED 기준 | ✅ | packet **연결**만 |
| Voice privacy · finalize gate | ✅ | on/off **연결**만 |
| 질문 순서·필수 여부 | — | ✅ |
| 문서 템플릿 연결 | — | ✅ |
| UI block 노출 | — | ✅ |

**CMB는 법률 판단을 바꾸지 않는다.** 질문·문서·화면·게이트 **구성**만 담당한다.

## 3. CMB가 관리하는 7대 대상

1. **CaseType** — `Case.category` = Gongbuho `caseType` 축
2. **QuestionSet** — registry code@version
3. **Interview Flow** — block 순서·voice 여부
4. **Document Template** — registry code@version
5. **Voice 검토 Gate** — finalize gate 모듈 ID
6. **Gongbuho Mapping** — `LAW-*-001` 패킷 code
7. **Workflow** — lawyer approval · delivery gate block

## 4. 1차 적용 순서 (권장)

1. 문서 템플릿 연결 CMB화 ✅ (Phase 6-C config)
2. 질문셋 연결 CMB화 ✅
3. Gongbuho packet 연결 ✅
4. Voice finalize gate 연결 ✅ (config flag)
5. 사건 상세 UI block — **런타임 연동은 후속**
6. Admin CMB UI — Phase 6-E
7. Publish/Lock — Phase 6-F

## 5. 디렉터리

| 경로 | 역할 |
| --- | --- |
| `src/cmb/core/` | schema · registry · validator · runtime |
| `src/cmb/case-types/` | `*.cmb.ts` LOCKED configs |
| `src/cmb/blocks/` | block ID SSOT |
| `src/cmb/policies/` | gate · role · evidence |
| `src/cmb/admin/` | Admin adapter (stub) |

## 6. 관련 SSOT

- Gongbuho caseType · 패킷: [`GONGBUHO_MULTI_PACKET_LIBRARY.md`](../gongbuho/GONGBUHO_MULTI_PACKET_LIBRARY.md)
- Voice finalize gate: [`VOICE_LAWYER_REVIEW_UX_SPEC.md`](../voice/VOICE_LAWYER_REVIEW_UX_SPEC.md)
- QuestionSet registry: `src/lib/question-set-registry.ts`
- Document template registry: `src/lib/document-template-registry.ts`

## 7. 한 줄 기준

CORE는 고정하고, CMB는 사건 유형별 구성을 설정화하며, Verify가 잘못된 설정·gate 약화를 배포 전에 차단한다.
