/**
 * Product Phase 35-A — Contract template pack SSOT.
 */
import type { ContractTemplatePackResult } from "./contract-template-pack.schema";

export const CONTRACT_TEMPLATE_PACK_REGISTRY_MARKER_PHASE35A =
  "phase35a-contract-template-pack-registry" as const;

export const CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG = "contracting-legal-ops-001" as const;

type ContractTemplateItem = Omit<ContractTemplatePackResult["templates"][number], "defined">;

export const CONTRACT_TEMPLATES: ContractTemplateItem[] = [
  { templateId: "MSA", label: "Master services agreement", required: true },
  { templateId: "ORDER_FORM", label: "Order form template", required: true },
  { templateId: "SOW", label: "Statement of work template", required: true },
  { templateId: "AMENDMENT", label: "Contract amendment template", required: true },
  { templateId: "NDA", label: "Mutual NDA template", required: true },
];
