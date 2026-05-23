/**
 * Staging secrets live verification — checks env presence/shape only (never prints values).
 *
 * Usage (staging shell or injected env):
 *   npm run verify:staging-secrets
 *   npm run verify:staging-secrets -- --db-ping
 *
 * Local dry-run of the validator shape only:
 *   STAGING_SECRETS_VERIFY_RELAXED=1 npm run verify:staging-secrets
 */
import { PrismaClient } from "@prisma/client";
import {
  getOAuthCallbackUrls,
  validateStagingSecretsEnv,
} from "./lib/staging-secrets-env-policy.mjs";

const args = new Set(process.argv.slice(2));
const dbPing = args.has("--db-ping");
const oauthSmoke = args.has("--oauth-smoke");
const skipAiCore = args.has("--skip-ai-core");
const relaxed = process.env.STAGING_SECRETS_VERIFY_RELAXED === "1";
const FETCH_TIMEOUT_MS = 15000;

function printSection(title) {
  console.log(`\n[verify:staging-secrets] ${title}`);
}

async function pingDatabase() {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("PASS — DATABASE_URL connectivity ($queryRaw SELECT 1)");
    return true;
  } catch {
    console.error("FAIL — DATABASE_URL connectivity (connection failed)");
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function smokeOAuthStarts(activeProviders, appBaseUrl) {
  const origin = (appBaseUrl ?? "").replace(/\/$/, "");
  if (!origin || activeProviders.length === 0) {
    console.log("(skipped — no active OAuth providers or invalid APP_BASE_URL)");
    return true;
  }

  let ok = true;
  for (const provider of activeProviders) {
    const url = `${origin}/api/auth/oauth/${provider}/start`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { redirect: "manual", signal: controller.signal });
      const pass = res.status >= 300 && res.status < 400;
      console.log(`${pass ? "PASS" : "FAIL"} — OAuth start ${provider} (${res.status})`);
      if (!pass) ok = false;
    } catch {
      console.error(`FAIL — OAuth start ${provider} (unreachable)`);
      ok = false;
    } finally {
      clearTimeout(timer);
    }
  }
  return ok;
}

async function main() {
  console.log("[verify:staging-secrets] staging secrets live verification (values redacted)");

  if (relaxed) {
    console.log("[verify:staging-secrets] STAGING_SECRETS_VERIFY_RELAXED=1 — NODE_ENV/https localhost rules relaxed");
  }

  const result = validateStagingSecretsEnv(process.env, {
    relaxed,
    requireAiCore: !skipAiCore,
  });

  printSection("OAuth callback URLs (register in provider consoles)");
  const callbacks = getOAuthCallbackUrls(process.env.APP_BASE_URL ?? "");
  if (callbacks.length === 0) {
    console.log("(skipped — APP_BASE_URL invalid)");
  } else {
    for (const url of callbacks) {
      console.log(`- ${url}`);
    }
  }

  printSection("Warnings");
  if (result.warnings.length === 0) {
    console.log("(none)");
  } else {
    for (const w of result.warnings) console.log(`WARN — ${w}`);
  }

  printSection("Errors");
  if (result.errors.length === 0) {
    console.log("(none)");
  } else {
    for (const e of result.errors) console.log(`FAIL — ${e}`);
  }

  let failed = result.errors.length;

  if (dbPing) {
    printSection("Database ping");
    if (!process.env.DATABASE_URL?.trim()) {
      console.error("FAIL — --db-ping requires DATABASE_URL");
      failed += 1;
    } else {
      const ok = await pingDatabase();
      if (!ok) failed += 1;
    }
  }

  if (oauthSmoke) {
    printSection("OAuth start smoke (redirect expected)");
    const ok = await smokeOAuthStarts(result.oauthActive, process.env.APP_BASE_URL);
    if (!ok) failed += 1;
  }

  if (failed > 0) {
    console.error(`\nverify:staging-secrets FAIL (${failed} issue(s))`);
    process.exit(1);
  }

  console.log("\nverify:staging-secrets PASS");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
