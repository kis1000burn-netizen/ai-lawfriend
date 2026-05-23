import { buildLockedAibeopchinCmbConfig } from "@/cmb/case-types/cmb-case-type-factory";

export const CONTENTS_CERTIFIED_DEMAND_CMB = buildLockedAibeopchinCmbConfig({
  caseType: "CONTENTS_CERTIFIED_DEMAND",
  title: "내용증명",
  interviewBlocks: ["demand-facts", "recipient-and-deadline"],
});
