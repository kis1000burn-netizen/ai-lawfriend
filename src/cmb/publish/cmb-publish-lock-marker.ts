/** CMB Publish/Lock Audit actions (AuditLog.action) */
export const CMB_AUDIT_ACTIONS = {
  CMB_BASELINE_SYNCED: "CMB_BASELINE_SYNCED",
  CMB_REVISION_TRANSITION: "CMB_REVISION_TRANSITION",
  CMB_REVISION_PUBLISHED: "CMB_REVISION_PUBLISHED",
} as const;

export type CmbAuditAction = (typeof CMB_AUDIT_ACTIONS)[keyof typeof CMB_AUDIT_ACTIONS];

export const CMB_PHASE6F_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6F-PUBLISH-LOCK" as const;

/** Phase 6-F Prisma migration (배포 전 db:migrate) */
export const CMB_PUBLISH_LOCK_REQUIRED_MIGRATION_DIRS = [
  "20260524200000_aibeopchin_cmb_publish_lock",
] as const;
