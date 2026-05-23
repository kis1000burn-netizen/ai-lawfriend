import { buildLockedAibeopchinCmbConfig } from "@/cmb/case-types/cmb-case-type-factory";
import { CMB_INTERVIEW_BLOCKS } from "@/cmb/blocks/interview-blocks";

export const CRIMINAL_COMPLAINT_CMB = buildLockedAibeopchinCmbConfig({
  caseType: "CRIMINAL_COMPLAINT_DRAFT",
  title: "형사고소장 초안",
  interviewBlocks: [
    CMB_INTERVIEW_BLOCKS.INCIDENT_FACTS,
    "suspect-and-damage",
  ],
});
