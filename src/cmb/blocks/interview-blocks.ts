/** Interview flow block IDs (Phase 6-C) */
export const CMB_INTERVIEW_BLOCKS = {
  CLIENT_BASIC_INFO: "client-basic-info",
  EMPLOYMENT_PERIOD: "employment-period",
  INCIDENT_FACTS: "incident-facts",
  EVIDENCE_UPLOAD: "evidence-upload",
  INTERVIEW_SUMMARY: "interview-summary",
} as const;

export type CmbInterviewBlockId =
  (typeof CMB_INTERVIEW_BLOCKS)[keyof typeof CMB_INTERVIEW_BLOCKS];
