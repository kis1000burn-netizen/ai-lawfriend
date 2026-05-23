import { buildLockedAibeopchinCmbConfig } from "@/cmb/case-types/cmb-case-type-factory";
import { CMB_INTERVIEW_BLOCKS } from "@/cmb/blocks/interview-blocks";

export const FRAUD_CMB = buildLockedAibeopchinCmbConfig({
  caseType: "FRAUD",
  title: "사기",
  interviewBlocks: [CMB_INTERVIEW_BLOCKS.INCIDENT_FACTS, "fraud-amount-and-proof"],
});
