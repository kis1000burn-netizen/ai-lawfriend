/**
 * Staging secrets / env live verification policy (values never logged).
 * @see docs/operations/STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md
 */

export const STAGING_CORE_ENV_KEYS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CRON_SECRET",
  "APP_BASE_URL",
  "NEXT_PUBLIC_APP_VERSION",
  "NEXT_PUBLIC_APP_ENV",
  "NODE_ENV",
];

export const STAGING_AI_CORE_ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_DOCUMENT_GENERATE_MODEL",
  "OPENAI_PARAGRAPH_REWRITE_MODEL",
  "OPENAI_CASE_SUMMARY_MODEL",
  "CASE_SUMMARY_AI_MODE",
  "AI_GOVERNANCE_AI_ENABLED",
  "AI_GOVERNANCE_TENANT_ID",
  "AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET",
  "AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE",
];

export const STAGING_OAUTH_PROVIDERS = [
  { key: "google", label: "Google", idKey: "GOOGLE_CLIENT_ID", secretKey: "GOOGLE_CLIENT_SECRET" },
  { key: "kakao", label: "Kakao", idKey: "KAKAO_CLIENT_ID", secretKey: "KAKAO_CLIENT_SECRET" },
  { key: "naver", label: "Naver", idKey: "NAVER_CLIENT_ID", secretKey: "NAVER_CLIENT_SECRET" },
];

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseOrigin(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function resolveStagingBaseUrl(env = process.env) {
  return (env.STAGING_BASE_URL ?? env.PLAYWRIGHT_BASE_URL ?? "").trim();
}

export function isLocalhostOrigin(url) {
  const origin = parseOrigin(url);
  if (!origin) return false;
  return LOCALHOST_HOSTS.has(origin.hostname);
}

export function assertStagingHttpsOrigin(url, { allowLocalhost = false } = {}) {
  const origin = parseOrigin(url);
  if (!origin) {
    return { ok: false, message: "APP_BASE_URL / STAGING_BASE_URL is not a valid URL" };
  }
  if (!allowLocalhost && isLocalhostOrigin(url)) {
    return { ok: false, message: "staging live check rejects localhost — set STAGING_ALLOW_LOCAL=1 to override" };
  }
  if (origin.protocol !== "https:" && !allowLocalhost) {
    return { ok: false, message: "staging APP_BASE_URL must use https://" };
  }
  return { ok: true, origin: origin.origin };
}

export function getOAuthCallbackUrls(appBaseUrl) {
  const origin = parseOrigin(appBaseUrl)?.origin;
  if (!origin) return [];
  return STAGING_OAUTH_PROVIDERS.map(
    (p) => `${origin}/api/auth/oauth/${p.key}/callback`,
  );
}

export function validateOAuthPairs(env = process.env) {
  const errors = [];
  const active = [];

  for (const provider of STAGING_OAUTH_PROVIDERS) {
    const hasId = isNonEmpty(env[provider.idKey]);
    const hasSecret = isNonEmpty(env[provider.secretKey]);
    if (!hasId && !hasSecret) continue;
    if (!hasId || !hasSecret) {
      errors.push(`${provider.label} OAuth requires both client id and client secret (${provider.idKey} / ${provider.secretKey}).`);
      continue;
    }
    active.push(provider.key);
  }

  return { errors, activeProviders: active };
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {{ relaxed?: boolean; requireAiCore?: boolean }} options
 */

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

export function validateAuthCookieSecureForStaging(env = process.env, { relaxed = false } = {}) {
  const errors = [];
  const base = env.APP_BASE_URL?.trim() ?? "";
  const origin = parseOrigin(base);
  if (!origin || origin.protocol !== "https:") {
    return errors;
  }
  const explicit = env.AUTH_COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === "false" || explicit === "0") {
    errors.push("AUTH_COOKIE_SECURE must not be false when APP_BASE_URL uses https://");
  }
  if (!relaxed && !explicit && origin.protocol === "https:") {
    // implicit secure via APP_BASE_URL — OK
  }
  return errors;
}

export function validateStagingSecretsEnv(env = process.env, options = {}) {
  const { relaxed = false, requireAiCore = true } = options;
  const errors = [];
  const warnings = [];
  const passed = [];

  for (const key of STAGING_CORE_ENV_KEYS) {
    if (!isNonEmpty(env[key])) {
      errors.push(`Missing or empty env: ${key}`);
    } else {
      passed.push(`present:${key}`);
    }
  }

  if (isNonEmpty(env.JWT_SECRET) && env.JWT_SECRET.trim().length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters for staging.");
  }
  if (isNonEmpty(env.CRON_SECRET) && env.CRON_SECRET.trim().length < 32) {
    errors.push("CRON_SECRET must be at least 32 characters for staging.");
  }
  if (!relaxed && isPlaceholderSecret(env.JWT_SECRET)) {
    errors.push("JWT_SECRET looks like a placeholder — use staging-specific secret.");
  }
  if (!relaxed && isPlaceholderSecret(env.CRON_SECRET)) {
    errors.push("CRON_SECRET looks like a placeholder — use staging-specific secret.");
  }

  if (!relaxed && env.NODE_ENV !== "production") {
    errors.push(`NODE_ENV must be production on staging runtime (got: ${env.NODE_ENV ?? "(unset)"}).`);
  }

  const appEnv = env.NEXT_PUBLIC_APP_ENV?.trim();
  if (!relaxed) {
    if (appEnv !== "staging") {
      errors.push(
        `NEXT_PUBLIC_APP_ENV must be "staging" for staging live phase (got: ${appEnv ?? "(unset)"}).`,
      );
    }
  } else if (appEnv && appEnv !== "staging") {
    warnings.push(`NEXT_PUBLIC_APP_ENV is "${appEnv}" — expected "staging" for staging live phase.`);
  }

  errors.push(...validateAuthCookieSecureForStaging(env, { relaxed }));

  const baseUrlCheck = assertStagingHttpsOrigin(env.APP_BASE_URL ?? "", {
    allowLocalhost: relaxed || env.STAGING_ALLOW_LOCAL === "1",
  });
  if (!baseUrlCheck.ok) {
    errors.push(`APP_BASE_URL: ${baseUrlCheck.message}`);
  } else {
    passed.push("APP_BASE_URL:https-or-allowed");
  }

  const oauth = validateOAuthPairs(env);
  errors.push(...oauth.errors);
  if (oauth.activeProviders.length > 0) {
    passed.push(`oauth:active:${oauth.activeProviders.join(",")}`);
  } else {
    warnings.push("No OAuth provider configured — email login only (OK if intentional).");
  }

  if (requireAiCore) {
    for (const key of STAGING_AI_CORE_ENV_KEYS) {
      if (!isNonEmpty(env[key])) {
        errors.push(`Missing AI Core env: ${key}`);
      } else {
        passed.push(`ai-core:${key}`);
      }
    }
  }

  const stagingUrl = resolveStagingBaseUrl(env);
  if (stagingUrl) {
    const stagingOriginCheck = assertStagingHttpsOrigin(stagingUrl, {
      allowLocalhost: relaxed || env.STAGING_ALLOW_LOCAL === "1",
    });
    if (!stagingOriginCheck.ok) {
      errors.push(`STAGING_BASE_URL/PLAYWRIGHT_BASE_URL: ${stagingOriginCheck.message}`);
    } else if (isNonEmpty(env.APP_BASE_URL) && stagingOriginCheck.origin !== parseOrigin(env.APP_BASE_URL)?.origin) {
      warnings.push("STAGING_BASE_URL origin differs from APP_BASE_URL — role smoke may hit a different host than OAuth callbacks.");
    }
  }

  return { errors, warnings, passed, oauthActive: oauth.activeProviders };
}
