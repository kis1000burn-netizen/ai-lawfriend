# AI법친 — AI Core 문서

## Phase 로드맵

| Phase | 상태 | 설명 |
| --- | --- | --- |
| Post-Ops | **LOCKED** | Legal regen · STAFF Voice/CMB — `verify:post-ops-critical-fix` |
| **8-A** | **LOCKED** | 6축 Spec · policy SSOT — `verify:aibeopchin-ai-core-phase8a` |
| **8-B** | **LOCKED** | Route runtime · generationMode · audit — `verify:aibeopchin-ai-core-phase8b` |
| **8-C** | **LOCKED** | OpenAI provider 단일화 · aiPromptKey binding — `verify:aibeopchin-ai-core-phase8c` |
| **8-D** | **LOCKED** | Native context · audit E2E/API smoke — `verify:aibeopchin-ai-core-phase8d` |
| **8-E** | **RC LOCKED** | RC summary · predeploy checklist · `verify:aibeopchin-ai-core-rc` |
| **9-A** | **LOCKED** | Case Summary ai-core integration spec · `verify:aibeopchin-ai-core-phase9a` |
| **9-B** | **IMPLEMENTED** | Case Summary runtime · Prompt Registry 9-B.1 · `verify:aibeopchin-ai-core-phase9b` |
| **9-C** | **RC LOCKED** | Case Summary RC · `verify:aibeopchin-case-summary-rc` · ai-core-rc Tier 2 |
| **9-D** | **SPEC LOCKED** | Case Intelligence Graph · schema · provenance · claim validator · `verify:aibeopchin-case-intelligence-graph` |
| **9-E** | **IMPLEMENTED** | Contradiction Radar · graph runtime · `summary/intelligenceGraph` · `verify:aibeopchin-contradiction-radar` |
| **9-F** | **IMPLEMENTED** | Lawyer Judgment Boundary Ledger · 6경계 lane · `verify:aibeopchin-lawyer-judgment-ledger` |
| **10-A** | **IMPLEMENTED** | AI Governance Control Matrix · tenant/role/case gate · `verify:aibeopchin-ai-governance-control` |
| **10-B** | **IMPLEMENTED** | AI Governance Audit & Usage Metering · denial log · `verify:aibeopchin-ai-governance-audit` |
| **10-C** | **IMPLEMENTED** | Client-Safe Disclosure Layer · ledger release filter · `verify:aibeopchin-client-safe-disclosure` |
| **10-D** | **RC LOCKED** | AI Governance RC · `verify:aibeopchin-ai-governance-rc` · ai-core-rc Tier 3 |
| **11-A** | **IMPLEMENTED** | Lawyer Review Console · Graph/Radar/Ledger judgment · `verify:aibeopchin-lawyer-review-console` |
| **11-B** | **IMPLEMENTED** | Client Disclosure Preview · diff · release audit · `verify:aibeopchin-client-disclosure-preview` |
| **11-C** | **IMPLEMENTED** | Client portal delivery · release-only binding · `verify:aibeopchin-client-disclosure-delivery` |
| **11-D** | **RC LOCKED** | Client Disclosure RC · `verify:aibeopchin-client-disclosure-rc` · ai-core-rc Tier 4 |
| **12-A** | **RC LOCKED** | Full AI Core RC · `verify:aibeopchin-full-ai-core-rc` · ai-core-rc master (Tier 1〜4) |
| **13-A** | **SPEC LOCKED** | Legal Document Intelligence Engine · 업로드→분류→분석 SSOT · `verify:aibeopchin-legal-document-intelligence` |
| **13-B** | **IMPLEMENTED** | Upload & Text Extraction · OCR boundary · page storage · `verify:aibeopchin-legal-document-intelligence-phase13b` |
| **13-C** | **IMPLEMENTED** | Document Classification · 유형·출처·단계·민감도 · `verify:aibeopchin-legal-document-intelligence-phase13c` |
| **13-D** | **IMPLEMENTED** | Legal Document Analysis · 요약·주장·쟁점·위험 후보 · `verify:aibeopchin-legal-document-intelligence-phase13d` |
| **13-E** | **IMPLEMENTED** | Opponent Brief Analyzer · 답변서·준비서면 · `verify:aibeopchin-legal-document-intelligence-phase13e` |
| **13-F** | **IMPLEMENTED** | Evidence & Claim Mapping · 충돌·부족증거 · `verify:aibeopchin-legal-document-intelligence-phase13f` |
| **13-G** | **IMPLEMENTED** | Lawyer Review Gate · 검토 큐 · Ledger · `verify:aibeopchin-legal-document-intelligence-phase13g` |
| **13-H** | **IMPLEMENTED** | Litigation Ops Integration · 기일·업무·보완·서면 · `verify:aibeopchin-legal-document-intelligence-phase13h` |
| **13-I** | **RC LOCKED** | Legal Document Intelligence RC · 13-A〜13-H 봉인 · `verify:aibeopchin-legal-document-intelligence-rc` |
| **14-A** | **IMPLEMENTED** | Litigation Command Center · 소송 지휘실 UI · `verify:aibeopchin-legal-document-intelligence-phase14a` |
| **14-B** | **IMPLEMENTED** | Litigation Command Center Actions · 업무·기일·보완·초안 · `verify:aibeopchin-legal-document-intelligence-phase14b` |
| **14-C** | **IMPLEMENTED** | Command Center Action Feedback UX · toast·낙관적 UI·피드 · `verify:aibeopchin-legal-document-intelligence-phase14c` |
| **14-D** | **IMPLEMENTED** | Command Center Dashboard Widget · 사건 목록·변호사 대시보드 · `verify:aibeopchin-legal-document-intelligence-phase14d` |
| **14-E** | **RC LOCKED** | Litigation Command Center RC · 14-A〜14-D 봉인 · `verify:aibeopchin-litigation-command-center-rc` |

