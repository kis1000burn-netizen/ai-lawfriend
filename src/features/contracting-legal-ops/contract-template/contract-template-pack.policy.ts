/**
 * Product Phase 35-A — Contract template pack policy SSOT.
 */
import { CONTRACT_TEMPLATES } from "./contract-template-pack.registry";
import type { ContractTemplatePackResult } from "./contract-template-pack.schema";
import { CONTRACT_TEMPLATE_PACK_VERSION } from "./contract-template-pack.schema";

export const CONTRACT_TEMPLATE_PACK_POLICY_MARKER_PHASE35A =
  "phase35a-contract-template-pack-policy" as const;

export const CONTRACT_TEMPLATE_PACK_GATE_MARKER_PHASE35A = "phase35a-contract-template-gate" as const;

export function assembleContractTemplatePack(input: {
  contractingScopeSlug: string;
  definedTemplateIds: Set<string>;
  generatedAt?: string;
}): ContractTemplatePackResult {
  const templates = CONTRACT_TEMPLATES.map((template) => ({
    ...template,
    defined: input.definedTemplateIds.has(template.templateId),
  }));

  const required = templates.filter((template) => template.required);
  const definedRequired = required.filter((template) => template.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CONTRACT_TEMPLATE_PACK_VERSION,
    contractingScopeSlug: input.contractingScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    templates,
    completionRate,
    contractTemplatePackReady: definedRequired === required.length,
  };
}
