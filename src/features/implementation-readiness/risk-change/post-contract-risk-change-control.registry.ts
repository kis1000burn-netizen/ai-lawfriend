/**
 * Product Phase 36-E — Post-contract risk / change control SSOT.
 */
import type { PostContractRiskChangeControlResult } from "./post-contract-risk-change-control.schema";

export const POST_CONTRACT_RISK_CHANGE_REGISTRY_MARKER_PHASE36E =
  "phase36e-post-contract-risk-change-registry" as const;

type PostContractControl = Omit<
  PostContractRiskChangeControlResult["controls"][number],
  "defined"
>;

export const POST_CONTRACT_CONTROLS: PostContractControl[] = [
  { controlId: "CHANGE_REQUEST_PROCESS", label: "Change request process", required: true },
  { controlId: "RISK_REGISTER", label: "Implementation risk register", required: true },
  { controlId: "SCOPE_CHANGE_CONTROL", label: "Scope change control policy", required: true },
  { controlId: "INCIDENT_ESCALATION", label: "Incident escalation path", required: true },
  { controlId: "POST_GO_LIVE_REVIEW", label: "Post go-live review checkpoint", required: true },
];
