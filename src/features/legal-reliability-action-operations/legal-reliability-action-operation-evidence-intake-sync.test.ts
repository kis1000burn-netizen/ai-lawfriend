import { describe, expect, it } from "vitest";
import {
  buildEvidenceIntakeLinksForUploadedFiles,
  deriveEvidenceIntakeStatusFromLinks,
} from "./legal-reliability-action-operation-evidence-intake-sync.service";

describe("legal-reliability-action-operation-evidence-intake-sync (Phase 50-C)", () => {
  it("links uploaded files as UNDER_REVIEW intake candidates", () => {
    const links = buildEvidenceIntakeLinksForUploadedFiles({
      operationId: "op-1",
      caseId: "case-1",
      sourceSupplementRequestId: "sup-1",
      uploadedFileIds: ["file-1", "file-2"],
    });

    expect(links).toHaveLength(2);
    expect(links.every((link) => link.intakeStatus === "UNDER_REVIEW")).toBe(true);
    expect(links.every((link) => !link.confirmedEvidenceItemId)).toBe(true);
  });

  it("derives UNDER_REVIEW evidence intake status when files exist", () => {
    const links = buildEvidenceIntakeLinksForUploadedFiles({
      operationId: "op-1",
      caseId: "case-1",
      sourceSupplementRequestId: "sup-1",
      uploadedFileIds: ["file-1"],
    });

    expect(deriveEvidenceIntakeStatusFromLinks(links, 1)).toBe("UNDER_REVIEW");
  });

  it("does not auto-promote uploaded files to confirmed evidence", () => {
    const links = buildEvidenceIntakeLinksForUploadedFiles({
      operationId: "op-1",
      caseId: "case-1",
      sourceSupplementRequestId: "sup-1",
      uploadedFileIds: ["file-1"],
    });

    expect(links[0]?.confirmedEvidenceItemId).toBeUndefined();
    expect(deriveEvidenceIntakeStatusFromLinks(links, 1)).not.toBe("LAWYER_CONFIRMED");
  });
});
