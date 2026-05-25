/**
 * Product Phase 32-E — Certification readiness gap review items SSOT.
 */
import type {
  CertificationGapStatus,
  CertificationReadinessGapReviewResult,
} from "./certification-gap-review.schema";

export const CERTIFICATION_GAP_REVIEW_REGISTRY_MARKER_PHASE32E =
  "phase32e-certification-gap-review-registry" as const;

type CertificationGapItemDef = Omit<
  CertificationReadinessGapReviewResult["gaps"][number],
  "status"
> & {
  defaultStatus: CertificationGapStatus;
};

export const CERTIFICATION_GAP_ITEMS: CertificationGapItemDef[] = [
  {
    gapId: "ISMS_ACCESS_CONTROL",
    label: "Access control and authorization",
    framework: "ISMS-P",
    required: true,
    defaultStatus: "MET",
  },
  {
    gapId: "ISO27001_LOGGING",
    label: "Logging and monitoring evidence",
    framework: "ISO27001",
    required: true,
    defaultStatus: "MET",
  },
  {
    gapId: "SOC2_CHANGE_MGMT",
    label: "Change management and release control",
    framework: "SOC2",
    required: true,
    defaultStatus: "PARTIAL",
  },
  {
    gapId: "DATA_GOVERNANCE_RETENTION",
    label: "Data governance retention and redaction",
    framework: "ISMS-P/ISO27001",
    required: true,
    defaultStatus: "MET",
  },
  {
    gapId: "INCIDENT_DRILL",
    label: "Incident response drill evidence",
    framework: "ISO27001/SOC2",
    required: true,
    defaultStatus: "PARTIAL",
  },
  {
    gapId: "AI_GOVERNANCE",
    label: "AI call governance and sensitive data handling",
    framework: "SOC2/customer audit",
    required: true,
    defaultStatus: "PARTIAL",
  },
];
