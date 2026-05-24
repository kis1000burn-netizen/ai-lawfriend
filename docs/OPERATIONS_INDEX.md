# OPERATIONS_INDEX.md

## AI법친 운영 문서 인덱스

> **파일명**: `docs/OPERATIONS_INDEX.md`  
> **목적**: 운영 관련 문서를 한곳에서 찾고, 상황별로 어떤 문서를 먼저 볼지 빠르게 판단하기 위한 인덱스  
> **루트 세트**: [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) · [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md) · [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

---

## 1. 문서 목적

이 문서는 AI법친 프로젝트의 운영 관련 문서를 한곳에서 찾고, 상황에 따라 어떤 문서를 먼저 봐야 하는지 빠르게 판단할 수 있도록 만든 운영 문서 인덱스입니다.

이번 인덱스 문서의 목적은 다음과 같습니다.

- 운영 문서의 역할을 명확히 구분
- 장애 대응, 패치 검수, 배포 전 확인 흐름을 빠르게 연결
- 운영 담당자 또는 후속 작업자가 필요한 문서를 즉시 찾을 수 있도록 정리
- 문서 간 중복 확인 시간을 줄이고, 실제 대응 순서를 단순화

---

## 2. 문서 구성

현재 운영 문서 세트는 아래와 같이 구성됩니다. (프로젝트 루트 기준)

- [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)
- [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

**AI Core · predeploy 운영 (2026-05-23)**

- [AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md](./operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md)
- [DB_MIGRATION_CHRONOLOGY.md](./operations/DB_MIGRATION_CHRONOLOGY.md)
- [STAGING_SECRETS_CHECKLIST.md](./operations/STAGING_SECRETS_CHECKLIST.md)
- [STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md](./operations/STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md) — **Phase A (다음)**
- [AIBEOPCHIN_STAGING_DEPLOY_READINESS_RUNBOOK.md](./operations/AIBEOPCHIN_STAGING_DEPLOY_READINESS_RUNBOOK.md) — **Phase 16-B**
- [AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md](./operations/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md) — **Phase 16-C**
- [AIBEOPCHIN_PRODUCTION_GO_NO_GO_RUNBOOK.md](./operations/AIBEOPCHIN_PRODUCTION_GO_NO_GO_RUNBOOK.md) — **Phase 16-D**
- [AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md) — **Phase 17**
- [AIBEOPCHIN_ADMIN_OPS_CONSOLE_RUNBOOK.md](./operations/AIBEOPCHIN_ADMIN_OPS_CONSOLE_RUNBOOK.md) — **Phase 17-D**
- [AIBEOPCHIN_OPERATIONS_MONITORING_LIVE_SMOKE_RUNBOOK.md](./operations/AIBEOPCHIN_OPERATIONS_MONITORING_LIVE_SMOKE_RUNBOOK.md) — **Phase 17-F**
- [AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md](./operations/AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md) — **Phase 18-A**
- [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) — **Phase 18-B**
- [AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md](./operations/AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md) — **Phase 18-C**
- [AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md](./operations/AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md) — **Phase 18-D**
- [AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md) — **Phase 18-E**
- [AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md](./operations/AIBEOPCHIN_RELIABILITY_RC_RUNBOOK.md) — **Phase 18-E**
- [AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md](./platform/AIBEOPCHIN_DATA_GOVERNANCE_PHASE19_ROADMAP.md) — **Phase 19** (codebase · Data Governance)
- [AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md](./platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md) — **Product Phase 20~23** (다음: **20 Real Messaging**)
- [AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md](./operations/AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md) — **Product 20-A**
- [AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md](./operations/AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md) — **Product 20-B**
- [AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md](./operations/AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md) — **Product 20-C**
- [AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md](./operations/AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md) — **Product 20-D**
- [AIBEOPCHIN_REAL_MESSAGING_SECURE_DELIVERY_INTEGRATION_RUNBOOK.md](./operations/AIBEOPCHIN_REAL_MESSAGING_SECURE_DELIVERY_INTEGRATION_RUNBOOK.md) — **Product 20-E**
- [AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md) — **Product 20-F**
- [AIBEOPCHIN_REAL_MESSAGING_RC_RUNBOOK.md](./operations/AIBEOPCHIN_REAL_MESSAGING_RC_RUNBOOK.md) — **Product 20-F**
- **Product 20-A** Adapter Contract — `verify:aibeopchin-real-messaging-phase20a`
- **Product 20-B** Email Adapter — `verify:aibeopchin-real-messaging-phase20b`
- **Product 20-C** Kakao Adapter — `verify:aibeopchin-real-messaging-phase20c`
- **Product 20-D** Webhook Status Sync — `verify:aibeopchin-real-messaging-phase20d`
- **Product 20-E** Secure Delivery Integration — `verify:aibeopchin-real-messaging-phase20e`
- **Product 20-F** Real Messaging RC — `verify:aibeopchin-real-messaging-rc`
- [AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md) — **Product 21-A**
- **Product 21-A** Mobile Client Portal Baseline — `verify:aibeopchin-client-mobile-phase21a`
- [AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md) — **Product 21-B**
- **Product 21-B** Mobile Upload UX — `verify:aibeopchin-client-mobile-phase21b`
- [AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md) — **Product 21-C**
- **Product 21-C** PWA Install / Home Screen — `verify:aibeopchin-client-mobile-phase21c`
- [AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md) — **Product 21-D**
- **Product 21-D** Push-ready Notification Surface — `verify:aibeopchin-client-mobile-phase21d`
- [AIBEOPCHIN_CLIENT_MOBILE_ACCESSIBILITY_SMOKE_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_MOBILE_ACCESSIBILITY_SMOKE_RUNBOOK.md) — **Product 21-E**
- **Product 21-E** Mobile Accessibility / Low-end Device Smoke — `verify:aibeopchin-client-mobile-phase21e`
- [AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md) — **Product 21-F**
- [AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_RUNBOOK.md) — **Product 21-F**
- **Product 21-F** Client Mobile / PWA RC — `verify:aibeopchin-client-mobile-rc`
- [AIBEOPCHIN_TENANT_ORGANIZATION_BASELINE_RUNBOOK.md](./operations/AIBEOPCHIN_TENANT_ORGANIZATION_BASELINE_RUNBOOK.md) — **Product 22-A**
- **Product 22-A** Tenant / Organization Model — `verify:aibeopchin-tenant-phase22a`
- [AIBEOPCHIN_TENANT_PLAN_ENTITLEMENT_RUNBOOK.md](./operations/AIBEOPCHIN_TENANT_PLAN_ENTITLEMENT_RUNBOOK.md) — **Product 22-B**
- **Product 22-B** Plan / Feature Entitlement — `verify:aibeopchin-tenant-phase22b`
- [AIBEOPCHIN_TENANT_USAGE_METERING_RUNBOOK.md](./operations/AIBEOPCHIN_TENANT_USAGE_METERING_RUNBOOK.md) — **Product 22-C**
- **Product 22-C** Usage Metering — `verify:aibeopchin-tenant-phase22c`
- [AIBEOPCHIN_BILLING_USAGE_LEDGER_RUNBOOK.md](./operations/AIBEOPCHIN_BILLING_USAGE_LEDGER_RUNBOOK.md) — **Product 22-D**
- **Product 22-D** Billing-safe Usage Ledger — `verify:aibeopchin-tenant-phase22d`
- [AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md](./operations/AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md) — **Product 22-E**
- **Product 22-E** Admin Plan Console — `verify:aibeopchin-tenant-phase22e`
- [AIBEOPCHIN_TENANT_PLAN_METERING_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_TENANT_PLAN_METERING_RC_LOCK_SUMMARY.md) — **Product 22-F**
- [AIBEOPCHIN_TENANT_PLAN_METERING_RC_RUNBOOK.md](./operations/AIBEOPCHIN_TENANT_PLAN_METERING_RC_RUNBOOK.md) — **Product 22-F**
- **Product 22-F** Tenant / Plan / Metering RC — `verify:aibeopchin-tenant-rc`
- [AIBEOPCHIN_AI_OUTPUT_QUALITY_EVALUATION_RUNBOOK.md](./operations/AIBEOPCHIN_AI_OUTPUT_QUALITY_EVALUATION_RUNBOOK.md) — **Product 23-A**
- **Product 23-A** AI Output Quality Evaluation — `verify:aibeopchin-ai-quality-phase23a`
- [AIBEOPCHIN_LAWYER_REVIEW_FEEDBACK_LOOP_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_REVIEW_FEEDBACK_LOOP_RUNBOOK.md) — **Product 23-B**
- **Product 23-B** Lawyer Review Feedback Loop — `verify:aibeopchin-ai-quality-phase23b`
- [AIBEOPCHIN_CASE_PACK_BUILDER_RUNBOOK.md](./operations/AIBEOPCHIN_CASE_PACK_BUILDER_RUNBOOK.md) — **Product 23-C**
- **Product 23-C** Case Pack Builder — `verify:aibeopchin-ai-quality-phase23c`
- [AIBEOPCHIN_EVIDENCE_TIMELINE_ISSUE_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_EVIDENCE_TIMELINE_ISSUE_PACK_RUNBOOK.md) — **Product 23-D**
- **Product 23-D** Evidence / Timeline / Issue Pack — `verify:aibeopchin-ai-quality-phase23d`
- [AIBEOPCHIN_CLIENT_SAFE_CASE_PROGRESS_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_SAFE_CASE_PROGRESS_PACK_RUNBOOK.md) — **Product 23-E**
- **Product 23-E** Client-safe Case Progress Pack — `verify:aibeopchin-ai-quality-phase23e`
- [AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_LOCK_SUMMARY.md) — **Product 23-F**
- [AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_RUNBOOK.md](./operations/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_RUNBOOK.md) — **Product 23-F**
- **Product 23-F** AI Quality / Case Pack RC — `verify:aibeopchin-ai-quality-rc`
- [AIBEOPCHIN_LITIGATION_TASK_DEADLINE_AUTOMATION_RUNBOOK.md](./operations/AIBEOPCHIN_LITIGATION_TASK_DEADLINE_AUTOMATION_RUNBOOK.md) — **Product 24-A**
- **Product 24-A** Litigation Task / Deadline Automation — `verify:aibeopchin-litigation-ops-phase24a`
- [AIBEOPCHIN_COURT_FILING_PREPARATION_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_COURT_FILING_PREPARATION_PACK_RUNBOOK.md) — **Product 24-B**
- **Product 24-B** Court Filing Preparation Pack — `verify:aibeopchin-litigation-ops-phase24b`
- [AIBEOPCHIN_LAWYER_WORKBENCH_INTEGRATION_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_WORKBENCH_INTEGRATION_RUNBOOK.md) — **Product 24-C**
- **Product 24-C** Lawyer Workbench Integration — `verify:aibeopchin-litigation-ops-phase24c`
- [AIBEOPCHIN_HEARING_SUBMISSION_CHECKLIST_RUNBOOK.md](./operations/AIBEOPCHIN_HEARING_SUBMISSION_CHECKLIST_RUNBOOK.md) — **Product 24-D**
- **Product 24-D** Hearing / Submission Checklist — `verify:aibeopchin-litigation-ops-phase24d`
- [AIBEOPCHIN_CLIENT_LITIGATION_PROGRESS_SYNC_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_LITIGATION_PROGRESS_SYNC_RUNBOOK.md) — **Product 24-E**
- **Product 24-E** Client-facing Litigation Progress Sync — `verify:aibeopchin-litigation-ops-phase24e`
- [AIBEOPCHIN_LITIGATION_OPERATIONS_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_LOCK_SUMMARY.md) — **Product 24-F**
- [AIBEOPCHIN_LITIGATION_OPERATIONS_RC_RUNBOOK.md](./operations/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_RUNBOOK.md) — **Product 24-F**
- **Product 24-F** Litigation Operations RC — `verify:aibeopchin-litigation-ops-rc`
- [AIBEOPCHIN_PRODUCTION_LAUNCH_CHECKLIST_RUNBOOK.md](./operations/AIBEOPCHIN_PRODUCTION_LAUNCH_CHECKLIST_RUNBOOK.md) — **Product 25-A**
- **Product 25-A** Production Launch Checklist — `verify:aibeopchin-production-launch-phase25a`
- [AIBEOPCHIN_TENANT_ONBOARDING_RUNBOOK.md](./operations/AIBEOPCHIN_TENANT_ONBOARDING_RUNBOOK.md) — **Product 25-B**
- **Product 25-B** Tenant Onboarding Runbook — `verify:aibeopchin-production-launch-phase25b`
- [AIBEOPCHIN_OPERATOR_TRAINING_ADMIN_PLAYBOOK_RUNBOOK.md](./operations/AIBEOPCHIN_OPERATOR_TRAINING_ADMIN_PLAYBOOK_RUNBOOK.md) — **Product 25-C**
- **Product 25-C** Operator Training / Admin Playbook — `verify:aibeopchin-production-launch-phase25c`
- [AIBEOPCHIN_LIVE_PROVIDER_SMOKE_PLAN_RUNBOOK.md](./operations/AIBEOPCHIN_LIVE_PROVIDER_SMOKE_PLAN_RUNBOOK.md) — **Product 25-D**
- **Product 25-D** Live Provider Smoke Plan — `verify:aibeopchin-production-launch-phase25d`
- [AIBEOPCHIN_COMMERCIAL_OPS_READINESS_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_COMMERCIAL_OPS_READINESS_REVIEW_RUNBOOK.md) — **Product 25-E**
- **Product 25-E** Commercial Ops Readiness Review — `verify:aibeopchin-production-launch-phase25e`
- [AIBEOPCHIN_PRODUCTION_LAUNCH_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_LOCK_SUMMARY.md) — **Product 25-F**
- [AIBEOPCHIN_PRODUCTION_LAUNCH_RC_RUNBOOK.md](./operations/AIBEOPCHIN_PRODUCTION_LAUNCH_RC_RUNBOOK.md) — **Product 25-F**
- **Product 25-F** Production Launch RC — `verify:aibeopchin-production-launch-rc`
- [AIBEOPCHIN_STAGING_E2E_COMMERCIAL_SMOKE_RUNBOOK.md](./operations/AIBEOPCHIN_STAGING_E2E_COMMERCIAL_SMOKE_RUNBOOK.md) — **Product 26-A**
- **Product 26-A** Staging End-to-End Commercial Smoke — `verify:aibeopchin-pilot-launch-phase26a`
- [AIBEOPCHIN_REAL_TENANT_PILOT_SETUP_RUNBOOK.md](./operations/AIBEOPCHIN_REAL_TENANT_PILOT_SETUP_RUNBOOK.md) — **Product 26-B**
- **Product 26-B** Real Tenant Pilot Setup — `verify:aibeopchin-pilot-launch-phase26b`
- [AIBEOPCHIN_LEGAL_TERMS_PRIVACY_FINAL_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_TERMS_PRIVACY_FINAL_REVIEW_RUNBOOK.md) — **Product 26-C**
- **Product 26-C** Legal / Terms / Privacy Final Review — `verify:aibeopchin-pilot-launch-phase26c`
- [AIBEOPCHIN_SUPPORT_CS_INCIDENT_DESK_SETUP_RUNBOOK.md](./operations/AIBEOPCHIN_SUPPORT_CS_INCIDENT_DESK_SETUP_RUNBOOK.md) — **Product 26-D**
- **Product 26-D** Support / CS / Incident Desk Setup — `verify:aibeopchin-pilot-launch-phase26d`
- [AIBEOPCHIN_PRODUCTION_LAUNCH_DAY_RUNBOOK.md](./operations/AIBEOPCHIN_PRODUCTION_LAUNCH_DAY_RUNBOOK.md) — **Product 26-E**
- **Product 26-E** Production Launch Day Runbook — `verify:aibeopchin-pilot-launch-phase26e`
- [AIBEOPCHIN_PILOT_LAUNCH_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_PILOT_LAUNCH_RC_LOCK_SUMMARY.md) — **Product 26-F**
- [AIBEOPCHIN_PILOT_LAUNCH_RC_RUNBOOK.md](./operations/AIBEOPCHIN_PILOT_LAUNCH_RC_RUNBOOK.md) — **Product 26-F**
- **Product 26-F** Pilot Launch RC — `verify:aibeopchin-pilot-launch-rc`
- [AIBEOPCHIN_PILOT_USAGE_MONITORING_RUNBOOK.md](./operations/AIBEOPCHIN_PILOT_USAGE_MONITORING_RUNBOOK.md) — **Product 27-A**
- **Product 27-A** Pilot Usage Monitoring — `verify:aibeopchin-pilot-operations-phase27a`
- [AIBEOPCHIN_PILOT_FEEDBACK_INTAKE_RUNBOOK.md](./operations/AIBEOPCHIN_PILOT_FEEDBACK_INTAKE_RUNBOOK.md) — **Product 27-B**
- **Product 27-B** Pilot Feedback Intake — `verify:aibeopchin-pilot-operations-phase27b`
- [AIBEOPCHIN_LAWYER_CLIENT_SATISFACTION_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_CLIENT_SATISFACTION_REVIEW_RUNBOOK.md) — **Product 27-C**
- **Product 27-C** Lawyer / Client Satisfaction Review — `verify:aibeopchin-pilot-operations-phase27c`
- [AIBEOPCHIN_PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_RUNBOOK.md](./operations/AIBEOPCHIN_PILOT_ISSUE_TRIAGE_HOTFIX_LOOP_RUNBOOK.md) — **Product 27-D**
- **Product 27-D** Pilot Issue Triage & Hotfix Loop — `verify:aibeopchin-pilot-operations-phase27d`
- [AIBEOPCHIN_CONVERSION_READINESS_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_CONVERSION_READINESS_REVIEW_RUNBOOK.md) — **Product 27-E**
- **Product 27-E** Conversion Readiness Review — `verify:aibeopchin-pilot-operations-phase27e`
- [AIBEOPCHIN_PILOT_OPERATIONS_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_PILOT_OPERATIONS_RC_LOCK_SUMMARY.md) — **Product 27-F**
- [AIBEOPCHIN_PILOT_OPERATIONS_RC_RUNBOOK.md](./operations/AIBEOPCHIN_PILOT_OPERATIONS_RC_RUNBOOK.md) — **Product 27-F**
- **Product 27-F** Pilot Operations RC — `verify:aibeopchin-pilot-operations-rc`
- [AIBEOPCHIN_PAID_CONVERSION_CONTRACT_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_PAID_CONVERSION_CONTRACT_PACK_RUNBOOK.md) — **Product 28-A**
- **Product 28-A** Paid Conversion Contract Pack — `verify:aibeopchin-paid-conversion-scale-phase28a`
- [AIBEOPCHIN_PRODUCTION_TENANT_MIGRATION_CHECKLIST_RUNBOOK.md](./operations/AIBEOPCHIN_PRODUCTION_TENANT_MIGRATION_CHECKLIST_RUNBOOK.md) — **Product 28-B**
- **Product 28-B** Production Tenant Migration Checklist — `verify:aibeopchin-paid-conversion-scale-phase28b`
- [AIBEOPCHIN_SLA_SUPPORT_TIER_POLICY_RUNBOOK.md](./operations/AIBEOPCHIN_SLA_SUPPORT_TIER_POLICY_RUNBOOK.md) — **Product 28-C**
- **Product 28-C** SLA / Support Tier Policy — `verify:aibeopchin-paid-conversion-scale-phase28c`
- [AIBEOPCHIN_SALES_ONBOARDING_HANDOFF_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_SALES_ONBOARDING_HANDOFF_PACK_RUNBOOK.md) — **Product 28-D**
- **Product 28-D** Sales / Onboarding Handoff Pack — `verify:aibeopchin-paid-conversion-scale-phase28d`
- [AIBEOPCHIN_SCALE_RISK_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_SCALE_RISK_REVIEW_RUNBOOK.md) — **Product 28-E**
- **Product 28-E** Scale Risk Review — `verify:aibeopchin-paid-conversion-scale-phase28e`
- [AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_LOCK_SUMMARY.md) — **Product 28-F**
- [AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_RUNBOOK.md](./operations/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_RUNBOOK.md) — **Product 28-F**
- **Product 28-F** Paid Conversion / Scale RC — `verify:aibeopchin-paid-conversion-scale-rc`
- [AIBEOPCHIN_REVENUE_ACCOUNT_HEALTH_RUNBOOK.md](./operations/AIBEOPCHIN_REVENUE_ACCOUNT_HEALTH_RUNBOOK.md) — **Product 29-A**
- **Product 29-A** Revenue Account Health Score — `verify:aibeopchin-revenue-ops-phase29a`
- [AIBEOPCHIN_CUSTOMER_SUCCESS_ACTIVITY_LOG_RUNBOOK.md](./operations/AIBEOPCHIN_CUSTOMER_SUCCESS_ACTIVITY_LOG_RUNBOOK.md) — **Product 29-B**
- **Product 29-B** Customer Success Activity Log — `verify:aibeopchin-revenue-ops-phase29b`
- [AIBEOPCHIN_RENEWAL_CHURN_RISK_MONITOR_RUNBOOK.md](./operations/AIBEOPCHIN_RENEWAL_CHURN_RISK_MONITOR_RUNBOOK.md) — **Product 29-C**
- **Product 29-C** Renewal / Churn Risk Monitor — `verify:aibeopchin-revenue-ops-phase29c`
- [AIBEOPCHIN_EXPANSION_OPPORTUNITY_TRACKER_RUNBOOK.md](./operations/AIBEOPCHIN_EXPANSION_OPPORTUNITY_TRACKER_RUNBOOK.md) — **Product 29-D**
- **Product 29-D** Expansion Opportunity Tracker — `verify:aibeopchin-revenue-ops-phase29d`
- [AIBEOPCHIN_EXECUTIVE_PARTNER_SUCCESS_REPORT_RUNBOOK.md](./operations/AIBEOPCHIN_EXECUTIVE_PARTNER_SUCCESS_REPORT_RUNBOOK.md) — **Product 29-E**
- **Product 29-E** Executive / Partner Success Report — `verify:aibeopchin-revenue-ops-phase29e`
- [AIBEOPCHIN_REVENUE_OPS_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_REVENUE_OPS_RC_LOCK_SUMMARY.md) — **Product 29-F**
- [AIBEOPCHIN_REVENUE_OPS_RC_RUNBOOK.md](./operations/AIBEOPCHIN_REVENUE_OPS_RC_RUNBOOK.md) — **Product 29-F**
- **Product 29-F** Revenue Ops / Customer Success RC — `verify:aibeopchin-revenue-ops-rc`
- [AIBEOPCHIN_ENTERPRISE_DEPLOYMENT_MODEL_RUNBOOK.md](./operations/AIBEOPCHIN_ENTERPRISE_DEPLOYMENT_MODEL_RUNBOOK.md) — **Product 30-A**
- **Product 30-A** Enterprise Deployment Model — `verify:aibeopchin-enterprise-scale-phase30a`
- [AIBEOPCHIN_MULTI_TENANT_GOVERNANCE_RUNBOOK.md](./operations/AIBEOPCHIN_MULTI_TENANT_GOVERNANCE_RUNBOOK.md) — **Product 30-B**
- **Product 30-B** Multi-tenant Governance / Role Delegation — `verify:aibeopchin-enterprise-scale-phase30b`
- [AIBEOPCHIN_PARTNER_BRANCH_NETWORK_OPERATIONS_RUNBOOK.md](./operations/AIBEOPCHIN_PARTNER_BRANCH_NETWORK_OPERATIONS_RUNBOOK.md) — **Product 30-C**
- **Product 30-C** Partner / Branch Network Operations — `verify:aibeopchin-enterprise-scale-phase30c`
- [AIBEOPCHIN_ENTERPRISE_SECURITY_REVIEW_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_ENTERPRISE_SECURITY_REVIEW_PACK_RUNBOOK.md) — **Product 30-D**
- **Product 30-D** Enterprise Security Review Pack — `verify:aibeopchin-enterprise-scale-phase30d`
- [AIBEOPCHIN_SCALE_MONITORING_CAPACITY_FORECAST_RUNBOOK.md](./operations/AIBEOPCHIN_SCALE_MONITORING_CAPACITY_FORECAST_RUNBOOK.md) — **Product 30-E**
- **Product 30-E** Scale Monitoring / Capacity Forecast — `verify:aibeopchin-enterprise-scale-phase30e`
- [AIBEOPCHIN_ENTERPRISE_SCALE_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_ENTERPRISE_SCALE_RC_LOCK_SUMMARY.md) — **Product 30-F**
- [AIBEOPCHIN_ENTERPRISE_SCALE_RC_RUNBOOK.md](./operations/AIBEOPCHIN_ENTERPRISE_SCALE_RC_RUNBOOK.md) — **Product 30-F**
- **Product 30-F** Enterprise Scale RC — `verify:aibeopchin-enterprise-scale-rc`
- **Phase 19-A** Data Retention Policy — `verify:aibeopchin-data-governance-phase19a`
- [AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md](./operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md) — **Phase 19-B**
- **Phase 19-B** PII / Legal Redaction — `verify:aibeopchin-data-governance-phase19b`
- [AIBEOPCHIN_AUDIT_LOG_RETENTION_EXPORT_RUNBOOK.md](./operations/AIBEOPCHIN_AUDIT_LOG_RETENTION_EXPORT_RUNBOOK.md) — **Phase 19-C**
- **Phase 19-C** AuditLog Retention & Export — `verify:aibeopchin-data-governance-phase19c`
- [AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md](./operations/AIBEOPCHIN_ATTACHMENT_LIFECYCLE_EXPIRY_RUNBOOK.md) — **Phase 19-D**
- **Phase 19-D** Attachment Lifecycle / Expiry — `verify:aibeopchin-data-governance-phase19d`
- [AIBEOPCHIN_DATA_GOVERNANCE_VISIBILITY_RUNBOOK.md](./operations/AIBEOPCHIN_DATA_GOVERNANCE_VISIBILITY_RUNBOOK.md) — **Phase 19-E**
- **Phase 19-E** Admin Data Governance Visibility — `verify:aibeopchin-data-governance-phase19e`
- [AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md) — **Phase 19-F**
- [AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md](./operations/AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md) — **Phase 19-F**
- **Phase 19-F** Data Governance RC — `verify:aibeopchin-data-governance-rc`
- [AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md](./operations/AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md) — **Phase 17-C**
- [AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md](./operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md) — **Phase 16-C post-deploy**

---

## 3. 문서별 역할

### 3.1 `OPERATIONS_RECOVERY.md`

운영 장애 또는 반영 실패가 발생했을 때 사용하는 복구 문서입니다.

주요 용도는 다음과 같습니다.

- build 실패 원인 추적
- import / session / role / Prisma 관련 오류 복구
- 최소 롤백 세트 판단
- 앱 재기동 우선 복구
- 권한 흐름 이상 시 우선 점검 순서 확인

다음 상황에서 가장 먼저 확인합니다.

- [ ] 배포 후 앱이 뜨지 않음
- [ ] `/admin` 권한 흐름이 깨짐
- [ ] API가 500 또는 403/401로 비정상 동작
- [ ] route / session / model명 보정이 꼬임
- [ ] 최소 범위 롤백이 필요함

---

### 3.2 `PATCH_FINAL_CHECKLIST.md`

운영 패치를 실제 프로젝트에 반영한 뒤, 최종 검수할 때 사용하는 체크리스트 문서입니다.

주요 용도는 다음과 같습니다.

- 코드 반영 누락 여부 확인
- 정책과 실제 구현 일치 여부 확인
- lint / test / build 확인
- STAFF / ADMIN 권한 스모크 테스트
- 운영 API 및 system page 최종 검수

다음 상황에서 가장 먼저 확인합니다.

- [ ] 패치 반영 직후 최종 점검이 필요함
- [ ] 구현은 끝났지만 배포 가능 여부를 판단해야 함
- [ ] 권한, route, API, 운영 UI를 한 번에 검수해야 함
- [ ] 인수인계 전에 현재 상태를 체크해야 함

---

### 3.3 `DEPLOY_PRECHECK.md`

실제 배포 직전에 꼭 확인해야 하는 항목만 추린 배포 전 점검 문서입니다.

주요 용도는 다음과 같습니다.

- 배포 승인 전 마지막 점검
- 환경 변수 및 build 상태 확인
- release-meta / health 확인
- STAFF / ADMIN 기준 최종 접근 확인
- 운영 계정 및 seed 상태 확인

다음 상황에서 가장 먼저 확인합니다.

- [ ] 배포 직전 마지막 확인 단계
- [ ] 로컬 검수는 끝났고 배포 승인 여부만 판단하면 됨
- [ ] build는 성공했지만 배포 환경 변수/권한 확인이 필요함
- [ ] 배포 후 즉시 확인할 항목을 정리해야 함

---

## 4. 상황별 문서 선택 가이드

### 4.1 앱이 아예 뜨지 않을 때

먼저 볼 문서:

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

확인 순서:

- [ ] import alias / export 누락
- [ ] session 함수명
- [ ] role 타입명
- [ ] Prisma model / field명
- [ ] 최소 롤백 세트

---

### 4.2 구현 반영은 끝났지만 검수가 필요할 때

먼저 볼 문서:

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

확인 순서:

- [ ] 정책 반영 확인
- [ ] 파일별 반영 점검
- [ ] 구버전 흔적 제거 확인
- [ ] lint / test / build
- [ ] 권한 스모크 테스트

---

### 4.3 오늘 바로 배포해야 할 때

먼저 볼 문서:

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)
- [ ] (AI Core) [AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md](./operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md) — **dev 종료 후** predeploy
- [ ] [STAGING_SECRETS_CHECKLIST.md](./operations/STAGING_SECRETS_CHECKLIST.md) — staging env
- [ ] [DB_MIGRATION_CHRONOLOGY.md](./operations/DB_MIGRATION_CHRONOLOGY.md) — 운영 DB migration

확인 순서:

- [ ] **`npm run dev` 종료** → build / predeploy
- [ ] build / predeploy 스크립트
- [ ] 환경 변수
- [ ] health / release-meta
- [ ] STAFF / ADMIN 접근 테스트
- [ ] 배포 승인 여부 판단

---

### 4.4 배포 후 문제가 생겼을 때

먼저 볼 문서:

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

그다음 필요 시:

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

확인 순서:

- [ ] 장애 증상 분류
- [ ] 복구 우선순위
- [ ] 최소 롤백 세트
- [ ] 복구 후 재검수

---

## 5. 추천 사용 순서

일반적인 작업 흐름에서는 아래 순서로 문서를 사용하는 것을 권장합니다.

### 5.1 패치 반영 직후

- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

### 5.2 배포 직전

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

### 5.3 장애 또는 이상 발생 시

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)

