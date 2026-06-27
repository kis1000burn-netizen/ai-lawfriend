import { execSync } from "node:child_process";
import { writeJson, getRepoRoot } from "./paths.mjs";
import { readJson } from "./paths.mjs";
import { recordFixtureCleanup } from "./staging-fixture-lifecycle.mjs";

function runPlaywright(specFiles, runId) {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "";
  const localAllowed = process.env.E2E_DIAGNOSTIC_LOCAL === "1";
  const defaultLocal = "http://localhost:3000";

  if (!baseUrl && !localAllowed) {
    return {
      ok: false,
      status: "PENDING",
      blockers: ["PLAYWRIGHT_BASE_URL_OR_E2E_DIAGNOSTIC_LOCAL_REQUIRED"],
      command: null,
      results: [],
      fixtureCleanup: null,
    };
  }

  const resolvedBaseUrl = baseUrl || defaultLocal;
  const command = `npx playwright test ${specFiles.join(" ")}`;
  let playwrightOk = false;
  let outputTail = "";
  let exitCode = 0;

  try {
    const output = execSync(command, {
      cwd: getRepoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: resolvedBaseUrl,
        E2E_INCLUDE_DIAGNOSTIC_ACCESS: "1",
        DIAGNOSTIC_RUN_ID: runId,
      },
    });
    playwrightOk = true;
    outputTail = output.slice(-2000);
  } catch (error) {
    playwrightOk = false;
    exitCode = error.status ?? 1;
    outputTail = `${error.stdout ?? ""}\n${error.stderr ?? ""}`.slice(-2000);
  }

  let fixtureCleanup = null;
  try {
    execSync("node tools/diagnostic-engine/scripts/run-staging-fixture-cleanup.mjs", {
      cwd: getRepoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: {
        ...process.env,
        DIAGNOSTIC_RUN_ID: runId,
      },
    });
    fixtureCleanup = recordFixtureCleanup({
      runId,
      status: "CLEANUP_OK",
      deletedResources: ["run-scoped-fixtures"],
      failures: [],
    });
  } catch (error) {
    fixtureCleanup = recordFixtureCleanup({
      runId,
      status: "CLEANUP_FAILED",
      deletedResources: [],
      failures: [
        {
          resource: "run-scoped-fixtures",
          message: error instanceof Error ? error.message : "cleanup script failed",
        },
      ],
    });
  }

  return {
    ok: playwrightOk,
    status: playwrightOk ? "PASS" : "FAIL",
    blockers: playwrightOk ? [] : ["E2E_COMMAND_FAILED"],
    command,
    baseUrl: resolvedBaseUrl,
    results: [{ command, ok: playwrightOk, exitCode, outputTail }],
    fixtureCleanup,
  };
}

export function evaluateE2ePass(runId) {
  const config = readJson("config/pass-gates.json");
  const playwright = runPlaywright(config.e2eChecks.specFiles, runId);

  const result = {
    stepId: "e2e-pass",
    level: "E2E_PASS",
    evaluatedAt: new Date().toISOString(),
    runId,
    specFiles: config.e2eChecks.specFiles,
    baseUrl: playwright.baseUrl ?? null,
    command: playwright.command,
    results: playwright.results,
    status: playwright.status ?? (playwright.ok ? "PASS" : "FAIL"),
    ok: playwright.ok,
    blockers: playwright.blockers ?? [],
    fixtureCleanup: playwright.fixtureCleanup,
  };

  writeJson("_runtime/e2e-pass.json", result);
  return result;
}
