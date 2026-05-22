type ApiError = {
  code?: string;
  message?: string;
  details?: unknown;
};

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "입력값을 다시 확인해 주세요.",
  EMAIL_EXISTS: "이미 가입된 이메일입니다.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  ACCOUNT_BLOCKED: "현재 로그인할 수 없는 계정입니다.",
  ACCOUNT_PENDING:
    "가입 신청이 완료되었습니다. 관리자 승인 후 서비스를 이용할 수 있습니다.",
  UNAUTHORIZED: "로그인이 필요합니다.",
  OAUTH_PROVIDER_UNAVAILABLE: "현재 사용할 수 없는 소셜 로그인입니다.",
  OAUTH_STATE_MISMATCH: "소셜 로그인 상태 검증에 실패했습니다. 다시 시도해 주세요.",
  OAUTH_CODE_EXCHANGE_FAILED: "소셜 로그인 인증 코드 교환에 실패했습니다.",
  OAUTH_PROFILE_FETCH_FAILED: "소셜 로그인 사용자 정보를 가져오지 못했습니다.",
  OAUTH_EMAIL_REQUIRED: "이 소셜 계정에서 이메일 정보를 확인할 수 없습니다.",
  OAUTH_EMAIL_NOT_VERIFIED: "이 소셜 계정의 이메일 검증이 필요합니다.",
  OAUTH_ACCESS_DENIED: "소셜 로그인 인증이 취소되었습니다.",
  OAUTH_FAILED: "소셜 로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  LAWYER_VERIFICATION_REQUIRED:
    "변호사 자격 승인 전입니다. 제출 정보를 확인하거나 관리자 승인을 기다려 주세요.",
  INTERNAL_ERROR: "서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.",
};

export function getErrorMessage(error?: ApiError | null) {
  if (!error) return "알 수 없는 오류가 발생했습니다.";
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  return error.message || "알 수 없는 오류가 발생했습니다.";
}
