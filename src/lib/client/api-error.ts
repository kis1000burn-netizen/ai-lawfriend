export async function readApiErrorMessage(res: Response) {
  try {
    const json = (await res.json()) as { error?: string };
    return json?.error ?? "요청 처리 중 오류가 발생했습니다.";
  } catch {
    return "요청 처리 중 오류가 발생했습니다.";
  }
}

/** `toErrorResponse`·`{ ok, message, error }` 혼재 JSON 본문에서 메시지 추출 */
export function readJsonApiErrorMessage(json: unknown, fallback = "요청에 실패했습니다."): string {
  if (!json || typeof json !== "object") return fallback;
  const o = json as Record<string, unknown>;
  if (typeof o.error === "string") return o.error;
  if (
    o.error &&
    typeof o.error === "object" &&
    typeof (o.error as { message?: unknown }).message === "string"
  ) {
    return (o.error as { message: string }).message;
  }
  if (typeof o.message === "string") return o.message;
  return fallback;
}

/** `fail()` 응답 등에서 코드·부가 필드와 메시지를 함께 파싱 */
export function readJsonApiErrorEnvelope(
  json: unknown,
  fallback = "요청에 실패했습니다.",
): {
  message: string;
  code?: string;
  pendingAccountRole?: string;
} {
  const message = readJsonApiErrorMessage(json, fallback);
  if (!json || typeof json !== "object") {
    return { message };
  }
  const o = json as Record<string, unknown>;
  const code = typeof o.code === "string" ? o.code : undefined;
  const pendingAccountRole =
    typeof o.pendingAccountRole === "string" ? o.pendingAccountRole : undefined;
  return { message, code, pendingAccountRole };
}

/**
 * `fetch` 직후 `res.json()` 본문(`raw`)에 대해, HTTP 성공 + `{ ok: true, data }`를 엄격히 확인한 뒤 `data`를 반환.
 * 그렇지 않으면 `readJsonApiErrorMessage` 기반 `Error`를 던짐(슬라이스 1·domain envelope 클라이언트 공통).
 */
export function requireOkData<T = unknown>(res: Response, raw: unknown, fallback: string): T {
  if (!res.ok) {
    throw new Error(readJsonApiErrorMessage(raw, fallback));
  }
  if (raw == null || typeof raw !== "object") {
    throw new Error(fallback);
  }
  const o = raw as Record<string, unknown>;
  if (o.ok !== true) {
    throw new Error(readJsonApiErrorMessage(raw, fallback));
  }
  return o.data as T;
}

/**
 * `ok({ data })`가 아닌 `{ ok: true, presets }`·`{ ok: true, item }` 등 **평면 확장** 본문용.
 * HTTP 성공 + `ok === true`를 엄격히 확인한 뒤 JSON 객체 전체를 반환.
 */
export function requireOkResponseBody(
  res: Response,
  raw: unknown,
  fallback: string,
): Record<string, unknown> {
  if (!res.ok) {
    throw new Error(readJsonApiErrorMessage(raw, fallback));
  }
  if (raw == null || typeof raw !== "object") {
    throw new Error(fallback);
  }
  const o = raw as Record<string, unknown>;
  if (o.ok !== true) {
    throw new Error(readJsonApiErrorMessage(raw, fallback));
  }
  return o;
}
