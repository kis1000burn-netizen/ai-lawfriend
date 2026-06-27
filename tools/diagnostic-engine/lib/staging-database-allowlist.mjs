function normalizeEnv(value) {
  return (value ?? "").trim();
}

export function parseDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    const databaseName = parsed.pathname.replace(/^\//, "").split("?")[0] || "";
    return {
      host: parsed.hostname.toLowerCase(),
      databaseName: databaseName.toLowerCase(),
      schemaFromQuery: parsed.searchParams.get("schema")?.toLowerCase() ?? null,
    };
  } catch {
    return { host: "", databaseName: "", schemaFromQuery: null };
  }
}

function hostMatchesAllowlist(host, config) {
  if (!host) return false;
  if (config.allowlistPolicy.allowedDatabaseHosts.includes(host)) {
    return true;
  }
  return config.allowlistPolicy.allowedDatabaseHostSuffixes.some((suffix) =>
    host.includes(String(suffix).toLowerCase()),
  );
}

function databaseNameMatchesAllowlist(databaseName, config) {
  if (!databaseName) return false;
  if (config.allowlistPolicy.allowedDatabaseNames.includes(databaseName)) {
    return true;
  }
  return config.allowlistPolicy.allowedDatabaseNameSuffixes.some((suffix) =>
    databaseName.endsWith(String(suffix).toLowerCase()),
  );
}

function looksLikeProductionDatabase(url, config) {
  const lower = url.toLowerCase();
  return config.blockedDatabaseUrlSubstrings.some((pattern) =>
    lower.includes(String(pattern).toLowerCase()),
  );
}

export function evaluateDatabaseUrlAllowlist(url, config, testEnvironment) {
  const blockers = [];
  const parsed = parseDatabaseUrl(url);

  if (looksLikeProductionDatabase(url, config)) {
    blockers.push("PRODUCTION_DATABASE_URL_BLOCKED");
  }

  if (!hostMatchesAllowlist(parsed.host, config)) {
    blockers.push("DATABASE_HOST_NOT_IN_ALLOWLIST");
  }

  if (!databaseNameMatchesAllowlist(parsed.databaseName, config)) {
    blockers.push("DATABASE_NAME_NOT_IN_ALLOWLIST");
  }

  const requiredSchema = config.allowlistPolicy.requiredDatabaseSchema;
  const allowedSchemas =
    testEnvironment === "local-test"
      ? config.allowlistPolicy.localTestAllowedSchemas
      : [requiredSchema];

  if (parsed.schemaFromQuery && !allowedSchemas.includes(parsed.schemaFromQuery)) {
    blockers.push("DATABASE_SCHEMA_QUERY_NOT_IN_ALLOWLIST");
  }

  return {
    ok: blockers.length === 0,
    blockers,
    parsed: {
      host: parsed.host,
      databaseName: parsed.databaseName,
      schemaFromQuery: parsed.schemaFromQuery,
      requiredSchema,
      allowedSchemas,
    },
    policy: "ALLOWLIST_FIRST",
  };
}
