import { describe, expect, it } from "vitest";
import {
  ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D,
  evaluateCaseDocumentDeliveryExpiryEligibility,
  evaluateCasePackageShareExpiryEligibility,
  evaluateCaseSharedDocumentExpiryEligibility,
  evaluateExternalMessageLogSecureLinkEligibility,
  evaluateLitigationExtractedTextLifecycleEligibility,
  evaluateLitigationUploadedFileLifecycleEligibility,
  guardAttachmentLifecycleLegalHold,
  isCaseDocumentDeliveryTokenExpired,
  isExternalMessageSecureLinkMetadata,
  resolveCaseSharedDocumentEffectiveStatus,
} from "./attachment-lifecycle-policy";
import {
  detectLitigationStorageOrphanCandidates,
  evaluateStorageOrphanReclamationEligibility,
  summarizeOrphanDetection,
} from "./attachment-lifecycle-orphan-detection.service";
import {
  assertAttachmentLifecyclePolicyValid,
  validateAttachmentLifecyclePolicy,
} from "./attachment-lifecycle.validator";

describe("attachment lifecycle (Phase 19-D)", () => {
  it("validates policy alignment with 19-A", () => {
    const result = validateAttachmentLifecyclePolicy();
    expect(result.ok).toBe(true);
    expect(() => assertAttachmentLifecyclePolicyValid()).not.toThrow();
  });

  it("keeps purge/delete execution locked until 19-F", () => {
    expect(ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D).toBe(true);
  });

  it("blocks litigation blob purge while case open or legal hold", () => {
    const openCase = evaluateLitigationUploadedFileLifecycleEligibility({
      caseClosed: false,
      legalHoldActive: false,
    });
    expect(openCase.eligible).toBe(false);
    expect(openCase.blockedReason).toBe("CASE_NOT_CLOSED");

    const legalHold = evaluateLitigationUploadedFileLifecycleEligibility({
      caseClosed: true,
      legalHoldActive: true,
    });
    expect(legalHold.eligible).toBe(false);
    expect(legalHold.blockedReason).toBe("LEGAL_HOLD_ACTIVE");
  });

  it("resolves shared document effective status by expiry", () => {
    const reference = new Date("2026-05-24T12:00:00.000Z");
    expect(
      resolveCaseSharedDocumentEffectiveStatus({
        shareStatus: "ACTIVE",
        expiresAt: new Date("2026-05-23T00:00:00.000Z"),
        reference,
      }),
    ).toBe("EXPIRED");
  });

  it("evaluates delivery token expiry eligibility", () => {
    const reference = new Date("2026-05-24T12:00:00.000Z");
    expect(
      isCaseDocumentDeliveryTokenExpired(
        new Date("2026-05-23T00:00:00.000Z"),
        reference,
      ),
    ).toBe(true);

    const active = evaluateCaseDocumentDeliveryExpiryEligibility({
      tokenExpiresAt: new Date("2026-05-25T00:00:00.000Z"),
      deliveryStatus: "SENT",
      reference,
    });
    expect(active.eligible).toBe(false);
    expect(active.blockedReason).toBe("NOT_EXPIRED");
  });

  it("evaluates case package share expiry eligibility", () => {
    const result = evaluateCasePackageShareExpiryEligibility({
      status: "ACTIVE",
      expiresAt: new Date("2026-05-23T00:00:00.000Z"),
      reference: new Date("2026-05-24T12:00:00.000Z"),
    });
    expect(result.eligible).toBe(false);
    expect(result.blockedReason).toBe("PURGE_EXECUTION_LOCKED");
  });

  it("detects secure link metadata on ExternalMessageLog", () => {
    expect(
      isExternalMessageSecureLinkMetadata({
        metadataOnly: true,
        portalPath: "/client/cases/c1?tab=shared&share=s1",
        documentTitle: "소장",
      }),
    ).toBe(true);

    const withinWindow = evaluateExternalMessageLogSecureLinkEligibility({
      createdAt: new Date("2026-05-01T00:00:00.000Z"),
      payloadSummaryJson: {
        metadataOnly: true,
        portalPath: "/client/cases/c1",
        documentTitle: "소장",
      },
      reference: new Date("2026-05-24T00:00:00.000Z"),
    });
    expect(withinWindow.eligible).toBe(false);
    expect(withinWindow.blockedReason).toBe("WITHIN_RETENTION_WINDOW");
  });

  it("detects litigation storage orphan candidates", () => {
    const candidates = detectLitigationStorageOrphanCandidates({
      dbRecords: [
        {
          id: "f1",
          caseId: "c1",
          storagePath: "document-intelligence/c1/a.pdf",
        },
      ],
      diskRelativePaths: [
        "document-intelligence/c1/a.pdf",
        "document-intelligence/c1/orphan.bin",
      ],
    });

    const summary = summarizeOrphanDetection({ candidates });
    expect(summary.diskWithoutDbCount).toBe(1);
    expect(summary.total).toBe(1);

    const orphan = candidates[0];
    const reclaim = evaluateStorageOrphanReclamationEligibility({
      candidate: orphan,
      caseClosed: true,
      legalHoldActive: false,
    });
    expect(reclaim.blockedReason).toBe("PURGE_EXECUTION_LOCKED");
  });

  it("guards legal hold on purge actions", () => {
    const guard = guardAttachmentLifecycleLegalHold({
      legalHoldActive: true,
      legalHoldDefaultFromRegistry: false,
      action: "BLOB_RECLAIM",
    });
    expect(guard.allowed).toBe(false);
    expect(guard.blockedReason).toBe("LEGAL_HOLD_ACTIVE");
  });

  it("blocks extracted text purge without uploaded file reference", () => {
    const result = evaluateLitigationExtractedTextLifecycleEligibility({
      caseClosed: true,
      legalHoldActive: false,
      hasUploadedFileReference: false,
    });
    expect(result.eligible).toBe(false);
    expect(result.blockedReason).toBe("MISSING_EXPIRY_SIGNAL");
  });
});
