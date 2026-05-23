import { buildLockedAibeopchinCmbConfig } from "@/cmb/case-types/cmb-case-type-factory";
import { CMB_INTERVIEW_BLOCKS } from "@/cmb/blocks/interview-blocks";

export const WAGE_BACKPAY_CMB = buildLockedAibeopchinCmbConfig({
  caseType: "WAGE_BACKPAY",
  title: "임금체불",
  interviewBlocks: [
    CMB_INTERVIEW_BLOCKS.EMPLOYMENT_PERIOD,
    "unpaid-wage-detail",
  ],
});
