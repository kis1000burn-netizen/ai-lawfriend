import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const engineRoot = path.join(repoRoot, "tools/diagnostic-engine");

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const required = [
  "tools/diagnostic-engine/config/first-practical-application.json",
  "tools/diagnostic-engine/config/pass-gates.json",
  "tools/diagnostic-engine/config/test-environment.json",
  "tools/diagnostic-engine/projects/aibeopchin-first-project.json",
  "tools/diagnostic-engine/reference-docs/aibeopchin-canonical-registry.json",
  "tools/diagnostic-engine/platform-expansion/registry.json",
  "tools/diagnostic-engine/platform-expansion/contracts/aibeopchin.json",
  "tools/diagnostic-engine/scripts/run-first-practical-application.mjs",
  "tools/diagnostic-engine/scripts/compress-diagnostic-bundle.mjs",
  "tests/e2e/diagnostic-case-access-control.spec.ts",
  "tools/nurion-engine/platform-profiles/achim-haetsal/profile.json",
];

for (const file of required) {
  if (!exists(file)) {
    console.error(`verify:aibeopchin-first-practical-application missing ${file}`);
    process.exit(1);
  }
}

if (!read("package.json").includes("verify:aibeopchin-first-practical-application")) {
  console.error("missing npm script verify:aibeopchin-first-practical-application");
  process.exit(1);
}

execSync("node tools/diagnostic-engine/tests/first-practical-application.test.mjs", {
  cwd: repoRoot,
  stdio: "inherit",
});

execSync("node tools/diagnostic-engine/scripts/run-first-practical-application.mjs --skip-compress", {
  cwd: repoRoot,
  stdio: "inherit",
});

console.log("verify:aibeopchin-first-practical-application PASS (engine structure only; diagnosticStatus may be INCOMPLETE)");
