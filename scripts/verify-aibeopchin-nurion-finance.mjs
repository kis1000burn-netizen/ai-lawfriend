import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const engineRoot = path.join(root, "tools", "nurion-engine");

function runNode(args, options = {}) {
  return execFileSync(process.execPath, args, {
    cwd: engineRoot,
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  });
}

runNode(["--test", "tests/finance-lib.test.mjs"], { stdio: "inherit" });
runNode(["--test", "tests/operational-safety.test.mjs"], { stdio: "inherit" });

const scenarioOutput = runNode(["scripts/nurion-finance-test.mjs", "--json"]);
const scenario = JSON.parse(scenarioOutput);

if (scenario.settlements < 25) {
  throw new Error(`Nurion finance fixture coverage is too small: ${scenario.settlements}`);
}

if (scenario.grade !== "G4") {
  throw new Error(`Nurion finance regression should detect the duplicate payout P-0 fixture, got ${scenario.grade}`);
}

const smokeOutput = runNode(["scripts/nurion-skill-run.mjs"]);
const smoke = JSON.parse(smokeOutput);

if (smoke.report?.platformId !== "aibeopchin") {
  throw new Error(`Nurion smoke used unexpected platformId: ${smoke.report?.platformId}`);
}

if (!["G0", "G1", "G2"].includes(smoke.report?.grade)) {
  throw new Error(`Aibeopchin Nurion dry-run smoke must not start in blocking grade, got ${smoke.report?.grade}`);
}

console.log(
  `verify:aibeopchin-nurion-finance PASS (finance regression ${scenario.settlements} records, aibeopchin dry-run ${smoke.report.grade})`,
);
