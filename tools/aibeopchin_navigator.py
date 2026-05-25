#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI법친 프로젝트 진행 내비게이터

목적
- 프로젝트의 기준 계획/순서를 고정한다.
- 다음 세션용 브리핑 초안을 생성한다.
- 저장소 안에 구 상태명(OPEN, IN_PROGRESS 등)이 섞였는지 검사한다.
- 본선 기준 파일이 없으면 구 자료를 현행 정의로 오인하지 않도록 경고한다.

check-status 관련 (중요) — [FILE-034] 경고·exit 1을 곧바로 구현 품질(사건 CaseStatus) 오류로
  보지 말고 docs/project-governance/IMPLEMENTATION_EVIDENCE.md §4-1,
  CASE_STATUS_DEFINITION §5.1을 본다(휴리스틱).

- LEGACY_TERMS(OPEN, IN_PROGRESS, DONE)는 단어 경계(\\b)로만 찾는 휴리스틱이다.
- 기본(--scope all)은 저장소 전체 텍스트를 스캔하므로, 알림·OPS·기타 도메인의 동일
  영단어도 대량으로 걸린다. 이는 사건(Case) 상태 정리 여부와 자동으로 일치하지 않는다.
- 사건 상태 문자열만 좁히려면 --scope case 를 사용한다(사건 API·컴포넌트·정의 모듈 등
  일부 경로만 검사).

사용 예시
1) 계획 보기
   python tools/aibeopchin_navigator.py show-plan

2) 상태 검사(전체 저장소)
   python tools/aibeopchin_navigator.py check-status

2b) 사건 도메인만 검사
   python tools/aibeopchin_navigator.py check-status --scope case

3) 다음 세션 브리핑 생성
   python tools/aibeopchin_navigator.py make-brief \
       --phase 1 \
       --done "상태 기준 규칙 반영" \
       --next "상태값 정의서 작성" \
       --output docs/project-governance/NEXT_SESSION_BRIEF.md

4) 다른 루트 폴더 검사
   python tools/aibeopchin_navigator.py check-status --root "C:/path/to/project"

Windows 등에서 python 실행 파일이 없으면 동일 인자로 py -3 tools/aibeopchin_navigator.py ... 를 쓴다.

DELETED 역점검(사건 soft-delete 복구 경로) 실행 브리핑은
docs/project-governance/IMPLEMENTATION_EVIDENCE.md 최상단 [EVIDENCE-20260421-243]([239] 후속1 repository 축)·[242](인용·OPEN-4/DENY-8) 순으로 본다.
판정은 [242] 고정. 실무 후속 repository [243]: 노출 raw + documents/generate 차단 + admin alerts 잔존 + apply-case-status-transition([240]) + document-draft.repository(초안 메모 잔존) → 공통 차단 아님(「누적 중간 결론」). 다음: 기타 find*·AlertEvent 수명. 템플릿: docs/project-governance/REPOSITORY_DELETED_3QUESTION_WORK_TEMPLATE.md. 근거 펼침 → [241]·[240].
UI 6파일 실사 붙여넣기 포맷: docs/project-governance/DELETED_UI_6FILE_3QUESTION_WORK_TEMPLATE.md
전체 로드맵은 본 스크립트 show-plan 등으로 보조한다.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional


