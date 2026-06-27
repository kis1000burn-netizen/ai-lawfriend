import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { getRepoRoot } from "./paths.mjs";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function collectFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(absolute, files);
      continue;
    }
    files.push(absolute);
  }
  return files;
}

export function hashDirectory(relativeFromRepoRoot) {
  const root = path.join(getRepoRoot(), relativeFromRepoRoot);
  if (!fs.existsSync(root)) {
    return null;
  }

  const files = collectFiles(root).sort();
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    const rel = path.relative(root, file).replaceAll("\\", "/");
    hash.update(rel);
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }

  return `sha256-${hash.digest("hex")}`;
}

export function hashText(value) {
  return `sha256-${sha256(value ?? "")}`;
}

export function getGitCommit() {
  try {
    return execSync("git rev-parse HEAD", {
      cwd: getRepoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

export function buildSourceHash() {
  const projectPath = path.join(
    getRepoRoot(),
    "tools/diagnostic-engine/projects/aibeopchin-first-project.json",
  );
  const project = JSON.parse(fs.readFileSync(projectPath, "utf8"));
  const hash = crypto.createHash("sha256");

  for (const sourcePath of project.canonicalSources ?? []) {
    const absolute = path.join(getRepoRoot(), sourcePath);
    hash.update(sourcePath);
    hash.update("\0");
    if (fs.existsSync(absolute)) {
      hash.update(fs.readFileSync(absolute));
    }
    hash.update("\0");
  }

  return `sha256-${hash.digest("hex")}`;
}
