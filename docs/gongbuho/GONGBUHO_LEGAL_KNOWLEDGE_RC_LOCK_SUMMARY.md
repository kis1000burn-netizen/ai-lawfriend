# Gongbuho Legal Knowledge Release Candidate Lock Summary — Phase **4‑H**

**상태**: Phase **4‑H** — Legal Knowledge **Compiler Policy · Intake · Pipeline Spec · Prisma/API · Admin UI · Lawyer Portal · APPROVE hook** 전 레이어 **릴리즈 후보(RC) 봉인** — 기능 추가 없음.

**증빙 태그**: **`[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-RC-PREDEPLOY-CLOSURE]`**

## 1. 목적

Phase **4‑G(Gongbuho MVP Lock)** · Legal Knowledge **Spec LOCKED(Compiler·Intake·Pipeline)** · **구현·변호사 포털**까지 완료된 축을 **배포 레벨 RC**로 고정한다. `npm run verify:gongbuho-legal-knowledge-rc` 가 정적·선행 게이트를 한 번에 재현한다.

## 2. RC 포함 Phase 매트릭스

| Phase | 요약 | RC 핵심 |
| --- | --- | --- |
| **4‑G** | Gongbuho MVP Lock · predeploy QA | [`GONGBUHO_MVP_LOCK_SUMMARY.md`](./GONGBUHO_MVP_LOCK_SUMMARY.md) |
| **Compiler** | Legal Knowledge 헌법 | [`GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md`](./GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY.md) (**LOCKED**) |
| **Intake** | 수요 신호·`noRawUgcStored` | [`GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md`](./GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md) (**LOCKED**) |
| **Pipeline Spec** | Brief → Lawyer Review → DRAFT | [`GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md`](./GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md) (**LOCKED**) |
| **Implementation** | Prisma · Admin API/UI · Intake 폼 · E2E | `legal-knowledge-pipeline.service.ts` · `/admin/gongbuho/legal-knowledge/*` |
| **Lawyer Portal** | `READY_FOR_LAWYER_REVIEW` 검수만 | `/lawyer/legal-knowledge/reviews` · `/api/lawyer/legal-knowledge/*` |
| **4‑H** | **본 RC 봉인** | [`GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md`](./GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md) |

## 3. RC 운영 흐름 (불변)

```
관리자 Intake 등록 (READY_FOR_RESEARCH, noRawUgcStored: true)
→ Research Brief 생성
→ ready-for-review
→ 변호사 포털 검수 (reviewerRole: LAWYER, channel: LAWYER_PORTAL)
→ 관리자 compile-packet-draft (ADMIN+, LEGAL_KNOWLEDGE_COMPILE)
→ approve
→ PACKET_APPROVED (+ GONGBUHO_LEGAL_KNOWLEDGE_PIPELINE_COMPLETED)
```

## 4. RC 불변 기준

1. **MVP(4‑G) 불변** — 기존 Gongbuho 패킷·사건 적용 축 유지.
2. **`READY_FOR_RESEARCH` 전** Brief·compile **차단** · `noRawUgcStored: true` · UGC 금지 키 스캔.
3. **`canonicalSourceRefs` ≥ 1** · `NAVER_SNIPPET`/`KNOWLEDGE_IN`/`BLOG` **금지**.
4. **`APPROVE_FOR_PACKET_DRAFT` 없이** DRAFT 생성 **금지** · compile은 **ADMIN+** only.
5. **변호사** — `READY_FOR_LAWYER_REVIEW` Brief만 · approve/revision/reject only · **compile 불가**.
6. **정적 게이트** — `npm run verify:gongbuho` **PASS** + `npm run verify:gongbuho-legal-knowledge-rc` **PASS**.
7. **DB migration(배포 전 필수)** — `DATABASE_URL` 설정 후:
   - `20260524180000_legal_knowledge_pipeline`

## 5. 검증 (재현)

| 명령 | 기대 |
| --- | --- |
| `npm run verify:gongbuho-legal-knowledge-rc` | **PASS** (선행 `verify:gongbuho` 포함) |
| `npm run verify:canonical-sources` | **PASS** (배포 플라이트 권장) |
| `npm run test -- legal-knowledge-pipeline` | gates · service · UI model **PASS** |

상세 체크리스트: [`GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md`](./GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md)

## 6. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | Phase **4‑H** Gongbuho Legal Knowledge RC / Predeploy Closure 초안 |
