import type { AibeopchinCmbCaseConfig, AibeopchinCmbCaseType } from "@/cmb/core/cmb-schema";
import { FRAUD_CMB } from "@/cmb/case-types/fraud.cmb";
import { WAGE_BACKPAY_CMB } from "@/cmb/case-types/wage-backpay.cmb";
import { LAND_DISPUTE_CMB } from "@/cmb/case-types/land-dispute.cmb";
import { CONTENTS_CERTIFIED_DEMAND_CMB } from "@/cmb/case-types/contents-certified-demand.cmb";
import { CRIMINAL_COMPLAINT_CMB } from "@/cmb/case-types/criminal-complaint.cmb";

const REGISTRY: Record<AibeopchinCmbCaseType, AibeopchinCmbCaseConfig> = {
  FRAUD: FRAUD_CMB,
  WAGE_BACKPAY: WAGE_BACKPAY_CMB,
  LAND_DISPUTE: LAND_DISPUTE_CMB,
  CONTENTS_CERTIFIED_DEMAND: CONTENTS_CERTIFIED_DEMAND_CMB,
  CRIMINAL_COMPLAINT_DRAFT: CRIMINAL_COMPLAINT_CMB,
};

export function listCmbCaseConfigs(): AibeopchinCmbCaseConfig[] {
  return Object.values(REGISTRY);
}

export function getCmbCaseConfig(
  caseType: string,
): AibeopchinCmbCaseConfig | null {
  const key = caseType.trim() as AibeopchinCmbCaseType;
  return REGISTRY[key] ?? null;
}

export function getCmbCaseConfigOrThrow(caseType: string): AibeopchinCmbCaseConfig {
  const config = getCmbCaseConfig(caseType);
  if (!config) {
    throw new Error(`CMB config not found for caseType: ${caseType}`);
  }
  return config;
}

export function listRegisteredCmbCaseTypes(): AibeopchinCmbCaseType[] {
  return Object.keys(REGISTRY) as AibeopchinCmbCaseType[];
}
