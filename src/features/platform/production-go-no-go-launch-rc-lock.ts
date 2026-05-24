/**
 * Phase 16-D — Production Go/No-Go Decision & Launch Record (SSOT).
 * Post–16-C cutover readiness: who approved deploy, when, on which commit, and go/no-go.
 * @see docs/platform/AIBEOPCHIN_PRODUCTION_GO_NO_GO_LAUNCH_RC_LOCK_SUMMARY.md
 */
export const PRODUCTION_GO_NO_GO_LAUNCH_RC_LOCK_MARKER_PHASE16D =
  "phase16d-production-go-no-go-launch-record" as const;

export const PRODUCTION_GO_NO_GO_LAUNCH_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH" as const;

export const PRODUCTION_GO_NO_GO_LAUNCH_RC_VERSION = "16-D.1" as const;

/** Static RC verify — docs, launch record template, prerequisite phase summary */
export const PRODUCTION_GO_NO_GO_LAUNCH_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-production-go-no-go-launch-rc" as const;

/** Nine-axis cutover scope inherited from 16-C (reference only in launch record) */
export const PRODUCTION_GO_NO_GO_LAUNCH_RC_CUTOVER_AXES = [
  "Production env",
  "DB backup / migration / rollback",
  "Kakao / Email live mode",
  "OAuth production callback",
  "Storage / document-intelligence",
  "Role smoke accounts",
  "Minimum rollback criteria",
  "Release note / operator notice",
  "Post-deploy monitoring",
] as const;

export const PRODUCTION_GO_NO_GO_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-STAGING-DEPLOY-READINESS-PHASE16B-LIVE-SMOKE",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER",
] as const;

export const PRODUCTION_GO_NO_GO_LAUNCH_RC_PREREQUISITE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-full-legal-ops-platform-rc",
  "verify:aibeopchin-staging-deploy-readiness-rc",
  "verify:aibeopchin-production-release-readiness-rc",
] as const;

export const PRODUCTION_GO_NO_GO_LAUNCH_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_PRODUCTION_GO_NO_GO_LAUNCH_RC_LOCK_SUMMARY.md",
  "docs/platform/AIBEOPCHIN_PRODUCTION_GO_NO_GO_DECISION_CHECKLIST.md",
  "docs/platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE.md",
  "docs/operations/AIBEOPCHIN_PRODUCTION_GO_NO_GO_RUNBOOK.md",
  "docs/platform/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RC_LOCK_SUMMARY.md",
  "docs/minimum-rollback-playbook.md",
] as const;

/** Launch record fields required before production deploy approval */
export const PRODUCTION_GO_NO_GO_LAUNCH_RECORD_REQUIRED_FIELDS = [
  "deployApprover",
  "deployApprovedAt",
  "deployTargetCommit",
  "rollbackTargetCommit",
  "liveModeKakao",
  "liveModeEmail",
  "knownLimitations",
  "launchNote",
  "goNoGoDecision",
] as const;
