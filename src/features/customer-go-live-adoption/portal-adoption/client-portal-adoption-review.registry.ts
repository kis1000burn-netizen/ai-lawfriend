/**
 * Product Phase 37-D — Client portal adoption review SSOT.
 */
import type { ClientPortalAdoptionReviewResult } from "./client-portal-adoption-review.schema";

export const CLIENT_PORTAL_ADOPTION_REGISTRY_MARKER_PHASE37D =
  "phase37d-client-portal-adoption-registry" as const;

type ClientPortalAdoptionMetric = Omit<
  ClientPortalAdoptionReviewResult["metrics"][number],
  "defined"
>;

export const CLIENT_PORTAL_ADOPTION_METRICS: ClientPortalAdoptionMetric[] = [
  { metricId: "CLIENT_LOGIN_ACTIVATION", label: "Client login activation rate", required: true },
  { metricId: "CASE_STATUS_VIEWS", label: "Case status view engagement", required: true },
  { metricId: "DOCUMENT_DOWNLOAD", label: "Document download usage", required: true },
  { metricId: "MESSAGE_RESPONSE", label: "Message response engagement", required: true },
  { metricId: "MOBILE_PORTAL_USAGE", label: "Mobile portal usage tracking", required: true },
];
