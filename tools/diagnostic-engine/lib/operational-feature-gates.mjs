import { execSync } from "node:child_process";
import { writeJson, getRepoRoot, readJson } from "./paths.mjs";

function runCommand(command) {
  try {
    const output = execSync(command, {
      cwd: getRepoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });
    return { command, ok: true, outputTail: output.slice(-2000) };
  } catch (error) {
    return {
      command,
      ok: false,
      exitCode: error.status ?? 1,
      outputTail: `${error.stdout ?? ""}\n${error.stderr ?? ""}`.slice(-2000),
    };
  }
}

function evaluateNamedPass(level, commandKey, configKey = "integrationChecks") {
  const config = readJson("config/pass-gates.json");
  const command = config[configKey]?.[commandKey];
  const result = runCommand(command);
  const payload = {
    stepId: level.toLowerCase().replaceAll("_", "-"),
    level,
    evaluatedAt: new Date().toISOString(),
    command,
    result,
    ok: result.ok,
  };
  writeJson(`_runtime/${level.toLowerCase()}.json`, payload);
  return payload;
}

export function evaluateMatchingUnitPass() {
  return evaluateNamedPass(
    "MATCHING_UNIT_PASS",
    "matchingUnitTests",
    "matchingChecks",
  );
}

export function evaluateMatchingPermissionPass() {
  return evaluateNamedPass(
    "MATCHING_PERMISSION_PASS",
    "matchingPermissionTests",
    "matchingChecks",
  );
}

export function evaluateSocialProofPrivacyPass() {
  return evaluateNamedPass(
    "SOCIAL_PROOF_PRIVACY_PASS",
    "socialProofPrivacyTests",
    "matchingChecks",
  );
}

export function evaluateStagingE2ePass(runId) {
  const config = readJson("config/pass-gates.json");
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "";
  const localAllowed = process.env.E2E_DIAGNOSTIC_LOCAL === "1";

  if (!baseUrl && !localAllowed) {
    const pending = {
      stepId: "staging-e2e-pass",
      level: "STAGING_E2E_PASS",
      evaluatedAt: new Date().toISOString(),
      runId,
      status: "PENDING",
      ok: false,
      blockers: ["PLAYWRIGHT_BASE_URL_OR_E2E_DIAGNOSTIC_LOCAL_REQUIRED"],
      specFiles: config.matchingChecks.stagingE2eSpecs,
    };
    writeJson("_runtime/staging_e2e_pass.json", pending);
    return pending;
  }

  const command = `npx playwright test ${config.matchingChecks.stagingE2eSpecs.join(" ")}`;
  let result;
  try {
    const output = execSync(command, {
      cwd: getRepoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: {
        ...process.env,
        E2E_INCLUDE_DIAGNOSTIC_ACCESS: "1",
        DIAGNOSTIC_RUN_ID: runId,
      },
    });
    result = { command, ok: true, outputTail: output.slice(-2000) };
  } catch (error) {
    result = {
      command,
      ok: false,
      exitCode: error.status ?? 1,
      outputTail: `${error.stdout ?? ""}\n${error.stderr ?? ""}`.slice(-2000),
    };
  }

  const payload = {
    stepId: "staging-e2e-pass",
    level: "STAGING_E2E_PASS",
    evaluatedAt: new Date().toISOString(),
    runId,
    status: result.ok ? "PASS" : "FAIL",
    ok: result.ok,
    command,
    result,
    specFiles: config.matchingChecks.stagingE2eSpecs,
  };
  writeJson("_runtime/staging_e2e_pass.json", payload);
  return payload;
}
