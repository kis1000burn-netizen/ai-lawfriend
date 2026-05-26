import { fail } from "@/lib/domain-api-response";
import { simpleRateLimit } from "@/lib/server/simple-rate-limit";
import {
  AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  AUTH_RATE_LIMIT_WINDOW_MS,
} from "./platform-content-protection.policy";
import { getRequestClientIp } from "./request-client-ip";

export function enforceAuthRateLimit(req: Request, scope: "login" | "signup" | "signup-lawyer") {
  const ip = getRequestClientIp(req);
  const result = simpleRateLimit({
    key: `auth:${scope}:${ip}`,
    limit: AUTH_RATE_LIMIT_MAX_ATTEMPTS,
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  });

  if (result.ok) {
    return null;
  }

  const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
  return fail("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.", 429, {
    code: "RATE_LIMITED",
    retryAfterSec,
  });
}
