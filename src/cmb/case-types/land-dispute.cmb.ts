import { buildLockedAibeopchinCmbConfig } from "@/cmb/case-types/cmb-case-type-factory";
import { CMB_INTERVIEW_BLOCKS } from "@/cmb/blocks/interview-blocks";

export const LAND_DISPUTE_CMB = buildLockedAibeopchinCmbConfig({
  caseType: "LAND_DISPUTE",
  title: "부동산 분쟁",
  interviewBlocks: [
    "property-and-parties",
    CMB_INTERVIEW_BLOCKS.INCIDENT_FACTS,
  ],
});
