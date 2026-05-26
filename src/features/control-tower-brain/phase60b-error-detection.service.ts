import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { BrainDetectedIssue, BrainScanInput, BrainScanResult } from "./phase60b-error-detection.schema";
import {
  PHASE60B_ERROR_DETECTION_MARKER,
  PHASE60B_ERROR_DETECTION_VERSION,
} from "./phase60b-error-detection.schema";

function readRepoFile(relativePath: string): string | null {
  const absolute = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(absolute)) {
    return null;
  }
  return fs.readFileSync(absolute, "utf8");
}

function parseLogIssues(input: {
  log?: string;
  source: BrainDetectedIssue["source"];
  defaultSeverity: BrainDetectedIssue["severity"];
}): BrainDetectedIssue[] {
  if (!input.log?.trim()) {
    return [];
  }

  const lines = input.log.split(/\r?\n/);
  const issues: BrainDetectedIssue[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const fileMatch = trimmed.match(/(?:^|\s)([\w./\\-]+\.(?:ts|tsx|js|mjs|md|prisma))(?:\(|:|\s|$)/);
    const phaseMatch = trimmed.match(/Phase\s*(\d{2}(?:-[A-F])?)/i);

    if (
      /error TS\d+/i.test(trimmed) ||
      /FAIL/i.test(trimmed) ||
      /✖/i.test(trimmed) ||
      /Missing/i.test(trimmed) ||
      /ELIFECYCLE/i.test(trimmed) ||
      (input.source === "RUNTIME" && /CRITICAL|500 error|OOM/i.test(trimmed))
    ) {
      issues.push({
        issueId: randomUUID(),
        source: input.source,
        severity: /CRITICAL|heap|OOM/i.test(trimmed) ? "CRITICAL" : input.defaultSeverity,
        phase: phaseMatch?.[1],
        files: fileMatch ? [fileMatch[1].replace(/\\/g, "/")] : [],
        summary: trimmed.slice(0, 240),
        rawLogRef: `${input.source}:${issues.length + 1}`,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return issues;
}

function detectStaticRepoIssues(): BrainDetectedIssue[] {
  const issues: BrainDetectedIssue[] = [];
  const packageJson = readRepoFile("package.json");
  const evidence = readRepoFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const navigator = readRepoFile("tools/aibeopchin_navigator.py");

  if (packageJson && evidence) {
    const verifyMatches = [...packageJson.matchAll(/"(verify:aibeopchin-[^"]+)"/g)].map((m) => m[1]);
    for (const script of verifyMatches) {
      const evidenceNeedle = script.replace("verify:", "").replace(/-/g, "-").toUpperCase();
      if (!evidence.includes("verify:") && script.includes("control-tower-brain")) {
        continue;
      }
      if (script.includes("control-tower-brain") && !evidence.includes("CONTROL-TOWER-BRAIN")) {
        issues.push({
          issueId: randomUUID(),
          source: "EVIDENCE",
          severity: "MEDIUM",
          phase: "60",
          files: ["docs/project-governance/IMPLEMENTATION_EVIDENCE.md"],
          summary: `Control Tower verify script ${script} may be missing evidence tag coverage`,
          rawLogRef: "static:evidence-tag",
          detectedAt: new Date().toISOString(),
        });
      }
    }
  }

  if (navigator && evidence) {
    if (evidence.includes("Phase 59-F") && !navigator.includes("59-F COMPLETE")) {
      issues.push({
        issueId: randomUUID(),
        source: "NAVIGATOR",
        severity: "LOW",
        phase: "59-F",
        files: ["tools/aibeopchin_navigator.py"],
        summary: "Navigator may be out of sync with Phase 59-F COMPLETE evidence",
        rawLogRef: "static:navigator-59f",
        detectedAt: new Date().toISOString(),
      });
    }
  }

  const scriptsDir = path.join(process.cwd(), "scripts");
  if (fs.existsSync(scriptsDir) && packageJson) {
    for (const file of fs.readdirSync(scriptsDir)) {
      if (
        !file.startsWith("verify-aibeopchin-control-tower-brain") &&
        !file.startsWith("verify-aibeopchin-legal-strategy")
      ) {
        continue;
      }
      const scriptName = file.replace(".mjs", "");
      const npmKey = `verify:aibeopchin-${scriptName.replace("verify-aibeopchin-", "")}`;
      if (!packageJson.includes(npmKey) && !packageJson.includes(scriptName)) {
        issues.push({
          issueId: randomUUID(),
          source: "VERIFY",
          severity: "HIGH",
          phase: "60",
          files: ["package.json", `scripts/${file}`],
          summary: `Verify script file exists but npm script may be missing: ${file}`,
          rawLogRef: `static:verify-script:${file}`,
          detectedAt: new Date().toISOString(),
        });
      }
    }
  }

  return issues;
}

export function runControlTowerBrainScan(input: BrainScanInput): BrainScanResult {
  const issues: BrainDetectedIssue[] = [
    ...parseLogIssues({ log: input.vitestLog, source: "TEST", defaultSeverity: "HIGH" }),
    ...parseLogIssues({ log: input.typecheckLog, source: "TYPECHECK", defaultSeverity: "HIGH" }),
    ...parseLogIssues({ log: input.lintLog, source: "LINT", defaultSeverity: "MEDIUM" }),
    ...parseLogIssues({ log: input.verifyLog, source: "VERIFY", defaultSeverity: "HIGH" }),
    ...parseLogIssues({ log: input.runtimeLog, source: "RUNTIME", defaultSeverity: "CRITICAL" }),
  ];

  if (input.includeStaticRepoChecks) {
    issues.push(...detectStaticRepoIssues());
  }

  return {
    marker: PHASE60B_ERROR_DETECTION_MARKER,
    version: PHASE60B_ERROR_DETECTION_VERSION,
    scannedAt: new Date().toISOString(),
    issues,
    recommendedCommands: [
      "npm run lint",
      "npm run test",
      "npm run verify:canonical-sources",
      "npm run verify:aibeopchin-control-tower-brain-rc",
    ],
  };
}
