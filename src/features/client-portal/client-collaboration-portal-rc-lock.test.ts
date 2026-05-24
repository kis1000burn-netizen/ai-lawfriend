import { describe, expect, it } from "vitest";
import {
  CLIENT_COLLABORATION_PORTAL_RC_CLIENT_AUDIT_ACTIONS,
  CLIENT_COLLABORATION_PORTAL_RC_COMMAND_CENTER_AUDIT_ACTIONS,
  CLIENT_COLLABORATION_PORTAL_RC_LOCK_MARKER_PHASE15D,
  CLIENT_COLLABORATION_PORTAL_RC_MIGRATION_DIRS,
  CLIENT_COLLABORATION_PORTAL_RC_PHASE_VERIFY_SCRIPTS,
  CLIENT_COLLABORATION_PORTAL_RC_PREDEPLOY_EVIDENCE_TAG,
  CLIENT_COLLABORATION_PORTAL_RC_UI_SMOKE_TESTIDS,
  CLIENT_COLLABORATION_PORTAL_RC_VITEST_TARGETS,
} from "./client-collaboration-portal-rc-lock";

describe("client-collaboration-portal-rc-lock (Phase 15-D)", () => {
  it("defines RC marker and evidence tag", () => {
    expect(CLIENT_COLLABORATION_PORTAL_RC_LOCK_MARKER_PHASE15D).toBe(
      "phase15d-client-collaboration-portal-rc-predeploy-closure",
    );
    expect(CLIENT_COLLABORATION_PORTAL_RC_PREDEPLOY_EVIDENCE_TAG).toContain("PHASE15D");
  });

  it("lists 15-A〜15-C.3 verify script", () => {
    expect(CLIENT_COLLABORATION_PORTAL_RC_PHASE_VERIFY_SCRIPTS).toEqual([
      "verify:aibeopchin-client-supplement-tracking-phase15a",
    ]);
  });

  it("defines migration apply order through 15-C.2 (excludes 15-E)", () => {
    expect(CLIENT_COLLABORATION_PORTAL_RC_MIGRATION_DIRS).toHaveLength(3);
    expect(CLIENT_COLLABORATION_PORTAL_RC_MIGRATION_DIRS[2]).toBe(
      "20260525160000_client_portal_phase15c2_review_gate",
    );
    expect(CLIENT_COLLABORATION_PORTAL_RC_MIGRATION_DIRS).not.toContain(
      "20260525170000_litigation_deadline_client_reminder_phase15d",
    );
  });

  it("defines audit actions and UI smoke testids", () => {
    expect(CLIENT_COLLABORATION_PORTAL_RC_CLIENT_AUDIT_ACTIONS).toContain(
      "CLIENT_PORTAL_FILE_UPLOAD",
    );
    expect(CLIENT_COLLABORATION_PORTAL_RC_COMMAND_CENTER_AUDIT_ACTIONS).toContain(
      "CASE_CONVERSATION_MESSAGE_ADOPTED",
    );
    expect(CLIENT_COLLABORATION_PORTAL_RC_UI_SMOKE_TESTIDS).toContain(
      "lcc-section-conversation",
    );
    expect(CLIENT_COLLABORATION_PORTAL_RC_VITEST_TARGETS[0]).toContain("client-portal");
  });
});
