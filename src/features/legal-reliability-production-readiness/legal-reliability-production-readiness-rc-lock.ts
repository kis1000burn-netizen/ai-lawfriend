/**
 * Product Phase 51-F — Legal Reliability Production Readiness RC lock SSOT.
 * @see docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_SUMMARY.md
 */
import { LEGAL_RELIABILITY_ACTION_LOOP_RC_EVIDENCE_TAG } from "../legal-reliability-action-loop/legal-reliability-action-loop-rc-lock";
import { LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_EVIDENCE_TAG } from "../legal-reliability-action-operations/legal-reliability-action-operations-rc-lock";
import { PHASE51A_LOCKED_BOUNDARIES } from "./phase51a-migration-schema-readiness.lock";
import { PHASE51B_LOCKED_BOUNDARIES } from "./phase51b-permission-role-boundary.lock";
import {
  PHASE51C_BUNDLED_VERIFY_SCRIPTS,
  PHASE51C_PREDEPLOY_READINESS_VERIFY_SCRIPT,
} from "./phase51c-predeploy-gate-integration.lock";
import { PHASE51D_LOCKED_BOUNDARIES } from "./phase51d-staging-operational-smoke.lock";
import { PHASE51E_LOCKED_BOUNDARIES } from "./phase51e-rollback-disable-incident.lock";

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_MARKER =
  "phase51f-legal-reliability-production-readiness-rc-gate" as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE51-PRODUCTION-READINESS-RC" as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_VERSION = "51-F.1" as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-production-readiness-rc" as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_PREDEPLOY_VERIFY_SCRIPT =
  PHASE51C_PREDEPLOY_READINESS_VERIFY_SCRIPT;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_ONE_LINE_CRITERION =
  "Phase 51 connects the Phase 49 Action Loop RC and Phase 50 Action Operations RC to production readiness controls, including migration checks, role-boundary smoke, predeploy gates, staging operational smoke, rollback/disable procedures, and production RC verification." as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_PREREQ_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-action-loop-rc",
  "verify:aibeopchin-legal-reliability-action-operations-rc",
] as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_BUNDLED_VERIFY_SCRIPTS = [
  ...PHASE51C_BUNDLED_VERIFY_SCRIPTS,
  PHASE51C_PREDEPLOY_READINESS_VERIFY_SCRIPT,
] as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_PREDEPLOY_GATE =
  "verify:aibeopchin-legal-reliability-production-readiness-rc" as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_SUB_PHASES = {
  "51-A": "Migration / Schema Readiness",
  "51-B": "Permission / Role Boundary Smoke",
  "51-C": "Predeploy Gate Integration",
  "51-D": "Staging Operational Smoke",
  "51-E": "Rollback / Disable / Incident Runbook",
  "51-F": "Production Readiness RC",
} as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_PREREQ_EVIDENCE_TAGS = [
  LEGAL_RELIABILITY_ACTION_LOOP_RC_EVIDENCE_TAG,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_EVIDENCE_TAG,
] as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_EVIDENCE_TAGS = [
  ...LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_PREREQ_EVIDENCE_TAGS,
  LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_EVIDENCE_TAG,
] as const;

/** RC-level boundary markers enforced across 51-A~51-E union. */
export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_CRITICAL_BOUNDARY_MARKERS = [
  "NO_PRODUCTION_DEPLOY_WITHOUT_RC_VERIFY",
  "NO_SCHEMA_DEPLOY_WITHOUT_MIGRATION_CHECK",
  "NO_CLIENT_ACCESS_TO_INTERNAL_ACTION_OPERATIONS",
  "NO_STAGING_SMOKE_SKIP",
  "NO_WRITE_ENABLE_WITHOUT_ROLLBACK_PLAN",
  "NO_DASHBOARD_AUTO_EXECUTION_IN_PRODUCTION",
  "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM_IN_PRODUCTION",
] as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCKED_BOUNDARIES = [
  ...new Set([
    ...PHASE51A_LOCKED_BOUNDARIES,
    ...PHASE51B_LOCKED_BOUNDARIES,
    ...PHASE51D_LOCKED_BOUNDARIES,
    ...PHASE51E_LOCKED_BOUNDARIES,
    ...LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_CRITICAL_BOUNDARY_MARKERS,
  ]),
] as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK = {
  phase: "51-F",
  name: "Legal Reliability Action Operations Production Readiness RC",
  status: "LOCKED",
  version: LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_VERSION,

  includes: [
    "51-A Migration / Schema Readiness",
    "51-B Permission / Role Boundary Smoke",
    "51-C Predeploy Gate Integration",
    "51-D Staging Operational Smoke",
    "51-E Rollback / Disable / Incident Runbook",
  ],

  requiredBoundaries: LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCKED_BOUNDARIES,

  criticalBoundaryMarkers: LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_CRITICAL_BOUNDARY_MARKERS,

  requiredVerifications: [
    ...LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_PREREQ_VERIFY_SCRIPTS,
    PHASE51C_PREDEPLOY_READINESS_VERIFY_SCRIPT,
    LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_MASTER_VERIFY_SCRIPT,
  ],

  productionDeployWithoutRcVerifyAllowed: false,
  schemaDeployWithoutMigrationCheckAllowed: false,
  clientInternalActionOperationsAccessAllowed: false,
  stagingSmokeSkipAllowed: false,
  writeEnableWithoutRollbackPlanAllowed: false,
  dashboardAutoExecutionInProductionAllowed: false,
  unreviewedEvidenceDownstreamInProductionAllowed: false,
} as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_SPEC_PATHS = [
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_PHASE51_SPEC.md",
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_LOCK_SUMMARY.md",
] as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_PRODUCTION_READINESS_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_STAGING_SMOKE_CHECKLIST.md",
] as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_RC_FINAL_JUDGMENT =
  "Legal Reliability Action Operations is production-readiness locked. Deployment is allowed only after RC verification, migration validation, role-boundary smoke, staging operational smoke, and rollback/disable readiness are confirmed." as const;
