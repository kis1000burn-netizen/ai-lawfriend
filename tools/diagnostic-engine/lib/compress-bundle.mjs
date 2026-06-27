import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { ensureDir, getEngineRoot, getRepoRoot, writeJson } from "./paths.mjs";

const BUNDLE_ITEMS = [
  "tools/diagnostic-engine/config",
  "tools/diagnostic-engine/projects",
  "tools/diagnostic-engine/reference-docs",
  "tools/diagnostic-engine/platform-expansion",
  "tools/diagnostic-engine/platform-expansion/contracts",
  "tools/diagnostic-engine/lib",
  "tools/diagnostic-engine/scripts",
  "tools/diagnostic-engine/tests",
  "tools/diagnostic-engine/README.md",
  "aibeopchin_patchset/tests/mvp-flow-first-practical.manifest.json",
  "aibeopchin_patchset/tests/mvp-flow-first-practical.generated.test.ts",
  "tools/nurion-engine/platform-profiles/aibeopchin",
  "tools/nurion-engine/platform-profiles/dosirak-store",
  "tools/nurion-engine/platform-profiles/achim-haetsal",
  "tools/nurion-engine/platform-profiles/future-template",
];

function copyRecursive(source, target) {
  if (!fs.existsSync(source)) {
    return;
  }
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function buildSourceManifest() {
  const project = JSON.parse(
    fs.readFileSync(
      path.join(getEngineRoot(), "projects/aibeopchin-first-project.json"),
      "utf8",
    ),
  );

  return {
    bundleId: "aibeopchin-first-practical-diagnostic-v1",
    generatedAt: new Date().toISOString(),
    primaryProjectId: project.projectId,
    sourceRoot: project.sourceRoot,
    sourceScope: project.sourceScope,
    canonicalSources: project.canonicalSources,
    mvpEntryPaths: project.mvpEntryPaths,
    note:
      "Full AI법친 source remains in repo root. This bundle carries registries, MVP patchset tests, and platform expansion stubs for other environments.",
  };
}

export function compressDiagnosticBundle() {
  const bundleDir = ensureDir("_bundles");
  const stagingDir = path.join(bundleDir, "staging-first-practical");
  const repoRoot = getRepoRoot();

  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  const copied = [];
  for (const item of BUNDLE_ITEMS) {
    const source = path.join(repoRoot, item);
    const target = path.join(stagingDir, item);
    if (!fs.existsSync(source)) {
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    copyRecursive(source, target);
    copied.push(item);
  }

  const sourceManifest = buildSourceManifest();
  fs.writeFileSync(
    path.join(stagingDir, "SOURCE_MANIFEST.json"),
    `${JSON.stringify(sourceManifest, null, 2)}\n`,
    "utf8",
  );

  const runtimeReport = path.join(getEngineRoot(), "_runtime/first-practical-application-summary.json");
  if (fs.existsSync(runtimeReport)) {
    const runtimeTarget = path.join(
      stagingDir,
      "tools/diagnostic-engine/_runtime/first-practical-application-summary.json",
    );
    fs.mkdirSync(path.dirname(runtimeTarget), { recursive: true });
    fs.copyFileSync(runtimeReport, runtimeTarget);
  }

  const zipName = "aibeopchin-first-practical-diagnostic-bundle.zip";
  const zipPath = path.join(bundleDir, zipName);

  if (fs.existsSync(zipPath)) {
    fs.rmSync(zipPath, { force: true });
  }

  // Windows 10+ tar supports zip via -a; avoids PowerShell Compress-Archive instability.
  execSync(`tar -a -cf "${zipPath}" -C "${stagingDir}" .`, {
    stdio: "inherit",
  });

  const result = {
    stepId: "compress-bundle",
    bundlePath: path.relative(repoRoot, zipPath).replace(/\\/g, "/"),
    stagingPath: path.relative(repoRoot, stagingDir).replace(/\\/g, "/"),
    copiedItems: copied,
    sourceManifestPath: "SOURCE_MANIFEST.json",
    ok: fs.existsSync(zipPath),
  };

  writeJson("_runtime/compress-bundle.json", result);
  return result;
}
