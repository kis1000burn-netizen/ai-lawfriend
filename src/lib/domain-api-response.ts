import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, { status: 201, ...init });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, message, ...(extra ?? {}) }, { status });
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return fail("입력값이 올바르지 않습니다.", 400, {
      code: "VALIDATION_ERROR",
      details: error.flatten(),
    });
  }

  if (error instanceof AppError) {
    const extra: Record<string, unknown> = { code: error.code };
    if (error.details !== undefined) {
      extra.details = error.details;
    }
    return fail(error.message, error.statusCode, extra);
  }

  const status =
    typeof error === "object" && error !== null
      ? "statusCode" in error &&
          typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : "status" in error &&
            typeof (error as { status?: unknown }).status === "number"
          ? (error as { status: number }).status
          : 500
      : 500;

  const message =
    error instanceof Error ? error.message : "서버 오류가 발생했습니다.";

  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : undefined;

  return fail(message, status, code ? { code } : undefined);
}