| 문서 | Phase | 설명 |
| --- | --- | --- |
| [AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md](./AIBEOPCHIN_AI_CORE_DOCUMENT_UNIFICATION_SPEC.md) | **8-A** | Provider SSOT · Prompt Registry · Context Builder · Output Validator · AI Audit · `generationMode` 런타임 |
| [AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md) | **8-E** | Document RC 매트릭스 · 불변 기준 |
| [AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md](./AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md) | **8-E** | Document 배포 전 체크 |
| [AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md](./AIBEOPCHIN_CASE_SUMMARY_AI_CORE_INTEGRATION_SPEC.md) | **9-A** | 사건 요약 ai-core 6축 편입 · `CaseSummaryAiMode` |
| [AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md) | **9-C** | Case Summary RC 매트릭스 (설계) |
| [AIBEOPCHIN_CASE_SUMMARY_PREDEPLOY_CLOSURE_CHECKLIST.md](./AIBEOPCHIN_CASE_SUMMARY_PREDEPLOY_CLOSURE_CHECKLIST.md) | **9-C** | Case Summary 배포 전 체크 (설계) |
| [AIBEOPCHIN_AI_CORE_RC_PHASE9C_EXTENSION_DESIGN.md](./AIBEOPCHIN_AI_CORE_RC_PHASE9C_EXTENSION_DESIGN.md) | **9-C** | `verify:aibeopchin-ai-core-rc` Tier 2 확장 설계 |
| [AIBEOPCHIN_CASE_INTELLIGENCE_GRAPH_SPEC.md](./AIBEOPCHIN_CASE_INTELLIGENCE_GRAPH_SPEC.md) | **9-D** | Claim·출처·근거·변호사 검토상태 Graph · AI는 판단하지 않는다 |
| [AIBEOPCHIN_CONTRADICTION_RADAR_SPEC.md](./AIBEOPCHIN_CONTRADICTION_RADAR_SPEC.md) | **9-E** | 5축 Contradiction Radar · Graph runtime · summary API 편입 |
| [AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md](./AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md) | **9-F** | 변호사 판단 6경계 Ledger · AI는 구조화, 변호사가 판단 |
| [AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md](./AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md) | **10-A** | tenant/role/case AI 통제 · invoke/view/client-release gate |
| [AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md](./AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md) | **10-B** | audit · usage meter · budget/case limit · denial log |
| [AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md](./AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md) | **10-C** | 의뢰인 공개 필터 · CLIENT_VISIBLE + case status gate |
| [AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md) | **10-D** | Governance RC 매트릭스 · 10-A〜C 봉인 |
| [AIBEOPCHIN_AI_GOVERNANCE_PREDEPLOY_CLOSURE_CHECKLIST.md](./AIBEOPCHIN_AI_GOVERNANCE_PREDEPLOY_CLOSURE_CHECKLIST.md) | **10-D** | Governance 배포 전 체크 |
| [AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md](./AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md) | **11-A** | 변호사 Graph/Radar/Ledger 작업대 |
| [AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md](./AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md) | **11-B** | 의뢰인 공개 미리보기 · diff · release |
| [AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md](./AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md) | **11-C** | 의뢰인 포털 release-only delivery |
| [AIBEOPCHIN_CLIENT_DISCLOSURE_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_CLIENT_DISCLOSURE_RC_LOCK_SUMMARY.md) | **11-D** | Client Disclosure RC 매트릭스 · 11-A〜C 봉인 |
| [AIBEOPCHIN_CLIENT_DISCLOSURE_PREDEPLOY_CLOSURE_CHECKLIST.md](./AIBEOPCHIN_CLIENT_DISCLOSURE_PREDEPLOY_CLOSURE_CHECKLIST.md) | **11-D** | Client Disclosure 배포 전 체크 |
| [AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md) | **12-A** | Full AI Core RC · Tier 1〜4 master 봉인 |
| [AIBEOPCHIN_FULL_AI_CORE_PREDEPLOY_MASTER_CHECKLIST.md](./AIBEOPCHIN_FULL_AI_CORE_PREDEPLOY_MASTER_CHECKLIST.md) | **12-A** | Full AI Core 배포 전 master 체크 |
| [AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md](./AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md) | **13-A** | AI 서류·증거 분석 엔진 · Master Spec |
| [AIBEOPCHIN_UPLOAD_FILE_ANALYSIS_PIPELINE_SPEC.md](./AIBEOPCHIN_UPLOAD_FILE_ANALYSIS_PIPELINE_SPEC.md) | **13-B/C** | 업로드 · OCR/추출 · 문서 분류 |
| [AIBEOPCHIN_OPPONENT_BRIEF_ANALYSIS_SPEC.md](./AIBEOPCHIN_OPPONENT_BRIEF_ANALYSIS_SPEC.md) | **13-E** | 상대방 답변서·준비서면 분석 |
| [AIBEOPCHIN_COURT_DOCUMENT_ANALYSIS_SPEC.md](./AIBEOPCHIN_COURT_DOCUMENT_ANALYSIS_SPEC.md) | **13-D/E** | 법원 명령·기일·보정 |
| [AIBEOPCHIN_EVIDENCE_MAPPING_SPEC.md](./AIBEOPCHIN_EVIDENCE_MAPPING_SPEC.md) | **13-F** | 증거‑주장 매핑 · 충돌 탐지 |
| [AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_RC_LOCK_SUMMARY.md) | **13-I** | Legal Document Intelligence RC · 13-A〜13-H 봉인 |
| [AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_PREDEPLOY_CLOSURE_CHECKLIST.md](./AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_PREDEPLOY_CLOSURE_CHECKLIST.md) | **13-I** | Legal Document Intelligence 배포 전 체크 |
| [AIBEOPCHIN_LITIGATION_COMMAND_CENTER_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_LITIGATION_COMMAND_CENTER_RC_LOCK_SUMMARY.md) | **14-E** | Litigation Command Center RC · 14-A〜14-D 봉인 |
| [AIBEOPCHIN_LITIGATION_COMMAND_CENTER_PREDEPLOY_CLOSURE_CHECKLIST.md](./AIBEOPCHIN_LITIGATION_COMMAND_CENTER_PREDEPLOY_CLOSURE_CHECKLIST.md) | **14-E** | Litigation Command Center 배포 전 체크 |
| [AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md](../operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md) | **Ops** | dev 종료 · Prisma DLL · NODE_ENV · CI fresh build |
| [DB_MIGRATION_CHRONOLOGY.md](../operations/DB_MIGRATION_CHRONOLOGY.md) | **Ops** | incremental migration vs greenfield |
| [STAGING_SECRETS_CHECKLIST.md](../operations/STAGING_SECRETS_CHECKLIST.md) | **Ops** | staging secrets · AI Core env |
| [STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md](../operations/STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md) | **Ops A** | staging secrets 실측 · role smoke |

