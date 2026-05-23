/**
 * AI법친 CMB Layer — Case · Module · Block 구성 스키마 (Phase 6-B SSOT)
 * @see docs/cmb/AIBEOPCHIN_CMB_SCHEMA.md
 */

export const AIBEOPCHIN_CMB_STATUSES = [
  "DRAFT",
  "REVIEW",
  "VERIFY_PASS",
  "LOCKED",
  "PUBLISHED",
] as const;

export type AibeopchinCmbStatus = (typeof AIBEOPCHIN_CMB_STATUSES)[number];

/** Gongbuho `Case.category` ↔ `GongbuhoPacket.caseType` 와 동일 축 */
export const AIBEOPCHIN_CMB_CASE_TYPES = [
  "FRAUD",
  "WAGE_BACKPAY",
  "LAND_DISPUTE",
  "CONTENTS_CERTIFIED_DEMAND",
  "CRIMINAL_COMPLAINT_DRAFT",
] as const;

export type AibeopchinCmbCaseType = (typeof AIBEOPCHIN_CMB_CASE_TYPES)[number];

export type AibeopchinCmbGateKey =
  | "REQUIRE_CONFIRMED_INTERVIEW"
  | "REQUIRE_VOICE_REVIEW_IF_VOICE_USED"
  | "REQUIRE_VOICE_FINALIZE_GATE"
  | "REQUIRE_OPEN_SUPLEMENT_RESOLVED"
  | "REQUIRE_GONGBUHO_APPROVED_PACKET"
  | "REQUIRE_LAWYER_APPROVAL_BEFORE_DELIVERY";

export type AibeopchinCmbRoleBlockScope = "client" | "lawyer" | "admin";

export type AibeopchinCmbCaseConfig = {
  id: string;
  caseType: AibeopchinCmbCaseType;
  title: string;
  version: string;
  status: AibeopchinCmbStatus;

  modules: {
    interview: string;
    documentTemplate: string;
    gongbuhoPacket: string;
    voiceGate: string;
    approvalFlow: string;
  };

  interview: {
    questionSetCode: string;
    questionSetVersion: string;
    requiredQuestionKeys: string[];
    optionalQuestionKeys: string[];
    voiceEnabled: boolean;
  };

  documents: {
    templateCode: string;
    templateVersion: string;
    templateIds: string[];
    defaultTemplateId: string;
    requireLawyerApproval: boolean;
  };

  gongbuho: {
    requiredPacketCodes: string[];
    optionalPacketCodes: string[];
    requireApprovedPacketsOnly: boolean;
  };

  gates: {
    requireConfirmedInterview: boolean;
    requireVoiceFinalizeGate: boolean;
    requireOpenSupplementResolved: boolean;
    requireLawyerReviewBeforeFinalize: boolean;
    keys: AibeopchinCmbGateKey[];
  };

  blocks: string[];

  ui: {
    visibleBlocks: string[];
    adminBlocks: string[];
    lawyerBlocks: string[];
    clientBlocks: string[];
  };

  audit: {
    evidenceTag: string;
    changeReasonRequired: boolean;
  };
};