---

## 6. 문서 사용 원칙

아래 원칙을 기준으로 문서를 사용합니다.

- [ ] 구현 자체보다 운영 안정성 확인을 우선한다
- [ ] 새로운 수정 전, 현재 상태를 먼저 문서 기준으로 점검한다
- [ ] 장애 발생 시 추측보다 복구 순서를 먼저 따른다
- [ ] 배포 직전에는 문서 기준으로 누락 여부를 최종 확인한다
- [ ] 문서 내용은 실제 프로젝트 구조 변경 시 함께 갱신한다

---

## 7. 빠른 진입점

가장 자주 보는 핵심 항목은 아래와 같습니다.

### 7.1 권한 문제

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

핵심 파일:

- [ ] `src/middleware.ts`
- [ ] `src/lib/auth/guards.ts`
- [ ] `src/lib/auth/roles.ts`

---

### 7.2 운영 API 문제

- [ ] [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [ ] [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md)

핵심 파일:

- [ ] `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`
- [ ] `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`
- [ ] `src/app/api/health/route.ts`
- [ ] `src/app/api/release-meta/route.ts`

---

### 7.3 배포 전 확인

- [ ] [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md)

핵심 항목:

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] 환경 변수
- [ ] health / release-meta
- [ ] STAFF / ADMIN 접근 흐름

---

## 8. 문서 갱신 기준

아래 경우에는 운영 문서를 함께 업데이트합니다.

- [ ] admin 접근 정책 변경
- [ ] session 구조 변경
- [ ] 운영 API 경로 변경
- [ ] health / release-meta 응답 정책 변경
- [ ] seed 계정 정책 변경
- [ ] 배포 전 필수 점검 절차 변경
- [ ] 롤백 우선순위 변경

---

## 9. 최종 메모

- 운영 문서는 구현을 대신하지 않지만, 구현 이후의 **검수 / 복구 / 배포 안정성**을 크게 높여줍니다.
- 가장 자주 보게 되는 문서는 보통 [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md) 와 [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) 입니다.
- 실제 운영 중 장애가 발생하면 새로운 수정부터 하지 말고, 먼저 [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) 기준으로 현재 상태를 정리하는 것이 안전합니다.
