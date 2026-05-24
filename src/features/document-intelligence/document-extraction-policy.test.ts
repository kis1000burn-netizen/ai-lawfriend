import { describe, expect, it } from "vitest";
import {
  assertCanExtractDocumentIntelligence,
  assertCanReadDocumentIntelligence,
  assertCanUploadDocumentIntelligence,
} from "./document-extraction-policy";
import type { CaseAccessContext } from "@/features/cases/case.permissions";

function baseAccess(overrides: Partial<CaseAccessContext>): CaseAccessContext {
  return {
    caseId: "case-1",
    ownerUserId: "u1",
    status: "INTERVIEW_DONE",
    title: "t",
    isOwner: false,
    isAdmin: false,
    isAssignedLawyer: false,
    isAssignedStaff: false,
    canRead: true,
    canWriteCase: false,
    canManageStaffFeatures: false,
    ...overrides,
  };
}

describe("document-extraction-policy (Phase 13-B)", () => {
  it("allows read when canRead", () => {
    expect(() =>
      assertCanReadDocumentIntelligence(baseAccess({ canRead: true })),
    ).not.toThrow();
  });

  it("requires canWriteCase for upload", () => {
    expect(() =>
      assertCanUploadDocumentIntelligence(baseAccess({ canWriteCase: false })),
    ).toThrow();
    expect(() =>
      assertCanUploadDocumentIntelligence(baseAccess({ canWriteCase: true })),
    ).not.toThrow();
  });

  it("allows extract for assigned lawyer", () => {
    expect(() =>
      assertCanExtractDocumentIntelligence(
        baseAccess({ isAssignedLawyer: true }),
      ),
    ).not.toThrow();
  });
});
