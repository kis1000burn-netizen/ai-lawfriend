import { describe, expect, it } from "vitest";
import { buildSupportCsIncidentDeskSetup } from "./support-cs-incident-desk-setup.service";
import { SUPPORT_CS_INCIDENT_DESK_ITEMS } from "./support-cs-incident-desk-setup.registry";

describe("support-cs-incident-desk-setup (Phase 26-D)", () => {
  it("defines support desk items", () => {
    expect(SUPPORT_CS_INCIDENT_DESK_ITEMS.some((i) => i.itemId === "incident-desk")).toBe(true);
  });

  it("marks supportDeskReady when all configured", () => {
    const result = buildSupportCsIncidentDeskSetup();
    expect(result.supportDeskReady).toBe(true);
  });

  it("blocks ready when incident desk missing", () => {
    const result = buildSupportCsIncidentDeskSetup({ configuredItemIds: ["support-email"] });
    expect(result.supportDeskReady).toBe(false);
  });
});
