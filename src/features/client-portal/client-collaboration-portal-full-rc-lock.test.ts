import { describe, expect, it } from "vitest";
import {
  CLIENT_COLLABORATION_PORTAL_FULL_RC_CLIENT_AUDIT_ACTIONS,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_DEADLINE_AUDIT_ACTIONS,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_DOCUMENT_DELIVERY_AUDIT_ACTIONS,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_LOCK_MARKER_PHASE15G,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_MIGRATION_DIRS,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_PHASE_VERIFY_SCRIPTS,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_EVIDENCE_TAG,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_VERIFY_SCRIPT,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_REVIEW_AUDIT_ACTIONS,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_SAFETY_PRINCIPLES,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_VERSION,
  CLIENT_COLLABORATION_PORTAL_FULL_RC_VITEST_TARGETS,
} from "./client-collaboration-portal-full-rc-lock";

describe("client-collaboration-portal-full-rc-lock (Phase 15-G)", () => {
  it("defines Full RC marker, version, and evidence tag", () => {
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_LOCK_MARKER_PHASE15G).toBe(
      "phase15g-client-collaboration-portal-full-rc-predeploy-closure",
    );
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_VERSION).toBe("15-G.1");
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_EVIDENCE_TAG).toContain("PHASE15G");
  });

  it("lists 15-A/E/F verify scripts in order", () => {
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_PHASE_VERIFY_SCRIPTS).toEqual([
      "verify:aibeopchin-client-supplement-tracking-phase15a",
      "verify:aibeopchin-court-schedule-client-reminder-phase15e",
      "verify:aibeopchin-secure-document-kakao-notice-phase15f",
    ]);
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-client-collaboration-portal-full-rc",
    );
  });

  it("includes all collaboration portal migrations through 15-F", () => {
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_MIGRATION_DIRS).toHaveLength(5);
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_MIGRATION_DIRS[3]).toBe(
      "20260525170000_litigation_deadline_client_reminder_phase15d",
    );
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_MIGRATION_DIRS[4]).toBe(
      "20260525180000_secure_document_delivery_phase15f",
    );
  });

  it("defines audit actions and safety principles across 15-A〜F", () => {
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_CLIENT_AUDIT_ACTIONS).toContain(
      "CLIENT_PORTAL_FILE_UPLOAD",
    );
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_REVIEW_AUDIT_ACTIONS).toContain(
      "CASE_CONVERSATION_MESSAGE_ADOPTED",
    );
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_DEADLINE_AUDIT_ACTIONS).toContain(
      "LITIGATION_DEADLINE_NOTIFY_SCHEDULED",
    );
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_DOCUMENT_DELIVERY_AUDIT_ACTIONS).toContain(
      "CASE_DOCUMENT_DELIVERY_SENT",
    );
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_SAFETY_PRINCIPLES).toContain(
      "EXTERNAL_MESSAGE_NO_RAW_FILE_ATTACHMENT",
    );
    expect(CLIENT_COLLABORATION_PORTAL_FULL_RC_VITEST_TARGETS).toHaveLength(3);
  });
});