PROJECT_PLAN = {
    "project_name": "AI법친",
    "principles": [
        "상태 이름의 유일 기준은 prisma/schema.prisma 와 src/lib/definitions/case-status.ts 이다.",
        "옛 메모, 위키, 슬랙, 패치셋은 단독 기준으로 사용할 수 없다.",
        "새 기능 추가보다 기준문서 잠금이 우선이다.",
        "구현은 정의서를 따르도록 재정렬한다.",
        "verify-canonical-sources 통과 전 결과물은 현행 기준으로 인정하지 않는다.",
    ],
    "mvp_flow": [
        "변호사 가입/승인",
        "로그인",
        "대시보드",
        "의뢰인 초대/가입",
        "사건 생성",
        "AI 인터뷰",
        "사건 요약",
        "문서 생성",
        "사건 상세",
        "보완 요청",
        "관리자 승인",
    ],
    "dashboard_admin_3_7_regression": (
        "Dashboard 3.7: 관리자 대시보드 3.4~3.6 변경분은 "
        "docs/project-governance/DASHBOARD_ADMIN_3_7_REGRESSION_CHECKLIST.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-387 기준으로 회귀 점검한다."
    ),
    "dashboard_3_8_role_copy_snapshot": (
        "Dashboard 3.8: 역할별 대시보드 사용자 노출 문구는 "
        "docs/project-governance/DASHBOARD_3_8_ROLE_COPY_SNAPSHOT.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-388 기준으로 확인한다."
    ),
    "dashboard_3_9_role_regression_checklist": (
        "Dashboard 3.9: 역할별 대시보드 최종 회귀 체크리스트는 "
        "docs/project-governance/DASHBOARD_3_9_ROLE_REGRESSION_CHECKLIST.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-389 기준으로 확인한다."
    ),
    "dashboard_3_10_demo_metrics_safety_check": (
        "Dashboard 3.10: dashboard-demo-metrics 유지·데모 경로 안전 점검은 "
        "docs/project-governance/DASHBOARD_3_10_DEMO_METRICS_SAFETY_CHECK.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-390 기준으로 확인한다."
    ),
    "dashboard_3_11_final_seal_summary": (
        "Dashboard 3.11: 대시보드 3.x 최종 봉인 요약표는 "
        "docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-391 기준으로 확인한다."
    ),
    "dashboard_4_0_predeploy_operation_check_phase": (
        "대시보드 4.0: 배포 전 운영 점검 Phase 착수는 "
        "docs/project-governance/DASHBOARD_4_0_PREDEPLOY_OPERATION_CHECK_PHASE.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-392 기준으로 확인한다."
    ),
    "dashboard_4_1_role_access_permission_checklist": (
        "대시보드 4.1: 역할별 접근 / 권한 점검표 세분화는 "
        "docs/project-governance/DASHBOARD_4_1_ROLE_ACCESS_PERMISSION_CHECKLIST.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-393 기준으로 확인한다."
    ),
    "dashboard_4_2_predeploy_manual_qa_scenarios": (
        "대시보드 4.2: 배포 전 수동 QA 시나리오표는 "
        "docs/project-governance/DASHBOARD_4_2_PREDEPLOY_MANUAL_QA_SCENARIOS.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-394 기준으로 확인한다."
    ),
    "dashboard_4_3_empty_error_state_manual_checklist": (
        "대시보드 4.3: 빈 상태 / 오류 상태 수동 점검표는 "
        "docs/project-governance/DASHBOARD_4_3_EMPTY_ERROR_STATE_MANUAL_CHECKLIST.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-395 기준으로 확인한다."
    ),
    "dashboard_4_4_predeploy_operator_final_checklist": (
        "대시보드 4.4: 배포 전 운영자 최종 체크리스트는 "
        "docs/project-governance/DASHBOARD_4_4_PREDEPLOY_OPERATOR_FINAL_CHECKLIST.md와 "
        "IMPLEMENTATION_EVIDENCE.md #evidence-20260426-396 기준으로 확인한다."
    ),
    "dashboard_4_5_qa_closure_reflection_prep": (
        "대시보드 4.5 — QA 회신 수신 후 closure 반영 준비표: "
        "DASHBOARD_4_5_QA_CLOSURE_REFLECTION_PREP.md / [EVIDENCE-20260426-397] 기준"
    ),
    "dashboard_4_6_qa_pending_followup_tracker": (
        "대시보드 4.6 — QA 회신 대기 중 후속 보완 항목 분리표: "
        "docs/project-governance/DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md / "
        "[EVIDENCE-20260428-399] — closure·회신·최종/배포 판정 미기입, 앱·DB 미변경"
    ),
    "dashboard_4_7_ai_assisted_qa_evidence_reflection_design": (
        "대시보드 4.7 — QA/운영 실측 결과 AI 자동 반영 설계서: "
        "DASHBOARD_4_7_AI_ASSISTED_QA_EVIDENCE_REFLECTION_DESIGN.md / "
        "[EVIDENCE-20260428-400] 기준"
    ),
    "dashboard_5_0_ai_evidence_assistant_mvp_start": (
        "대시보드 5.0 — AI Evidence Assistant MVP 착수 기준서: "
        "DASHBOARD_5_0_AI_EVIDENCE_ASSISTANT_MVP_START.md / "
        "[EVIDENCE-20260428-401] 기준"
    ),
    "dashboard_5_1_ai_evidence_assistant_mvp_implementation": (
        "대시보드 5.1 — AI Evidence Assistant MVP 1차 구현 세트: "
        "관리자 /admin/qa-evidence, POST /api/admin/qa-evidence/analyze, "
        "src/lib/qa-evidence/* / [EVIDENCE-20260428-402] 기준"
    ),
    "dashboard_5_2_ai_evidence_draft_storage_design": (
        "대시보드 5.2 — AI Evidence Draft 저장 구조 설계: "
        "DASHBOARD_5_2_AI_EVIDENCE_DRAFT_STORAGE_DESIGN.md / "
        "[EVIDENCE-20260428-403] 기준"
    ),
    "aibeopchin_6_0_case_package_share_lawyer_access_plan": (
        "AI법친 6.0 — 사건 패키지 / 고유번호 공유 / 변호사 열람 연계 기획서: "
        "docs/project-governance/AIBEOPCHIN_6_0_CASE_PACKAGE_SHARE_LAWYER_ACCESS_PLAN.md / "
        "[EVIDENCE-20260501-AIBEOPCHIN-6-0-CASE-PACKAGE-SHARE-LAWYER-ACCESS-PLAN] 기준"
    ),
    "aibeopchin_6_1_case_package_data_structure": (
        "AI법친 6.1 — 사건 패키지 데이터 구조 / 생성 기준 설계: "
        "docs/project-governance/AIBEOPCHIN_6_1_CASE_PACKAGE_DATA_STRUCTURE.md / "
        "[EVIDENCE-20260501-AIBEOPCHIN-6-1-CASE-PACKAGE-DATA-STRUCTURE] 기준"
    ),
    "aibeopchin_6_2_case_package_code_consent_policy": (
        "AI법친 6.2 — 고유번호 발급 정책 / 공유 동의 구조 설계: "
        "docs/project-governance/AIBEOPCHIN_6_2_CASE_PACKAGE_CODE_CONSENT_POLICY.md / "
        "[EVIDENCE-20260501-AIBEOPCHIN-6-2-CASE-PACKAGE-CODE-CONSENT-POLICY] 기준"
    ),
    "aibeopchin_6_3_case_package_share_prisma_api": (
        "AI법친 6.3 — CasePackageShare Prisma 모델 / API 구현: "
        "prisma/schema.prisma / src/features/case-package/case-package-share.repository.ts / "
        "src/app/api/cases/[caseId]/package-shares/* / "
        "src/app/api/lawyer/case-packages/lookup/route.ts / src/app/api/lawyer/case-packages/[shareId]/route.ts / "
        "[EVIDENCE-20260501-AIBEOPCHIN-6-3-CASE-PACKAGE-SHARE-PRISMA-API] 기준"
    ),
    "aibeopchin_6_4_client_share_settings_ui": (
        "AI법친 6.4 — 의뢰인 공유 설정 화면 구현: "
        "CasePackageShareSettingsPanel / "
        "[EVIDENCE-20260501-AIBEOPCHIN-6-4-CLIENT-SHARE-SETTINGS-UI] 기준"
    ),
    "aibeopchin_6_5_lawyer_case_package_lookup_detail_ui": (
        "AI법친 6.5 — 변호사 고유번호 조회 / 열람 화면 구현: "
        "LawyerCasePackageLookupClient / LawyerCasePackageDetailClient / "
        "[EVIDENCE-20260501-AIBEOPCHIN-6-5-LAWYER-CASE-PACKAGE-LOOKUP-DETAIL-UI] 기준"
    ),
    "aibeopchin_6_6_attachment_view_download_permissions": (
        "AI법친 6.6 — 첨부파일 열람 / 다운로드 권한 분리: "
        "attachment download API / [EVIDENCE-20260501-AIBEOPCHIN-6-6-ATTACHMENT-VIEW-DOWNLOAD-PERMISSIONS] 기준"
    ),
    "aibeopchin_6_7_access_logs_revoke_enhancement": (
        "AI법친 6.7 — 열람 로그 / 다운로드 로그 / 공유 취소 고도화: "
        "access log API / share settings log UI / [EVIDENCE-20260501-AIBEOPCHIN-6-7-ACCESS-LOGS-REVOKE-ENHANCEMENT] 기준"
    ),
    "aibeopchin_6_8_case_package_summary_output": (
        "AI법친 6.8 — 사건 패키지 PDF / 요약본 출력: "
        "public-safe package summary output / [EVIDENCE-20260501-AIBEOPCHIN-6-8-CASE-PACKAGE-PDF-SUMMARY] 기준"
    ),
    "aibeopchin_6_9_privacy_security_consent_finalization": "AI법친 6.9 — 개인정보 / 보안 / 동의문구 최종 정리: privacy/security/consent policy / [EVIDENCE-20260501-AIBEOPCHIN-6-9-PRIVACY-SECURITY-CONSENT-FINALIZATION] 기준",
    "aibeopchin_6_10_qa_regression_predeploy": (
        "AI법친 6.10 — QA / 회귀 / 배포 전 점검: "
        "자동 회귀 runner(scripts/run-case-package-6-regression.ts), "
        "수동 QA 체크리스트(docs/project-governance/case-package-6-manual-qa-results.json), "
        "수동 QA runner(scripts/verify-case-package-6-manual-qa.ts) / "
        "[EVIDENCE-20260503-AIBEOPCHIN-6-10-QA-REGRESSION-PREDEPLOY] 기준"
    ),
    "aibeopchin_6_12_binary_pdf_engine": (
        "AI법친 6.12 — binary PDF 엔진 검토 / 적용: "
        "Playwright PDF renderer / "
        "[EVIDENCE-20260503-AIBEOPCHIN-6-12-BINARY-PDF-ENGINE] 기준"
    ),
    "aibeopchin_19_a_data_retention_policy_constitution": (
        "AI법친 19-A — Data Retention Policy 헌법(purge job 전 SSOT 잠금): "
        "docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md / "
        "src/lib/data-governance/data-retention-policy.registry.ts / "
        "npm run verify:aibeopchin-data-governance-phase19a / "
        "[EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19A-DATA-RETENTION-POLICY] 기준. "
        "선행: Phase 18-E Reliability RC · Phase 17 monitoring. "
        "19-B~F(마스킹·Audit retention·첨부 lifecycle·AI privacy·RC)는 19-A 이후."
    ),
    "aibeopchin_19_b_pii_legal_redaction_output_paths": (
        "AI법친 19-B — PII/Legal Sensitive Redaction(19-A tier → 운영 출력 경로): "
        "src/lib/data-governance/data-redaction-policy.registry.ts / "
        "src/lib/data-governance/data-redaction.service.ts / "
        "npm run verify:aibeopchin-data-governance-phase19b / "
        "[EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19B-PII-LEGAL-REDACTION] 기준. "
        "AuditLog.metadata · RetryJob.failurePayload · AI audit · VoiceTranscript ops."
    ),
    "aibeopchin_19_c_audit_log_retention_export": (
        "AI법친 19-C — AuditLog Retention & Export(보존·export·마스킹·다운로드 감사): "
        "src/lib/data-governance/audit-log-retention-policy.ts / "
        "src/lib/data-governance/audit-log-export-policy.ts / "
        "npm run verify:aibeopchin-data-governance-phase19c / "
        "[EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19C-AUDIT-LOG-RETENTION-EXPORT] 기준. "
        "XLSX export → AUDIT_LOG_XLSX_EXPORTED AuditLog."
    ),
    "aibeopchin_19_d_attachment_lifecycle_expiry": (
        "AI법친 19-D — Attachment Lifecycle/Expiry(만료·보존·삭제 eligibility·orphan·legal hold): "
        "src/lib/data-governance/attachment-lifecycle-policy.ts / "
        "src/lib/data-governance/attachment-lifecycle-orphan-detection.service.ts / "
        "npm run verify:aibeopchin-data-governance-phase19d / "
        "[EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19D-ATTACHMENT-LIFECYCLE-EXPIRY] 기준. "
        "purge/delete 실행은 19-F RC 이후."
    ),
    "aibeopchin_19_e_admin_data_governance_visibility": (
        "AI법친 19-E — Admin Data Governance Visibility(삭제·만료·orphan·legal hold 조회): "
        "src/features/data-governance/data-governance-visibility.service.ts / "
        "/admin/operations/data-governance / "
        "npm run verify:aibeopchin-data-governance-phase19e / "
        "[EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19E-ADMIN-VISIBILITY] 기준. "
        "purge/delete/blob reclaim UI는 19-F RC 전까지 비활성."
    ),
    "aibeopchin_19_f_data_governance_rc_purge_unlock": (
        "AI법친 19-F — Data Governance RC(purge unlock 8 gate·dry-run 기본): "
        "src/features/data-governance/data-governance-rc-lock.ts / "
        "npm run verify:aibeopchin-data-governance-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19F-RC] 기준. "
        "19-A~E bundled · limited execution env flag."
    ),
    "aibeopchin_product_20_real_external_messaging": (
        "Product Phase 20 — Real External Messaging(1순위): "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md / "
        "20-A adapter contract: npm run verify:aibeopchin-real-messaging-phase20a / "
        "20-B email adapter: npm run verify:aibeopchin-real-messaging-phase20b / "
        "20-C kakao adapter: npm run verify:aibeopchin-real-messaging-phase20c / "
        "20-D webhook sync: npm run verify:aibeopchin-real-messaging-phase20d / "
        "20-E secure delivery: npm run verify:aibeopchin-real-messaging-phase20e / "
        "20-F RC: npm run verify:aibeopchin-real-messaging-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC] / "
        "선행: 15-F · 18-B · 19-B/F. 다음: Product Phase 21 Client Mobile / PWA."
    ),
    "aibeopchin_product_21_client_mobile_pwa": (
        "Product Phase 21 — Client Mobile/PWA(2순위): "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §21. "
        "21-F RC: npm run verify:aibeopchin-client-mobile-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC] / "
        "선행: Product 20-F. Phase 21 COMPLETE — 다음: Product Phase 22 Tenant / Plan."
    ),
    "aibeopchin_product_22_tenant_plan_metering": (
        "Product Phase 22 — Tenant/Plan/Metering(3순위): "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §22. "
        "22-A: npm run verify:aibeopchin-tenant-phase22a / "
        "[EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22A-ORGANIZATION-BASELINE] / "
        "22-B: npm run verify:aibeopchin-tenant-phase22b / "
        "[EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22B-PLAN-ENTITLEMENT] / "
        "22-C: npm run verify:aibeopchin-tenant-phase22c / "
        "[EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22C-USAGE-METERING] / "
        "22-D: npm run verify:aibeopchin-tenant-phase22d / "
        "[EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22D-BILLING-USAGE-LEDGER] / "
        "22-E: npm run verify:aibeopchin-tenant-phase22e / "
        "[EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22E-ADMIN-PLAN-CONSOLE] / "
        "22-F RC: npm run verify:aibeopchin-tenant-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC] / "
        "Phase 22 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_23_ai_quality_case_pack": (
        "Product Phase 23 — AI Quality/Case Pack(4순위·중기): "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §23. "
        "23-A~E + 23-F RC: npm run verify:aibeopchin-ai-quality-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23F-RC] / "
        "선행: Product 22-F · AI Core 10-D. Phase 23 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_24_litigation_operations": (
        "Product Phase 24 — Litigation Operations: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §24. "
        "24-A~E + 24-F RC: npm run verify:aibeopchin-litigation-ops-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC] / "
        "선행: Product 23-F · Code 14-E. Phase 24 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_25_production_launch": (
        "Product Phase 25 — Production Launch: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §25. "
        "25-A~E + 25-F RC: npm run verify:aibeopchin-production-launch-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC] / "
        "선행: Product 24-F · Code 16-D. Phase 25 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_26_pilot_launch": (
        "Product Phase 26 — Pilot Launch: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §26. "
        "26-A~E + 26-F RC: npm run verify:aibeopchin-pilot-launch-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC] / "
        "선행: Product 25-F · Code 16-D. Phase 26 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_27_pilot_operations": (
        "Product Phase 27 — Pilot Operations: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §27. "
        "27-A~E + 27-F RC: npm run verify:aibeopchin-pilot-operations-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC] / "
        "선행: Product 26-F · 25-F. Phase 27 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_28_paid_conversion_scale": (
        "Product Phase 28 — Paid Conversion / Scale: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §28. "
        "28-A~E + 28-F RC: npm run verify:aibeopchin-paid-conversion-scale-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC] / "
        "선행: Product 27-F · 26-F. Phase 28 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_29_revenue_ops_customer_success": (
        "Product Phase 29 — Revenue Ops / Customer Success: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §29. "
        "29-A~E + 29-F RC: npm run verify:aibeopchin-revenue-ops-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC] / "
        "선행: Product 28-F · 22-F · no automatic invoice. Phase 29 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_30_enterprise_scale": (
        "Product Phase 30 — Enterprise Scale: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §30. "
        "30-A~E + 30-F RC: npm run verify:aibeopchin-enterprise-scale-rc / "
        "[EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC] / "
        "선행: Product 29-F · 28-F · 22-F. Phase 30 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_31_partner_ecosystem_marketplace": (
        "Product Phase 31 — Partner Ecosystem / Marketplace Readiness: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §31. "
        "31-A~E + 31-F RC: npm run verify:aibeopchin-partner-ecosystem-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC] / "
        "선행: Product 30-F · 29-F · 22-F · no automatic payout. Phase 31 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_32_enterprise_security_compliance": (
        "Product Phase 32 — Enterprise Security / Compliance Certification Readiness: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §32. "
        "32-A~E + 32-F RC: npm run verify:aibeopchin-enterprise-security-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC] / "
        "선행: Product 31-F · 30-F · 19-F · no certification claim. Phase 32 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_33_public_trust_marketing_launch": (
        "Product Phase 33 — Public Trust / Marketing Launch: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §33. "
        "33-A~E + 33-F RC: npm run verify:aibeopchin-public-trust-marketing-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC] / "
        "선행: Product 32-F · 31-F · 25-F · no unverified marketing claim. Phase 33 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_34_sales_pipeline_deal_desk": (
        "Product Phase 34 — Sales Pipeline / Deal Desk: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §34. "
        "34-A~E + 34-F RC: npm run verify:aibeopchin-sales-pipeline-deal-desk-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC] / "
        "선행: Product 33-F · 28-F · 25-F · no auto contract/invoice. Phase 34 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_35_contracting_legal_ops": (
        "Product Phase 35 — Contracting / Legal Ops: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §35. "
        "35-A~E + 35-F RC: npm run verify:aibeopchin-contracting-legal-ops-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC] / "
        "선행: Product 34-F · 32-F · 33-F · 28-F · no auto contract execution/signature. "
        "Phase 35 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_36_implementation_readiness": (
        "Product Phase 36 — Implementation Readiness: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §36. "
        "36-A~E + 36-F RC: npm run verify:aibeopchin-implementation-readiness-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC] / "
        "선행: Product 35-F · 34-F · 28-F · 25-F · no auto tenant provisioning/go-live. "
        "Phase 36 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_37_customer_go_live_adoption": (
        "Product Phase 37 — Customer Go-Live / Adoption: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §37. "
        "37-A~E + 37-F RC: npm run verify:aibeopchin-customer-go-live-adoption-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC] / "
        "선행: Product 36-F · 35-F · 28-F · 25-F · no auto adoption success claim. "
        "Phase 37 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_38_long_term_customer_success": (
        "Product Phase 38 — Long-term Customer Success: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §38. "
        "38-A~E + 38-F RC: npm run verify:aibeopchin-long-term-customer-success-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38F-RC] / "
        "선행: Product 37-F · 36-F · 28-F · 25-F · no auto renewal/upsell. "
        "Phase 38 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_39_strategic_account_expansion": (
        "Product Phase 39 — Strategic Account Expansion: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §39. "
        "39-A~E + 39-F RC: npm run verify:aibeopchin-strategic-account-expansion-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39F-RC] / "
        "선행: Product 38-F · 37-F · 28-F · 25-F · no auto expansion execution. "
        "Phase 39 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_40_legal_outcome_assessment": (
        "Product Phase 40 — Judgment-Grounded Legal Outcome Assessment: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §40. "
        "40-A~E + 40-F RC: npm run verify:aibeopchin-legal-outcome-assessment-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC] / "
        "선행: Product 39-F · 23-F · 24-F · 32-F · "
        "NO_JUDGMENTLESS_LEGAL_ASSESSMENT · LAWYER_REVIEW_REQUIRED · 판결문 우선. "
        "Phase 40 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_41_sentencing_outcome_assessment": (
        "Product Phase 41 — Judgment-Grounded Sentencing Outcome Assessment: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §41. "
        "41-A~E + 41-F RC: npm run verify:aibeopchin-sentencing-outcome-assessment-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC] / "
        "선행: Product 40-F · 24-F · 32-F · "
        "NO_AUTOMATED_SENTENCING_PREDICTION · NO_SENTENCE_GUARANTEE · "
        "판결문 기반 양형결과 검토(양형예측 아님). "
        "Phase 41 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_42_evidence_integrity": (
        "Product Phase 42 — Evidence Integrity / Chain of Custody: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §42 · Legal Reliability §24. "
        "42-A~E + 42-F RC: npm run verify:aibeopchin-evidence-integrity-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC] / "
        "선행: Product 41-F · 40-F · 32-F · "
        "NO_AI_EXTRACT_REPLACES_ORIGINAL · ORIGINAL_EVIDENCE_TRACE_REQUIRED · "
        "판사도 볼 수 있는 투명한 증거 기록 축. "
        "Phase 42 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_43_claim_evidence_judgment_graph": (
        "Product Phase 43 — Claim-Evidence-Judgment Graph: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §26 · Legal Reliability §24. "
        "43-A~E + 43-F RC: npm run verify:aibeopchin-claim-evidence-judgment-graph-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC] / "
        "선행: Product 42-F · 40-F · "
        "Claim ↔ Evidence ↔ Judgment ↔ Lawyer Review Status · "
        "NO_UNLINKED_CLAIM_GRAPH · NO_JUDGMENTLESS_ISSUE_LINK · AI_CANDIDATE_LINK_NOT_FINAL · "
        "NO_CLIENT_VISIBLE_STRATEGY_GRAPH · LAWYER_REVIEW_REQUIRED. "
        "Phase 43 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_44_court_ready_case_record_pack": (
        "Product Phase 44 — Court-Ready Case Record Pack: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §27 · Legal Reliability §24. "
        "44-A~E + 44-F RC: npm run verify:aibeopchin-court-ready-case-record-pack-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC] / "
        "선행: Product 43-F · 42-F · "
        "Phase 43 graph → court-ready pack 정제 · "
        "NO_AUTOMATIC_COURT_SUBMISSION · NO_E_FILING_AUTO_UPLOAD · "
        "NO_COURT_READY_BEFORE_LAWYER_REVIEW · NO_INTERNAL_STRATEGY_GRAPH_IN_DEFAULT_PACK · "
        "NO_SENSITIVE_CLIENT_COUNSELING_AUTO_INCLUDE. "
        "Phase 44 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_45_judicial_transparency_explainability": (
        "Product Phase 45 — Judicial Transparency / Explainability Layer: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §28 · Legal Reliability §24. "
        "45-A~E + 45-F RC: npm run verify:aibeopchin-judicial-transparency-explainability-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC] / "
        "선행: Product 44-F · 43-F · "
        "AI가 왜 이렇게 정리했는지 trace · evidenceUsed · judgmentsReferenced · "
        "excludedMaterials · linkedClaims · similarityDifferenceAnalysis · "
        "uncertaintySignals · lawyerCorrectionHistory · finalReviewer · "
        "NO_UNEXPLAINED_AI_OUTPUT · NO_HIDDEN_SOURCE_OMISSION · "
        "NO_CLIENT_VISIBLE_EXPLAINABILITY_WITHOUT_LAWYER_REVIEW · LAWYER_REVIEW_REQUIRED. "
        "Phase 45 COMPLETE · LOCKED."
    ),
    "aibeopchin_product_46_neutral_litigation_review_pack": (
        "Product Phase 46 — Neutral Litigation Review Pack (구 Court/Mediator Review Mode 정정): "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §29 · Legal Reliability §24. "
        "46-A~E + 46-F RC: npm run verify:aibeopchin-neutral-litigation-review-pack-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46F-RC] / "
        "선행: Product 45-F · 44-F · "
        "변호사 통제 하 neutral pack 생성·검토 · "
        "NO_DIRECT_COURT_ACCESS · NO_MEDIATOR_PORTAL_BY_DEFAULT · "
        "NO_OPPOSING_PARTY_AUTO_SHARE · LAWYER_CONTROLLED_EXPORT_ONLY · "
        "NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK · NO_UNREVIEWED_AI_OUTPUT · "
        "NO_CLIENT_CONFIDENTIAL_MEMO · "
        "공식 정정: 판사 열람/법원 포털 기능 아님. "
        "Phase 46 COMPLETE · LOCKED · 46-F.2 · Phase 47 LOCKED (47.1)."
    ),
    "aibeopchin_product_47_legal_reliability": (
        "Product Phase 47 — Legal Reliability RC: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §30 · Legal Reliability §24. "
        "47-A~G bundle gates + 47-RC: npm run verify:aibeopchin-legal-reliability-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47-RC] / "
        "선행: Product 40-F~46-F · "
        "40 judgment-grounded · 41 sentencing · 42 evidence integrity · "
        "43 claim-evidence-judgment graph · 44 court-ready pack · "
        "45 explainability · 46 neutral litigation review pack · "
        "7대 원칙: NO_PREDICTION · NO_GUARANTEE · LAWYER_REVIEW_REQUIRED · "
        "NO_COURT_DIRECT_ACCESS · NO_UNREVEALED_SOURCE_OMISSION · "
        "NO_AI_OUTPUT_WITHOUT_EVIDENCE_JUDGMENT_TRACE · "
        "Phase 47 COMPLETE · LOCKED · 47.1 · Phase 48 LOCKED (48-F.1)."
    ),
    "aibeopchin_product_48_legal_reliability_lawyer_workbench": (
        "Product Phase 48 — Legal Reliability Lawyer Workbench UX: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §31 · Legal Reliability §24. "
        "48-A~E + 48-F RC: npm run verify:aibeopchin-legal-reliability-lawyer-workbench-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48F-RC] / "
        "선행: Product 47-RC · 40~47 Legal Reliability · "
        "UI: /cases/[caseId]/lawyer-workbench · "
        "Risk Radar · Judgment Drawer · Claim Graph · Court-ready Builder · "
        "NO_AI_FINAL_STRATEGY · NO_CLIENT_VISIBLE_STRATEGY_GRAPH · "
        "LAWYER_REVIEW_REQUIRED · JUDGMENT_CLICKTHROUGH_REQUIRED · "
        "NO_COURT_AUTO_SUBMISSION · NO_UNEXPLAINED_WORKBENCH_ITEM · "
        "Phase 48 COMPLETE · LOCKED · 48-F.1 · Phase 49-A/B LOCKED (49-A.1 · 49-B.1)."
    ),
    "aibeopchin_product_49_legal_reliability_action_loop": (
        "Product Phase 49 — Legal Reliability Action Loop: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §32 · Legal Reliability §24. "
        "49-A: npm run verify:aibeopchin-legal-reliability-action-loop-phase49a / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49A-RISK-RADAR-SUPPLEMENT-ACTION] / "
        "Risk Radar → SupplementActionCandidate → lawyer approval → SupplementRequest DRAFT · "
        "49-B: npm run verify:aibeopchin-legal-reliability-action-loop-phase49b / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49B-GRAPH-GAP-EVIDENCE-REQUEST-ACTION] / "
        "Graph gap → EvidenceRequestActionCandidate → lawyer approval → client evidence request DRAFT · "
        "49-C RC: npm run verify:aibeopchin-legal-reliability-action-loop-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-LOOP-PHASE49C-RC] / "
        "선행: Product 48-F · 47-RC · 40~47 Legal Reliability · "
        "공통: NO_AI_AUTO_ACTION · NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL · "
        "NO_AUTO_LEGAL_FILING · LAWYER_DECISION_LEDGER_REQUIRED · NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT · "
        "NO_UNREVIEWED_DRAFT_CONTEXT · NO_UNVERIFIED_EVIDENCE_LABELING · "
        "Phase 49 COMPLETE · LOCKED · 49-A.1 · 49-B.1 · 49-C.1 · Phase 50-A LOCKED (50-A.1)."
    ),
    "aibeopchin_product_50_legal_reliability_action_operations": (
        "Product Phase 50 — Legal Reliability Action Operations: "
        "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md §33 · Legal Reliability §24. "
        "50-A: npm run verify:aibeopchin-legal-reliability-action-operations-phase50a / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50A-QUEUE] / "
        "50-B: npm run verify:aibeopchin-legal-reliability-action-operations-phase50b / "
        "50-C: npm run verify:aibeopchin-legal-reliability-action-operations-phase50c / "
        "50-D: npm run verify:aibeopchin-legal-reliability-action-operations-phase50d / "
        "50-E: npm run verify:aibeopchin-legal-reliability-action-operations-phase50e / "
        "50-F RC: npm run verify:aibeopchin-legal-reliability-action-operations-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50F-RC] / "
        "Product Phase 50 COMPLETE · LOCKED · 50-F.1 · "
        "Approved 49-A/B candidate → LegalReliabilityActionOperation → Command Center queue · "
        "Execution dashboard: SLA · response · evidence · lawyer review · downstream readiness · "
        "선행: Product 49-C · Litigation Command Center 14-E · "
        "NO_DASHBOARD_AUTO_COMPLETION · NO_DASHBOARD_AUTO_MESSAGING · NO_UNREVIEWED_EVIDENCE_DOWNSTREAM · "
        "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION · CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION · "
        "NO_AUTO_OPERATION_COMPLETION · NO_CLIENT_UPLOAD_AUTO_EVIDENCE_CONFIRMATION · "
        "NO_AI_AUTO_ACTION · NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL · "
        "LAWYER_DECISION_LEDGER_REQUIRED · NO_AUTO_LEGAL_FILING · "
        "Phase 50-A~50-F LOCKED."
    ),
    "aibeopchin_product_51_legal_reliability_production_readiness": (
        "Product Phase 51 — Legal Reliability Action Operations Production Readiness: "
        "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_PHASE51_SPEC.md · "
        "51-A: migration/schema · 51-B: role-boundary smoke · "
        "51-C: npm run verify:aibeopchin-legal-reliability-predeploy-readiness / "
        "51-D: staging smoke checklist · 51-E: rollback/disable runbook · "
        "51-F RC: npm run verify:aibeopchin-legal-reliability-production-readiness-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51-PRODUCTION-READINESS-RC] / "
        "Product Phase 51 COMPLETE · LOCKED · 51-F.1 · "
        "선행: Product 49-C · Product 50-F · "
        "NO_PRODUCTION_DEPLOY_WITHOUT_RC_VERIFY · NO_SCHEMA_DEPLOY_WITHOUT_MIGRATION_CHECK · "
        "NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS · NO_STAGING_SMOKE_SKIP · "
        "NO_WRITE_ENABLE_WITHOUT_ROLLBACK_PLAN · NO_DASHBOARD_AUTO_EXECUTION_IN_PRODUCTION · "
        "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION · "
        "Feature flags: LEGAL_RELIABILITY_ACTION_LOOP_ENABLED · "
        "LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED · "
        "LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED."
    ),
    "aibeopchin_product_52_legal_reliability_staging_live_validation": (
        "Product Phase 52 — Legal Reliability Staging Live Validation / Go-Live Evidence: "
        "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_PHASE52_SPEC.md · "
        "52-A: staging migration apply evidence · 52-B: role live smoke · "
        "52-C: Action Loop live smoke · 52-D: Action Operations live smoke · "
        "52-E: feature flag rollback live validation · "
        "52-F RC: npm run verify:aibeopchin-legal-reliability-staging-live-validation-rc / "
        "evidence lock: npm run verify:aibeopchin-legal-reliability-staging-evidence-lock / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE52-STAGING-LIVE-VALIDATION-GO-LIVE-EVIDENCE] / "
        "Product Phase 52 COMPLETE · LOCKED · 52-F.1 · "
        "선행: Product 51-F · "
        "NO_GO_LIVE_WITHOUT_STAGING_EVIDENCE · NO_GO_LIVE_WITHOUT_ROLE_SMOKE · "
        "NO_GO_LIVE_WITHOUT_FEATURE_FLAG_ROLLBACK_TEST · NO_GO_LIVE_WITH_FAILED_MIGRATION_STATUS · "
        "NO_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS · NO_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING · "
        "NO_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM · "
        "Go-live checklist: phase52-staging-go-live-evidence-checklist."
    ),
    "aibeopchin_product_53_legal_reliability_production_go_live_control": (
        "Product Phase 53 — Legal Reliability Production Go-Live Control / Post-Go-Live Monitoring Lock: "
        "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY.md · "
        "Product Phase 53 COMPLETE · LOCKED · 53-F.1: npm run verify:aibeopchin-legal-reliability-production-go-live-control-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53F-PRODUCTION-GO-LIVE-CONTROL-RC] / "
        "53-A COMPLETE · LOCKED · 53-A.1: npm run verify:aibeopchin-legal-reliability-go-live-approval-gate / "
        "53-B COMPLETE · LOCKED · 53-B.1: npm run verify:aibeopchin-legal-reliability-production-migration-evidence / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53B-PRODUCTION-MIGRATION-LIVE-EVIDENCE] / "
        "53-C COMPLETE · LOCKED · 53-C.1: npm run verify:aibeopchin-legal-reliability-production-role-smoke / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53C-PRODUCTION-ROLE-SMOKE-CLIENT-BOUNDARY] / "
        "53-D COMPLETE · LOCKED · 53-D.1: npm run verify:aibeopchin-legal-reliability-production-action-smoke / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53D-PRODUCTION-ACTION-LOOP-OPERATIONS-SMOKE] / "
        "53-E COMPLETE · LOCKED · 53-E.1: npm run verify:aibeopchin-legal-reliability-post-go-live-monitoring / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53E-POST-GO-LIVE-MONITORING-ROLLBACK-READINESS] / "
        "53-F COMPLETE · LOCKED · 53-F.1: npm run verify:aibeopchin-legal-reliability-production-go-live-control-rc / "
        "[EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53F-PRODUCTION-GO-LIVE-CONTROL-RC] / "
        "선행: Product 52-F · "
        "NO_PRODUCTION_GO_LIVE_WITHOUT_STAGING_EVIDENCE · NO_PRODUCTION_GO_LIVE_WITHOUT_APPROVER_LEDGER · "
        "NO_PRODUCTION_GO_LIVE_WITHOUT_ROLLBACK_OWNER · NO_PRODUCTION_GO_LIVE_WITH_FAILED_PREDEPLOY_RC · "
        "NO_PRODUCTION_GO_LIVE_WITH_PENDING_MIGRATION_RISK · NO_PRODUCTION_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS · "
        "NO_PRODUCTION_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING · "
        "NO_PRODUCTION_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM · "
        "NO_PRODUCTION_GO_LIVE_WITHOUT_FEATURE_FLAG_KILL_SWITCH · "
        "Approval checklist: phase53a-production-go-live-approval-checklist · "
        "NO_PRODUCTION_MIGRATION_WITHOUT_53A_APPROVAL · NO_DESTRUCTIVE_RESET_IN_PRODUCTION · "
        "NO_GO_LIVE_WITH_SCHEMA_DRIFT_AFTER_MIGRATION · "
        "Migration checklist: phase53b-production-migration-evidence-checklist · "
        "NO_PRODUCTION_ROLE_SMOKE_WITHOUT_53A_53B_LOCK · NO_GO_LIVE_WITHOUT_PRODUCTION_ROLE_SMOKE · "
        "NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY · NO_CLIENT_ACCESS_TO_ACTION_OPERATIONS · "
        "NO_CLIENT_ACCESS_TO_GO_LIVE_CONTROL · NO_STAFF_ADMIN_PRIVILEGE_ESCALATION · "
        "NO_LAWYER_COMPLETION_WITHOUT_REVIEW_BOUNDARY · NO_ROLE_SMOKE_WITH_SHARED_OR_UNKNOWN_ACCOUNT · "
        "NO_GO_LIVE_WITH_FAILED_AUTHZ_AUDIT_LOG · "
        "Role smoke checklist: phase53c-production-role-smoke-checklist · "
        "NO_PRODUCTION_ACTION_SMOKE_WITHOUT_53A_53B_53C_LOCK · NO_GO_LIVE_WITHOUT_ACTION_LOOP_LIVE_SMOKE · "
        "NO_AI_ACTION_WITHOUT_LAWYER_APPROVAL · NO_CLIENT_REQUEST_WITHOUT_LAWYER_DECISION_LEDGER · "
        "NO_OPERATION_QUEUE_WITHOUT_APPROVED_ACTION · NO_AUTO_OPERATION_COMPLETION_IN_PRODUCTION · "
        "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION · NO_AUTO_FILING_OR_AUTO_SUBMISSION_IN_PRODUCTION · "
        "NO_ACTION_SMOKE_WITHOUT_AUDIT_EVIDENCE · NO_CLIENT_VISIBLE_INTERNAL_STRATEGY_DURING_SMOKE · "
        "Action smoke checklist: phase53d-production-action-smoke-checklist · "
        "NO_POST_GO_LIVE_MONITORING_WITHOUT_53A_53B_53C_53D_LOCK · NO_GO_LIVE_CLOSEOUT_WITHOUT_MONITORING_WINDOW · "
        "NO_CLOSEOUT_WITH_ACTION_LOOP_ERROR_SPIKE · NO_CLOSEOUT_WITH_ACTION_OPERATIONS_ERROR_SPIKE · "
        "NO_CLOSEOUT_WITH_CLIENT_BOUNDARY_VIOLATION · NO_CLOSEOUT_WITH_AUDIT_LOG_GAP · "
        "NO_CLOSEOUT_WITH_ROLLBACK_FLAG_UNVERIFIED · NO_CLOSEOUT_WITH_AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL · "
        "NO_CLOSEOUT_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL · NO_CLOSEOUT_WITHOUT_OPERATOR_SIGNOFF · "
        "Post-go-live monitoring checklist: phase53e-post-go-live-monitoring-checklist · "
        "NO_PRODUCTION_GO_LIVE_RC_WITHOUT_53A_APPROVAL_LOCK · NO_RC_WITH_BROKEN_EVIDENCE_CHAIN · "
        "NO_RC_WITHOUT_ROLLBACK_READINESS · NO_RC_WITHOUT_MASTER_VERIFY · "
        "Production go-live control RC runbook: phase53f-production-go-live-control-rc."
    ),
    "aibeopchin_product_54_legal_reliability_production_stabilization": (
        "Product Phase 54 — Legal Reliability Commercial Production Stabilization: "
        "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_PHASE54_SPEC.md · "
        "선행: Product 53-F · verify:aibeopchin-legal-reliability-production-go-live-control-rc / "
        "54-A COMPLETE · LOCKED · 54-A.1: npm run verify:aibeopchin-legal-reliability-stabilization-baseline / "
        "[EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54A-PRODUCTION-STABILIZATION-MONITORING-BASELINE] / "
        "54-B COMPLETE · LOCKED · 54-B.1: npm run verify:aibeopchin-legal-reliability-incident-severity / "
        "[EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY] / "
        "54-C COMPLETE · LOCKED · 54-C.1: npm run verify:aibeopchin-legal-reliability-hotfix-governance / "
        "[EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54C-HOTFIX-GOVERNANCE] / "
        "54-D COMPLETE · LOCKED · 54-D.1: npm run verify:aibeopchin-legal-reliability-degraded-mode / "
        "[EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54D-DEGRADED-MODE] / "
        "54-E COMPLETE · LOCKED · 54-E.1: npm run verify:aibeopchin-legal-reliability-support-escalation / "
        "[EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54E-SUPPORT-OPS-ESCALATION] / "
        "54-F COMPLETE · LOCKED · 54-F.1: npm run verify:aibeopchin-legal-reliability-production-stabilization-rc / "
        "[EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54F-PRODUCTION-STABILIZATION-RC] / "
        "Product Phase 54 COMPLETE · LOCKED · 54-F.1 · COMMERCIALLY_STABLE_OPERATION · "
        "Go-Live Control → Production Stabilization · "
        "NO_STABILIZATION_RC_WITHOUT_PHASE53_COMPLETE_LOCK · "
        "NO_BASELINE_WITHOUT_PHASE53_COMPLETE_LOCK · "
        "NO_BASELINE_WITHOUT_ERROR_RATE_THRESHOLD · "
        "NO_BASELINE_WITHOUT_LATENCY_THRESHOLD · "
        "NO_BASELINE_WITHOUT_ACTION_LOOP_SUCCESS_THRESHOLD · "
        "NO_BASELINE_WITHOUT_OPERATIONS_QUEUE_BACKLOG_THRESHOLD · "
        "NO_BASELINE_WITHOUT_AUDIT_LOG_COVERAGE_THRESHOLD · "
        "NO_BASELINE_WITHOUT_ROLE_DENIAL_PATTERN · "
        "NO_BASELINE_WITHOUT_DEGRADE_READINESS_SIGNAL · "
        "NO_BASELINE_WITHOUT_OPERATOR_BASELINE_SIGNOFF · "
        "NO_INCIDENT_SEVERITY_WITHOUT_PHASE54A_BASELINE · "
        "NO_SEVERITY_WITHOUT_CUSTOMER_IMPACT_CLASSIFICATION · "
        "NO_SEVERITY_WITHOUT_ROLE_BOUNDARY_CLASSIFICATION · "
        "NO_SEVERITY_WITHOUT_AUTOMATION_RISK_CLASSIFICATION · "
        "NO_SEVERITY_WITHOUT_ACTION_LOOP_IMPACT_CLASSIFICATION · "
        "NO_SEVERITY_WITHOUT_QUEUE_IMPACT_CLASSIFICATION · "
        "NO_SEVERITY_WITHOUT_LATENCY_DEGRADATION_CLASSIFICATION · "
        "NO_SEVERITY_WITHOUT_ESCALATION_TARGET · "
        "NO_SEVERITY_WITHOUT_OPERATOR_RESPONSE_WINDOW · "
        "NO_SEVERITY_WITHOUT_INCIDENT_AUDIT_REQUIREMENT · "
        "NO_HOTFIX_WITHOUT_54B_INCIDENT_SEVERITY · "
        "NO_HOTFIX_WITHOUT_SEVERITY_CLASSIFICATION · "
        "NO_HOTFIX_WITHOUT_APPROVAL_CHAIN · "
        "NO_HOTFIX_WITHOUT_SCOPE_LIMIT · "
        "NO_HOTFIX_WITHOUT_ROLLBACK_PLAN · "
        "NO_HOTFIX_WITHOUT_POST_PATCH_VERIFY · "
        "NO_HOTFIX_WITHOUT_CUSTOMER_IMPACT_RECORD · "
        "NO_EMERGENCY_PATCH_WITHOUT_AUDIT_LOG · "
        "NO_MIGRATION_HOTFIX_WITHOUT_EXTRA_APPROVAL · "
        "NO_HOTFIX_WITHOUT_CLOSEOUT_REVIEW · "
        "NO_DEGRADED_MODE_WITHOUT_54B_54C_LOCK · "
        "NO_DEGRADE_WITHOUT_SEVERITY_TRIGGER · "
        "NO_DEGRADE_WITHOUT_OPERATOR_APPROVAL · "
        "NO_DEGRADE_WITHOUT_TENANT_OR_FEATURE_SCOPE · "
        "NO_DEGRADE_WITHOUT_CLIENT_SAFE_MESSAGE · "
        "NO_DEGRADE_WITHOUT_READ_ONLY_FALLBACK · "
        "NO_DEGRADE_WITHOUT_WRITE_COMPLETION_DISABLE_CONTROL · "
        "NO_DEGRADE_WITHOUT_AUDIT_LOG · "
        "NO_DEGRADE_WITHOUT_RECOVERY_CRITERIA · "
        "NO_DEGRADE_WITHOUT_EXIT_REVIEW · "
        "NO_SUPPORT_ESCALATION_WITHOUT_54A_54D_LOCK · "
        "NO_ESCALATION_WITHOUT_SEVERITY_OWNER · "
        "NO_ESCALATION_WITHOUT_RESPONSE_WINDOW · "
        "NO_ESCALATION_WITHOUT_ENGINEERING_OWNER · "
        "NO_ESCALATION_WITHOUT_LEGAL_OPS_OWNER · "
        "NO_ESCALATION_WITHOUT_CUSTOMER_SUPPORT_OWNER · "
        "NO_CUSTOMER_MESSAGE_WITHOUT_SAFE_TEMPLATE · "
        "NO_SUPPORT_ACTION_WITHOUT_AUDIT_LOG · "
        "NO_INCIDENT_CLOSEOUT_WITHOUT_SUPPORT_REVIEW · "
        "NO_STABILIZATION_RC_WITHOUT_SUPPORT_READY · "
        "NO_CUSTOMER_OPERATION_WITHOUT_BASELINE_MONITORING · "
        "NO_CUSTOMER_OPERATION_WITHOUT_INCIDENT_SEVERITY_POLICY · "
        "NO_HOTFIX_WITHOUT_GOVERNANCE · NO_DEGRADE_WITHOUT_OPERATOR_CONTROL · "
        "NO_CUSTOMER_IMPACT_WITHOUT_ESCALATION_CHAIN · "
        "NO_STABILIZATION_RC_WITHOUT_SUPPORT_READINESS · "
        "NO_STABILIZATION_RC_WITHOUT_54A_BASELINE_LOCK · "
        "NO_STABILIZATION_RC_WITHOUT_54B_SEVERITY_LOCK · "
        "NO_STABILIZATION_RC_WITHOUT_54C_HOTFIX_LOCK · "
        "NO_STABILIZATION_RC_WITHOUT_54D_DEGRADED_MODE_LOCK · "
        "NO_STABILIZATION_RC_WITHOUT_54E_SUPPORT_LOCK · "
        "NO_STABILIZATION_RC_WITH_BROKEN_EVIDENCE_CHAIN · "
        "NO_STABILIZATION_RC_WITHOUT_CUSTOMER_SAFE_OPERATION · "
        "NO_STABILIZATION_RC_WITHOUT_ROLLBACK_AND_DEGRADE_READINESS · "
        "NO_STABILIZATION_RC_WITHOUT_SUPPORT_ESCALATION_READY · "
        "NO_STABILIZATION_RC_WITHOUT_MASTER_VERIFY · "
        "54-A: monitoring baseline · 54-B: incident severity · 54-C: hotfix governance · "
        "54-D: degraded mode · 54-E: support escalation · 54-F: stabilization RC · "
        "Stabilization baseline checklist: phase54a-stabilization-baseline-checklist · "
        "Incident severity checklist: phase54b-incident-severity-checklist · "
        "Hotfix governance checklist: phase54c-hotfix-governance-checklist · "
        "Degraded mode checklist: phase54d-degraded-mode-checklist · "
        "Support escalation checklist: phase54e-support-escalation-checklist · "
        "Production stabilization RC runbook: phase54f-production-stabilization-rc."
    ),
    "aibeopchin_product_59_gongbuho_intelligence_layer": (
        "Product Phase 59 — Gongbuho Intelligence Layer: "
        "docs/gongbuho/AIBEOPCHIN_GONGBUHO_INTELLIGENCE_LAYER_PHASE59_SPEC.md · "
        "선행: Product 54-F · verify:aibeopchin-legal-reliability-production-stabilization-rc / "
        "verify:gongbuho-legal-knowledge-rc / "
        "59-A DRAFT · 59-A.0: npm run verify:aibeopchin-gongbuho-intelligence-phase59a / "
        "[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59A-MEMORY-PACKET-SCHEMA] / "
        "59-B COMPLETE · LOCKED · 59-B.1: npm run verify:aibeopchin-gongbuho-intelligence-phase59b / "
        "[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59B-REAL-TIME-LEGAL-SIGNAL] / "
        "59-C COMPLETE · LOCKED · 59-C.1: npm run verify:aibeopchin-gongbuho-intelligence-phase59c / "
        "[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59C-REASONING-CONTEXT] / "
        "59-D COMPLETE · LOCKED · 59-D.1: npm run verify:aibeopchin-gongbuho-intelligence-phase59d / "
        "[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59D-LAWYER-FEEDBACK-LEARNING] / "
        "59-E COMPLETE · LOCKED · 59-E.1: npm run verify:aibeopchin-gongbuho-intelligence-phase59e / "
        "[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59E-REUSABLE-LEGAL-PATTERN] / "
        "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE / "
        "59-F COMPLETE · LOCKED · 59-F.1: npm run verify:aibeopchin-gongbuho-intelligence-rc / "
        "[EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59F-RC-LOCK] / "
        "LEGAL_RELIABILITY_INTELLIGENCE_PLATFORM / "
        "GONGBUHO_INTELLIGENCE_MASTER_VERIFY_REQUIRED / "
        "Gongbuho Memory Packet → Real-time Legal Signal → Retrieval Reasoning → Learning Loop → Pattern Library → Intelligence RC · "
        "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING · LAWYER_CONFIRMED_BEFORE_STRATEGY_USE · "
        "REAL_TIME_SIGNAL_NOT_AUTHORITY · NO_AUTO_LEGAL_ADVICE_TO_CLIENT · "
        "CASE_SCOPE_FIRST · TENANT_ISOLATION_REQUIRED · ANONYMIZED_PATTERN_ONLY · "
        "AUDIT_EVERY_AI_LEARNING · NO_UGC_VECTOR_STORAGE · NO_AI_AUTO_ACTION · "
        "LAWYER_DECISION_LEDGER_REQUIRED · NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL · "
        "NO_INTELLIGENCE_RC_WITHOUT_59A_MEMORY_PACKET_LOCK · "
        "NO_INTELLIGENCE_RC_WITHOUT_PHASE54_STABILIZATION_LOCK · "
        "NO_INTELLIGENCE_RC_WITHOUT_MASTER_VERIFY · "
        "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL · "
        "COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE · "
        "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING · "
        "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT · "
        "CONTEXT_BUNDLE_AUDIT_REQUIRED · "
        "NO_REJECTED_SUGGESTION_REUSE · "
        "LAWYER_DECISION_LEDGER_REQUIRED · "
        "Legal Reliability Intelligence Platform (target)."
    ),
    "aibeopchin_6_11_admin_case_package_share_dashboard": (
        "AI법친 6.11 — 관리자 공유 현황 화면 구현: "
        "공유 목록/상세 API, 관리자 목록/상세 화면, 위험 배지, 로그 요약 / "
        "[EVIDENCE-20260503-AIBEOPCHIN-6-11-ADMIN-CASE-PACKAGE-SHARE-DASHBOARD] 기준"
    ),
    "aibeopchin_6_3_migration_closeout_and_runtime_verification": (
        "AI법친 6.3 migration 마감 및 6.4~6.8 런타임 검증: .env.local 템플릿 생성 완료, 실제 DATABASE_URL 입력 대기, add-case-package-share migration 실행, 6.4~6.8 런타임 검증, 407~412 증빙 갱신"
    ),
    "predeploy_qa_closure_procedure": (
        "배포 전 QA: IMPLEMENTATION_EVIDENCE.md #evidence-20260428-predeploy-qa-closure에 "
        "1~4단계·Message(#predeploy-qa-message-copy)·사전(#predeploy-qa-sakjeon-20260428)·"
        "공식 확정(#predeploy-qa-official-confirm) 정리됨 — [EVIDENCE-20260428-398]. "
        "다음: QA 실측 전문 수신 후 확정 표·회신 원문만 갱신."
    ),
    "phase1_start_baseline": (
        "시작 기준선: docs/project-governance/CASE_STATUS_DEFINITION.md §7.1 - "
        "CaseStatus, DELETED, soft delete, allowedLifecycleActions 정합 확인 스냅 -> "
        "FILE_REALIGN §2 Batch 1-A/1-B + §5 FILE Batch A/B/C done (EVIDENCE-20260423-316~320), next SPEC §0 / governance & Step 3 question-set (separate EVIDENCE)"
    ),
    "post_file_realign_320_baseline": (
        "고정점(§5): EVIDENCE-20260423-320 - FILE_REALIGN §5 Batch A/B/C 완료. "
        "다음 차수(동일 순서): (1) docs/project-governance/SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-320-이후-거버넌스-순서 - "
        "(2) docs/project-governance/IMPLEMENTATION_EVIDENCE.md 최상단 EVIDENCE(327 잠금, 328~329 Step3·싱글소스) - "
        "(3) 본 show-plan - "
        "(4) 실작업 단위: SPEC#spec-320-거버넌스-작업-단위 = GW-0.1~0.4, GW-0.1 EVIDENCE=323, "
        "GW-0.2(비기본) EVIDENCE=324·SPEC#gw-0-2-범위-완료, GW-0.3(비기본) EVIDENCE=325·SPEC#gw-0-3-범위-완료, "
        "GW-0.4(검증·조건부) EVIDENCE=326·SPEC#gw-0-4-범위-완료, "
        "정렬 주기 1차 완료(잠금) EVIDENCE=327·SPEC#gw-0-정렬-주기-1차-완료. "
        "327 이후 우선 실착(별도 EVIDENCE): Step 3 EVIDENCE=328~; 싱글소스 1차 스캔·로드맵=329·SPEC#step-3-싱글-소스-질문셋. "
        "A안(questions) 런타임 잠금·getInterviewFlow+complete 동일 기준: EVIDENCE-20260423-330 완료. "
        "질문 유형 3층 매핑(런타임 type / Zod inputType / 정의서 §7): EVIDENCE-20260423-331·docs/project-governance/QUESTION_TYPE_MAPPING.md 완료. "
        "질문셋 admin UI 경계(고아 question-set-admin-client 삭제, QUESTION_SET_DEFINITION §14-1): EVIDENCE-20260423-332 완료. "
        "333~346: …+339~342 B, 343~344 publish·백필, 345=[345] 시드 잠금, 346 종료(A=visibility B=documentMapping 완·C·D 스킵·EVIDENCE-346). "
        "[343][345] 재오픈 금지. 다음: [347]+·[348] 1순위(EVIDENCE-347·348·SPEC#spec-347-후속-고정). "
        "이전(338): 2차 동기 EV(EVIDENCE_STEP3_B §1~4). "
        "비기본(별도 증빙): B안/IO/§5.4/ALIGNMENT 보감 - §0 '이후 분기'/313/320과 직교. "
        "이후 착수: 정의·스키마·코드 실변경 등 필요 항목만 별도 단위·EVIDENCE. "
        "Step3 1순([351] EVIDENCE-20260426-351) 종료·2순 GW-0.2 [352] (나) 마감(EVIDENCE-20260426-352) → [347]3순 "
        "ALIGNMENT/Case/인터뷰 잔여(post_352_next_347_tier3_alignment, DEV_BRIEF_POST_STEP3_352.md). "
        "SPEC#spec-347-후속-고정. 348·349·1순 흐름과 3순 혼재 금지. "
        "GW-0.2 차기 (가) 시 확인: SPEC#gw-0-2-범위-완료 → IO_DATA → POST_278 §6.3 → SPEC §5.4 → EVIDENCE-324. 합의 전 src/** 금지."
    ),
    "next_work_unit_step3_question_set": (
        "Step 3 질문셋 본착수 (EVIDENCE-20260423-328) - SPEC #step-3-질문셋-본착수, "
        "docs/project-governance/QUESTION_SET_DEFINITION.md 기준, 질문셋 route / 관리·생성·편집 UI / "
        "정의-저장 1차 정합. 싱글소스 1차 스캔·로드맵: EVIDENCE-20260423-329 · SPEC #step-3-싱글-소스-질문셋. "
        "A안(questions) 런타임 잠금·getInterviewFlow+complete 동일 기준: EVIDENCE-20260423-330 완료. "
        "유형 매핑: EVIDENCE-20260423-331·QUESTION_TYPE_MAPPING.md. admin UI: EVIDENCE-20260423-332·QUESTION_SET_DEFINITION §14-1. "
        "334·335·336 완, 337 1차 종료. 338+EVIDENCE_STEP3_B 2차(§1~4). 339~345: 343=게시, 344=백필, 345=시드 잠금. 346 종료(A=visibility B=documentMapping·C·D 스킵). 스냅: .../EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md. "
        "다음: [347]+ 작업 단위 개설. B안/IO/§5.4 = 별도 합의."
    ),
    "step3_question_set_single_source_roadmap": (
        "Step 3 싱글 소스 (인터뷰 런타임) - EVIDENCE-20260423-329, SPEC #step-3-싱글-소스-질문셋. "
        "이번 결론(329): questions 플랫 JSON vs definitionJson.sections vs 타입 3층, 단일 기준 부재. "
        "330 완: A안(questions) 런타임 잠금; getInterviewFlow + completeCaseInterviewService = 동일 질문 소스·동일 complete 판정; definitionJson.sections = 이번 차수 런타임 필수 아님(관리·Zod). "
        "331 완: QUESTION_TYPE_MAPPING.md — QuestionSetQuestionType / QuestionInputType / §7 3층 행 잠금. "
        "332~342: …+339(§1)+340(§2)+341(§3)+342(§4). "
        "잔여: 342=§4 잠금 완, 동기 코드=전용 EVIDENCE, 시드 — A §4.5 / B."
    ),
    "post_345_step3_remaining": (
        "EVIDENCE-346: [346] 종료. PR-346-A visibility·PR-346-B documentMapping 구현 완. PR-346-C·D=필요 없음(스킵, 본절). "
        "C: inputType/조건 불필요·B+ValidationError+QUESTION_TYPE_MAPPING 정합 변화 없음. "
        "D: [346]범위 CaseStatus/스키마/사건 실변경 없음·GW-0.4(가) 정렬만. "
        "[343][345] 재오픈 없음. 이후 증빙=[346]|[347]+. "
        "다음: [347]+ 후속(SPEC/거버넌스·EVIDENCE) — `post_347_step3_followup` 참고. A·B 완료 시점: tsc+lint+verify:canonical-sources."
    ),
    "post_347_step3_followup": (
        "EVIDENCE-20260425-347: [347]+ 본절·SPEC#spec-347-후속-고정. [343][345][346] 재오픈 금지(346 종료·345 잠금 유지). "
        "선정(2026-04-25): 1) Step3 잔여·운용 2) GW-0.2 B안/IO/§5.4 3) ALIGNMENT§6·Case/인터뷰 잔여. "
        "1순 [348]·①+② [349]·③ [350]·[352] 2순 GW-0.2(나) 마감 = 문서권 Step3/Phase 종료(점검표 [343]~[352]). "
        "3순: EVIDENCE-20260426-353 — 문서권 마감 #347-tier3-document-scope-closure-20260426; 후속(가)·본착수=별 PR(post_352_next_347_tier3_alignment). "
        "348·349·1순·352 흐름과 3순 혼재·한 PR 금지. show-plan: post_348, post_349, post_352_next_347_tier3_alignment."
    ),
    "post_348_step3_tier1": (
        "EVIDENCE-20260425-348(확정): [347] 1순위 Step3 잔여·운용 회귀 검증. [343][345][346] 재오픈 없음. "
        "2026-04-25: npx tsc --noEmit·npm run lint·verify:canonical-sources·npm test — 모두 exit 0 (vitest 31/94). "
        "누적: 문서·스냅·운용로그·회귀=[348]에만. src/**·시드·자동검·런타임=[349+]에만(IMPLEMENTATION [348]/[349] 표). "
        "2·3(GW-0.2, ALIGNMENT/Case)=[347]·SPEC#spec-347-후속-고정·[320]—348·349와 혼재 금지."
    ),
    "post_349_step3_tier1_code": (
        "EVIDENCE-20260425-349: 후보1·2·3 신규diff 불필요 처리 완료. 후보4: ①②③ 범위 확정. "
        "PR분기 정본: IMPLEMENTATION_EVIDENCE.md [349]「누적·분리」와 EVIDENCE-20260425-350. "
        "①+②는 [349]에만 누적하고, verify:349-12 exit0 완료 기록으로 닫습니다. "
        "③은 [350]/EVIDENCE-20260425-350에만 누적합니다(개설 2026-04-25, ci.yml). ③범위=CI·PR게이트·.github/workflows/*·파이프라인. "
        "[349]에는 ③·workflow를 혼입하지 않습니다. "
        "2·3순/348=별트랙. [343]~[346] 비재오픈."
    ),
    "post_351_step3_tier1_reaudit": (
        "EVIDENCE-20260426-351: [351] Step3 1순위 종료 판정 — 추가 착수 후보 없음. "
        "당시 다음은 [347] 2순 GW-0.2·이후 [352] (나)로 2순 마감(EVIDENCE-20260426-352). "
        "다음(현재): [347] 3순 ALIGNMENT/Case/인터뷰 — post_352_next_347_tier3_alignment. "
        "GW-0.2 (가) 재착수 시: SPEC#gw-0-2-범위-완료·IO·POST_278 §6.3·SPEC §5.4·EVIDENCE-324, 합의 전 src/** 금지."
    ),
    "post_352_gw02_document_agreement": (
        "EVIDENCE-20260426-352: GW-0.2 본 주기 마감. 1·2단계 완료, 이번 (나). "
        "신규 src/**·B안·§5.4 행 이관/유지·API_SPEC success/ok 강제 없음 → 3) 문서 3종 생략, 4) 이번 흐름 src/** 없음. "
        "Step3/Phase [343]~[352] 점검표·문서권 완료. 향후 GW-0.2 src/** = 별도 EVIDENCE/PR (가) 재판정. "
        "다음: [347] 3순 — post_352_next_347_tier3_alignment, docs/project-governance/DEV_BRIEF_POST_STEP3_352.md."
    ),
    "post_352_next_347_tier3_alignment": (
        "[347]3순 #evidence-20260426-353 — A·B·C(A)·**문서권 전체** 닫힘 — #347-tier3-document-scope-closure-20260426 "
        "(전제 #c-gw03-a-tier3-20260426·당장 본착수·src 없음). "
        "**후속만:** GW-0.3 **(가)**·질문셋 본착수·런타임 대규모=FOLLOWUP §4·**별** EVIDENCE/PR·343~350 비재오픈. "
        "[347]이후 코드 1순위 FILE-1B: #work-instruction-post-347-file-1b-attachment-case-link · "
        "WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md · WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md. "
        "B축 마감·C 전환 기록: #347-tier3-b-axis-closure-c-next-20260426 · 표 #347-tier3-bc-next-after-bg1. "
        "B 증빙 소급: #work-instruction-347-tier3-case-interview-gap-audit · #work-instruction-347-tier3-b-residual-lc-case-api-ui · B-G1 #b-g1-ux-pr-20260426 · B-LC05. "
        "문서승인 전용 감사행=보류 후보만(착수 안 함). FILE-1B·IV대규모=별 트랙, C PR과 혼재 금지. "
        "C: 착수 전 판정 #work-instruction-347-tier3-c-gw03-spec-preflight · WORK_INSTRUCTION_347_TIER3_C_GW03_SPEC_PREFLIGHT.md "
        "(GW-0.2(나) 마감 전제·SPEC/질문셋 겹침·별도 EVIDENCE/PR). "
        "GW-0.3 (A) 1차 완료 확인: #c-gw03-a-tier3-20260426 (문서·정렬·src 없음·verify:canonical-sources). "
        "질문셋 본착수·런타임 대규모=(가)만; (A)에 넣지 않음. SPEC#gw-0-3-범위-완료 · #spec-347-후속-고정 · FOLLOWUP §3·§4 · GW-0.3-분기/SPEC-347-확장. "
        "전제·닫힘: P0첫코드 #p0-353-구현-20260426 · P0잔여·P2통합 #p0-347-tier3-p0-p2-integrated-20260426 · "
        "P1·IO-05·353+ #p0-353-plus-dual-axis-real — 재오픈·canonical CaseStatus 변경 금지. "
        "SPEC#spec-347-후속-고정, 348/349/1·2순(352)과 PR 혼재·한PR 금지. GW-0.2 src/** 필요 시 별 EVIDENCE (가) 재판정. "
        "고정: [343]~[346]·[349]①+② 재오픈 금지, [350]③, [352] (나) 마감. "
        "PR/릴리스 전: verify:349-12·CI. DEV_BRIEF: DEV_BRIEF_POST_STEP3_352.md · #p0-353-p1p2-next."
    ),
    "governance_gw0_cycle1_closed": (
        "GW-0.1~0.4 문서·증빙·show-plan 정렬 주기 1차 완료·잠금 - "
        "EVIDENCE-20260423-327 · SPEC#gw-0-정렬-주기-1차-완료. "
        "우선 실착(별도 EVIDENCE): 328~332 + 331 매핑 + 332 admin UI(§14-1) (SPEC#step-3-싱글-소스-질문셋). "
        "see next_work_unit_step3_question_set, step3_question_set_single_source_roadmap. "
        "이후(잔여·333~, 337~342): 341 B §3(백필/시드), 342 B §4(구현 형태); 다음=동기 코드 전용 EVIDENCE; 338=2차 EVIDENCE(EVIDENCE_STEP3_B); 실구현=전용 EVIDENCE · §4.5; "
        "B안/IO/§5.4 합의·정의/스키마/코드 실수정·GW-0.4(가) 등 필요한 항목만 "
        "별도 착수·전용 EVIDENCE·해당 GW-0.x (가) · SPEC#이후-분기-고정."
    ),
    "governance_321_work_units": [
        "GW-0.1: §0 훑기 - 이후-분기-고정, C(R6) 닫힘(참조만), B안/IO/ROWS 비기본 표시; 범위·완료 판정 SPEC#gw-0-1-범위-완료; IMPLEMENTATION GW-0.1 EVIDENCE + show-plan 첫 bullet 1:1 (도메인 구현 없음).",
        "GW-0.2 (비기본): B안·IO·POST_278 §6.3·§5.4; 합의 전 src/** 변경 금지; "
        "[352] 본 주기 마감: 1·2 완료·(나); 신규 src·B안·§5.4 행·API_SPEC 강제 없음; 3 생략 4 미실시; "
        "SPEC#gw-0-2-범위-완료; EVIDENCE-324 + (가)/(나) + show-plan 둘째 1:1; "
        "향후 src 필요 시 별 EVIDENCE/PR (가) 재판정.",
        "GW-0.3 (비기본): §7 Step 3 질문셋·QUESTION_SET_DEFINITION·[320] 이후 궤도; "
        "범위·완료 판정 SPEC#gw-0-3-범위-완료; EVIDENCE-325 + 이번 주기 실착수(A)/(B) + 분기(가)/(나) + show-plan 셋째 bullet 1:1; "
        "질문셋 본 착수·src는 (가)에서만. "
        "[347] C 1차: #c-gw03-a-tier3-20260426 — (A) 문서·정렬만·(나) 분기·343~350 재오픈 없음. "
        "[347]3순 문서권 마감: #347-tier3-document-scope-closure-20260426.",
        "GW-0.4 (검증·조건부): 정의서·스키마·CaseStatus 실수정 시 verify + check-status --scope case (§4-1); "
        "범위·완료 판정 SPEC#gw-0-4-범위-완료; EVIDENCE-326 + 이번 주기 실착수(A)/(B) + 분기(가)/(나) + show-plan 넷째 bullet 1:1; "
        "수정 없으면 (나)·(A) 정렬만.",
    ],
    "phases": [
        {
            "phase": 1,
            "title": "도메인 기준문서 잠금",
            "items": [
                "상태값 정의서",
                "사건 라이프사이클 정의서",
                "권한정의서",
                "질문셋 정의서",
                "문서 템플릿 정의서",
            ],
        },
        {
            "phase": 2,
            "title": "AI 출력 기준 잠금",
            "items": [
                "AI 출력 정책서",
                "고지문/면책문구 정의서",
                "사건 요약 출력 명세서",
            ],
        },
        {
            "phase": 3,
            "title": "데이터 구조 문서화",
            "items": [
                "입력/출력 데이터 정의서",
                "첨부자료 분류 기준서",
                "DB 상세 설계 초안",
            ],
        },
        {
            "phase": 4,
            "title": "화면/API 기준 문서화",
            "items": [
                "화면 우선순위표",
                "API 명세 1차본",
            ],
        },
        {
            "phase": 5,
            "title": "정의서 대비 구현 역점검",
            "items": [
                "정의서 대비 구현 불일치 역점검표",
                "수정 우선순위표",
                "파일별 수정 대상 목록",
                "check-status --scope case 용 CASE_SCOPE_* 프리픽스와 실제 사건 디렉터리 구조 정합(누락·오탐 방지)",
            ],
        },
        {
            "phase": 6,
            "title": "구현 재정렬 패치",
            "items": [
                "role / permission 통합",
                "case status / lifecycle 통합",
                "question set / interview contract 통합",
                "document template / paragraph policy 통합",
                "API response contract 통합",
                "화면 문구/버튼/상태 라벨 통합",
            ],
        },
    ],
}

CANONICAL_REQUIRED_FILES = [
    "prisma/schema.prisma",
    "src/lib/definitions/case-status.ts",
]

LEGACY_TERMS = [
    "OPEN",
    "IN_PROGRESS",
    "DONE",
]

DEFAULT_SKIP_DIRS = {
    ".git",
    ".next",
    ".turbo",
    ".idea",
    ".vscode",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "__pycache__",
}

DEFAULT_TEXT_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".md",
    ".mdx",
    ".txt",
    ".py",
    ".prisma",
    ".yml",
    ".yaml",
    ".sql",
    ".sh",
    ".zsh",
}

# check-status --scope case 일 때만 스캔하는 경로(프로젝트 루트 기준 posix 상대경로).
# 사건(Case) 모델·API·UI·전이·정의 모듈 위주이며, prisma 마이그레이션 SQL 등은 제외한다.
CASE_SCOPE_EXACT_FILES = frozenset(
    {
        "prisma/schema.prisma",
    }
)
CASE_SCOPE_PREFIXES = (
    "src/lib/definitions/case-",
    "src/lib/case-",
    "src/lib/cases/",
    "src/features/cases/",
    "src/app/api/cases/",
    "src/app/(protected)/cases/",
    "src/components/cases/",
    "src/__tests__/lib/definitions/case-definitions",
    "src/__tests__/api/cases/",
    "src/__tests__/features/cases/",
)


@dataclass
class CanonicalCheckResult:
    ok: bool
    root: str
    found_files: Dict[str, bool]
    message: str


@dataclass
class LegacyFinding:
    path: str
    line_no: int
    term: str
    line: str


def eprint(*args: object) -> None:
    print(*args, file=sys.stderr)


def normalize_root(root: Optional[str]) -> Path:
    if root:
        return Path(root).expanduser().resolve()
    return Path.cwd().resolve()


def path_exists(root: Path, relative_path: str) -> bool:
    return (root / relative_path).exists()


def posix_relative(root: Path, file_path: Path) -> str:
    return file_path.resolve().relative_to(root.resolve()).as_posix()


def file_in_case_scope(root: Path, file_path: Path) -> bool:
    """사건(Case) 도메인으로 보는 경로만 True. --scope case 용."""

    try:
        rel = posix_relative(root, file_path)
    except ValueError:
        return False

    if rel in CASE_SCOPE_EXACT_FILES:
        return True

    for prefix in CASE_SCOPE_PREFIXES:
        p = prefix.rstrip("/")
        if rel == p or rel.startswith(prefix):
            return True

    return False


def check_canonical_sources(root: Path) -> CanonicalCheckResult:
    found = {p: path_exists(root, p) for p in CANONICAL_REQUIRED_FILES}
    ok = all(found.values())

    if ok:
        msg = (
            "[OK] 본선 기준 파일이 모두 존재합니다.\n"
            f" - {CANONICAL_REQUIRED_FILES[0]}\n"
            f" - {CANONICAL_REQUIRED_FILES[1]}\n"
            "상태 관련 비교/문서화/패치 검토를 진행할 수 있습니다."
        )
    else:
        missing = [p for p, exists in found.items() if not exists]
        msg = (
            "[경고] 본선 기준 파일이 모두 확인되지 않았습니다.\n"
            f"누락 파일: {', '.join(missing)}\n"
            "이 상태에서는 상태 정의 추출/비교를 성공으로 간주하지 않습니다.\n"
            "구 패치(aibeopchin_patchset 등)를 본선 정의로 착각하지 마십시오."
        )

    return CanonicalCheckResult(
        ok=ok,
        root=str(root),
        found_files=found,
        message=msg,
    )


def iter_text_files(root: Path, scope: str = "all") -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in DEFAULT_SKIP_DIRS]
        current_dir = Path(dirpath)

        for filename in filenames:
            path = current_dir / filename
            if path.suffix.lower() not in DEFAULT_TEXT_EXTENSIONS:
                continue
            if scope == "case" and not file_in_case_scope(root, path):
                continue
            yield path


def should_ignore_line(path: Path, line: str) -> bool:
    line_lower = line.lower()
    path_str = str(path).replace("\\", "/").lower()

    if "옛 표기" in line or "현행 코드 값" in line:
        return True

    if "mapping" in line_lower and "open" in line_lower:
        return True

    if "aibeopchin_patchset" in path_str:
        return True

    if "status_single_source_of_truth" in path_str:
        return True

    if "verify-canonical-sources" in path_str:
        return True

    return False


def find_legacy_terms(
    root: Path, legacy_terms: List[str], scope: str = "all"
) -> List[LegacyFinding]:
    findings: List[LegacyFinding] = []
    patterns = {term: re.compile(rf"\b{re.escape(term)}\b") for term in legacy_terms}

    for file_path in iter_text_files(root, scope=scope):
        try:
            text = file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            try:
                text = file_path.read_text(encoding="utf-8-sig")
            except Exception:
                continue
        except Exception:
            continue

        for idx, line in enumerate(text.splitlines(), start=1):
            if should_ignore_line(file_path, line):
                continue

            for term, pattern in patterns.items():
                if pattern.search(line):
                    findings.append(
                        LegacyFinding(
                            path=str(file_path.relative_to(root)),
                            line_no=idx,
                            term=term,
                            line=line.strip(),
                        )
                    )
    return findings


def render_plan() -> str:
    lines: List[str] = []
    lines.append(f"# {PROJECT_PLAN['project_name']} 진행 계획")
    lines.append("")
    lines.append("## 원칙")
    for principle in PROJECT_PLAN["principles"]:
        lines.append(f"- {principle}")

    lines.append("")
    lines.append("## MVP 흐름")
    for idx, step in enumerate(PROJECT_PLAN["mvp_flow"], start=1):
        lines.append(f"{idx}. {step}")

    dash37 = PROJECT_PLAN.get("dashboard_admin_3_7_regression")
    if dash37:
        lines.append("")
        lines.append("## 대시보드 3.7 — 관리자 회귀 점검 (배포 전 QA 확정표와 별도)")
        lines.append(dash37)

    dash38 = PROJECT_PLAN.get("dashboard_3_8_role_copy_snapshot")
    if dash38:
        lines.append("")
        lines.append("## 대시보드 3.8 — 역할별 문구 스냅샷 (배포 전 QA 확정표와 별도)")
        lines.append(dash38)

    dash39 = PROJECT_PLAN.get("dashboard_3_9_role_regression_checklist")
    if dash39:
        lines.append("")
        lines.append("## 대시보드 3.9 — 역할별 최종 회귀 체크리스트 (배포 전 QA 확정표와 별도)")
        lines.append(dash39)

    dash310 = PROJECT_PLAN.get("dashboard_3_10_demo_metrics_safety_check")
    if dash310:
        lines.append("")
        lines.append("## 대시보드 3.10 — demo metrics 유지·실서비스 경계 (배포 전 QA 확정표와 별도)")
        lines.append(dash310)

    dash311 = PROJECT_PLAN.get("dashboard_3_11_final_seal_summary")
    if dash311:
        lines.append("")
        lines.append("## 대시보드 3.11 — 3.x 최종 봉인 요약표 (배포 전 QA 확정표와 별도)")
        lines.append("- 기준 문서: docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md")
        lines.append("- 기준 증빙: [EVIDENCE-20260426-391]")
        lines.append(
            "- 목적: 대시보드 3.0~3.10 완료 흐름을 최종 봉인하고 "
            "QA 회신 대기 또는 별도 Phase 기준으로 전환"
        )
        lines.append(dash311)

    dash40 = PROJECT_PLAN.get("dashboard_4_0_predeploy_operation_check_phase")
    if dash40:
        lines.append("")
        lines.append("## 대시보드 4.0 — 배포 전 운영 점검 Phase (3.x 봉인 유지)")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_4_0_PREDEPLOY_OPERATION_CHECK_PHASE.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260426-392]")
        lines.append(
            "- 목적: 대시보드 3.x 봉인을 유지한 상태에서 "
            "배포 전 운영 점검 항목을 별도 Phase로 분리"
        )
        lines.append(dash40)

    dash41 = PROJECT_PLAN.get("dashboard_4_1_role_access_permission_checklist")
    if dash41:
        lines.append("")
        lines.append("## 대시보드 4.1 — 역할별 접근 / 권한 점검표 (3.x 봉인 유지)")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_4_1_ROLE_ACCESS_PERMISSION_CHECKLIST.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260426-393]")
        lines.append(
            "- 목적: 의뢰인 / 변호사 / 관리자 / 권한 불일치 / 비로그인 접근 점검 항목을 세분화"
        )
        lines.append(dash41)

    dash42 = PROJECT_PLAN.get("dashboard_4_2_predeploy_manual_qa_scenarios")
    if dash42:
        lines.append("")
        lines.append("## 대시보드 4.2 — 배포 전 수동 QA 시나리오표 (3.x 봉인 유지)")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_4_2_PREDEPLOY_MANUAL_QA_SCENARIOS.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260426-394]")
        lines.append(
            "- 목적: 공통 / 의뢰인 / 변호사 / 관리자 / restricted / demo metrics 경계를 "
            "브라우저 수동 QA 절차로 확인"
        )
        lines.append(dash42)

    dash43 = PROJECT_PLAN.get("dashboard_4_3_empty_error_state_manual_checklist")
    if dash43:
        lines.append("")
        lines.append("## 대시보드 4.3 — 빈 상태 / 오류 상태 수동 점검표 (3.x 봉인 유지)")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_4_3_EMPTY_ERROR_STATE_MANUAL_CHECKLIST.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260426-395]")
        lines.append(
            "- 목적: 빈 상태 / 제한 상태 / 로딩 상태 / 오류 상태 / demo metrics 경계를 "
            "배포 전 수동 점검 항목으로 분리"
        )
        lines.append(dash43)

    dash44 = PROJECT_PLAN.get("dashboard_4_4_predeploy_operator_final_checklist")
    if dash44:
        lines.append("")
        lines.append("## 대시보드 4.4 — 배포 전 운영자 최종 체크리스트 (3.x 봉인 유지)")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_4_4_PREDEPLOY_OPERATOR_FINAL_CHECKLIST.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260426-396]")
        lines.append(
            "- 목적: 4.0~4.3 운영 점검 문서를 배포 전 운영자 최종 확인표로 통합"
        )
        lines.append(dash44)

    dash45 = PROJECT_PLAN.get("dashboard_4_5_qa_closure_reflection_prep")
    if dash45:
        lines.append("")
        lines.append("## 대시보드 4.5 — QA closure 반영 준비표 (3.x 봉인 유지)")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_4_5_QA_CLOSURE_REFLECTION_PREP.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260426-397]")
        lines.append(
            "- 목적: QA 회신 수신 후 #evidence-20260428-predeploy-qa-closure에 "
            "무엇을 어떤 순서로 반영할지 사전 고정"
        )
        lines.append(dash45)

    dash46 = PROJECT_PLAN.get("dashboard_4_6_qa_pending_followup_tracker")
    if dash46:
        lines.append("")
        lines.append("## 대시보드 4.6 — QA 회신 대기 중 후속 보완 항목 분리표 (3.x 봉인 유지)")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260428-399]")
        lines.append(
            "- 목적: 실측 회신 전 후속 보완 항목을 FAIL/BLOCKED/N/A·문서/기능/운영으로 "
            "분류할 표 틀만 둠 — closure 공식 확정 표·회신 원문은 미기입"
        )
        lines.append(dash46)

    dash47 = PROJECT_PLAN.get("dashboard_4_7_ai_assisted_qa_evidence_reflection_design")
    if dash47:
        lines.append("")
        lines.append("## 대시보드 4.7 — QA/운영 실측 결과 AI 자동 반영 설계서")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_4_7_AI_ASSISTED_QA_EVIDENCE_REFLECTION_DESIGN.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260428-400]")
        lines.append(
            "- 목적: QA/운영 실측 결과를 AI가 자동 분석해 closure 초안과 "
            "follow-up 초안을 만들 수 있도록 운영 기준, 금지 기준, 사람 승인 절차를 고정한다."
        )
        lines.append(
            "- 핵심 원칙: AI는 최종 판정자가 아니며, 증빙 초안 작성자·분류자·보완 요청자 역할만 "
            "수행한다. 최종 확정은 사람 승인 후에만 가능하다."
        )
        lines.append(dash47)

    dash50 = PROJECT_PLAN.get("dashboard_5_0_ai_evidence_assistant_mvp_start")
    if dash50:
        lines.append("")
        lines.append("## 대시보드 5.0 — AI Evidence Assistant MVP 착수 기준서")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_5_0_AI_EVIDENCE_ASSISTANT_MVP_START.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260428-401]")
        lines.append(
            "- 목적: QA/운영 실측 원문을 AI가 분석해 closure 공식 확정 표 초안, "
            "회신 원문 정리본, 4.6 follow-up tracker 초안을 생성하는 관리자 보조 기능의 "
            "MVP 범위를 고정한다."
        )
        lines.append(
            "- 핵심 원칙: 5.0은 실제 구현이 아니라 5.1 구현 전 착수 기준이다. "
            "AI는 최종 판정자가 아니며, 공식 반영은 사람 승인 후에만 가능하다."
        )
        lines.append(dash50)
        lines.append("")
        lines.append("### 검증 명령 (5.0)")
        lines.append("npx tsc --noEmit")
        lines.append("npm run lint")
        lines.append("npm run verify:canonical-sources")
        lines.append("py -3 -m py_compile tools/aibeopchin_navigator.py")
        lines.append("")
        lines.append("### 5.0 완료 기준")
        lines.append(
            "대시보드 5.0 완료 판정: DASHBOARD_5_0…MVP_START.md 신규 추가·MVP 목적·포함/제외 "
            "기능·동작 흐름·입출력·판정/상태값·closure/회신/4.6 초안 기준·필드 누락/경고·"
            "파일 구조/API 후보·권한·보안·성공 기준 정리·[EVIDENCE-20260428-401]·"
            "dashboard_5_0…·render_plan 5.0 절·코드/API/DB/권한/dashboard 미변경·3.x 봉인·"
            "QA closure 미기입·tsc+lint+verify:canonical-sources+py_compile 통과."
        )
        lines.append("")
        lines.append("### 5.0 이후 방향")
        lines.append(
            "권장: (1) 대시보드 5.1a — Zod schema / renderer / analyzer 유틸 선행 구현 "
            "(5.1 일괄 시 화면·API·분석·렌더러 동시 엮임 위험 완화). "
            "이후 (2) 5.1b API route (3) 5.1c 관리자 화면 (4) 5.1d 복사/UX (5) 5.1e 검증·증빙·내비."
        )

    dash51 = PROJECT_PLAN.get("dashboard_5_1_ai_evidence_assistant_mvp_implementation")
    if dash51:
        lines.append("")
        lines.append("## 대시보드 5.1 — AI Evidence Assistant MVP 1차 구현 세트")
        lines.append("- 기준 증빙: [EVIDENCE-20260428-402]")
        lines.append(
            "- 목적: QA/운영 실측 원문을 분석하여 closure 공식 확정 표 초안, "
            "회신 원문 정리본, 4.6 follow-up tracker 초안을 생성하는 "
            "관리자 보조 화면과 분석 API를 구현한다."
        )
        lines.append(
            "- 범위: DB 저장 없음, 문서 자동 수정 없음, Git 자동 커밋 없음, "
            "사람 승인 전 공식 반영 없음. 관리자 전용(requireAdminApi)."
        )
        lines.append(dash51)
        lines.append("")
        lines.append("### 검증 명령 (5.1)")
        lines.append("npx tsc --noEmit")
        lines.append("npm run lint")
        lines.append("npm run verify:canonical-sources")
        lines.append("py -3 -m py_compile tools/aibeopchin_navigator.py")
        lines.append("")
        lines.append("### 5.1 완료 기준 (요약)")
        lines.append(
            "화면·API·schema·analyzer·renderer·복사·안내; DB/문서 자동/MVP 외 정책 미변경; "
            "3.x 봉인·closure 미기입 유지; tsc+lint+verify+py_compile 통과."
        )

    dash52 = PROJECT_PLAN.get("dashboard_5_2_ai_evidence_draft_storage_design")
    if dash52:
        lines.append("")
        lines.append("## 대시보드 5.2 — AI Evidence Draft 저장 구조 설계")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "DASHBOARD_5_2_AI_EVIDENCE_DRAFT_STORAGE_DESIGN.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260428-403]")
        lines.append(
            "- 목적: AI Evidence Assistant 분석 결과를 향후 Draft로 저장하고 "
            "승인 / 반려 / 보완 / 공식 반영까지 이어갈 수 있도록 저장 모델, 상태값, "
            "승인 기준, 감사로그 기준을 설계한다."
        )
        lines.append(
            "- 범위: 실제 DB schema 변경 없음, 마이그레이션 없음, 저장 API 구현 없음, "
            "문서 자동 수정 없음."
        )
        lines.append(dash52)
        lines.append("")
        lines.append("### 검증 명령 (5.2)")
        lines.append("npx tsc --noEmit")
        lines.append("npm run lint")
        lines.append("npm run verify:canonical-sources")
        lines.append("py -3 -m py_compile tools/aibeopchin_navigator.py")
        lines.append("")
        lines.append("### 5.2 완료 기준 (요약)")
        lines.append(
            "5.2 설계 MD·Draft 목적/상태/전이·모델·API·화면·승인·감사·403 증빙·"
            "navigator·코드·DB 미변경·검증 통과."
        )

    plan60 = PROJECT_PLAN.get("aibeopchin_6_0_case_package_share_lawyer_access_plan")
    if plan60:
        lines.append("")
        lines.append("## AI법친 6.0 — 사건 패키지 / 고유번호 공유 / 변호사 열람 연계 기획서")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "AIBEOPCHIN_6_0_CASE_PACKAGE_SHARE_LAWYER_ACCESS_PLAN.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-0-CASE-PACKAGE-SHARE-LAWYER-ACCESS-PLAN]")
        lines.append(
            "- 목적: 일반 사용자가 AI 질문 흐름으로 사건을 정리하고, "
            "변호사가 고유번호와 권한 승인으로 사건 패키지를 열람·다운로드할 수 있는 구조를 설계한다."
        )
        lines.append(
            "- 범위: 실제 Prisma schema 변경 없음, 신규 API 구현 없음, 화면 구현 없음, "
            "사건 패키지 / 고유번호 / 공유 동의 / 변호사 열람 구조만 기획서로 고정한다."
        )
        lines.append(plan60)

    plan61 = PROJECT_PLAN.get("aibeopchin_6_1_case_package_data_structure")
    if plan61:
        lines.append("")
        lines.append("## AI법친 6.1 — 사건 패키지 데이터 구조 / 생성 기준 설계")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "AIBEOPCHIN_6_1_CASE_PACKAGE_DATA_STRUCTURE.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-1-CASE-PACKAGE-DATA-STRUCTURE]")
        lines.append(
            "- 목적: 기존 Case / Attachment / Interview / Summary / LegalDocument 데이터를 "
            "변호사 검토용 사건 패키지 DTO로 조합하는 기준을 확정한다."
        )
        lines.append(
            "- 범위: Prisma schema 변경 없음, 신규 API 구현 없음, 신규 화면 구현 없음, "
            "데이터 구조 / 생성 기준 / public-safe DTO / 순수 builder만 고정한다."
        )
        lines.append(plan61)

    plan62 = PROJECT_PLAN.get("aibeopchin_6_2_case_package_code_consent_policy")
    if plan62:
        lines.append("")
        lines.append("## AI법친 6.2 — 고유번호 발급 정책 / 공유 동의 구조 설계")
        lines.append(
            "- 기준 문서: docs/project-governance/"
            "AIBEOPCHIN_6_2_CASE_PACKAGE_CODE_CONSENT_POLICY.md"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-2-CASE-PACKAGE-CODE-CONSENT-POLICY]")
        lines.append(
            "- 목적: 사건 패키지 공유를 위한 publicCode, accessToken, optionalPin, consent snapshot, "
            "shareStatus, access decision 기준을 확정한다."
        )
        lines.append(
            "- 범위: Prisma schema 변경 없음, 신규 API 구현 없음, 신규 화면 구현 없음, "
            "고유번호/동의/상태/접근 판정 정책과 순수 유틸만 고정한다."
        )
        lines.append(plan62)

    plan63 = PROJECT_PLAN.get("aibeopchin_6_3_case_package_share_prisma_api")
    if plan63:
        lines.append("")
        lines.append("## AI법친 6.3 — CasePackageShare Prisma 모델 / API 구현")
        lines.append(
            "- 기준 문서: docs/project-governance/IMPLEMENTATION_EVIDENCE.md "
            "#evidence-20260428-407"
        )
        lines.append("- 기준 증빙: [EVIDENCE-20260428-407]")
        lines.append(
            "- 목적: 사건 패키지 공유 정책을 실제 Prisma 모델, 공유 생성/목록/상세/취소 API, "
            "변호사 고유번호 조회 API로 연결한다."
        )
        lines.append(
            "- 범위: CasePackageShare / CasePackageAccessLog 추가, case-package 유틸 추가, "
            "의뢰인/변호사 공유 API 구현. 첨부 다운로드 완화, 문서 PDF API, 변호사 UI, 의뢰인 UI는 제외한다."
        )
        lines.append(
            "- 다음 실제 작업: 프로젝트 루트 .env.local 또는 셸 환경에 DATABASE_URL 설정 후 add-case-package-share migration을 실행하고, 이어서 6.4~6.8 런타임 검증을 수행한다."
        )
        lines.append(
            "- 현재 상태 잠금: .env.local 템플릿 생성 완료, 실제 DATABASE_URL 값 입력 대기."
        )
        lines.append(
            "- 고정 순서: 1) 실제 개발 DB DATABASE_URL 확보 2) 프로젝트 루트 .env.local 입력 3) add-case-package-share migration 실행 4) 6.4~6.8 런타임 검증 5) 성공 후 407~412 증빙을 런타임 검증 완료로 갱신."
        )
        lines.append(plan63)

    plan64 = PROJECT_PLAN.get("aibeopchin_6_4_client_share_settings_ui")
    if plan64:
        lines.append("")
        lines.append("## AI법친 6.4 — 의뢰인 공유 설정 화면 구현")
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-4-CLIENT-SHARE-SETTINGS-UI]")
        lines.append(
            "- 목적: 의뢰인이 사건 상세 화면에서 사건 패키지 공유 범위, 다운로드 권한, 만료일, PIN을 설정하고 고유번호를 발급·취소할 수 있게 한다."
        )
        lines.append(
            "- 범위: 의뢰인 공유 설정 UI와 기존 6.3 API 연결만 구현한다. 변호사 조회/열람 화면은 6.5로 분리한다."
        )
        lines.append(plan64)

    plan65 = PROJECT_PLAN.get("aibeopchin_6_5_lawyer_case_package_lookup_detail_ui")
    if plan65:
        lines.append("")
        lines.append("## AI법친 6.5 — 변호사 고유번호 조회 / 열람 화면 구현")
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-5-LAWYER-CASE-PACKAGE-LOOKUP-DETAIL-UI]")
        lines.append(
            "- 목적: 변호사가 고유번호와 선택형 PIN으로 사건 패키지를 조회하고, 허용된 범위 내에서 사건 요약·첨부자료 목록·문서 초안의 기초를 열람할 수 있게 한다."
        )
        lines.append(
            "- 범위: 변호사 lookup/detail 화면과 기존 6.3 API 연결만 구현한다. 첨부파일 실제 다운로드 권한 분리는 6.6으로 분리한다."
        )
        lines.append(plan65)

    plan66 = PROJECT_PLAN.get("aibeopchin_6_6_attachment_view_download_permissions")
    if plan66:
        lines.append("")
        lines.append("## AI법친 6.6 — 첨부파일 열람 / 다운로드 권한 분리")
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-6-ATTACHMENT-VIEW-DOWNLOAD-PERMISSIONS]")
        lines.append(
            "- 목적: 변호사 사건 패키지에서 첨부자료 목록 열람과 실제 파일 다운로드 권한을 분리하고, 다운로드 성공/차단 로그를 기록한다."
        )
        lines.append(
            "- 범위: allowAttachmentList / allowAttachmentDownload 분리, 다운로드 API, 로그 기록, 상세 화면 버튼 연결까지 구현한다. 사건 패키지 PDF는 6.8로 분리한다."
        )
        lines.append(plan66)

    plan67 = PROJECT_PLAN.get("aibeopchin_6_7_access_logs_revoke_enhancement")
    if plan67:
        lines.append("")
        lines.append("## AI법친 6.7 — 열람 로그 / 다운로드 로그 / 공유 취소 고도화")
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-7-ACCESS-LOGS-REVOKE-ENHANCEMENT]")
        lines.append(
            "- 목적: 공유별 열람/다운로드/차단 로그를 의뢰인이 확인하고, 공유 취소 사유를 기록할 수 있게 한다."
        )
        lines.append(
            "- 범위: access log API, 의뢰인 공유 패널 로그 표시, 취소 사유 입력, 취소 후 로그 새로고침까지 구현한다. 사건 패키지 PDF는 6.8로 분리한다."
        )
        lines.append(plan67)

    plan68 = PROJECT_PLAN.get("aibeopchin_6_8_case_package_summary_output")
    if plan68:
        lines.append("")
        lines.append("## AI법친 6.8 — 사건 패키지 PDF / 요약본 출력")
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-8-CASE-PACKAGE-PDF-SUMMARY]")
        lines.append(
            "- 목적: allowPackagePdf가 허용된 공유에 한해 public-safe 사건 패키지 요약본을 출력하고 다운로드 로그를 기록한다."
        )
        lines.append(
            "- 범위: 사건 요약, 첨부자료 목록, 문서 목록, 안전 고지만 출력한다. 첨부 원문, prompt, raw response, snapshot 전체는 출력하지 않는다."
        )
        lines.append(plan68)

    plan69 = PROJECT_PLAN.get("aibeopchin_6_9_privacy_security_consent_finalization")
    if plan69:
        lines.append("")
        lines.append("## AI법친 6.9 — 개인정보 / 보안 / 동의문구 최종 정리")
        lines.append("- 기준 증빙: [EVIDENCE-20260501-AIBEOPCHIN-6-9-PRIVACY-SECURITY-CONSENT-FINALIZATION]")
        lines.append(
            "- 목적: 사건 패키지 공유 기능 전체의 개인정보 최소노출, 공유 동의, 변호사 열람 고지, 출력물 제외 항목, 변호사법 오인 방지 문구를 최종 정리한다."
        )
        lines.append(
            "- 범위: 문서·공용 상수·검증 helper·기존 UI/출력물 문구 연결만 수행한다. Prisma/API/화면 신규 구현은 하지 않는다."
        )
        lines.append(plan69)

    pq = PROJECT_PLAN.get("predeploy_qa_closure_procedure")
    plan610 = PROJECT_PLAN.get("aibeopchin_6_10_qa_regression_predeploy")
    if plan610:
        lines.append("")
        lines.append("## AI법친 6.10 — QA / 회귀 / 배포 전 점검")
        lines.append("- 기준 증빙: [EVIDENCE-20260503-AIBEOPCHIN-6-10-QA-REGRESSION-PREDEPLOY]")
        lines.append(
            "- 목적: 6.0~6.9 사건 패키지 공유 기능 전체를 자동 회귀 + 수동 QA로 잠그고 배포 전 점검 체계를 확립한다."
        )
        lines.append(
            "- 범위: 회귀 runner / 수동 QA JSON / 수동 QA 검증 runner / package.json 스크립트 추가. 신규 기능 구현 없음."
        )
        lines.append(plan610)

    plan612 = PROJECT_PLAN.get("aibeopchin_6_12_binary_pdf_engine")
    if plan612:
        lines.append("")
        lines.append("## AI법친 6.12 — binary PDF 엔진 검토 / 적용")
        lines.append("- 기중 문서: docs/project-governance/AIBEOPCHIN_6_12_BINARY_PDF_ENGINE.md")
        lines.append("- 기중 증빠: [EVIDENCE-20260503-AIBEOPCHIN-6-12-BINARY-PDF-ENGINE]")
        lines.append(
            "- 목적: 6.8 public-safe HTML 요약본을 Playwright 기반 binary PDF 응답으로 고도화한다."
        )
        lines.append(
            "- 범위: PDF 엔진/응답만 변경한다. 출력물 포함·제외 정책, 권한 정책, 로그 정책은 변경하지 않는다."
        )
        lines.append(plan612)

    plan19a = PROJECT_PLAN.get("aibeopchin_19_a_data_retention_policy_constitution")
    if plan19a:
        lines.append("")
        lines.append("## AI법친 19-A — Data Retention Policy (헌법 · purge job 전 SSOT)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19A-DATA-RETENTION-POLICY]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-data-governance-phase19a"
        )
        lines.append(
            "- 로드맵: docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md"
        )
        lines.append(
            "- 원칙: 실제 purge job 금지 — registry·validator만. 19-B~F는 19-A 이후."
        )
        lines.append(plan19a)

    plan19b = PROJECT_PLAN.get("aibeopchin_19_b_pii_legal_redaction_output_paths")
    if plan19b:
        lines.append("")
        lines.append("## AI법친 19-B — PII / Legal Sensitive Redaction (운영 출력 경로)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19B-PII-LEGAL-REDACTION]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-data-governance-phase19b"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md"
        )
        lines.append(plan19b)

    plan19c = PROJECT_PLAN.get("aibeopchin_19_c_audit_log_retention_export")
    if plan19c:
        lines.append("")
        lines.append("## AI법친 19-C — AuditLog Retention & Export")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19C-AUDIT-LOG-RETENTION-EXPORT]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-data-governance-phase19c"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_AUDIT_LOG_RETENTION_EXPORT_RUNBOOK.md"
        )
        lines.append(plan19c)

    plan19d = PROJECT_PLAN.get("aibeopchin_19_d_attachment_lifecycle_expiry")
    if plan19d:
        lines.append("")
        lines.append("## AI법친 19-D — Attachment Lifecycle / Expiry")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19D-ATTACHMENT-LIFECYCLE-EXPIRY]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-data-governance-phase19d"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md"
        )
        lines.append(plan19d)

    plan19e = PROJECT_PLAN.get("aibeopchin_19_e_admin_data_governance_visibility")
    if plan19e:
        lines.append("")
        lines.append("## AI법친 19-E — Admin Data Governance Visibility")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19E-ADMIN-VISIBILITY]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-data-governance-phase19e"
        )
        lines.append(
            "- Console: /admin/operations/data-governance"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_VISIBILITY_RUNBOOK.md"
        )
        lines.append(plan19e)

    plan19f = PROJECT_PLAN.get("aibeopchin_19_f_data_governance_rc_purge_unlock")
    if plan19f:
        lines.append("")
        lines.append("## AI법친 19-F — Data Governance RC / Purge Execution Unlock")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19F-RC]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-data-governance-rc"
        )
        lines.append(
            "- Summary: docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md"
        )
        lines.append(plan19f)

    plan20 = PROJECT_PLAN.get("aibeopchin_product_20_real_external_messaging")
    if plan20:
        lines.append("")
        lines.append("## Product Phase 20 — Real External Messaging (1순위 · 다음 착수)")
        lines.append(
            "- 로드맵: docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md"
        )
        lines.append(
            "- 20-A adapter contract · 20-B email · 20-C kakao · 20-D webhook · 20-E secure delivery · 20-F RC"
        )
        lines.append(
            "- 선행(완료): 15-F · 18-B · 19-B/F · Phase 17 triage"
        )
        lines.append("")
        lines.append("## Product Phase 20-A — Adapter Contract (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20A-ADAPTER-CONTRACT]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-real-messaging-phase20a"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md"
        )
        lines.append(
            "- 후속(완료): 20-B Email Adapter"
        )
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20B-EMAIL-ADAPTER]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-real-messaging-phase20b"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md"
        )
        lines.append(
            "- 후속(완료): 20-C Kakao Adapter"
        )
        lines.append("")
        lines.append("## Product Phase 20-C — Kakao Adapter (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20C-KAKAO-ADAPTER]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-real-messaging-phase20c"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md"
        )
        lines.append(
            "- 후속(완료): 20-D Webhook Status Sync"
        )
        lines.append("")
        lines.append("## Product Phase 20-D — Webhook / Status Sync (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20D-WEBHOOK-STATUS-SYNC]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-real-messaging-phase20d"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md"
        )
        lines.append(
            "- 다음: 20-E Secure Delivery Integration"
        )
        lines.append("")
        lines.append("## Product Phase 20-E — Secure Delivery Integration (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20E-SECURE-DELIVERY-INTEGRATION]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-real-messaging-phase20e"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_REAL_MESSAGING_SECURE_DELIVERY_INTEGRATION_RUNBOOK.md"
        )
        lines.append(
            "- 다음: 20-F Real Messaging RC"
        )
        lines.append("")
        lines.append("## Product Phase 20-F — Real Messaging RC (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-real-messaging-rc"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_REAL_MESSAGING_RC_RUNBOOK.md"
        )
        lines.append(
            "- Lock summary: docs/platform/AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md"
        )
        lines.append(
            "- 다음: Product Phase 21 Client Mobile / PWA"
        )
        lines.append(plan20)

    plan21 = PROJECT_PLAN.get("aibeopchin_product_21_client_mobile_pwa")
    if plan21:
        lines.append("")
        lines.append("## Product Phase 21 — Client Mobile / PWA (2순위 · 착수)")
        lines.append(
            "- 21-A baseline · 21-B upload · 21-C PWA · 21-D push surface · 21-E a11y smoke · 21-F RC"
        )
        lines.append("")
        lines.append("## Product Phase 21-A — Mobile Client Portal Baseline (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21A-PORTAL-BASELINE]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-client-mobile-phase21a"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md"
        )
        lines.append(
            "- 다음: 21-D Push-ready Notification Surface"
        )
        lines.append("")
        lines.append("## Product Phase 21-B — Mobile Upload UX (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21B-UPLOAD-UX]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-client-mobile-phase21b"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md"
        )
        lines.append(
            "- 다음: 21-E Mobile Accessibility / Low-end Device Smoke"
        )
        lines.append("")
        lines.append("## Product Phase 21-C — PWA Install / Home Screen (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21C-PWA-INSTALL]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-client-mobile-phase21c"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md"
        )
        lines.append(
            "- 다음: 21-F Client Mobile / PWA RC"
        )
        lines.append("")
        lines.append("## Product Phase 21-D — Push-ready Notification Surface (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21D-PUSH-NOTIFICATION-SURFACE]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-client-mobile-phase21d"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md"
        )
        lines.append(
            "- 다음: Product Phase 22 Tenant / Plan / Metering"
        )
        lines.append("")
        lines.append("## Product Phase 21-E — Mobile Accessibility / Low-end Device Smoke (완료)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21E-ACCESSIBILITY-SMOKE]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-client-mobile-phase21e"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_CLIENT_MOBILE_ACCESSIBILITY_SMOKE_RUNBOOK.md"
        )
        lines.append(
            "- 다음: Product Phase 22 Tenant / Plan / Metering"
        )
        lines.append("")
        lines.append("## Product Phase 21-F — Client Mobile / PWA RC (완료 · Phase 21 LOCKED)")
        lines.append(
            "- 기준 증빙: [EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC]"
        )
        lines.append(
            "- 검증: npm run verify:aibeopchin-client-mobile-rc"
        )
        lines.append(
            "- Lock summary: docs/platform/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md"
        )
        lines.append(
            "- Runbook: docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_RUNBOOK.md"
        )
        lines.append(
            "- 다음: Product Phase 22 Tenant / Plan / Metering"
        )
        lines.append(plan21)

    plan22 = PROJECT_PLAN.get("aibeopchin_product_22_tenant_plan_metering")
    if plan22:
        lines.append("")
        lines.append("## Product Phase 22 — Tenant / Plan / Metering (3순위)")
        lines.append(plan22)

    plan23 = PROJECT_PLAN.get("aibeopchin_product_23_ai_quality_case_pack")
    if plan23:
        lines.append("")
        lines.append("## Product Phase 23 — AI Quality / Case Pack (4순위 · 중기)")
        lines.append(plan23)

    plan24 = PROJECT_PLAN.get("aibeopchin_product_24_litigation_operations")
    if plan24:
        lines.append("")
        lines.append("## Product Phase 24 — Litigation Operations")
        lines.append(plan24)

    plan25 = PROJECT_PLAN.get("aibeopchin_product_25_production_launch")
    if plan25:
        lines.append("")
        lines.append("## Product Phase 25 — Production Launch")
        lines.append(plan25)

    plan26 = PROJECT_PLAN.get("aibeopchin_product_26_pilot_launch")
    if plan26:
        lines.append("")
        lines.append("## Product Phase 26 — Pilot Launch")
        lines.append(plan26)

    plan27 = PROJECT_PLAN.get("aibeopchin_product_27_pilot_operations")
    if plan27:
        lines.append("")
        lines.append("## Product Phase 27 — Pilot Operations")
        lines.append(plan27)

    plan28 = PROJECT_PLAN.get("aibeopchin_product_28_paid_conversion_scale")
    if plan28:
        lines.append("")
        lines.append("## Product Phase 28 — Paid Conversion / Scale")
        lines.append(plan28)

    plan29 = PROJECT_PLAN.get("aibeopchin_product_29_revenue_ops_customer_success")
    if plan29:
        lines.append("")
        lines.append("## Product Phase 29 — Revenue Ops / Customer Success")
        lines.append(plan29)

    plan30 = PROJECT_PLAN.get("aibeopchin_product_30_enterprise_scale")
    if plan30:
        lines.append("")
        lines.append("## Product Phase 30 — Enterprise Scale")
        lines.append(plan30)

    plan31 = PROJECT_PLAN.get("aibeopchin_product_31_partner_ecosystem_marketplace")
    if plan31:
        lines.append("")
        lines.append("## Product Phase 31 — Partner Ecosystem / Marketplace Readiness")
        lines.append(plan31)

    plan32 = PROJECT_PLAN.get("aibeopchin_product_32_enterprise_security_compliance")
    if plan32:
        lines.append("")
        lines.append("## Product Phase 32 — Enterprise Security / Compliance Certification Readiness")
        lines.append(plan32)

    plan33 = PROJECT_PLAN.get("aibeopchin_product_33_public_trust_marketing_launch")
    if plan33:
        lines.append("")
        lines.append("## Product Phase 33 — Public Trust / Marketing Launch")
        lines.append(plan33)

    plan34 = PROJECT_PLAN.get("aibeopchin_product_34_sales_pipeline_deal_desk")
    if plan34:
        lines.append("")
        lines.append("## Product Phase 34 — Sales Pipeline / Deal Desk")
        lines.append(plan34)

    plan35 = PROJECT_PLAN.get("aibeopchin_product_35_contracting_legal_ops")
    if plan35:
        lines.append("")
        lines.append("## Product Phase 35 — Contracting / Legal Ops")
        lines.append(plan35)

    plan36 = PROJECT_PLAN.get("aibeopchin_product_36_implementation_readiness")
    if plan36:
        lines.append("")
        lines.append("## Product Phase 36 — Implementation Readiness")
        lines.append(plan36)

    plan37 = PROJECT_PLAN.get("aibeopchin_product_37_customer_go_live_adoption")
    if plan37:
        lines.append("")
        lines.append("## Product Phase 37 — Customer Go-Live / Adoption")
        lines.append(plan37)

    plan38 = PROJECT_PLAN.get("aibeopchin_product_38_long_term_customer_success")
    if plan38:
        lines.append("")
        lines.append("## Product Phase 38 — Long-term Customer Success")
        lines.append(plan38)

    plan39 = PROJECT_PLAN.get("aibeopchin_product_39_strategic_account_expansion")
    if plan39:
        lines.append("")
        lines.append("## Product Phase 39 — Strategic Account Expansion")
        lines.append(plan39)

    plan40 = PROJECT_PLAN.get("aibeopchin_product_40_legal_outcome_assessment")
    if plan40:
        lines.append("")
        lines.append("## Product Phase 40 — Judgment-Grounded Legal Outcome Assessment")
        lines.append(plan40)

    plan41 = PROJECT_PLAN.get("aibeopchin_product_41_sentencing_outcome_assessment")
    if plan41:
        lines.append("")
        lines.append("## Product Phase 41 — Judgment-Grounded Sentencing Outcome Assessment")
        lines.append(plan41)

    plan42 = PROJECT_PLAN.get("aibeopchin_product_42_evidence_integrity")
    if plan42:
        lines.append("")
        lines.append("## Product Phase 42 — Evidence Integrity / Chain of Custody")
        lines.append(plan42)

    plan43 = PROJECT_PLAN.get("aibeopchin_product_43_claim_evidence_judgment_graph")
    if plan43:
        lines.append("")
        lines.append("## Product Phase 43 — Claim-Evidence-Judgment Graph")
        lines.append(plan43)

    plan44 = PROJECT_PLAN.get("aibeopchin_product_44_court_ready_case_record_pack")
    if plan44:
        lines.append("")
        lines.append("## Product Phase 44 — Court-Ready Case Record Pack")
        lines.append(plan44)

    plan45 = PROJECT_PLAN.get("aibeopchin_product_45_judicial_transparency_explainability")
    if plan45:
        lines.append("")
        lines.append("## Product Phase 45 — Judicial Transparency / Explainability Layer")
        lines.append(plan45)

    plan46 = PROJECT_PLAN.get("aibeopchin_product_46_neutral_litigation_review_pack")
    if plan46:
        lines.append("")
        lines.append("## Product Phase 46 — Neutral Litigation Review Pack")
        lines.append(plan46)

    plan47 = PROJECT_PLAN.get("aibeopchin_product_47_legal_reliability")
    if plan47:
        lines.append("")
        lines.append("## Product Phase 47 — Legal Reliability RC")
        lines.append(plan47)

    plan48 = PROJECT_PLAN.get("aibeopchin_product_48_legal_reliability_lawyer_workbench")
    if plan48:
        lines.append("")
        lines.append("## Product Phase 48 — Legal Reliability Lawyer Workbench UX")
        lines.append(plan48)

    plan49 = PROJECT_PLAN.get("aibeopchin_product_49_legal_reliability_action_loop")
    if plan49:
        lines.append("")
        lines.append("## Product Phase 49 — Legal Reliability Action Loop")
        lines.append(plan49)

    plan50 = PROJECT_PLAN.get("aibeopchin_product_50_legal_reliability_action_operations")
    if plan50:
        lines.append("")
        lines.append("## Product Phase 50 — Legal Reliability Action Operations")
        lines.append(plan50)

    plan51 = PROJECT_PLAN.get("aibeopchin_product_51_legal_reliability_production_readiness")
    if plan51:
        lines.append("")
        lines.append("## Product Phase 51 — Legal Reliability Production Readiness")
        lines.append(plan51)

    plan52 = PROJECT_PLAN.get("aibeopchin_product_52_legal_reliability_staging_live_validation")
    if plan52:
        lines.append("")
        lines.append("## Product Phase 52 — Legal Reliability Staging Live Validation")
        lines.append(plan52)

    plan53 = PROJECT_PLAN.get("aibeopchin_product_53_legal_reliability_production_go_live_control")
    if plan53:
        lines.append("")
        lines.append("## Product Phase 53 — Legal Reliability Production Go-Live Control")
        lines.append(plan53)

    plan54 = PROJECT_PLAN.get("aibeopchin_product_54_legal_reliability_production_stabilization")
    if plan54:
        lines.append("")
        lines.append("## Product Phase 54 — Legal Reliability Commercial Production Stabilization")
        lines.append(plan54)

    plan59 = PROJECT_PLAN.get("aibeopchin_product_59_gongbuho_intelligence_layer")
    if plan59:
        lines.append("")
        lines.append("## Product Phase 59 — Gongbuho Intelligence Layer")
        lines.append(plan59)

    plan611 = PROJECT_PLAN.get("aibeopchin_6_11_admin_case_package_share_dashboard")
    if plan611:
        lines.append("")
        lines.append("## AI법친 6.11 — 관리자 공유 현황 화면 구현")
        lines.append("- 기중 증빠: [EVIDENCE-20260503-AIBEOPCHIN-6-11-ADMIN-CASE-PACKAGE-SHARE-DASHBOARD]")
        lines.append(
            "- 목적: 관리자가 사건 패키지 공유 현황, 상태, 권한, 위험 배지, 접근 로그를 운영 관점에서 확인할 수 있게 한다."
        )
        lines.append(
            "- 범위: 공유 목록/상세 API 및 화면 구현. 공유 강제 변경, 삭제, 관리자 대리 다운로드는 미구현."
        )
        lines.append(plan611)

    pq = PROJECT_PLAN.get("predeploy_qa_closure_procedure")
    if pq:
        lines.append("")
        lines.append("## 배포 전 QA — closure 절차 (증빙·운영)")
        lines.append(
            "- 증빙: [EVIDENCE-20260428-398] — "
            "IMPLEMENTATION_EVIDENCE.md #evidence-20260428-predeploy-qa-closure"
        )
        lines.append(
            "- 앵커: #predeploy-qa-1-4 · #predeploy-qa-message-copy · "
            "#predeploy-qa-official-confirm · #predeploy-qa-sakjeon-20260428"
        )
        lines.append(pq)

    baseline = PROJECT_PLAN.get("phase1_start_baseline")
    if baseline:
        lines.append("")
        lines.append("## Phase 1 시작 기준선 (show-plan·Batch 공통)")
        lines.append(baseline)

    post_320 = PROJECT_PLAN.get("post_file_realign_320_baseline")
    if post_320:
        lines.append("")
        lines.append("## [320] 이후 - SPEC §0 / 거버넌스 차기 (show-plan / 증빙과 동일 순서)")
        lines.append(post_320)

    gw = PROJECT_PLAN.get("governance_321_work_units")
    if gw:
        lines.append("")
        lines.append(
            "## [321] 기준 - 거버넌스 실작업 단위 (GW-0.1~0.4, 321/322, GW-0.1=[323], "
            "GW-0.2(비기본)=[324]·#gw-0-2-범위-완료, "
            "GW-0.3(비기본)=[325]·#gw-0-3-범위-완료, "
            "GW-0.4(검증·조건부)=[326]·#gw-0-4-범위-완료, "
            "정렬1차(잠금)=[327]·#gw-0-정렬-주기-1차-완료)"
        )
        for item in gw:
            lines.append(f"- {item}")

    gw0_c1 = PROJECT_PLAN.get("governance_gw0_cycle1_closed")
    if gw0_c1:
        lines.append("")
        lines.append("## GW-0.1~0.4 정렬 주기 1차 완료 (잠금)")
        lines.append(gw0_c1)

    nwu = PROJECT_PLAN.get("next_work_unit_step3_question_set")
    if nwu:
        lines.append("")
        lines.append("## [327] 이후 - Step 3 질문셋 본착수 (EVIDENCE-328, next_work_unit_step3_question_set)")
        lines.append(nwu)

    p348t = PROJECT_PLAN.get("post_348_step3_tier1")
    if p348t:
        lines.append("")
        lines.append(
            "## [348] 1순위 — Step 3 잔여·운용 (EVIDENCE-20260425-348, post_348_step3_tier1)"
        )
        lines.append(p348t)

    p349c = PROJECT_PLAN.get("post_349_step3_tier1_code")
    if p349c:
        lines.append("")
        lines.append(
            "## [349] 1순위 — 코드·시드·자동검·런타임 전용 (EVIDENCE-20260425-349, post_349_step3_tier1_code)"
        )
        lines.append(p349c)

    p351r = PROJECT_PLAN.get("post_351_step3_tier1_reaudit")
    if p351r:
        lines.append("")
        lines.append(
            "## [351] — 1순 종료 판정 (이후 2순 [352] 마감·3순으로 이동) (EVIDENCE-20260426-351, post_351_step3_tier1_reaudit)"
        )
        lines.append(p351r)

    p352g = PROJECT_PLAN.get("post_352_gw02_document_agreement")
    if p352g:
        lines.append("")
        lines.append(
            "## [352] — [347] 2순 GW-0.2 본 주기 (나) 마감 (EVIDENCE-20260426-352, post_352_gw02_document_agreement)"
        )
        lines.append(p352g)

    p352t3 = PROJECT_PLAN.get("post_352_next_347_tier3_alignment")
    if p352t3:
        lines.append("")
        lines.append(
            "## [347] 3순위 — ALIGNMENT / Case·인터뷰 잔여 (post_352_next_347_tier3_alignment)"
        )
        lines.append(p352t3)

    p345r = PROJECT_PLAN.get("post_345_step3_remaining")
    if p345r:
        lines.append("")
        lines.append(
            "## [346] 종료 · 후속 ([347]+) (EVIDENCE-346, post_345_step3_remaining)"
        )
        lines.append(p345r)

    p347f = PROJECT_PLAN.get("post_347_step3_followup")
    if p347f:
        lines.append("")
        lines.append(
            "## [347]+ — 후속 개설 (EVIDENCE-20260425-347, post_347_step3_followup)"
        )
        lines.append(p347f)

    ssrc = PROJECT_PLAN.get("step3_question_set_single_source_roadmap")
    if ssrc:
        lines.append("")
        lines.append("## Step 3 - 싱글 소스 (EVIDENCE-329, step3_question_set_single_source_roadmap)")
        lines.append(ssrc)

    lines.append("")
    lines.append("## 실행 단계")
    for phase in PROJECT_PLAN["phases"]:
        lines.append(f"### Phase {phase['phase']}. {phase['title']}")
        for item in phase["items"]:
            lines.append(f"- {item}")
        lines.append("")

    return "\n".join(lines).strip() + "\n"


