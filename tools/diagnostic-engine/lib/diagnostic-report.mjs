import { execSync } from "node:child_process";
import { writeJson, getRepoRoot, repoFileExists } from "./paths.mjs";
import { MVP_FLOWS } from "./mvp-flow-test-generator.mjs";

function runCommand(command) {
  try {
    const output = execSync(command, {
      cwd: getRepoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });
    return { ok: true, output: output.slice(-4000) };
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? "";
    const stderr = error.stderr?.toString?.() ?? "";
    return {
      ok: false,
      output: `${stdout}\n${stderr}`.slice(-4000),
      exitCode: error.status ?? 1,
    };
  }
}

export function runDiagnosticReport(options = {}) {
  const { runTests = false } = options;
  const findings = [];
  const testResults = [];

  for (const flow of MVP_FLOWS) {
    if (!repoFileExists(flow.entryPath)) {
      findings.push({
        severity: "HIGH",
        kind: "MISSING_ENTRY",
        flowId: flow.flowId,
        path: flow.entryPath,
        message: `${flow.label} entry path is missing`,
      });
    }
    if (!repoFileExists(flow.targetTest)) {
      findings.push({
        severity: "MEDIUM",
        kind: "MISSING_TEST",
        flowId: flow.flowId,
        path: flow.targetTest,
        message: `${flow.label} automated test target is missing`,
      });
    }
  }

  if (runTests) {
    for (const flow of MVP_FLOWS) {
      if (!repoFileExists(flow.targetTest)) {
        testResults.push({
          flowId: flow.flowId,
          command: flow.verifyCommand,
          ok: false,
          skipped: true,
        });
        continue;
      }
      const result = runCommand(flow.verifyCommand);
      testResults.push({
        flowId: flow.flowId,
        command: flow.verifyCommand,
        ok: result.ok,
        exitCode: result.exitCode ?? 0,
        outputTail: result.output,
      });
      if (!result.ok) {
        findings.push({
          severity: "HIGH",
          kind: "TEST_FAILURE",
          flowId: flow.flowId,
          command: flow.verifyCommand,
          message: `${flow.label} verify command failed`,
        });
      }
    }
  }

  const canonical = runCommand("npm run verify:canonical-sources");
  if (!canonical.ok) {
    findings.push({
      severity: "CRITICAL",
      kind: "CANONICAL_SOURCE",
      command: "npm run verify:canonical-sources",
      message: "Canonical source verification failed",
    });
  }

  const report = {
    stepId: "run-diagnostic-report",
    generatedAt: new Date().toISOString(),
    runTests,
    summary: {
      findingCount: findings.length,
      criticalCount: findings.filter((f) => f.severity === "CRITICAL").length,
      highCount: findings.filter((f) => f.severity === "HIGH").length,
      mediumCount: findings.filter((f) => f.severity === "MEDIUM").length,
      testsRun: testResults.length,
      testsPassed: testResults.filter((t) => t.ok).length,
    },
    findings,
    testResults,
    ok: findings.filter((f) => f.severity === "CRITICAL" || f.severity === "HIGH").length === 0,
  };

  writeJson("_runtime/diagnostic-report.json", report);
  return report;
}
