import { describe, expect, it } from "vitest";
import {
  REAL_MESSAGING_LIVE_SEND_DEFAULT_MODE,
  REAL_MESSAGING_LIVE_SEND_LIMITED_EXECUTION_ENV,
  REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE,
  REAL_MESSAGING_RC_DOCS,
  REAL_MESSAGING_RC_EVIDENCE_TAG,
  REAL_MESSAGING_RC_EVIDENCE_TAGS,
  REAL_MESSAGING_RC_ENV_EXAMPLE_KEYS,
  REAL_MESSAGING_RC_LOCK_MARKER_PHASE20F,
  REAL_MESSAGING_RC_MASTER_VERIFY_SCRIPT,
  REAL_MESSAGING_RC_ONE_LINE_CRITERION,
  REAL_MESSAGING_RC_PHASE15F_CROSS_LINK,
  REAL_MESSAGING_RC_PHASE18B_CROSS_LINK,
  REAL_MESSAGING_RC_PHASE19B_CROSS_LINK,
  REAL_MESSAGING_RC_PREREQUISITE_EVIDENCE_TAGS,
  REAL_MESSAGING_RC_RUNBOOK_PATHS,
  REAL_MESSAGING_RC_SUB_PHASES,
  REAL_MESSAGING_RC_SUB_VERIFY_SCRIPTS,
  REAL_MESSAGING_RC_VERSION,
  isRealMessagingLiveSendEnabled,
  parseRealMessagingLiveSendRecipientAllowlist,
} from "./real-messaging-rc-lock";

describe("real-messaging-rc-lock (Phase 20-F)", () => {
  it("defines Phase 20-F marker, version, and evidence tag", () => {
    expect(REAL_MESSAGING_RC_LOCK_MARKER_PHASE20F).toBe(
      "phase20f-real-messaging-rc-external-send-gate",
    );
    expect(REAL_MESSAGING_RC_VERSION).toBe("20-F.1");
    expect(REAL_MESSAGING_RC_EVIDENCE_TAG).toContain("PHASE20F");
  });

  it("lists 20-A through 20-F sub-phases", () => {
    expect(Object.keys(REAL_MESSAGING_RC_SUB_PHASES)).toEqual([
      "20-A",
      "20-B",
      "20-C",
      "20-D",
      "20-E",
      "20-F",
    ]);
  });

  it("wires master verify and five sub-phase verify scripts", () => {
    expect(REAL_MESSAGING_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-real-messaging-rc",
    );
    expect(REAL_MESSAGING_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
    expect(REAL_MESSAGING_RC_SUB_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-real-messaging-phase20a",
    );
    expect(REAL_MESSAGING_RC_SUB_VERIFY_SCRIPTS[4]).toBe(
      "verify:aibeopchin-real-messaging-phase20e",
    );
  });

  it("requires 15-F, 18-B, 19-B prerequisite evidence tags", () => {
    expect(REAL_MESSAGING_RC_PREREQUISITE_EVIDENCE_TAGS).toHaveLength(3);
    expect(REAL_MESSAGING_RC_PREREQUISITE_EVIDENCE_TAGS[0]).toContain("PHASE15F");
    expect(REAL_MESSAGING_RC_PREREQUISITE_EVIDENCE_TAGS[1]).toContain("PHASE18B");
    expect(REAL_MESSAGING_RC_PREREQUISITE_EVIDENCE_TAGS[2]).toContain("PHASE19B");
  });

  it("cross-links 18-B redelivery, 19-B redaction, and 15-F secure delivery", () => {
    expect(REAL_MESSAGING_RC_PHASE18B_CROSS_LINK.retryJobsConsolePath).toBe(
      "/admin/operations/retry-jobs",
    );
    expect(REAL_MESSAGING_RC_PHASE19B_CROSS_LINK.redactionRunbook).toContain("REDACTION");
    expect(REAL_MESSAGING_RC_PHASE15F_CROSS_LINK.deliveryNotificationService).toContain(
      "case-document-delivery-notification",
    );
  });

  it("defaults live send to DRY_RUN with env keys documented", () => {
    expect(REAL_MESSAGING_LIVE_SEND_DEFAULT_MODE).toBe("DRY_RUN");
    expect(REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE).toContain("LIVE");
    expect(REAL_MESSAGING_RC_ENV_EXAMPLE_KEYS).toContain("EMAIL_PROVIDER");
    expect(REAL_MESSAGING_RC_ENV_EXAMPLE_KEYS).toContain(
      REAL_MESSAGING_LIVE_SEND_LIMITED_EXECUTION_ENV,
    );
    expect(isRealMessagingLiveSendEnabled({})).toBe(false);
    expect(
      isRealMessagingLiveSendEnabled({
        [REAL_MESSAGING_LIVE_SEND_LIMITED_EXECUTION_ENV]: "true",
      }),
    ).toBe(true);
  });

  it("parses recipient allowlist from env", () => {
    expect(parseRealMessagingLiveSendRecipientAllowlist({})).toEqual([]);
    expect(
      parseRealMessagingLiveSendRecipientAllowlist({
        EXTERNAL_MESSAGE_LIVE_SEND_RECIPIENT_ALLOWLIST: "a@b.com, +8210",
      }),
    ).toEqual(["a@b.com", "+8210"]);
  });

  it("lists runbooks, evidence tags, and one-line criterion", () => {
    expect(REAL_MESSAGING_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(REAL_MESSAGING_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(REAL_MESSAGING_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(REAL_MESSAGING_RC_ONE_LINE_CRITERION).toContain("consent gate");
  });
});
