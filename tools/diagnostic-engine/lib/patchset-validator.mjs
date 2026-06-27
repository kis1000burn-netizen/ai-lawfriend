import { execSync } from "node:child_process";
import { writeJson, getRepoRoot } from "./paths.mjs";

export function validateInPatchsetSandbox() {
  const command = "npx vitest run --config vitest.patchset.config.ts";

  let results;
  try {
    const output = execSync(command, {
      cwd: getRepoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });
    results = [{ command, ok: true, outputTail: output.slice(-2000) }];
  } catch (error) {
    results = [
      {
        command,
        ok: false,
        exitCode: error.status ?? 1,
        outputTail: `${error.stdout ?? ""}\n${error.stderr ?? ""}`.slice(-2000),
      },
    ];
  }

  const result = {
    stepId: "validate-in-patchset",
    sandboxDir: "aibeopchin_patchset",
    validatedAt: new Date().toISOString(),
    results,
    ok: results.every((r) => r.ok),
  };

  writeJson("_runtime/patchset-validation.json", result);
  return result;
}
