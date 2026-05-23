/**
 * Phase 6-G — CMB Release Candidate / Predeploy Closure 마커.
 * @see docs/cmb/AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md
 */
export const AIBEOPCHIN_CMB_RC_LOCK_MARKER_PHASE6G =
  "phase6g-aibeopchin-cmb-rc-predeploy-closure" as const;

/** Phase 6-F Publish/Lock Prisma migration (배포 전 `db:migrate`/`db:deploy` 필수) */
export const AIBEOPCHIN_CMB_RC_REQUIRED_MIGRATION_DIRS = [
  "20260524200000_aibeopchin_cmb_publish_lock",
] as const;

export const AIBEOPCHIN_CMB_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6G-RC-PREDEPLOY-CLOSURE" as const;
