import { AIBEOPCHIN_CMB_CASE_TYPES } from "@/cmb/core/cmb-schema";
import { listCmbCaseConfigs, getCmbCaseConfig } from "@/cmb/core/cmb-registry";
import { getQuestionSetDefinitionByCodeVersion } from "@/lib/question-set-registry";
import { getTemplateDefinitionByCodeVersion } from "@/lib/document-template-registry";
import { assertCmbGatePolicyImmutable } from "@/cmb/policies/gate-policy";
import { findAdminOnlyBlocksInClientUi } from "@/cmb/policies/role-policy";
import { CMB_GONGBUHO_PACKET_CODES } from "@/cmb/blocks/gongbuho-blocks";

export type CmbValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateAllCmbConfigs(): CmbValidationResult {
  const errors: string[] = [];
  const configs = listCmbCaseConfigs();

  for (const expected of AIBEOPCHIN_CMB_CASE_TYPES) {
    if (!configs.some((c) => c.caseType === expected)) {
      errors.push(`Missing CMB config for caseType: ${expected}`);
    }
  }

  for (const config of configs) {
    errors.push(...validateSingleCmbConfig(config));
  }

  return { ok: errors.length === 0, errors };
}

export function validateSingleCmbConfig(config: ReturnType<typeof getCmbCaseConfig>): string[] {
  if (!config) return ["config is null"];

  const errors: string[] = [];

  errors.push(...assertCmbGatePolicyImmutable(config));

  const qs = getQuestionSetDefinitionByCodeVersion(
    config.interview.questionSetCode,
    config.interview.questionSetVersion,
  );
  if (!qs) {
    errors.push(
      `${config.caseType}: questionSet ${config.interview.questionSetCode}@${config.interview.questionSetVersion} not in registry`,
    );
  }

  const tpl = getTemplateDefinitionByCodeVersion(
    config.documents.templateCode,
    config.documents.templateVersion,
  );
  if (!tpl) {
    errors.push(
      `${config.caseType}: template ${config.documents.templateCode}@${config.documents.templateVersion} not in registry`,
    );
  }

  for (const code of config.gongbuho.requiredPacketCodes) {
    const known = Object.values(CMB_GONGBUHO_PACKET_CODES);
    if (!known.includes(code as (typeof known)[number])) {
      errors.push(`${config.caseType}: unknown gongbuho packetCode ${code}`);
    }
  }

  if (
    config.gongbuho.requiredPacketCodes[0] !==
    CMB_GONGBUHO_PACKET_CODES[config.caseType]
  ) {
    errors.push(
      `${config.caseType}: primary gongbuho packet must match SSOT ${CMB_GONGBUHO_PACKET_CODES[config.caseType]}`,
    );
  }

  const adminInClient = findAdminOnlyBlocksInClientUi(config.ui.clientBlocks);
  if (adminInClient.length > 0) {
    errors.push(
      `${config.caseType}: admin-only blocks exposed to client: ${adminInClient.join(", ")}`,
    );
  }

  for (const block of config.blocks) {
    if (!config.ui.visibleBlocks.includes(block)) {
      errors.push(`${config.caseType}: block ${block} missing from ui.visibleBlocks`);
    }
  }

  if (config.status === "LOCKED" && !config.audit.evidenceTag.startsWith("EVIDENCE-")) {
    errors.push(`${config.caseType}: LOCKED config requires evidenceTag`);
  }

  return errors;
}
