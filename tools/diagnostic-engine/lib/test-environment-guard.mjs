import { readJson, writeJson } from "./paths.mjs";
import { evaluateDatabaseUrlAllowlist } from "./staging-database-allowlist.mjs";

const SECURITY_BLOCKERS = new Set([
  "PRODUCTION_DATABASE_URL_BLOCKED",
  "DATABASE_HOST_NOT_IN_ALLOWLIST",
  "DATABASE_NAME_NOT_IN_ALLOWLIST",
  "DATABASE_SCHEMA_QUERY_NOT_IN_ALLOWLIST",
  "DATABASE_URL_WITHOUT_TEST_DATABASE_URL",
]);

function normalizeEnv(value) {
  return (value ?? "").trim();
}

function resolveDatabaseUrl() {
  const config = readJson("config/test-environment.json");
  for (const envName of config.databaseUrlEnvPriority) {
    const value = normalizeEnv(process.env[envName]);
    if (value.length > 0) {
      return { envName, value };
    }
  }
  return { envName: null, value: "" };
}

export function evaluateTestEnvironmentGuard(options = {}) {
  const { requireConfigured = false } = options;
  const config = readJson("config/test-environment.json");
  const testEnvironment = normalizeEnv(process.env.DIAGNOSTIC_TEST_ENV);
  const database = resolveDatabaseUrl();
  const blockers = [];
  let allowlist = null;

  if (!testEnvironment) {
    blockers.push("DIAGNOSTIC_TEST_ENV_MISSING");
  } else if (!config.allowedTestEnvironmentValues.includes(testEnvironment)) {
    blockers.push("DIAGNOSTIC_TEST_ENV_NOT_ALLOWED");
  }

  if (!database.value) {
    if (requireConfigured) {
      blockers.push("TEST_DATABASE_URL_OR_DATABASE_URL_MISSING");
    }
  } else {
    allowlist = evaluateDatabaseUrlAllowlist(database.value, config, testEnvironment);
    blockers.push(...allowlist.blockers);
  }

  if (
    database.envName === "DATABASE_URL" &&
    !normalizeEnv(process.env.TEST_DATABASE_URL) &&
    testEnvironment !== "local-test"
  ) {
    blockers.push("DATABASE_URL_WITHOUT_TEST_DATABASE_URL");
  }

  const securityBlockers = blockers.filter((item) => SECURITY_BLOCKERS.has(item));
  const result = {
    stepId: "test-environment-guard",
    evaluatedAt: new Date().toISOString(),
    testEnvironment: testEnvironment || null,
    databaseUrlEnv: database.envName,
    databaseUrlConfigured: database.value.length > 0,
    allowlist,
    ok: blockers.length === 0,
    blockers,
    securityBlockers,
    failureCategory:
      securityBlockers.length > 0
        ? "SECURITY"
        : blockers.length > 0
          ? requireConfigured
            ? "ENV_ERROR"
            : "INCOMPLETE"
          : null,
    stagingAccountsConfigured: {
      admin: Boolean(normalizeEnv(process.env[config.stagingAccounts.adminEmailEnv])),
      lawyerA: Boolean(normalizeEnv(process.env[config.stagingAccounts.lawyerEmailEnv])),
      lawyerB: Boolean(normalizeEnv(process.env[config.stagingAccounts.lawyerBEmailEnv])),
      client: Boolean(normalizeEnv(process.env[config.stagingAccounts.clientEmailEnv])),
    },
    policy: {
      neverTouchProductionDatabase: true,
      neverLogDatabaseUrlValue: true,
      allowlistFirst: true,
      resetPolicy: config.resetPolicy,
    },
  };

  writeJson("_runtime/test-environment-guard.json", result);
  return result;
}

export function assertSafeTestEnvironmentOrThrow() {
  const result = evaluateTestEnvironmentGuard({ requireConfigured: true });
  if (!result.ok) {
    const error = new Error(
      `Unsafe or incomplete diagnostic test environment: ${result.blockers.join(", ")}`,
    );
    error.blockers = result.blockers;
    error.failureCategory = result.failureCategory;
    throw error;
  }
  return result;
}

export function isSecurityEnvironmentFailure(result) {
  return Boolean(result.securityBlockers?.length);
}
