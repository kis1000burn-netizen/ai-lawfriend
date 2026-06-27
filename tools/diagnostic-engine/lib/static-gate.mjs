import { execSync } from "node:child_process";
import { writeJson, getRepoRoot } from "./paths.mjs";
import { readJson } from "./paths.mjs";

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

export function evaluateStaticPass() {
  const config = readJson("config/pass-gates.json");
  const results = [
    runCommand(config.staticChecks.registryTest),
    runCommand(config.staticChecks.canonicalSources),
  ];

  const result = {
    stepId: "static-pass",
    level: "STATIC_PASS",
    evaluatedAt: new Date().toISOString(),
    results,
    ok: results.every((item) => item.ok),
  };

  writeJson("_runtime/static-pass.json", result);
  return result;
}
