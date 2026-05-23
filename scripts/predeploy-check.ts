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
  run("Voice RC predeploy closure gate", "npm run verify:aibeopchin-voice-rc");
  run(
    "Gongbuho Legal Knowledge RC predeploy closure gate",
    "npm run verify:gongbuho-legal-knowledge-rc",
  );
  run("CMB RC predeploy closure gate", "npm run verify:aibeopchin-cmb-rc");
  run("AI Core RC predeploy closure gate", "npm run verify:aibeopchin-ai-core-rc");
  run("Supplement migration predeploy gate", "npm run verify:supplement-migration-predeploy");
  run("Canonical sources (CaseStatus SSOT)", "npm run verify:canonical-sources");
  run("Type check", "npx tsc --noEmit");
  run("Lint", "npm run lint");
  run("Unit tests", "npm run test", { NODE_ENV: "test" });
  console.log(
    "\n[PREDEPLOY] Build — stop `npm run dev` first (Windows: Prisma DLL lock). See docs/operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md §1",
  );
  run("Build", "npm run build", { NODE_ENV: "production" });
}

main();
