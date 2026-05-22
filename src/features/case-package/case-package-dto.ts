export type CasePackageMeta = {
  caseId: string;
  packageTitle: string;
  generatedAt: string;
  packageVersion: "6.1" | "6.2";
  source: "CASE_PACKAGE_DRAFT";
};

export type CasePackageCaseInfo = {
  title: string;
  caseType?: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  keyDates: Array<{
    label: string;
    value: string;
  }>;
  keyAmounts: Array<{
    label: string;
    amount: number | null;
    currency: "KRW";
  }>;
};

export type CasePackageParties = {
  client: {
    displayName: string;
    isMasked: boolean;
  };
  opponents: Array<{
    displayName: string;
    role?: string | null;
    isMasked: boolean;
  }>;
};

export type CasePackageSummary = {
  shortSummary: string;
  detailedSummary?: string | null;
  issueCandidates: string[];
  riskNotes: string[];
};

export type CasePackageInterview = {
  answerCount: number;
  completed: boolean;
  publicSafeAnswers: Array<{
    questionKey: string;
    questionLabel: string;
    answerPreview: string;
  }>;
};

export type CasePackageAttachmentItem = {
  attachmentId: string;
  filename: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  category?: string | null;
  uploadedAt?: string | null;
  downloadable: boolean;
};

export type CasePackageDocumentItem = {
  documentId: string;
  title: string;
  status: string;
  latestVersionLabel?: string | null;
  approved: boolean;
  printable: boolean;
  guardrailSummary?: {
    generationPolicy: string;
    guardrailCheckStatusLabel: string;
    checkedAtLabel: string;
    warningMissingFieldCount: number;
  } | null;
};

export type CasePackageFollowUpItem = {
  fieldKey: string;
  label: string;
  reason: string;
  suggestedQuestion: string;
  severity: "INFO" | "WARNING" | "BLOCKING";
};

export type CasePackageSafetyInfo = {
  includesLegalAdvice: false;
  requiresLawyerReview: true;
  publicSafeOnly: true;
  notice: string;
};

export type CasePackageSharingDefaults = {
  allowSummary: true;
  allowInterview: true;
  allowAttachmentList: true;
  allowAttachmentDownload: false;
  allowDocumentDraft: false;
  allowPackagePdf: false;
  defaultExpiresInDays: 7;
};

export type CasePackageDto = {
  packageMeta: CasePackageMeta;
  caseInfo: CasePackageCaseInfo;
  parties: CasePackageParties;
  summary: CasePackageSummary;
  interview: CasePackageInterview;
  attachments: CasePackageAttachmentItem[];
  documents: CasePackageDocumentItem[];
  followUp: CasePackageFollowUpItem[];
  safety: CasePackageSafetyInfo;
  sharingDefaults: CasePackageSharingDefaults;
};
