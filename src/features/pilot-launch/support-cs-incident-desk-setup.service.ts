/**
 * Product Phase 26-D — Support / CS / incident desk setup service.
 */
import { assembleSupportCsIncidentDeskSetup } from "./support-cs-incident-desk-setup.policy";
import { SUPPORT_CS_INCIDENT_DESK_ITEMS } from "./support-cs-incident-desk-setup.registry";
import type { SupportCsIncidentDeskSetupResult } from "./support-cs-incident-desk-setup.schema";

export const SUPPORT_CS_INCIDENT_DESK_SETUP_SERVICE_MARKER_PHASE26D =
  "phase26d-support-cs-incident-desk-setup-service" as const;

export function buildSupportCsIncidentDeskSetup(input?: {
  configuredItemIds?: string[];
}): SupportCsIncidentDeskSetupResult {
  const configuredItemIds = new Set(
    input?.configuredItemIds ?? SUPPORT_CS_INCIDENT_DESK_ITEMS.map((item) => item.itemId),
  );

  return assembleSupportCsIncidentDeskSetup({ configuredItemIds });
}
