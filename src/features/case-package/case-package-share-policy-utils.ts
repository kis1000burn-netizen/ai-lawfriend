import { randomBytes } from "node:crypto";
import { hashSecretToken, verifySecretToken } from "@/lib/crypto/secret-token-hash";

import type {
  CasePackageAccessDecision,
  CasePackageConsentSnapshot,
  CasePackageDownloadPermissions,
  CasePackageShareScope,
  CasePackageShareStatus,
} from "./case-package-share-policy";
import {
  DEFAULT_CASE_PACKAGE_CONSENT_TEXT,
  DEFAULT_CASE_PACKAGE_DOWNLOAD_PERMISSIONS,
  DEFAULT_CASE_PACKAGE_SHARE_SCOPE,
} from "./case-package-share-policy";

type GeneratePublicCodeInput = {
  year: number;
  sequence: number;
};

type IssueAccessTokenResult = {
  plainToken: string;
  tokenHash: string;
};

type BuildConsentSnapshotInput = {
  ownerUserId: string;
  caseId: string;
  targetLawyerUserId?: string | null;
  consentedAt?: Date;
  scope?: Partial<CasePackageShareScope>;
  downloadPermissions?: Partial<CasePackageDownloadPermissions>;
  expiresAt?: Date | string | null;
  consentText?: string;
};

type EvaluateAccessInput = {
  publicCode?: string | null;
  shareExists: boolean;
  status?: CasePackageShareStatus | null;
  expiresAt?: Date | string | null;
  revokedAt?: Date | string | null;
  isLawyerAuthenticated: boolean;
  lawyerMatchesShare: boolean;
  pinRequired?: boolean;
  pinValid?: boolean;
};

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function isExpired(expiresAt: Date | string | null | undefined): boolean {
  if (!expiresAt) {
    return false;
  }
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() < Date.now();
}

export function generateCasePackagePublicCode({
  year,
  sequence,
}: GeneratePublicCodeInput): string {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new Error("year는 2000~9999 사이의 정수여야 합니다.");
  }
  if (!Number.isInteger(sequence) || sequence < 0 || sequence > 999999) {
    throw new Error("sequence는 0~999999 사이의 정수여야 합니다.");
  }
  return `AIF-${year}-${String(sequence).padStart(6, "0")}`;
}

export function hashCasePackageSecret(value: string): string {
  return hashSecretToken(value);
}

export function issueCasePackageAccessToken(): IssueAccessTokenResult {
  const plainToken = randomBytes(24).toString("base64url");
  return {
    plainToken,
    tokenHash: hashCasePackageSecret(plainToken),
  };
}

export function hashOptionalPin(pin: string): string {
  const trimmed = pin.trim();
  if (trimmed.length < 4) {
    throw new Error("PIN은 최소 4자리 이상이어야 합니다.");
  }
  return hashCasePackageSecret(trimmed);
}

export function verifyOptionalPin(input: {
  pin: string;
  pinHash: string;
}): boolean {
  try {
    if (input.pin.trim().length < 4) {
      return false;
    }
    return verifySecretToken({ value: input.pin, storedHash: input.pinHash });
  } catch {
    return false;
  }
}

export function buildCasePackageConsentSnapshot(
  input: BuildConsentSnapshotInput,
): CasePackageConsentSnapshot {
  const consentedAt = input.consentedAt ?? new Date();
  return {
    consentText: input.consentText ?? DEFAULT_CASE_PACKAGE_CONSENT_TEXT,
    consentedAt: consentedAt.toISOString(),
    ownerUserId: input.ownerUserId,
    caseId: input.caseId,
    targetLawyerUserId: input.targetLawyerUserId ?? null,
    scope: {
      ...DEFAULT_CASE_PACKAGE_SHARE_SCOPE,
      ...input.scope,
    },
    downloadPermissions: {
      ...DEFAULT_CASE_PACKAGE_DOWNLOAD_PERMISSIONS,
      ...input.downloadPermissions,
    },
    expiresAt: toIsoString(input.expiresAt),
  };
}

export function resolveCasePackageShareStatus(input: {
  status: CasePackageShareStatus;
  expiresAt?: Date | string | null;
  revokedAt?: Date | string | null;
}): CasePackageShareStatus {
  if (input.status === "REVOKED" || input.revokedAt) {
    return "REVOKED";
  }
  if (input.status === "EXPIRED" || isExpired(input.expiresAt)) {
    return "EXPIRED";
  }
  return "ACTIVE";
}

export function evaluateCasePackageAccess(
  input: EvaluateAccessInput,
): CasePackageAccessDecision {
  if (!input.publicCode?.trim()) {
    return {
      allowed: false,
      code: "INVALID_PUBLIC_CODE",
      message: "사건 패키지 고유번호가 올바르지 않습니다.",
    };
  }

  if (!input.shareExists) {
    return {
      allowed: false,
      code: "SHARE_NOT_FOUND",
      message: "사건 패키지 공유 정보를 찾을 수 없습니다.",
    };
  }

  const resolvedStatus = resolveCasePackageShareStatus({
    status: input.status ?? "ACTIVE",
    expiresAt: input.expiresAt,
    revokedAt: input.revokedAt,
  });

  if (resolvedStatus === "EXPIRED") {
    return {
      allowed: false,
      code: "SHARE_EXPIRED",
      message: "사건 패키지 공유 기간이 만료되었습니다.",
    };
  }

  if (resolvedStatus === "REVOKED") {
    return {
      allowed: false,
      code: "SHARE_REVOKED",
      message: "사건 패키지 공유가 취소되었습니다.",
    };
  }

  if (!input.isLawyerAuthenticated) {
    return {
      allowed: false,
      code: "LAWYER_AUTH_REQUIRED",
      message: "변호사 로그인이 필요합니다.",
    };
  }

  if (!input.lawyerMatchesShare) {
    return {
      allowed: false,
      code: "LAWYER_ACCESS_DENIED",
      message: "해당 사건 패키지에 접근할 권한이 없습니다.",
    };
  }

  if (input.pinRequired && !input.pinValid) {
    return {
      allowed: false,
      code: "INVALID_PIN",
      message: "접근 PIN이 올바르지 않습니다.",
    };
  }

  return {
    allowed: true,
    code: "ALLOW",
    message: "사건 패키지 접근이 허용되었습니다.",
  };
}
