/**
 * 이관 스크립트 실패 단계(감사·요약용). reason 문자열에 전체 URL·비밀을 넣지 않는다.
 */
export type LawyerVerificationMigrationFailureStage =
  | "eligibility"
  | "download"
  | "mime"
  | "storage"
  | "db"
  | "unknown";

export function mapLawyerVerificationMigrationFailureStage(
  reason: string,
): LawyerVerificationMigrationFailureStage {
  if (reason === "SKIP_NOT_ELIGIBLE") return "eligibility";
  if (reason.startsWith("MIME_NOT_ALLOWED")) return "mime";
  if (
    reason === "LEGACY_URL_NOT_HTTP" ||
    reason.startsWith("DOWNLOAD_") ||
    reason === "DOWNLOAD_FAILED"
  ) {
    return "download";
  }
  if (reason === "STORAGE_SAVE_FAILED") return "storage";
  if (reason === "DB_UPDATE_FAILED") return "db";
  return "unknown";
}
