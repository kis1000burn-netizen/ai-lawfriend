/**
 * Admin CMB adapter — Phase 6-E Preview UI
 * @see docs/cmb/AIBEOPCHIN_CMB_ADMIN_POLICY.md
 */
import type { AibeopchinCmbCaseConfig } from "@/cmb/core/cmb-schema";
import { validateSingleCmbConfig } from "@/cmb/core/cmb-validator";

export {
  buildCmbAdminCasePreview,
  buildCmbAdminGlobalVerifySummary,
  listCmbAdminListItems,
  CMB_ADMIN_VERIFY_COMMAND,
  cmbStatusBadgeClass,
  type CmbAdminCasePreview,
  type CmbAdminGlobalVerifySummary,
  type CmbAdminListItem,
} from "@/cmb/admin/cmb-admin-preview";

export function previewCmbConfigValidation(config: AibeopchinCmbCaseConfig) {
  const errors = validateSingleCmbConfig(config);
  return { ok: errors.length === 0, errors };
}

/** Phase 6-F: DRAFT → REVIEW → VERIFY_PASS → LOCKED → PUBLISHED */
export const CMB_PUBLISH_FLOW_STATUSES = [
  "DRAFT",
  "REVIEW",
  "VERIFY_PASS",
  "LOCKED",
  "PUBLISHED",
] as const;
