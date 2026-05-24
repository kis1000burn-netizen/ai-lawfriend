/**
 * Production env readiness policy (Phase 16-C). Values never logged.
 * @see docs/operations/AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md
 */
import {
  assertStagingHttpsOrigin,
  getOAuthCallbackUrls,
  STAGING_AI_CORE_ENV_KEYS,
  STAGING_CORE_ENV_KEYS,
  STAGING_OAUTH_PROVIDERS,
  validateAuthCookieSecureForStaging,
  validateOAuthPairs,
} from "./staging-secrets-env-policy.mjs";

export { getOAuthCallbackUrls };

export const PRODUCTION_CORE_ENV_KEYS = STAGING_CORE_ENV_KEYS;

export const PRODUCTION_AI_CORE_ENV_KEYS = STAGING_AI_CORE_ENV_KEYS;

/** Documented in cutover checklist — stub vs live provider switch */
export const PRODUCTION_MESSAGING_PROVIDER_ENV_KEYS = [
  "PRODUCTION_KAKAO_ALIMTALK_MODE",
  "PRODUCTION_EMAIL_DELIVERY_MODE",
];

/** Storage / document-intelligence — at least one path must be configured for prod */
export const PRODUCTION_STORAGE_ENV_KEYS = [
  "ILLEGAL_LENDING_STORAGE_DRIVER",
  "ILLEGAL_LENDING_UPLOAD_ROOT",
];

function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const PLACEHOLDER_PATTERNS = [
  /^replace_me/i,
  /^ci-jwt-secret-minimum/i,
  /^ci-cron-secret-minimum/i,
  /^your-domain\.com$/i,
];

function isPlaceholderSecret(value) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return false;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function resolveProductionBaseUrl(env = process.env) {
  return (
    env.PRODUCTION_BASE_URL ??
    env.PLAYWRIGHT_BASE_URL ??
    env.APP_BASE_URL ??
    ""
  ).trim();
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {{ relaxed?: boolean; requireAiCore?: boolean }} options
 */
export function validateProductionEnvReadiness(env = process.env, options = {}) {
  const { relaxed = false, requireAiCore = true } = options;
  const errors = [];
  const warnings = [];
  const passed = [];

  for (const key of PRODUCTION_CORE_ENV_KEYS) {
    if (!isNonEmpty(env[key])) {
      errors.push(`Missing or empty env: ${key}`);
    } else {
      passed.push(`present:${key}`);
    }
  }

  if (isNonEmpty(env.JWT_SECRET) && env.JWT_SECRET.trim().length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters for production.");
  }
  if (isNonEmpty(env.CRON_SECRET) && env.CRON_SECRET.trim().length < 32) {
    errors.push("CRON_SECRET must be at least 32 characters for production.");
  }
  if (!relaxed && isPlaceholderSecret(env.JWT_SECRET)) {
    errors.push("JWT_SECRET looks like a placeholder — use production-specific secret.");
  }
  if (!relaxed && isPlaceholderSecret(env.CRON_SECRET)) {
    errors.push("CRON_SECRET looks like a placeholder — use production-specific secret.");
  }

  if (!relaxed && env.NODE_ENV !== "production") {
    errors.push(`NODE_ENV must be production on production runtime (got: ${env.NODE_ENV ?? "(unset)"}).`);
  }

  const appEnv = env.NEXT_PUBLIC_APP_ENV?.trim();
  if (!relaxed) {
    if (appEnv !== "production") {
      errors.push(
        `NEXT_PUBLIC_APP_ENV must be "production" for production cutover (got: ${appEnv ?? "(unset)"}).`,
      );
    }
  } else if (appEnv && appEnv !== "production") {
    warnings.push(`NEXT_PUBLIC_APP_ENV is "${appEnv}" — expected "production" for cutover.`);
  }

  errors.push(...validateAuthCookieSecureForStaging(env, { relaxed }));

  const baseUrlCheck = assertStagingHttpsOrigin(env.APP_BASE_URL ?? "", {
    allowLocalhost: relaxed,
  });
  if (!baseUrlCheck.ok) {
    errors.push(`APP_BASE_URL: ${baseUrlCheck.message}`);
  } else {
    passed.push("APP_BASE_URL:https");
  }

  const oauth = validateOAuthPairs(env);
  errors.push(...oauth.errors);
  if (oauth.activeProviders.length > 0) {
    passed.push(`oauth:active:${oauth.activeProviders.join(",")}`);
  } else {
    warnings.push("No OAuth provider configured — email login only (OK if intentional).");
  }

  if (requireAiCore) {
    for (const key of PRODUCTION_AI_CORE_ENV_KEYS) {
      if (!isNonEmpty(env[key])) {
        errors.push(`Missing AI Core env: ${key}`);
      } else {
        passed.push(`ai-core:${key}`);
      }
    }
  }

  const storageDriver = env.ILLEGAL_LENDING_STORAGE_DRIVER?.trim();
  if (!relaxed && !storageDriver) {
    warnings.push(
      "ILLEGAL_LENDING_STORAGE_DRIVER unset — confirm attachment/storage path for production.",
    );
  } else if (storageDriver === "r2" || storageDriver === "s3") {
    for (const key of [
      "ILLEGAL_LENDING_S3_BUCKET",
      "ILLEGAL_LENDING_S3_ACCESS_KEY_ID",
      "ILLEGAL_LENDING_S3_SECRET_ACCESS_KEY",
    ]) {
      if (!isNonEmpty(env[key])) {
        errors.push(`Object storage driver ${storageDriver} requires ${key}.`);
      }
    }
  }

  const kakaoMode = env.PRODUCTION_KAKAO_ALIMTALK_MODE?.trim() ?? "stub";
  const emailMode = env.PRODUCTION_EMAIL_DELIVERY_MODE?.trim() ?? "stub";
  passed.push(`messaging:kakao:${kakaoMode}`);
  passed.push(`messaging:email:${emailMode}`);
  if (!relaxed && kakaoMode === "live" && !isNonEmpty(env.KAKAO_ALIMTALK_API_KEY)) {
    warnings.push(
      "PRODUCTION_KAKAO_ALIMTALK_MODE=live but KAKAO_ALIMTALK_API_KEY missing — confirm provider wiring.",
    );
  }

  return {
    errors,
    warnings,
    passed,
    oauthActive: oauth.activeProviders,
    oauthCallbackUrls: getOAuthCallbackUrls(env.APP_BASE_URL ?? ""),
  };
}
