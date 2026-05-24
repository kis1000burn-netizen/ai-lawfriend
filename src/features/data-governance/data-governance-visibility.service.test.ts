import { describe, expect, it } from "vitest";
import { formatBlockedReason } from "@/features/data-governance/data-governance-visibility.service";
import {
  DATA_GOVERNANCE_PURGE_EXECUTION_UI_LOCKED_PHASE19E,
  DATA_GOVERNANCE_VISIBILITY_ADMIN_PATH,
  DATA_GOVERNANCE_VISIBILITY_SNAPSHOT_API_PATH,
} from "@/features/data-governance/data-governance-rc-lock";

describe("data governance admin visibility (Phase 19-E)", () => {
  it("exposes admin paths and UI execution lock", () => {
    expect(DATA_GOVERNANCE_VISIBILITY_ADMIN_PATH).toBe(
      "/admin/operations/data-governance",
    );
    expect(DATA_GOVERNANCE_VISIBILITY_SNAPSHOT_API_PATH).toBe(
      "/api/admin/operations/data-governance-snapshot",
    );
    expect(DATA_GOVERNANCE_PURGE_EXECUTION_UI_LOCKED_PHASE19E).toBe(true);
  });

  it("formats blocked reasons for operators", () => {
    expect(formatBlockedReason("LEGAL_HOLD_ACTIVE")).toBe("Legal hold");
    expect(formatBlockedReason("PURGE_EXECUTION_LOCKED")).toContain("19-F");
    expect(formatBlockedReason(null)).toBe("—");
  });
});
