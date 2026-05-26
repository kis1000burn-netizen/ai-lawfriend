import { describe, expect, it } from "vitest";
import {
  LEGAL_INTELLIGENCE_PLATFORM_IMPLEMENTATION_ORDER,
  LEGAL_INTELLIGENCE_PLATFORM_MASTER_VERIFY_SCRIPT,
  LEGAL_INTELLIGENCE_PLATFORM_NEXT_PHASE,
  LEGAL_INTELLIGENCE_PLATFORM_PHASES,
  LEGAL_INTELLIGENCE_PLATFORM_RC_BUNDLED_VERIFY_SCRIPTS,
  LEGAL_INTELLIGENCE_PLATFORM_RC_FINAL_BOUNDARIES,
  LEGAL_INTELLIGENCE_PLATFORM_RC_TARGET_STATUS,
  LEGAL_INTELLIGENCE_PLATFORM_ROADMAP_DOC,
} from "./legal-intelligence-platform-roadmap.registry";

describe("Legal Intelligence Platform roadmap registry", () => {
  it("defines phase 59~70 axis", () => {
    expect(LEGAL_INTELLIGENCE_PLATFORM_PHASES["62"]).toBe("Evidence Gap Auto Planner");
    expect(LEGAL_INTELLIGENCE_PLATFORM_PHASES["70"]).toBe("Legal Intelligence Platform RC");
  });

  it("orders implementation after 61-A", () => {
    expect(LEGAL_INTELLIGENCE_PLATFORM_IMPLEMENTATION_ORDER[0]).toBe("61-A");
    expect(LEGAL_INTELLIGENCE_PLATFORM_IMPLEMENTATION_ORDER[1]).toBe("62");
    expect(LEGAL_INTELLIGENCE_PLATFORM_IMPLEMENTATION_ORDER.at(-1)).toBe("70");
  });

  it("points next phase to 62-C", () => {
    expect(LEGAL_INTELLIGENCE_PLATFORM_NEXT_PHASE).toBe("62-C");
  });

  it("defines platform RC target verify chain", () => {
    expect(LEGAL_INTELLIGENCE_PLATFORM_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-intelligence-platform-rc",
    );
    expect(LEGAL_INTELLIGENCE_PLATFORM_RC_BUNDLED_VERIFY_SCRIPTS).toContain(
      "verify:aibeopchin-gongbuho-intelligence-rc",
    );
    expect(LEGAL_INTELLIGENCE_PLATFORM_RC_BUNDLED_VERIFY_SCRIPTS).toContain(
      "verify:aibeopchin-control-tower-brain-rc",
    );
    expect(LEGAL_INTELLIGENCE_PLATFORM_RC_FINAL_BOUNDARIES).toContain(
      "MASTER_PLATFORM_VERIFY_REQUIRED",
    );
  });

  it("links roadmap documentation SSOT", () => {
    expect(LEGAL_INTELLIGENCE_PLATFORM_ROADMAP_DOC).toContain("PHASE62_70_ROADMAP");
    expect(LEGAL_INTELLIGENCE_PLATFORM_RC_TARGET_STATUS).toBe(
      "LEGAL_INTELLIGENCE_PLATFORM_RC_LOCKED",
    );
  });
});
