#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateDatabaseUrlAllowlist } from "../lib/staging-database-allowlist.mjs";

const engineRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  readFileSync(path.join(engineRoot, "config/test-environment.json"), "utf8"),
);

function resolveDatabaseUrl() {
  for (const envName of config.databaseUrlEnvPriority) {
    const value = (process.env[envName] ?? "").trim();
    if (value.length > 0) {
      return { envName, value };
    }
  }
  return { envName: null, value: "" };
}

async function main() {
  const testEnvironment = (process.env.DIAGNOSTIC_TEST_ENV ?? "").trim();
  const database = resolveDatabaseUrl();

  if (!testEnvironment) {
    console.error("FAIL — DIAGNOSTIC_TEST_ENV is required");
    process.exit(1);
  }

  if (!database.value) {
    console.error("FAIL — TEST_DATABASE_URL or DATABASE_URL is required");
    process.exit(1);
  }

  const urlAllowlist = evaluateDatabaseUrlAllowlist(
    database.value,
    config,
    testEnvironment,
  );

  if (!urlAllowlist.ok) {
    console.error(
      `FAIL — database URL allowlist (${urlAllowlist.blockers.join(", ")})`,
    );
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: { url: database.value },
    },
  });

  try {
    const rows = await prisma.$queryRawUnsafe(
      "SELECT current_database() AS database_name, current_schema() AS schema_name",
    );
    const row = rows[0];
    const currentDatabase = String(row.database_name ?? "").toLowerCase();
    const currentSchema = String(row.schema_name ?? "").toLowerCase();
    const allowedSchemas =
      testEnvironment === "local-test"
        ? config.allowlistPolicy.localTestAllowedSchemas.map((s) => s.toLowerCase())
        : [config.allowlistPolicy.requiredDatabaseSchema.toLowerCase()];

    if (!config.allowlistPolicy.allowedDatabaseNames.includes(currentDatabase)) {
      const suffixOk = config.allowlistPolicy.allowedDatabaseNameSuffixes.some((suffix) =>
        currentDatabase.endsWith(String(suffix).toLowerCase()),
      );
      if (!suffixOk) {
        console.error("FAIL — current_database() is not in allowlist");
        process.exit(1);
      }
    }

    if (!allowedSchemas.includes(currentSchema)) {
      console.error("FAIL — current_schema() is not in allowlist");
      process.exit(1);
    }

    console.log("PASS — staging database allowlist runtime verification");
    console.log(`  current_database(): present / value redacted`);
    console.log(`  current_schema(): present / value redacted`);
    process.exit(0);
  } catch {
    console.error("FAIL — database runtime verification query failed");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
