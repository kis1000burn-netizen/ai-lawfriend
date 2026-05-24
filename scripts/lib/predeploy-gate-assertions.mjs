/** Phase 16-A master predeploy gate — domain RC scripts accept this OR their own gate. */
export const FULL_LEGAL_OPS_PLATFORM_RC_MASTER_VERIFY =
  "verify:aibeopchin-full-legal-ops-platform-rc";

export function predeployIncludesMasterOrGate(predeployContent, domainGate) {
  return (
    predeployContent.includes(FULL_LEGAL_OPS_PLATFORM_RC_MASTER_VERIFY) ||
    predeployContent.includes(domainGate)
  );
}

export function assertPredeployMasterOrGate(predeployContent, domainGate, label) {
  if (!predeployIncludesMasterOrGate(predeployContent, domainGate)) {
    throw new Error(
      `scripts/predeploy-check.ts must call ${FULL_LEGAL_OPS_PLATFORM_RC_MASTER_VERIFY} (Phase 16-A) or ${domainGate} (${label})`,
    );
  }
}