def save_project_plan(root: Path) -> Path:
    target_dir = root / ".aibeopchin"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / "project_plan.json"
    target.write_text(
        json.dumps(PROJECT_PLAN, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return target


def make_brief(
    root: Path,
    phase: Optional[int],
    done_items: List[str],
    next_items: List[str],
    output_path: Optional[str],
    notes: List[str],
) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    phase_title = None
    if phase is not None:
        for p in PROJECT_PLAN["phases"]:
            if p["phase"] == phase:
                phase_title = p["title"]
                break

    lines: List[str] = []
    lines.append("# NEXT_SESSION_BRIEF")
    lines.append("")
    lines.append(f"- 생성 시각: {now}")
    lines.append(f"- 프로젝트: {PROJECT_PLAN['project_name']}")
    if phase_title:
        lines.append(f"- 현재 Phase: {phase} / {phase_title}")
    elif phase is not None:
        lines.append(f"- 현재 Phase: {phase}")
    lines.append("")
    lines.append("## 오늘 완료")
    if done_items:
        for item in done_items:
            lines.append(f"- {item}")
    else:
        lines.append("- 없음")

    lines.append("")
    lines.append("## 다음 작업 1순위")
    if next_items:
        for item in next_items:
            lines.append(f"- {item}")
    else:
        lines.append("- 상태값 정의서 작성")

    lines.append("")
    lines.append("## 고정 원칙")
    for principle in PROJECT_PLAN["principles"]:
        lines.append(f"- {principle}")

    lines.append("")
    lines.append("## 주의할 점")
    caution_items = [
        "verify-canonical-sources 통과 전 결과물은 현행 기준으로 인정하지 않음",
        "구 패치셋(aibeopchin_patchset 등)을 본선 정의로 오인하지 않음",
        "옛 용어가 필요한 경우 반드시 매핑표를 붙인 뒤 사용",
        "새 기능 추가보다 기준문서 잠금이 우선",
    ]
    for item in caution_items:
        lines.append(f"- {item}")

    if notes:
        lines.append("")
        lines.append("## 추가 메모")
        for note in notes:
            lines.append(f"- {note}")

    lines.append("")
    lines.append("## 다음 세션 시작 순서")
    lines.append("1. npm run verify:canonical-sources")
    lines.append(
        "2. python tools/aibeopchin_navigator.py check-status [--scope all|case]"
    )
    lines.append("3. 현재 Phase 확인")
    lines.append("4. 다음 작업 1순위부터 재개")
    lines.append("")

    content = "\n".join(lines)

    if output_path:
        target = root / output_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")

    return content


def command_show_plan(args: argparse.Namespace) -> int:
    root = normalize_root(args.root)
    print(render_plan(), end="")

    saved = save_project_plan(root)
    print(f"[INFO] 프로젝트 계획 JSON 저장: {saved}")
    return 0


def command_check_status(args: argparse.Namespace) -> int:
    root = normalize_root(args.root)
    scope = args.scope

    canonical = check_canonical_sources(root)
    print(canonical.message)

    if not canonical.ok:
        return 1

    print("")
    print("[안내] check-status는 OPEN/IN_PROGRESS/DONE을 단어 경계로 찾는 휴리스틱입니다.")
    print(
        "  - --scope all: 저장소 전체(알림·OPS 등 다른 도메인 문자열도 대량 포함될 수 있음)"
    )
    print(
        "  - --scope case: 사건(Case) 관련 경로만 스캔(사건 상태 정리 점검에 더 가깝게 사용)"
    )
    print(f"  - 현재 스코프: {scope}")
    print("")

    findings = find_legacy_terms(root, LEGACY_TERMS, scope=scope)

    if not findings:
        print("[OK] 구 상태명 혼용이 발견되지 않았습니다.")
        return 0

    print(f"[경고] 구 상태명 혼용 {len(findings)}건 발견")
    for finding in findings[:200]:
        print(
            f"- {finding.path}:{finding.line_no} | {finding.term} | {finding.line}"
        )

    print(
        "[안내] 위 항목이 매핑표/인용/구버전 기록이 아니라면 현행 상태명으로 정리하십시오."
    )
    return 1


def command_make_brief(args: argparse.Namespace) -> int:
    root = normalize_root(args.root)

    content = make_brief(
        root=root,
        phase=args.phase,
        done_items=args.done or [],
        next_items=args.next_items or [],
        output_path=args.output,
        notes=args.note or [],
    )

    print(content)
    if args.output:
        print(f"[INFO] 브리핑 저장 완료: {root / args.output}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="AI법친 프로젝트 진행 내비게이터"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    p_show = subparsers.add_parser(
        "show-plan",
        help="고정 계획/순서표 출력",
    )
    p_show.add_argument(
        "--root",
        help="프로젝트 루트 경로(기본값: 현재 작업 디렉터리)",
    )
    p_show.set_defaults(func=command_show_plan)

    p_check = subparsers.add_parser(
        "check-status",
        help="구 상태명 혼용 및 본선 기준 파일 존재 여부 검사",
        description=(
            "본선 기준 파일 존재 확인 후, OPEN/IN_PROGRESS/DONE 토큰을 휴리스틱으로 검색한다. "
            "기본(scope all)은 저장소 전체라 알림·OPS 등 비사건 도메인도 걸린다. "
            "사건 상태만 보려면 --scope case."
        ),
    )
    p_check.add_argument(
        "--root",
        help="프로젝트 루트 경로(기본값: 현재 작업 디렉터리)",
    )
    p_check.add_argument(
        "--scope",
        choices=("all", "case"),
        default="all",
        help=(
            "검색 범위: all=전체 저장소, case=사건 API·컴포넌트·정의·스키마 등 일부 경로만"
        ),
    )
    p_check.set_defaults(func=command_check_status)

    p_brief = subparsers.add_parser(
        "make-brief",
        help="다음 세션 브리핑 초안 생성",
    )
    p_brief.add_argument(
        "--root",
        help="프로젝트 루트 경로(기본값: 현재 작업 디렉터리)",
    )
    p_brief.add_argument(
        "--phase",
        type=int,
        help="현재 진행 Phase 번호",
    )
    p_brief.add_argument(
        "--done",
        action="append",
        help="오늘 완료한 항목(여러 번 사용 가능)",
    )
    p_brief.add_argument(
        "--next",
        dest="next_items",
        action="append",
        help="다음 작업 1순위 항목(여러 번 사용 가능)",
    )
    p_brief.add_argument(
        "--note",
        action="append",
        help="추가 메모(여러 번 사용 가능)",
    )
    p_brief.add_argument(
        "--output",
        help="출력 파일 경로 예: docs/project-governance/NEXT_SESSION_BRIEF.md",
    )
    p_brief.set_defaults(func=command_make_brief)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        return args.func(args)
    except KeyboardInterrupt:
        eprint("\n[중단] 사용자가 작업을 중단했습니다.")
        return 130
    except Exception as exc:
        eprint(f"[오류] {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