## 검증

```bash
npm run verify:post-ops-critical-fix
npm run verify:aibeopchin-ai-core-phase8a
npm run verify:aibeopchin-ai-core-phase8b
npm run verify:aibeopchin-ai-core-phase8c
npm run verify:aibeopchin-ai-core-phase8d
npm run verify:aibeopchin-case-summary-rc
npm run verify:aibeopchin-ai-core-rc
npm run verify:aibeopchin-ai-core-phase9a
npm run verify:aibeopchin-ai-core-phase9b
npm run verify:aibeopchin-case-intelligence-graph
npm run verify:aibeopchin-contradiction-radar
npm run verify:aibeopchin-lawyer-judgment-ledger
npm run verify:aibeopchin-ai-governance-control
npm run verify:aibeopchin-ai-governance-audit
npm run verify:aibeopchin-client-safe-disclosure
npm run verify:aibeopchin-ai-governance-rc
npm run verify:aibeopchin-lawyer-review-console
npm run verify:aibeopchin-client-disclosure-preview
npm run verify:aibeopchin-client-disclosure-delivery
npm run verify:aibeopchin-client-disclosure-rc
npm run verify:aibeopchin-full-ai-core-rc
npm run verify:aibeopchin-legal-document-intelligence
npm run verify:aibeopchin-legal-document-intelligence-phase13b
npm run verify:aibeopchin-legal-document-intelligence-phase13c
npm run verify:aibeopchin-legal-document-intelligence-phase13d
npm run verify:aibeopchin-legal-document-intelligence-phase13e
npm run verify:aibeopchin-legal-document-intelligence-phase13f
npm run verify:aibeopchin-legal-document-intelligence-phase13g
npm run verify:aibeopchin-legal-document-intelligence-phase13h
npm run verify:aibeopchin-legal-document-intelligence-rc
npm run verify:aibeopchin-legal-document-intelligence-phase14a
npm run verify:aibeopchin-legal-document-intelligence-phase14b
npm run verify:aibeopchin-legal-document-intelligence-phase14c
npm run verify:aibeopchin-legal-document-intelligence-phase14d
npm run verify:aibeopchin-litigation-command-center-rc
npm run verify:aibeopchin-ai-core-rc
npm run predeploy:check
```

증빙: `[EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13A-LEGAL-DOCUMENT-INTELLIGENCE-SPEC-LOCK]` · Full AI Core: `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE]` · Client Disclosure: `[EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11D-CLIENT-DISCLOSURE-RC-CLOSURE]`

## 관련

- [AI_OUTPUT_POLICY.md](../project-governance/AI_OUTPUT_POLICY.md)
- [DOCUMENT_TEMPLATE_DEFINITION.md](../project-governance/DOCUMENT_TEMPLATE_DEFINITION.md) §17-2 (`generationMode` 매핑)
- Post-Ops Critical Fix: `npm run verify:post-ops-critical-fix`
