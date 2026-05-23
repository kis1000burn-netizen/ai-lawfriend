import type {
  AibeopchinCmbCaseConfig,
  AibeopchinCmbCaseType,
  AibeopchinCmbGateKey,
} from "@/cmb/core/cmb-schema";
import { CMB_APPROVAL_BLOCKS, CMB_APPROVAL_FLOW_MODULE_IDS } from "@/cmb/blocks/approval-blocks";
import { CMB_DOCUMENT_BLOCKS } from "@/cmb/blocks/document-blocks";
import {
  CMB_GONGBUHO_BLOCKS,
  CMB_GONGBUHO_PACKET_CODES,
} from "@/cmb/blocks/gongbuho-blocks";
import { CMB_INTERVIEW_BLOCKS } from "@/cmb/blocks/interview-blocks";
import { CMB_VOICE_BLOCKS, CMB_VOICE_GATE_MODULE_IDS } from "@/cmb/blocks/voice-blocks";
import { CMB_FOUNDATION_EVIDENCE_TAG } from "@/cmb/policies/evidence-policy";

const DEFAULT_GATES: AibeopchinCmbGateKey[] = [
  "REQUIRE_CONFIRMED_INTERVIEW",
  "REQUIRE_VOICE_REVIEW_IF_VOICE_USED",
  "REQUIRE_VOICE_FINALIZE_GATE",
  "REQUIRE_OPEN_SUPLEMENT_RESOLVED",
  "REQUIRE_GONGBUHO_APPROVED_PACKET",
  "REQUIRE_LAWYER_APPROVAL_BEFORE_DELIVERY",
];

const DEFAULT_TEMPLATE = {
  templateCode: "STATEMENT_TEMPLATE_V1",
  templateVersion: "1.0.0",
  templateIds: ["STATEMENT_TEMPLATE_V1@1.0.0"],
  defaultTemplateId: "STATEMENT_TEMPLATE_V1@1.0.0",
} as const;

const DEFAULT_QUESTION_SET = {
  questionSetCode: "STATEMENT_DEFAULT_V1",
  questionSetVersion: "1.0.0",
} as const;

type BuildArgs = {
  caseType: AibeopchinCmbCaseType;
  title: string;
  interviewBlocks: string[];
  voiceEnabled?: boolean;
};

export function buildLockedAibeopchinCmbConfig(args: BuildArgs): AibeopchinCmbCaseConfig {
  const packetCode =
    CMB_GONGBUHO_PACKET_CODES[args.caseType as keyof typeof CMB_GONGBUHO_PACKET_CODES];

  const blocks = [
    CMB_INTERVIEW_BLOCKS.CLIENT_BASIC_INFO,
    ...args.interviewBlocks,
    CMB_INTERVIEW_BLOCKS.EVIDENCE_UPLOAD,
    ...(args.voiceEnabled !== false ? [CMB_VOICE_BLOCKS.VOICE_REVIEW] : []),
    CMB_DOCUMENT_BLOCKS.DOCUMENT_GENERATE,
    CMB_GONGBUHO_BLOCKS.GONGBUHO_REVIEW_CARD,
    CMB_APPROVAL_BLOCKS.LAWYER_APPROVAL,
  ];

  const voiceEnabled = args.voiceEnabled !== false;

  return {
    id: `cmb-${args.caseType.toLowerCase()}-v1`,
    caseType: args.caseType,
    title: args.title,
    version: "1.0.0",
    status: "LOCKED",

    modules: {
      interview: `${args.caseType.toLowerCase()}InterviewFlow`,
      documentTemplate: `${args.caseType.toLowerCase()}StatementTemplate`,
      gongbuhoPacket: packetCode,
      voiceGate: voiceEnabled
        ? CMB_VOICE_GATE_MODULE_IDS.STANDARD
        : CMB_VOICE_GATE_MODULE_IDS.DISABLED,
      approvalFlow: CMB_APPROVAL_FLOW_MODULE_IDS.LAWYER_REVIEW_REQUIRED,
    },

    interview: {
      ...DEFAULT_QUESTION_SET,
      requiredQuestionKeys: ["incident_date"],
      optionalQuestionKeys: [],
      voiceEnabled,
    },

    documents: {
      templateCode: DEFAULT_TEMPLATE.templateCode,
      templateVersion: DEFAULT_TEMPLATE.templateVersion,
      templateIds: [...DEFAULT_TEMPLATE.templateIds],
      defaultTemplateId: DEFAULT_TEMPLATE.defaultTemplateId,
      requireLawyerApproval: true,
    },

    gongbuho: {
      requiredPacketCodes: [packetCode],
      optionalPacketCodes: [],
      requireApprovedPacketsOnly: true,
    },

    gates: {
      requireConfirmedInterview: true,
      requireVoiceFinalizeGate: voiceEnabled,
      requireOpenSupplementResolved: voiceEnabled,
      requireLawyerReviewBeforeFinalize: true,
      keys: DEFAULT_GATES,
    },

    blocks,

    ui: {
      visibleBlocks: blocks,
      adminBlocks: [
        ...blocks,
        "admin-audit-trail",
        "admin-gongbuho-ops",
      ],
      lawyerBlocks: blocks.filter((b) => b !== CMB_INTERVIEW_BLOCKS.EVIDENCE_UPLOAD),
      clientBlocks: blocks.filter(
        (b) =>
          ![
            CMB_APPROVAL_BLOCKS.LAWYER_APPROVAL,
            "admin-audit-trail",
            "admin-gongbuho-ops",
          ].includes(b),
      ),
    },

    audit: {
      evidenceTag: CMB_FOUNDATION_EVIDENCE_TAG,
      changeReasonRequired: true,
    },
  };
}
