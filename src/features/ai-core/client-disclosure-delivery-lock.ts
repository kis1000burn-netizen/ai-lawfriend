/**
 * Phase 11-C — Client Disclosure Delivery / Client Portal Binding marker SSOT.
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md
 */
export const CLIENT_DISCLOSURE_DELIVERY_LOCK_MARKER_PHASE11C =
  "phase11c-client-disclosure-delivery-portal-binding" as const;

export const CLIENT_DISCLOSURE_DELIVERY_EVIDENCE_TAG =
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11C-CLIENT-DISCLOSURE-DELIVERY" as const;

export const CLIENT_DISCLOSURE_DELIVERY_API_ROUTES = [
  "/api/cases/[caseId]/client-disclosure-delivery",
] as const;

export const CLIENT_DISCLOSURE_DELIVERY_VITEST_TARGETS = [
  "src/features/ai-core/client-disclosure-delivery.service.test.ts",
] as const;
