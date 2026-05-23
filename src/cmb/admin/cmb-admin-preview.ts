/**
 * Admin CMB Preview view model (Phase 6-E) — 순수 조립, UI/RSC 공유
 */
import type { AibeopchinCmbCaseConfig, AibeopchinCmbCaseType } from "@/cmb/core/cmb-schema";
import { getCmbCaseConfig, listCmbCaseConfigs } from "@/cmb/core/cmb-registry";
import {
  validateAllCmbConfigs,
  validateSingleCmbConfig,
} from "@/cmb/core/cmb-validator";
import {
  getCmbBlocksForRole,
  type CmbRuntimeRole,
} from "@/cmb/core/cmb-runtime";
import { getQuestionSetDefinitionByCodeVersion } from "@/lib/question-set-registry";
import { getTemplateDefinitionByCodeVersion } from "@/lib/document-template-registry";
import { CMB_FOUNDATION_EVIDENCE_TAG } from "@/cmb/policies/evidence-policy";

export type CmbAdminListItem = {
  id: string;
  caseType: AibeopchinCmbCaseType;
  title: string;
  version: string;
  status: AibeopchinCmbCaseConfig["status"];
  previewHref: string;
  validationOk: boolean;
};

export type CmbRegistryRefPreview = {
  code: string;
  version: string;
  title: string;
  registryKey: string;
  found: boolean;
};

export type CmbAdminGlobalVerifySummary = {
  command: "npm run verify:aibeopchin-cmb";
  ok: boolean;
  errors: string[];
  configCount: number;
};

export type CmbAdminCasePreview = {
  config: AibeopchinCmbCaseConfig;
  isEditable: boolean;
  lockNotice: string | null;
  questionSet: CmbRegistryRefPreview;
  documentTemplate: CmbRegistryRefPreview;
  gongbuhoPackets: string[];
  gateFlags: {
    requireConfirmedInterview: boolean;
    requireVoiceFinalizeGate: boolean;
    requireOpenSupplementResolved: boolean;
    requireLawyerReviewBeforeFinalize: boolean;
    keys: string[];
  };
  modules: AibeopchinCmbCaseConfig["modules"];
  blocks: string[];
  roleBlocks: Record<CmbRuntimeRole, string[]>;
  validation: { ok: boolean; errors: string[] };
  evidenceTag: string;
};

const CMB_RUNTIME_ROLES: CmbRuntimeRole[] = ["CLIENT", "LAWYER", "STAFF", "ADMIN"];

export function buildCmbAdminGlobalVerifySummary(): CmbAdminGlobalVerifySummary {
  const result = validateAllCmbConfigs();
  return {
    command: "npm run verify:aibeopchin-cmb",
    ok: result.ok,
    errors: result.errors,
    configCount: listCmbCaseConfigs().length,
  };
}

export function listCmbAdminListItems(): CmbAdminListItem[] {
  return listCmbCaseConfigs().map((c) => {
    const errors = validateSingleCmbConfig(c);
    return {
      id: c.id,
      caseType: c.caseType,
      title: c.title,
      version: c.version,
      status: c.status,
      previewHref: `/admin/cmb/case-types/${c.caseType}`,
      validationOk: errors.length === 0,
    };
  });
}

function buildRegistryRef(
  code: string,
  version: string,
  title: string | undefined,
): CmbRegistryRefPreview {
  const registryKey = `${code}@${version}`;
  return {
    code,
    version,
    title: title ?? "(registry 미등록)",
    registryKey,
    found: Boolean(title),
  };
}

export function buildCmbAdminCasePreview(caseType: string): CmbAdminCasePreview | null {
  const config = getCmbCaseConfig(caseType);
  if (!config) return null;

  const qs = getQuestionSetDefinitionByCodeVersion(
    config.interview.questionSetCode,
    config.interview.questionSetVersion,
  );
  const tpl = getTemplateDefinitionByCodeVersion(
    config.documents.templateCode,
    config.documents.templateVersion,
  );

  const validationErrors = validateSingleCmbConfig(config);
  const isLocked = config.status === "LOCKED" || config.status === "PUBLISHED";

  const roleBlocks = Object.fromEntries(
    CMB_RUNTIME_ROLES.map((role) => [role, getCmbBlocksForRole(config, role)]),
  ) as Record<CmbRuntimeRole, string[]>;

  return {
    config,
    isEditable: !isLocked,
    lockNotice: isLocked
      ? `${config.status} 상태 — 수정 불가, preview만 허용합니다.`
      : null,
    questionSet: buildRegistryRef(
      config.interview.questionSetCode,
      config.interview.questionSetVersion,
      qs?.title,
    ),
    documentTemplate: buildRegistryRef(
      config.documents.templateCode,
      config.documents.templateVersion,
      tpl?.title,
    ),
    gongbuhoPackets: [
      ...config.gongbuho.requiredPacketCodes,
      ...config.gongbuho.optionalPacketCodes,
    ],
    gateFlags: {
      requireConfirmedInterview: config.gates.requireConfirmedInterview,
      requireVoiceFinalizeGate: config.gates.requireVoiceFinalizeGate,
      requireOpenSupplementResolved: config.gates.requireOpenSupplementResolved,
      requireLawyerReviewBeforeFinalize: config.gates.requireLawyerReviewBeforeFinalize,
      keys: [...config.gates.keys],
    },
    modules: config.modules,
    blocks: [...config.blocks],
    roleBlocks,
    validation: {
      ok: validationErrors.length === 0,
      errors: validationErrors,
    },
    evidenceTag: config.audit.evidenceTag || CMB_FOUNDATION_EVIDENCE_TAG,
  };
}

export const CMB_ADMIN_VERIFY_COMMAND = "npm run verify:aibeopchin-cmb" as const;

export function cmbStatusBadgeClass(status: AibeopchinCmbCaseConfig["status"]): string {
  switch (status) {
    case "LOCKED":
      return "bg-slate-100 text-slate-800 ring-slate-300";
    case "PUBLISHED":
      return "bg-emerald-100 text-emerald-900 ring-emerald-300";
    case "VERIFY_PASS":
      return "bg-sky-100 text-sky-900 ring-sky-300";
    case "REVIEW":
      return "bg-amber-100 text-amber-900 ring-amber-300";
    default:
      return "bg-violet-100 text-violet-900 ring-violet-300";
  }
}
