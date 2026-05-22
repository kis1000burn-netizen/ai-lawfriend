export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "로그인이 필요합니다.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "접근 권한이 없습니다.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message = "충돌이 발생했습니다.", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "대상을 찾을 수 없습니다.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "입력값이 올바르지 않습니다.", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}
