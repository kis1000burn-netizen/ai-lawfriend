import { describe, expect, it } from "vitest";
import {
  CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_DEFAULT_MODE,
  CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_ENV,
  CLIENT_MOBILE_PWA_RC_DOCS,
  CLIENT_MOBILE_PWA_RC_EVIDENCE_TAG,
  CLIENT_MOBILE_PWA_RC_EVIDENCE_TAGS,
  CLIENT_MOBILE_PWA_RC_ENV_EXAMPLE_KEYS,
  CLIENT_MOBILE_PWA_RC_LOCK_MARKER_PHASE21F,
  CLIENT_MOBILE_PWA_RC_MASTER_VERIFY_SCRIPT,
  CLIENT_MOBILE_PWA_RC_ONE_LINE_CRITERION,
  CLIENT_MOBILE_PWA_RC_PHASE20F_CROSS_LINK,
  CLIENT_MOBILE_PWA_RC_PREREQUISITE_EVIDENCE_TAGS,
  CLIENT_MOBILE_PWA_RC_RUNBOOK_PATHS,
  CLIENT_MOBILE_PWA_RC_SENSITIVE_CACHE_DENY_TERMS,
  CLIENT_MOBILE_PWA_RC_SUB_PHASES,
  CLIENT_MOBILE_PWA_RC_SUB_VERIFY_SCRIPTS,
  CLIENT_MOBILE_PWA_RC_VERSION,
  isClientMobilePwaPushLiveSendEnabled,
} from "./client-mobile-pwa-rc-lock";

describe("client-mobile-pwa-rc-lock (Phase 21-F)", () => {
  it("defines Phase 21-F marker, version, and evidence tag", () => {
    expect(CLIENT_MOBILE_PWA_RC_LOCK_MARKER_PHASE21F).toBe(
      "phase21f-client-mobile-pwa-rc-gate",
    );
    expect(CLIENT_MOBILE_PWA_RC_VERSION).toBe("21-F.1");
    expect(CLIENT_MOBILE_PWA_RC_EVIDENCE_TAG).toContain("PHASE21F");
  });

  it("lists 21-A through 21-F sub-phases", () => {
    expect(Object.keys(CLIENT_MOBILE_PWA_RC_SUB_PHASES)).toEqual([
      "21-A",
      "21-B",
      "21-C",
      "21-D",
      "21-E",
      "21-F",
    ]);
  });

  it("wires master verify and five sub-phase verify scripts", () => {
    expect(CLIENT_MOBILE_PWA_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-client-mobile-rc",
    );
    expect(CLIENT_MOBILE_PWA_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
    expect(CLIENT_MOBILE_PWA_RC_SUB_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-client-mobile-phase21a",
    );
    expect(CLIENT_MOBILE_PWA_RC_SUB_VERIFY_SCRIPTS[4]).toBe(
      "verify:aibeopchin-client-mobile-phase21e",
    );
  });

  it("requires Phase 20-F prerequisite evidence", () => {
    expect(CLIENT_MOBILE_PWA_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC",
    );
  });

  it("cross-links Phase 20 deep link and notification services", () => {
    expect(CLIENT_MOBILE_PWA_RC_PHASE20F_CROSS_LINK.realMessagingMasterVerify).toBe(
      "verify:aibeopchin-real-messaging-rc",
    );
    expect(CLIENT_MOBILE_PWA_RC_PHASE20F_CROSS_LINK.mobileDeepLinkPolicy).toContain(
      "client-portal-mobile.policy",
    );
  });

  it("defaults web push live send to OFF", () => {
    expect(CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_DEFAULT_MODE).toBe("OFF");
    expect(CLIENT_MOBILE_PWA_RC_ENV_EXAMPLE_KEYS).toContain(
      CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_ENV,
    );
    expect(isClientMobilePwaPushLiveSendEnabled({})).toBe(false);
    expect(
      isClientMobilePwaPushLiveSendEnabled({
        [CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_ENV]: "true",
      }),
    ).toBe(true);
  });

  it("lists sensitive cache deny terms for PWA regression", () => {
    expect(CLIENT_MOBILE_PWA_RC_SENSITIVE_CACHE_DENY_TERMS).toContain("/api/");
    expect(CLIENT_MOBILE_PWA_RC_SENSITIVE_CACHE_DENY_TERMS).toContain(
      "shared-documents",
    );
  });

  it("lists runbooks, evidence tags, and one-line criterion", () => {
    expect(CLIENT_MOBILE_PWA_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(CLIENT_MOBILE_PWA_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(CLIENT_MOBILE_PWA_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(CLIENT_MOBILE_PWA_RC_ONE_LINE_CRITERION).toContain("PWA RC");
  });
});
