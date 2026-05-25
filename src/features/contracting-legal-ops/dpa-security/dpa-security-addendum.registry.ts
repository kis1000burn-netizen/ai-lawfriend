/**
 * Product Phase 35-D — DPA / security addendum pack SSOT.
 */
import type { DpaSecurityAddendumPackResult } from "./dpa-security-addendum.schema";

export const DPA_SECURITY_ADDENDUM_REGISTRY_MARKER_PHASE35D =
  "phase35d-dpa-security-addendum-registry" as const;

type DpaSecurityAddendumItem = Omit<DpaSecurityAddendumPackResult["addenda"][number], "defined">;

export const DPA_SECURITY_ADDENDA: DpaSecurityAddendumItem[] = [
  { addendumId: "DPA_STANDARD", label: "Standard data processing addendum", required: true },
  { addendumId: "SUBPROCESSOR_LIST", label: "Subprocessor disclosure exhibit", required: true },
  { addendumId: "SECURITY_ADDENDUM", label: "Security measures addendum", required: true },
  { addendumId: "BAA_IF_REQUIRED", label: "BAA template (if required)", required: true },
  { addendumId: "DATA_RESIDENCY_RIDER", label: "Data residency / localization rider", required: true },
];
