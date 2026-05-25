/**
 * Product Phase 51 — Legal Reliability Production Readiness schema SSOT.
 */
import { PHASE51A_REQUIRED_SCHEMA_FIELDS, PHASE51A_REQUIRED_SCHEMA_MODELS } from "./phase51a-migration-schema-readiness.lock";
import { PHASE51B_ROLE_PERMISSION_MATRIX } from "./phase51b-permission-role-boundary.lock";
import { PHASE51D_STAGING_SMOKE_STEPS } from "./phase51d-staging-operational-smoke.lock";
import { PHASE51E_FEATURE_FLAG_ENV_KEYS } from "./phase51e-rollback-disable-incident.lock";

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_SCHEMA_MARKER =
  "phase51-legal-reliability-production-readiness-schema" as const;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_SUB_PHASES = {
  "51-A": "Migration / Schema Readiness",
  "51-B": "Permission / Role Boundary Smoke",
  "51-C": "Predeploy Gate Integration",
  "51-D": "Staging Operational Smoke",
  "51-E": "Rollback / Disable / Incident Runbook",
  "51-F": "Production Readiness RC",
} as const;

export type LegalReliabilityProductionReadinessSubPhase =
  keyof typeof LEGAL_RELIABILITY_PRODUCTION_READINESS_SUB_PHASES;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_SCHEMA_MODELS =
  PHASE51A_REQUIRED_SCHEMA_MODELS;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_SCHEMA_FIELDS =
  PHASE51A_REQUIRED_SCHEMA_FIELDS;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_ROLE_MATRIX =
  PHASE51B_ROLE_PERMISSION_MATRIX;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_STAGING_SMOKE_STEPS =
  PHASE51D_STAGING_SMOKE_STEPS;

export const LEGAL_RELIABILITY_PRODUCTION_READINESS_FEATURE_FLAG_ENV_KEYS =
  PHASE51E_FEATURE_FLAG_ENV_KEYS;

export type LegalReliabilityProductionReadinessRole =
  keyof (typeof PHASE51B_ROLE_PERMISSION_MATRIX)["actionCandidateCreate"];

export type LegalReliabilityProductionReadinessPermissionDecision =
  "allow" | "deny" | "restricted" | "internal" | "lawyer_confirmed";

export function isPermissionDenied(
  decision: LegalReliabilityProductionReadinessPermissionDecision,
): boolean {
  return decision === "deny";
}
