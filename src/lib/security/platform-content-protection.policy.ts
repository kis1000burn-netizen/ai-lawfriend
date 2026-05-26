/**
 * 플랫폼 구성·민감 콘텐츠 유출 방지 SSOT.
 * 크롤링·정적 URL·무인증 접근·브루트포스 완화 기준.
 */
export const PLATFORM_CONTENT_PROTECTION_MARKER =
  "platform-content-protection-v1" as const;

/** DB storagePath — AES-256-GCM private blob */
export const ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX = "/private-encrypted/cases/" as const;

/** 레거시 public 정적 경로(신규 저장 금지, 읽기만 호환) */
export const LEGACY_PUBLIC_UPLOAD_PATH_PREFIX = "/uploads/" as const;

export const PRIVATE_UPLOAD_ROOT_ENV = "CASE_ATTACHMENT_UPLOAD_ROOT" as const;

export const DEFAULT_PRIVATE_UPLOAD_ROOT = ".private-uploads/cases" as const;

/** 인증 API IP당 허용 횟수(15분) */
export const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 20 as const;
export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/** 크롤러·색인 차단 경로(robots + X-Robots-Tag) */
export const NOINDEX_PATH_PREFIXES = [
  "/admin/",
  "/api/",
  "/cases/",
  "/dashboard/",
  "/documents/",
  "/lawyer/",
  "/login",
  "/signup",
  "/uploads/",
  "/private-encrypted/",
] as const;
