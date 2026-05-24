import { execSync } from "node:child_process";
import { getOAuthEnvValidationErrors } from "../src/lib/auth/oauth";

function run(label: string, command: string, env?: NodeJS.ProcessEnv) {
  console.log(`\n[PREDEPLOY] ${label}`);
  execSync(command, {
    stdio: "inherit",
    env: env ? { ...process.env, ...env } : process.env,
  });
}

function validateEnvironment() {
  console.log("\n[PREDEPLOY] Environment");
  const errors = getOAuthEnvValidationErrors();

  if (errors.length === 0) {
    console.log("[PREDEPLOY] Auth env validation passed");
    return;
  }

  throw new Error(`[PREDEPLOY] Auth env validation failed:\n- ${errors.join("\n- ")}`);
}

function main() {
  validateEnvironment();
  run(
    "Full Legal Ops Platform RC master gate (Phase 16-A)",
    "npm run verify:aibeopchin-full-legal-ops-platform-rc",
  );
  console.log(
    "\n[PREDEPLOY] Build — stop `npm run dev` first (Windows: Prisma DLL lock). See docs/operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md §1",
  );
  run("Build", "npm run build", { NODE_ENV: "production" });
}

main();
