import { describe, expect, it } from "vitest";
import {
  getMissingRequiredLawyerVerificationDocumentTypes,
  hasAllRequiredLawyerVerificationDocumentTypes,
  LAWYER_VERIFICATION_DOCUMENT_TYPE,
} from "./lawyer-verification-document-types";

describe("lawyer verification document types", () => {
  it("필수 증빙이 없으면 두 유형을 요구한다", () => {
    expect(getMissingRequiredLawyerVerificationDocumentTypes([])).toEqual([
      LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE,
      LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID,
    ]);
  });

  it("등록증만 있으면 신분증이 누락된다", () => {
    expect(
      getMissingRequiredLawyerVerificationDocumentTypes([
        LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE,
      ]),
    ).toEqual([LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID]);
  });

  it("필수 둘 다 있으면 충족", () => {
    expect(
      hasAllRequiredLawyerVerificationDocumentTypes([
        LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE,
        LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID,
      ]),
    ).toBe(true);
  });
});
