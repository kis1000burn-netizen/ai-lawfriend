import { CASE_PACKAGE_CLIENT_CONSENT_TEXT } from "./case-package-privacy-security-policy";

export type CasePackageShareStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export type CasePackageAccessDecisionCode =
  | "ALLOW"
  | "INVALID_PUBLIC_CODE"
  | "SHARE_NOT_FOUND"
  | "SHARE_EXPIRED"
  | "SHARE_REVOKED"
  | "LAWYER_AUTH_REQUIRED"
  | "LAWYER_ACCESS_DENIED"
  | "INVALID_PIN"
  | "SHARE_SCOPE_DENIED";

export type CasePackageShareScope = {
  allowSummary: boolean;
  allowInterview: boolean;
  allowAttachmentList: boolean;
  allowDocumentDraft: boolean;
};

export type CasePackageDownloadPermissions = {
  allowAttachmentDownload: boolean;
  allowPackagePdf: boolean;
  allowDocumentDownload: boolean;
};

export type CasePackageConsentSnapshot = {
  consentText: string;
  consentedAt: string;
  ownerUserId: string;
  caseId: string;
  targetLawyerUserId?: string | null;
  scope: CasePackageShareScope;
  downloadPermissions: CasePackageDownloadPermissions;
  expiresAt?: string | null;
};

export type CasePackageAccessAction =
  | "VIEW"
  | "DOWNLOAD"
  | "DENIED"
  | "EXPIRED"
  | "REVOKED";

export type CasePackageAccessTargetType =
  | "SUMMARY"
  | "INTERVIEW"
  | "ATTACHMENT_LIST"
  | "ATTACHMENT"
  | "DOCUMENT"
  | "PACKAGE";

export type CasePackageAccessDecision = {
  allowed: boolean;
  code: CasePackageAccessDecisionCode;
  message: string;
};

export const DEFAULT_CASE_PACKAGE_SHARE_SCOPE: CasePackageShareScope = {
  allowSummary: true,
  allowInterview: true,
  allowAttachmentList: true,
  allowDocumentDraft: false,
};

export const DEFAULT_CASE_PACKAGE_DOWNLOAD_PERMISSIONS: CasePackageDownloadPermissions =
  {
    allowAttachmentDownload: false,
    allowPackagePdf: false,
    allowDocumentDownload: false,
  };

export const DEFAULT_CASE_PACKAGE_CONSENT_TEXT = CASE_PACKAGE_CLIENT_CONSENT_TEXT;
