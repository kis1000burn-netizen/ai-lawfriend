import { execSync } from "node:child_process";
import { writeJson, getRepoRoot } from "./paths.mjs";
import { readJson } from "./paths.mjs";
import {
  evaluateTestEnvironmentGuard,
  isSecurityEnvironmentFailure,
} from "./test-environment-guard.mjs";

function runCommand(command, env = process.env) {
  try {
    const output = execSync(command, {
      cwd: getRepoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env,
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

function buildIntegrationEnv() {
  const env = { ...process.env };
  if (env.TEST_DATABASE_URL && env.TEST_DATABASE_URL.trim().length > 0) {
    env.DATABASE_URL = env.TEST_DATABASE_URL;
  }
  return env;
}

export function evaluateIntegrationPass() {
  const config = readJson("config/pass-gates.json");
  const guard = evaluateTestEnvironmentGuard({ requireConfigured: true });
  const results = [];

  if (!guard.ok) {
    const result = {
      stepId: "integration-pass",
      level: "INTEGRATION_PASS",
      evaluatedAt: new Date().toISOString(),
      guard,
      results,
      status: "FAIL",
      ok: false,
      blockers: guard.blockers,
      failureCategory: guard.failureCategory ?? "ENV_ERROR",
    };
    writeJson("_runtime/integration-pass.json", result);
    return result;
  }

  results.push(runCommand(config.integrationChecks.permissionUnitTests));
  const allowlistResult = runCommand(
    config.integrationChecks.dbAllowlistCommand,
    buildIntegrationEnv(),
  );
  results.push(allowlistResult);
  results.push(
    runCommand(config.integrationChecks.dbPingCommand, buildIntegrationEnv()),
  );

  const result = {
    stepId: "integration-pass",
    level: "INTEGRATION_PASS",
    evaluatedAt: new Date().toISOString(),
    guard,
    results,
    allowlistPass: {
      ok: allowlistResult.ok,
      status: allowlistResult.ok ? "PASS" : "FAIL",
      command: config.integrationChecks.dbAllowlistCommand,
    },
    status: results.every((item) => item.ok) ? "PASS" : "FAIL",
    ok: results.every((item) => item.ok),
    blockers: results.every((item) => item.ok) ? [] : ["INTEGRATION_COMMAND_FAILED"],
    failureCategory: results.every((item) => item.ok) ? null : "ENV_ERROR",
  };

  writeJson("_runtime/integration-pass.json", result);
  return result;
}
