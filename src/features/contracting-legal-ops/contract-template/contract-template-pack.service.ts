/**
 * Product Phase 35-A — Contract template pack service.
 */
import {
  CONTRACT_TEMPLATES,
  CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG,
} from "./contract-template-pack.registry";
import { assembleContractTemplatePack } from "./contract-template-pack.policy";
import type { ContractTemplatePackResult } from "./contract-template-pack.schema";

export const CONTRACT_TEMPLATE_PACK_SERVICE_MARKER_PHASE35A =
  "phase35a-contract-template-pack-service" as const;

export function buildContractTemplatePack(input?: {
  contractingScopeSlug?: string;
  definedTemplateIds?: string[];
}): ContractTemplatePackResult {
  const definedTemplateIds = new Set(
    input?.definedTemplateIds ??
      CONTRACT_TEMPLATES.filter((template) => template.required).map(
        (template) => template.templateId,
      ),
  );

  return assembleContractTemplatePack({
    contractingScopeSlug: input?.contractingScopeSlug ?? CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG,
    definedTemplateIds,
  });
}
