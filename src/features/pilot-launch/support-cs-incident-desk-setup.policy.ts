/**
 * Product Phase 26-D — Support / CS / incident desk setup policy SSOT.
 */
import { SUPPORT_CS_INCIDENT_DESK_ITEMS } from "./support-cs-incident-desk-setup.registry";
import type { SupportCsIncidentDeskSetupResult } from "./support-cs-incident-desk-setup.schema";
import { SUPPORT_CS_INCIDENT_DESK_SETUP_VERSION } from "./support-cs-incident-desk-setup.schema";

export const SUPPORT_CS_INCIDENT_DESK_SETUP_POLICY_MARKER_PHASE26D =
  "phase26d-support-cs-incident-desk-setup-policy" as const;

export function assembleSupportCsIncidentDeskSetup(input: {
  configuredItemIds: Set<string>;
  generatedAt?: string;
}): SupportCsIncidentDeskSetupResult {
  const items = SUPPORT_CS_INCIDENT_DESK_ITEMS.map((item) => ({
    ...item,
    configured: input.configuredItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const configuredRequired = required.filter((item) => item.configured).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((configuredRequired / required.length) * 100);

  return {
    version: SUPPORT_CS_INCIDENT_DESK_SETUP_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    supportDeskReady: configuredRequired === required.length,
  };
}
