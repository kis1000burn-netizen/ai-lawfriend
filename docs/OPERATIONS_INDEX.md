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
- [AIBEOPCHIN_PARTNER_PROGRAM_MODEL_RUNBOOK.md](./operations/AIBEOPCHIN_PARTNER_PROGRAM_MODEL_RUNBOOK.md) — **Product 31-A**
- **Product 31-A** Partner Program Model — `verify:aibeopchin-partner-ecosystem-phase31a`
- [AIBEOPCHIN_PARTNER_REFERRAL_REVENUE_SHARE_RUNBOOK.md](./operations/AIBEOPCHIN_PARTNER_REFERRAL_REVENUE_SHARE_RUNBOOK.md) — **Product 31-B**
- **Product 31-B** Partner Referral / Revenue Share Policy — `verify:aibeopchin-partner-ecosystem-phase31b`
- [AIBEOPCHIN_EXPERT_NETWORK_CASE_ROUTING_RUNBOOK.md](./operations/AIBEOPCHIN_EXPERT_NETWORK_CASE_ROUTING_RUNBOOK.md) — **Product 31-C**
- **Product 31-C** Expert Network Case Routing — `verify:aibeopchin-partner-ecosystem-phase31c`
- [AIBEOPCHIN_MARKETPLACE_SERVICE_CATALOG_RUNBOOK.md](./operations/AIBEOPCHIN_MARKETPLACE_SERVICE_CATALOG_RUNBOOK.md) — **Product 31-D**
- **Product 31-D** Marketplace Listing / Service Catalog — `verify:aibeopchin-partner-ecosystem-phase31d`
- [AIBEOPCHIN_PARTNER_QUALITY_COMPLIANCE_RUNBOOK.md](./operations/AIBEOPCHIN_PARTNER_QUALITY_COMPLIANCE_RUNBOOK.md) — **Product 31-E**
- **Product 31-E** Partner Quality / Compliance Review — `verify:aibeopchin-partner-ecosystem-phase31e`
- [AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_LOCK_SUMMARY.md) — **Product 31-F**
- [AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_RUNBOOK.md](./operations/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_RUNBOOK.md) — **Product 31-F**
- **Product 31-F** Partner Ecosystem RC — `verify:aibeopchin-partner-ecosystem-rc`
- [AIBEOPCHIN_SECURITY_CONTROL_INVENTORY_RUNBOOK.md](./operations/AIBEOPCHIN_SECURITY_CONTROL_INVENTORY_RUNBOOK.md) — **Product 32-A**
- **Product 32-A** Security Control Inventory — `verify:aibeopchin-enterprise-security-phase32a`
- [AIBEOPCHIN_PRIVACY_DATA_PROTECTION_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_PRIVACY_DATA_PROTECTION_REVIEW_RUNBOOK.md) — **Product 32-B**
- **Product 32-B** Privacy / Data Protection Review Pack — `verify:aibeopchin-enterprise-security-phase32b`
- [AIBEOPCHIN_ACCESS_CONTROL_AUDIT_EVIDENCE_RUNBOOK.md](./operations/AIBEOPCHIN_ACCESS_CONTROL_AUDIT_EVIDENCE_RUNBOOK.md) — **Product 32-C**
- **Product 32-C** Access Control / Audit Evidence Pack — `verify:aibeopchin-enterprise-security-phase32c`
- [AIBEOPCHIN_VENDOR_SECURITY_QUESTIONNAIRE_RUNBOOK.md](./operations/AIBEOPCHIN_VENDOR_SECURITY_QUESTIONNAIRE_RUNBOOK.md) — **Product 32-D**
- **Product 32-D** Vendor Security Questionnaire Pack — `verify:aibeopchin-enterprise-security-phase32d`
- [AIBEOPCHIN_CERTIFICATION_READINESS_GAP_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_CERTIFICATION_READINESS_GAP_REVIEW_RUNBOOK.md) — **Product 32-E**
- **Product 32-E** Certification Readiness Gap Review — `verify:aibeopchin-enterprise-security-phase32e`
- [AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_SUMMARY.md) — **Product 32-F**
- [AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_RUNBOOK.md](./operations/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_RUNBOOK.md) — **Product 32-F**
- **Product 32-F** Enterprise Security / Compliance RC — `verify:aibeopchin-enterprise-security-rc`
- [AIBEOPCHIN_TRUST_CENTER_CONTENT_RUNBOOK.md](./operations/AIBEOPCHIN_TRUST_CENTER_CONTENT_RUNBOOK.md) — **Product 33-A**
- **Product 33-A** Trust Center Content Pack — `verify:aibeopchin-public-trust-marketing-phase33a`
- [AIBEOPCHIN_SALES_DEMO_PITCH_DECK_RUNBOOK.md](./operations/AIBEOPCHIN_SALES_DEMO_PITCH_DECK_RUNBOOK.md) — **Product 33-B**
- **Product 33-B** Sales Demo / Pitch Deck Pack — `verify:aibeopchin-public-trust-marketing-phase33b`
- [AIBEOPCHIN_WEBSITE_LANDING_MESSAGE_RUNBOOK.md](./operations/AIBEOPCHIN_WEBSITE_LANDING_MESSAGE_RUNBOOK.md) — **Product 33-C**
- **Product 33-C** Website / Landing Message Refresh — `verify:aibeopchin-public-trust-marketing-phase33c`
- [AIBEOPCHIN_CUSTOMER_PROOF_CASE_STUDY_RUNBOOK.md](./operations/AIBEOPCHIN_CUSTOMER_PROOF_CASE_STUDY_RUNBOOK.md) — **Product 33-D**
- **Product 33-D** Customer Proof / Case Study Template — `verify:aibeopchin-public-trust-marketing-phase33d`
- [AIBEOPCHIN_PARTNER_ENTERPRISE_PROPOSAL_KIT_RUNBOOK.md](./operations/AIBEOPCHIN_PARTNER_ENTERPRISE_PROPOSAL_KIT_RUNBOOK.md) — **Product 33-E**
- **Product 33-E** Partner / Enterprise Proposal Kit — `verify:aibeopchin-public-trust-marketing-phase33e`
- [AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_LOCK_SUMMARY.md) — **Product 33-F**
- [AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_RUNBOOK.md](./operations/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_RUNBOOK.md) — **Product 33-F**
- **Product 33-F** Public Trust / Marketing Launch RC — `verify:aibeopchin-public-trust-marketing-rc`
- [AIBEOPCHIN_SALES_PIPELINE_MODEL_RUNBOOK.md](./operations/AIBEOPCHIN_SALES_PIPELINE_MODEL_RUNBOOK.md) — **Product 34-A**
- **Product 34-A** Sales Pipeline Model — `verify:aibeopchin-sales-pipeline-deal-desk-phase34a`
- [AIBEOPCHIN_LEAD_OPPORTUNITY_INTAKE_RUNBOOK.md](./operations/AIBEOPCHIN_LEAD_OPPORTUNITY_INTAKE_RUNBOOK.md) — **Product 34-B**
- **Product 34-B** Lead / Opportunity Intake — `verify:aibeopchin-sales-pipeline-deal-desk-phase34b`
- [AIBEOPCHIN_PROPOSAL_QUOTE_DESK_RUNBOOK.md](./operations/AIBEOPCHIN_PROPOSAL_QUOTE_DESK_RUNBOOK.md) — **Product 34-C**
- **Product 34-C** Proposal / Quote Desk Policy — `verify:aibeopchin-sales-pipeline-deal-desk-phase34c`
- [AIBEOPCHIN_DEAL_RISK_LEGAL_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_DEAL_RISK_LEGAL_REVIEW_RUNBOOK.md) — **Product 34-D**
- **Product 34-D** Deal Risk / Legal Review Gate — `verify:aibeopchin-sales-pipeline-deal-desk-phase34d`
- [AIBEOPCHIN_SALES_ONBOARDING_HANDOFF_RUNBOOK.md](./operations/AIBEOPCHIN_SALES_ONBOARDING_HANDOFF_RUNBOOK.md) — **Product 34-E**
- **Product 34-E** Sales-to-Onboarding Handoff — `verify:aibeopchin-sales-pipeline-deal-desk-phase34e`
- [AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_LOCK_SUMMARY.md) — **Product 34-F**
- [AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_RUNBOOK.md](./operations/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_RUNBOOK.md) — **Product 34-F**
- **Product 34-F** Sales Pipeline / Deal Desk RC — `verify:aibeopchin-sales-pipeline-deal-desk-rc`
- [AIBEOPCHIN_CONTRACT_TEMPLATE_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_CONTRACT_TEMPLATE_PACK_RUNBOOK.md) — **Product 35-A**
- **Product 35-A** Contract Template Pack — `verify:aibeopchin-contracting-legal-ops-phase35a`
- [AIBEOPCHIN_LEGAL_REVIEW_WORKFLOW_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_REVIEW_WORKFLOW_RUNBOOK.md) — **Product 35-B**
- **Product 35-B** Legal Review Workflow — `verify:aibeopchin-contracting-legal-ops-phase35b`
- [AIBEOPCHIN_ORDER_FORM_SOW_POLICY_RUNBOOK.md](./operations/AIBEOPCHIN_ORDER_FORM_SOW_POLICY_RUNBOOK.md) — **Product 35-C**
- **Product 35-C** Order Form / SOW Policy — `verify:aibeopchin-contracting-legal-ops-phase35c`
- [AIBEOPCHIN_DPA_SECURITY_ADDENDUM_RUNBOOK.md](./operations/AIBEOPCHIN_DPA_SECURITY_ADDENDUM_RUNBOOK.md) — **Product 35-D**
- **Product 35-D** DPA / Security Addendum Pack — `verify:aibeopchin-contracting-legal-ops-phase35d`
- [AIBEOPCHIN_SIGNATURE_APPROVAL_MATRIX_RUNBOOK.md](./operations/AIBEOPCHIN_SIGNATURE_APPROVAL_MATRIX_RUNBOOK.md) — **Product 35-E**
- **Product 35-E** Signature Readiness / Approval Matrix — `verify:aibeopchin-contracting-legal-ops-phase35e`
- [AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_LOCK_SUMMARY.md) — **Product 35-F**
- [AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_RUNBOOK.md](./operations/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_RUNBOOK.md) — **Product 35-F**
- **Product 35-F** Contracting / Legal Ops RC — `verify:aibeopchin-contracting-legal-ops-rc`
- [AIBEOPCHIN_IMPLEMENTATION_PROJECT_PLAN_RUNBOOK.md](./operations/AIBEOPCHIN_IMPLEMENTATION_PROJECT_PLAN_RUNBOOK.md) — **Product 36-A**
- **Product 36-A** Implementation Project Plan — `verify:aibeopchin-implementation-readiness-phase36a`
- [AIBEOPCHIN_CUSTOMER_DATA_TENANT_PROVISIONING_RUNBOOK.md](./operations/AIBEOPCHIN_CUSTOMER_DATA_TENANT_PROVISIONING_RUNBOOK.md) — **Product 36-B**
- **Product 36-B** Customer Data / Tenant Provisioning Plan — `verify:aibeopchin-implementation-readiness-phase36b`
- [AIBEOPCHIN_ADMIN_LAWYER_TRAINING_SCHEDULE_RUNBOOK.md](./operations/AIBEOPCHIN_ADMIN_LAWYER_TRAINING_SCHEDULE_RUNBOOK.md) — **Product 36-C**
- **Product 36-C** Admin / Lawyer Training Schedule — `verify:aibeopchin-implementation-readiness-phase36c`
- [AIBEOPCHIN_GO_LIVE_SUCCESS_CRITERIA_RUNBOOK.md](./operations/AIBEOPCHIN_GO_LIVE_SUCCESS_CRITERIA_RUNBOOK.md) — **Product 36-D**
- **Product 36-D** Go-Live Success Criteria — `verify:aibeopchin-implementation-readiness-phase36d`
- [AIBEOPCHIN_POST_CONTRACT_RISK_CHANGE_CONTROL_RUNBOOK.md](./operations/AIBEOPCHIN_POST_CONTRACT_RISK_CHANGE_CONTROL_RUNBOOK.md) — **Product 36-E**
- **Product 36-E** Post-Contract Risk / Change Control — `verify:aibeopchin-implementation-readiness-phase36e`
- [AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_LOCK_SUMMARY.md) — **Product 36-F**
- [AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_RUNBOOK.md](./operations/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_RUNBOOK.md) — **Product 36-F**
- **Product 36-F** Implementation Readiness RC — `verify:aibeopchin-implementation-readiness-rc`
- [AIBEOPCHIN_GO_LIVE_EXECUTION_CHECKLIST_RUNBOOK.md](./operations/AIBEOPCHIN_GO_LIVE_EXECUTION_CHECKLIST_RUNBOOK.md) — **Product 37-A**
- **Product 37-A** Go-Live Execution Checklist — `verify:aibeopchin-customer-go-live-adoption-phase37a`
- [AIBEOPCHIN_FIRST_30_DAYS_ADOPTION_MONITORING_RUNBOOK.md](./operations/AIBEOPCHIN_FIRST_30_DAYS_ADOPTION_MONITORING_RUNBOOK.md) — **Product 37-B**
- **Product 37-B** First 30 Days Adoption Monitoring — `verify:aibeopchin-customer-go-live-adoption-phase37b`
- [AIBEOPCHIN_ADMIN_LAWYER_ACTIVATION_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_ADMIN_LAWYER_ACTIVATION_REVIEW_RUNBOOK.md) — **Product 37-C**
- **Product 37-C** Admin / Lawyer Activation Review — `verify:aibeopchin-customer-go-live-adoption-phase37c`
- [AIBEOPCHIN_CLIENT_PORTAL_ADOPTION_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_CLIENT_PORTAL_ADOPTION_REVIEW_RUNBOOK.md) — **Product 37-D**
- **Product 37-D** Client Portal Adoption Review — `verify:aibeopchin-customer-go-live-adoption-phase37d`
- [AIBEOPCHIN_GO_LIVE_ISSUE_CHANGE_REQUEST_LOOP_RUNBOOK.md](./operations/AIBEOPCHIN_GO_LIVE_ISSUE_CHANGE_REQUEST_LOOP_RUNBOOK.md) — **Product 37-E**
- **Product 37-E** Go-Live Issue / Change Request Loop — `verify:aibeopchin-customer-go-live-adoption-phase37e`
- [AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_SUMMARY.md) — **Product 37-F**
- [AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_RUNBOOK.md](./operations/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_RUNBOOK.md) — **Product 37-F**
- **Product 37-F** Customer Go-Live / Adoption RC — `verify:aibeopchin-customer-go-live-adoption-rc`
- [AIBEOPCHIN_90_DAY_SUCCESS_PLAN_RUNBOOK.md](./operations/AIBEOPCHIN_90_DAY_SUCCESS_PLAN_RUNBOOK.md) — **Product 38-A**
- **Product 38-A** 90-Day Success Plan — `verify:aibeopchin-long-term-customer-success-phase38a`
- [AIBEOPCHIN_QUARTERLY_BUSINESS_REVIEW_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_QUARTERLY_BUSINESS_REVIEW_PACK_RUNBOOK.md) — **Product 38-B**
- **Product 38-B** Quarterly Business Review Pack — `verify:aibeopchin-long-term-customer-success-phase38b`
- [AIBEOPCHIN_RENEWAL_READINESS_TIMELINE_RUNBOOK.md](./operations/AIBEOPCHIN_RENEWAL_READINESS_TIMELINE_RUNBOOK.md) — **Product 38-C**
- **Product 38-C** Renewal Readiness Timeline — `verify:aibeopchin-long-term-customer-success-phase38c`
- [AIBEOPCHIN_EXPANSION_UPSELL_PLAYBOOK_RUNBOOK.md](./operations/AIBEOPCHIN_EXPANSION_UPSELL_PLAYBOOK_RUNBOOK.md) — **Product 38-D**
- **Product 38-D** Expansion / Upsell Playbook — `verify:aibeopchin-long-term-customer-success-phase38d`
- [AIBEOPCHIN_LONG_TERM_CHURN_PREVENTION_LOOP_RUNBOOK.md](./operations/AIBEOPCHIN_LONG_TERM_CHURN_PREVENTION_LOOP_RUNBOOK.md) — **Product 38-E**
- **Product 38-E** Long-term Churn Prevention Loop — `verify:aibeopchin-long-term-customer-success-phase38e`
- [AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_SUMMARY.md) — **Product 38-F**
- [AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_RUNBOOK.md](./operations/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_RUNBOOK.md) — **Product 38-F**
- **Product 38-F** Long-term Customer Success RC — `verify:aibeopchin-long-term-customer-success-rc`
- [AIBEOPCHIN_STRATEGIC_ACCOUNT_PLAN_RUNBOOK.md](./operations/AIBEOPCHIN_STRATEGIC_ACCOUNT_PLAN_RUNBOOK.md) — **Product 39-A**
- **Product 39-A** Strategic Account Plan — `verify:aibeopchin-strategic-account-expansion-phase39a`
- [AIBEOPCHIN_ENTERPRISE_EXPANSION_MAP_RUNBOOK.md](./operations/AIBEOPCHIN_ENTERPRISE_EXPANSION_MAP_RUNBOOK.md) — **Product 39-B**
- **Product 39-B** Enterprise Expansion Map — `verify:aibeopchin-strategic-account-expansion-phase39b`
- [AIBEOPCHIN_MULTI_BRANCH_ROLLOUT_PLAYBOOK_RUNBOOK.md](./operations/AIBEOPCHIN_MULTI_BRANCH_ROLLOUT_PLAYBOOK_RUNBOOK.md) — **Product 39-C**
- **Product 39-C** Multi-Branch Rollout Playbook — `verify:aibeopchin-strategic-account-expansion-phase39c`
- [AIBEOPCHIN_EXECUTIVE_SPONSOR_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_EXECUTIVE_SPONSOR_REVIEW_RUNBOOK.md) — **Product 39-D**
- **Product 39-D** Executive Sponsor Review — `verify:aibeopchin-strategic-account-expansion-phase39d`
- [AIBEOPCHIN_EXPANSION_RISK_GOVERNANCE_REVIEW_RUNBOOK.md](./operations/AIBEOPCHIN_EXPANSION_RISK_GOVERNANCE_REVIEW_RUNBOOK.md) — **Product 39-E**
- **Product 39-E** Expansion Risk / Governance Review — `verify:aibeopchin-strategic-account-expansion-phase39e`
- [AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_SUMMARY.md) — **Product 39-F**
- [AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_RUNBOOK.md](./operations/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_RUNBOOK.md) — **Product 39-F**
- **Product 39-F** Strategic Account Expansion RC — `verify:aibeopchin-strategic-account-expansion-rc`
- [AIBEOPCHIN_JUDGMENT_CORPUS_SOURCE_REGISTRY_RUNBOOK.md](./operations/AIBEOPCHIN_JUDGMENT_CORPUS_SOURCE_REGISTRY_RUNBOOK.md) — **Product 40-A**
- **Product 40-A** Judgment Corpus / Source Registry — `verify:aibeopchin-legal-outcome-assessment-phase40a`
- [AIBEOPCHIN_JUDGMENT_REFERENCE_LINKING_ENGINE_RUNBOOK.md](./operations/AIBEOPCHIN_JUDGMENT_REFERENCE_LINKING_ENGINE_RUNBOOK.md) — **Product 40-B**
- **Product 40-B** Judgment Reference Linking Engine — `verify:aibeopchin-legal-outcome-assessment-phase40b`
- [AIBEOPCHIN_ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_RUNBOOK.md](./operations/AIBEOPCHIN_ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_RUNBOOK.md) — **Product 40-C**
- **Product 40-C** Issue / Burden / Evidence Judgment Mapping — `verify:aibeopchin-legal-outcome-assessment-phase40c`
- [AIBEOPCHIN_SIMILARITY_DISTINCTION_ANALYSIS_RUNBOOK.md](./operations/AIBEOPCHIN_SIMILARITY_DISTINCTION_ANALYSIS_RUNBOOK.md) — **Product 40-D**
- **Product 40-D** Similarity / Distinction Analysis — `verify:aibeopchin-legal-outcome-assessment-phase40d`
- [AIBEOPCHIN_LAWYER_JUDGMENT_REVIEW_WORKSPACE_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_JUDGMENT_REVIEW_WORKSPACE_RUNBOOK.md) — **Product 40-E**
- **Product 40-E** Lawyer Judgment Review Workspace — `verify:aibeopchin-legal-outcome-assessment-phase40e`
- [AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md) — **Product 40-F**
- [AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_RUNBOOK.md](./operations/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_RUNBOOK.md) — **Product 40-F**
- **Product 40-F** Judgment-Grounded Outcome Assessment RC — `verify:aibeopchin-legal-outcome-assessment-rc`
- [AIBEOPCHIN_CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_RUNBOOK.md](./operations/AIBEOPCHIN_CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_RUNBOOK.md) — **Product 41-A**
- **Product 41-A** Criminal Judgment / Sentencing Corpus Registry — `verify:aibeopchin-sentencing-outcome-assessment-phase41a`
- [AIBEOPCHIN_SENTENCING_FACTOR_EXTRACTION_RUNBOOK.md](./operations/AIBEOPCHIN_SENTENCING_FACTOR_EXTRACTION_RUNBOOK.md) — **Product 41-B**
- **Product 41-B** Sentencing Factor Extraction — `verify:aibeopchin-sentencing-outcome-assessment-phase41b`
- [AIBEOPCHIN_SIMILAR_SENTENCING_OUTCOME_COMPARISON_RUNBOOK.md](./operations/AIBEOPCHIN_SIMILAR_SENTENCING_OUTCOME_COMPARISON_RUNBOOK.md) — **Product 41-C**
- **Product 41-C** Similar Sentencing Outcome Comparison — `verify:aibeopchin-sentencing-outcome-assessment-phase41c`
- [AIBEOPCHIN_SENTENCING_RISK_MITIGATION_MATRIX_RUNBOOK.md](./operations/AIBEOPCHIN_SENTENCING_RISK_MITIGATION_MATRIX_RUNBOOK.md) — **Product 41-D**
- **Product 41-D** Sentencing Risk / Mitigation Matrix — `verify:aibeopchin-sentencing-outcome-assessment-phase41d`
- [AIBEOPCHIN_LAWYER_SENTENCING_REVIEW_WORKSPACE_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_SENTENCING_REVIEW_WORKSPACE_RUNBOOK.md) — **Product 41-E**
- **Product 41-E** Lawyer Sentencing Review Workspace — `verify:aibeopchin-sentencing-outcome-assessment-phase41e`
- [AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md) — **Product 41-F**
- [AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_RUNBOOK.md](./operations/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_RUNBOOK.md) — **Product 41-F**
- **Product 41-F** Sentencing Outcome Assessment RC — `verify:aibeopchin-sentencing-outcome-assessment-rc`
- [AIBEOPCHIN_EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_RUNBOOK.md](./operations/AIBEOPCHIN_EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_RUNBOOK.md) — **Product 42-A**
- **Product 42-A** Evidence File Hash / Original Preservation — `verify:aibeopchin-evidence-integrity-phase42a`
- [AIBEOPCHIN_EVIDENCE_CHAIN_OF_CUSTODY_LOG_RUNBOOK.md](./operations/AIBEOPCHIN_EVIDENCE_CHAIN_OF_CUSTODY_LOG_RUNBOOK.md) — **Product 42-B**
- **Product 42-B** Chain of Custody Log — `verify:aibeopchin-evidence-integrity-phase42b`
- [AIBEOPCHIN_AI_EXTRACT_TO_SOURCE_LINKAGE_RUNBOOK.md](./operations/AIBEOPCHIN_AI_EXTRACT_TO_SOURCE_LINKAGE_RUNBOOK.md) — **Product 42-C**
- **Product 42-C** AI Extract-to-Source Linkage — `verify:aibeopchin-evidence-integrity-phase42c`
- [AIBEOPCHIN_EVIDENCE_REVIEW_TAMPER_WARNING_RUNBOOK.md](./operations/AIBEOPCHIN_EVIDENCE_REVIEW_TAMPER_WARNING_RUNBOOK.md) — **Product 42-D**
- **Product 42-D** Evidence Review / Tamper Warning — `verify:aibeopchin-evidence-integrity-phase42d`
- [AIBEOPCHIN_LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_RUNBOOK.md) — **Product 42-E**
- **Product 42-E** Lawyer Evidence Integrity Review Workspace — `verify:aibeopchin-evidence-integrity-phase42e`
- [AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY.md) — **Product 42-F**
- [AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_RUNBOOK.md](./operations/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_RUNBOOK.md) — **Product 42-F**
- **Product 42-F** Evidence Integrity RC — `verify:aibeopchin-evidence-integrity-rc`
- [AIBEOPCHIN_CLAIM_ISSUE_GRAPH_REGISTRY_RUNBOOK.md](./operations/AIBEOPCHIN_CLAIM_ISSUE_GRAPH_REGISTRY_RUNBOOK.md) — **Product 43-A**
- **Product 43-A** Claim / Issue Graph Registry — `verify:aibeopchin-claim-evidence-judgment-graph-phase43a`
- [AIBEOPCHIN_CLAIM_EVIDENCE_EDGE_ENGINE_RUNBOOK.md](./operations/AIBEOPCHIN_CLAIM_EVIDENCE_EDGE_ENGINE_RUNBOOK.md) — **Product 43-B**
- **Product 43-B** Claim-Evidence Edge Engine — `verify:aibeopchin-claim-evidence-judgment-graph-phase43b`
- [AIBEOPCHIN_ISSUE_JUDGMENT_EDGE_ENGINE_RUNBOOK.md](./operations/AIBEOPCHIN_ISSUE_JUDGMENT_EDGE_ENGINE_RUNBOOK.md) — **Product 43-C**
- **Product 43-C** Issue-Judgment Edge Engine — `verify:aibeopchin-claim-evidence-judgment-graph-phase43c`
- [AIBEOPCHIN_OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_RUNBOOK.md](./operations/AIBEOPCHIN_OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_RUNBOOK.md) — **Product 43-D**
- **Product 43-D** Opponent Argument / Risk Signal Graph — `verify:aibeopchin-claim-evidence-judgment-graph-phase43d`
- [AIBEOPCHIN_LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_RUNBOOK.md) — **Product 43-E**
- **Product 43-E** Lawyer Claim Graph Review Workspace — `verify:aibeopchin-claim-evidence-judgment-graph-phase43e`
- [AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY.md) — **Product 43-F**
- [AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_RUNBOOK.md](./operations/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_RUNBOOK.md) — **Product 43-F**
- **Product 43-F** Claim-Evidence-Judgment Graph RC — `verify:aibeopchin-claim-evidence-judgment-graph-rc`
- [AIBEOPCHIN_CASE_SUMMARY_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_CASE_SUMMARY_PACK_RUNBOOK.md) — **Product 44-A**
- **Product 44-A** Case Summary Pack — `verify:aibeopchin-court-ready-case-record-pack-phase44a`
- [AIBEOPCHIN_ISSUE_TABLE_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_ISSUE_TABLE_PACK_RUNBOOK.md) — **Product 44-B**
- **Product 44-B** Issue Table Pack — `verify:aibeopchin-court-ready-case-record-pack-phase44b`
- [AIBEOPCHIN_EVIDENCE_LIST_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_EVIDENCE_LIST_PACK_RUNBOOK.md) — **Product 44-C**
- **Product 44-C** Evidence List Pack — `verify:aibeopchin-court-ready-case-record-pack-phase44c`
- [AIBEOPCHIN_JUDGMENT_PROCEDURE_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_JUDGMENT_PROCEDURE_PACK_RUNBOOK.md) — **Product 44-D**
- **Product 44-D** Judgment Reference & Procedure History Pack — `verify:aibeopchin-court-ready-case-record-pack-phase44d`
- [AIBEOPCHIN_LAWYER_COURT_READY_REVIEW_WORKSPACE_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_COURT_READY_REVIEW_WORKSPACE_RUNBOOK.md) — **Product 44-E**
- **Product 44-E** Lawyer Court-Ready Review Workspace — `verify:aibeopchin-court-ready-case-record-pack-phase44e`
- [AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY.md) — **Product 44-F**
- [AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_RUNBOOK.md](./operations/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_RUNBOOK.md) — **Product 44-F**
- **Product 44-F** Court-Ready Case Record Pack RC — `verify:aibeopchin-court-ready-case-record-pack-rc`
- [AIBEOPCHIN_SOURCE_PROVENANCE_TRACE_REGISTRY_RUNBOOK.md](./operations/AIBEOPCHIN_SOURCE_PROVENANCE_TRACE_REGISTRY_RUNBOOK.md) — **Product 45-A**
- **Product 45-A** Source Provenance Trace Registry — `verify:aibeopchin-judicial-transparency-explainability-phase45a`
- [AIBEOPCHIN_JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_RUNBOOK.md](./operations/AIBEOPCHIN_JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_RUNBOOK.md) — **Product 45-B**
- **Product 45-B** Judgment & Claim Link Explainability Engine — `verify:aibeopchin-judicial-transparency-explainability-phase45b`
- [AIBEOPCHIN_SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_RUNBOOK.md](./operations/AIBEOPCHIN_SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_RUNBOOK.md) — **Product 45-C**
- **Product 45-C** Similarity / Difference & Uncertainty Signal Engine — `verify:aibeopchin-judicial-transparency-explainability-phase45c`
- [AIBEOPCHIN_LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_RUNBOOK.md) — **Product 45-D**
- **Product 45-D** Lawyer Correction & Final Reviewer Trace — `verify:aibeopchin-judicial-transparency-explainability-phase45d`
- [AIBEOPCHIN_COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_RUNBOOK.md](./operations/AIBEOPCHIN_COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_RUNBOOK.md) — **Product 45-E**
- **Product 45-E** Court-Ready Pack Item Explainability Workspace — `verify:aibeopchin-judicial-transparency-explainability-phase45e`
- [AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY.md) — **Product 45-F**
- [AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_RUNBOOK.md](./operations/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_RUNBOOK.md) — **Product 45-F**
- **Product 45-F** Judicial Transparency / Explainability RC — `verify:aibeopchin-judicial-transparency-explainability-rc`
- [AIBEOPCHIN_NEUTRAL_CASE_SUMMARY_VIEW_RUNBOOK.md](./operations/AIBEOPCHIN_NEUTRAL_CASE_SUMMARY_VIEW_RUNBOOK.md) — **Product 46-A**
- **Product 46-A** Neutral Case Summary View — `verify:aibeopchin-neutral-litigation-review-pack-phase46a`
- [AIBEOPCHIN_STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_RUNBOOK.md](./operations/AIBEOPCHIN_STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_RUNBOOK.md) — **Product 46-B**
- **Product 46-B** Strategy / Confidential Material Exclusion Policy — `verify:aibeopchin-neutral-litigation-review-pack-phase46b`
- [AIBEOPCHIN_LAWYER_CONTROLLED_EXPORT_SCOPE_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_CONTROLLED_EXPORT_SCOPE_RUNBOOK.md) — **Product 46-C**
- **Product 46-C** Lawyer-Controlled Export Scope — `verify:aibeopchin-neutral-litigation-review-pack-phase46c`
- [AIBEOPCHIN_MEDIATION_HEARING_PREPARATION_PACK_RUNBOOK.md](./operations/AIBEOPCHIN_MEDIATION_HEARING_PREPARATION_PACK_RUNBOOK.md) — **Product 46-D**
- **Product 46-D** Mediation / Hearing Preparation Pack — `verify:aibeopchin-neutral-litigation-review-pack-phase46d`
- [AIBEOPCHIN_NEUTRAL_PACK_REVIEW_WORKSPACE_RUNBOOK.md](./operations/AIBEOPCHIN_NEUTRAL_PACK_REVIEW_WORKSPACE_RUNBOOK.md) — **Product 46-E**
- **Product 46-E** Neutral Pack Review Workspace — `verify:aibeopchin-neutral-litigation-review-pack-phase46e`
- [AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY.md) — **Product 46-F**
- [AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_RUNBOOK.md](./operations/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_RUNBOOK.md) — **Product 46-F**
- **Product 46-F** Neutral Litigation Review Pack RC — `verify:aibeopchin-neutral-litigation-review-pack-rc`
- [AIBEOPCHIN_JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_RUNBOOK.md](./operations/AIBEOPCHIN_JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_RUNBOOK.md) — **Product 47-A**
- **Product 47-A** Judgment-Grounded Assessment Bundle Gate — `verify:aibeopchin-legal-reliability-phase47a`
- [AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_RUNBOOK.md](./operations/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_RUNBOOK.md) — **Product 47-B**
- **Product 47-B** Sentencing Outcome Assessment Bundle Gate — `verify:aibeopchin-legal-reliability-phase47b`
- [AIBEOPCHIN_EVIDENCE_INTEGRITY_BUNDLE_GATE_RUNBOOK.md](./operations/AIBEOPCHIN_EVIDENCE_INTEGRITY_BUNDLE_GATE_RUNBOOK.md) — **Product 47-C**
- **Product 47-C** Evidence Integrity Bundle Gate — `verify:aibeopchin-legal-reliability-phase47c`
- [AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_RUNBOOK.md](./operations/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_RUNBOOK.md) — **Product 47-D**
- **Product 47-D** Claim-Evidence-Judgment Graph Bundle Gate — `verify:aibeopchin-legal-reliability-phase47d`
- [AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_RUNBOOK.md](./operations/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_RUNBOOK.md) — **Product 47-E**
- **Product 47-E** Court-Ready Case Record Pack Bundle Gate — `verify:aibeopchin-legal-reliability-phase47e`
- [AIBEOPCHIN_EXPLAINABILITY_TRACE_BUNDLE_GATE_RUNBOOK.md](./operations/AIBEOPCHIN_EXPLAINABILITY_TRACE_BUNDLE_GATE_RUNBOOK.md) — **Product 47-F**
- **Product 47-F** Explainability Trace Bundle Gate — `verify:aibeopchin-legal-reliability-phase47f`
- [AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_RUNBOOK.md](./operations/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_RUNBOOK.md) — **Product 47-G**
- **Product 47-G** Neutral Litigation Review Pack Bundle Gate — `verify:aibeopchin-legal-reliability-phase47g`
- [AIBEOPCHIN_LEGAL_RELIABILITY_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_LEGAL_RELIABILITY_RC_LOCK_SUMMARY.md) — **Product 47-RC**
- [AIBEOPCHIN_LEGAL_RELIABILITY_RC_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_RC_RUNBOOK.md) — **Product 47-RC**
- **Product 47-RC** Legal Reliability RC — `verify:aibeopchin-legal-reliability-rc`
- [AIBEOPCHIN_LAWYER_WORKBENCH_NAVIGATION_SHELL_RUNBOOK.md](./operations/AIBEOPCHIN_LAWYER_WORKBENCH_NAVIGATION_SHELL_RUNBOOK.md) — **Product 48-A**
- **Product 48-A** Lawyer Workbench Navigation Shell — `verify:aibeopchin-legal-reliability-lawyer-workbench-phase48a`
- [AIBEOPCHIN_LITIGATION_RISK_RADAR_PANEL_RUNBOOK.md](./operations/AIBEOPCHIN_LITIGATION_RISK_RADAR_PANEL_RUNBOOK.md) — **Product 48-B**
- **Product 48-B** Litigation Risk Radar Panel — `verify:aibeopchin-legal-reliability-lawyer-workbench-phase48b`
- [AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_RUNBOOK.md](./operations/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_RUNBOOK.md) — **Product 48-C**
- **Product 48-C** Claim-Evidence-Judgment Graph Workspace — `verify:aibeopchin-legal-reliability-lawyer-workbench-phase48c`
- [AIBEOPCHIN_JUDGMENT_DRAWER_PRECEDENT_VIEWER_RUNBOOK.md](./operations/AIBEOPCHIN_JUDGMENT_DRAWER_PRECEDENT_VIEWER_RUNBOOK.md) — **Product 48-D**
- **Product 48-D** Judgment Drawer / Precedent Viewer — `verify:aibeopchin-legal-reliability-lawyer-workbench-phase48d`
- [AIBEOPCHIN_COURT_READY_PACK_BUILDER_UX_RUNBOOK.md](./operations/AIBEOPCHIN_COURT_READY_PACK_BUILDER_UX_RUNBOOK.md) — **Product 48-E**
- **Product 48-E** Court-ready Pack Builder UX — `verify:aibeopchin-legal-reliability-lawyer-workbench-phase48e`
- [AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_SUMMARY.md](./platform/AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_SUMMARY.md) — **Product 48-F**
- [AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_RUNBOOK.md) — **Product 48-F**
- **Product 48-F** Legal Reliability Lawyer Workbench UX RC — `verify:aibeopchin-legal-reliability-lawyer-workbench-rc`
- [AIBEOPCHIN_RISK_RADAR_SUPPLEMENT_ACTION_RUNBOOK.md](./operations/AIBEOPCHIN_RISK_RADAR_SUPPLEMENT_ACTION_RUNBOOK.md) — **Product 49-A**
- [AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_SPEC.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_SPEC.md) — **Product 49-A**
- **Product 49-A** Risk Radar → Supplement Request Action — `verify:aibeopchin-legal-reliability-action-loop-phase49a`
- [AIBEOPCHIN_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_RUNBOOK.md](./operations/AIBEOPCHIN_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_RUNBOOK.md) — **Product 49-B**
- [AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_SPEC.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_SPEC.md) — **Product 49-B**
- **Product 49-B** Graph Gap → Evidence Request Action — `verify:aibeopchin-legal-reliability-action-loop-phase49b`
- [AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_SUMMARY.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_SUMMARY.md) — **Product 49-C**
- [AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_RUNBOOK.md) — **Product 49-C**
- **Product 49-C** Legal Reliability Action Loop RC — `verify:aibeopchin-legal-reliability-action-loop-rc`
- [AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_PHASE50_SPEC.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_PHASE50_SPEC.md) — **Product 50-A**
- [AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RUNBOOK.md) — **Product 50-A**
- **Product 50-A** Legal Reliability Action Operations Queue — `verify:aibeopchin-legal-reliability-action-operations-phase50a`
- **Product 50-B** Assignment / Due Date / SLA Tracking — `verify:aibeopchin-legal-reliability-action-operations-phase50b`
- **Product 50-C** Client Response & Evidence Intake Sync — `verify:aibeopchin-legal-reliability-action-operations-phase50c`
- **Product 50-D** Lawyer Completion Review — `verify:aibeopchin-legal-reliability-action-operations-phase50d`
- **Product 50-E** Command Center Execution Dashboard — `verify:aibeopchin-legal-reliability-action-operations-phase50e`
- **Product 50-F** Legal Reliability Action Operations RC — `verify:aibeopchin-legal-reliability-action-operations-rc`
- [AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_SUMMARY.md](../legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_SUMMARY.md) — **Product 50-F**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_PHASE51_SPEC.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_PHASE51_SPEC.md) — **Product 51**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_SUMMARY.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_SUMMARY.md) — **Product 51-F**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RUNBOOK.md) — **Product 51**
- [AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md) — **Product 51-D**
- **Product 51-F** Legal Reliability Production Readiness RC — `verify:aibeopchin-legal-reliability-production-readiness-rc`
- **Product 51-C** Predeploy Gate Integration — `verify:aibeopchin-legal-reliability-predeploy-readiness`
- [AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_PHASE52_SPEC.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_PHASE52_SPEC.md) — **Product 52**
- [AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK_SUMMARY.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK_SUMMARY.md) — **Product 52-F**
- [AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RUNBOOK.md) — **Product 52**
- [AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_GO_LIVE_EVIDENCE_CHECKLIST.md) — **Product 52-D/E**
- **Product 52-F** Staging Live Validation RC — `verify:aibeopchin-legal-reliability-staging-live-validation-rc`
- **Product 52** Staging Evidence Lock — `verify:aibeopchin-legal-reliability-staging-evidence-lock`
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_LOCK_SUMMARY.md) — **Product 53**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_CHECKLIST.md) — **Product 53-A**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_APPROVAL_RUNBOOK.md) — **Product 53-A**
- **Product 53-A** Production Go-Live Approval Gate — `verify:aibeopchin-legal-reliability-go-live-approval-gate`
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_EVIDENCE_CHECKLIST.md) — **Product 53-B**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_MIGRATION_RUNBOOK.md) — **Product 53-B**
- **Product 53-B** Production Migration Evidence — `verify:aibeopchin-legal-reliability-production-migration-evidence`
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_CHECKLIST.md) — **Product 53-C**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ROLE_SMOKE_RUNBOOK.md) — **Product 53-C**
- **Product 53-C** Production Role Smoke — `verify:aibeopchin-legal-reliability-production-role-smoke`
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_CHECKLIST.md) — **Product 53-D**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_ACTION_SMOKE_RUNBOOK.md) — **Product 53-D**
- **Product 53-D** Production Action Loop / Operations Smoke — `verify:aibeopchin-legal-reliability-production-action-smoke`
- [AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_CHECKLIST.md) — **Product 53-E**
- [AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_RUNBOOK.md) — **Product 53-E**
- [AIBEOPCHIN_LEGAL_RELIABILITY_ROLLBACK_READINESS_WINDOW_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_ROLLBACK_READINESS_WINDOW_RUNBOOK.md) — **Product 53-E**
- **Product 53-E** Post-Go-Live Monitoring — `verify:aibeopchin-legal-reliability-post-go-live-monitoring`
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_GO_LIVE_CONTROL_RC_RUNBOOK.md) — **Product 53-F**
- **Product 53-F** Production Go-Live Control RC — `verify:aibeopchin-legal-reliability-production-go-live-control-rc`
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_PHASE54_SPEC.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_PHASE54_SPEC.md) — **Product 54** (Commercial Production Stabilization)
- [AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_CHECKLIST.md) — **Product 54-A**
- [AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_STABILIZATION_BASELINE_RUNBOOK.md) — **Product 54-A**
- **Product 54-A** Production Stabilization Monitoring Baseline — `verify:aibeopchin-legal-reliability-stabilization-baseline`
- [AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_CHECKLIST.md) — **Product 54-B**
- [AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_RUNBOOK.md) — **Product 54-B**
- **Product 54-B** Customer Impact / Incident Severity Tracking — `verify:aibeopchin-legal-reliability-incident-severity`
- [AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_CHECKLIST.md) — **Product 54-C**
- [AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_RUNBOOK.md) — **Product 54-C**
- **Product 54-C** Hotfix / Emergency Patch Governance — `verify:aibeopchin-legal-reliability-hotfix-governance`
- [AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_CHECKLIST.md) — **Product 54-D**
- [AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_RUNBOOK.md) — **Product 54-D**
- **Product 54-D** Customer-safe Degraded Mode — `verify:aibeopchin-legal-reliability-degraded-mode`
- [AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_CHECKLIST.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_CHECKLIST.md) — **Product 54-E**
- [AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_SUPPORT_ESCALATION_RUNBOOK.md) — **Product 54-E**
- [AIBEOPCHIN_LEGAL_RELIABILITY_CUSTOMER_SAFE_MESSAGE_TEMPLATES.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_CUSTOMER_SAFE_MESSAGE_TEMPLATES.md) — **Product 54-E**
- **Product 54-E** Support / Ops Escalation Readiness — `verify:aibeopchin-legal-reliability-support-escalation`
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_LOCK_SUMMARY.md](./legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_LOCK_SUMMARY.md) — **Product 54-F**
- [AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_RUNBOOK.md](./operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_RUNBOOK.md) — **Product 54-F**
- **Product 54-F** Production Stabilization RC — `verify:aibeopchin-legal-reliability-production-stabilization-rc`
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
