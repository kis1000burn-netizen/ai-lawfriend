import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ENGINE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "../..");

export function getEngineRoot() {
  return ENGINE_ROOT;
}

export function getRepoRoot() {
  return REPO_ROOT;
}

export function readJson(relativeFromEngineRoot) {
  const absolute = path.join(ENGINE_ROOT, relativeFromEngineRoot);
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
}

export function readRepoFile(relativeFromRepoRoot) {
  const absolute = path.join(REPO_ROOT, relativeFromRepoRoot);
  if (!fs.existsSync(absolute)) {
    return null;
  }
  return fs.readFileSync(absolute, "utf8");
}

export function repoFileExists(relativeFromRepoRoot) {
  return fs.existsSync(path.join(REPO_ROOT, relativeFromRepoRoot));
}

export function ensureDir(relativeFromEngineRoot) {
  const absolute = path.join(ENGINE_ROOT, relativeFromEngineRoot);
  fs.mkdirSync(absolute, { recursive: true });
  return absolute;
}

export function writeJson(relativeFromEngineRoot, value) {
  const absolute = path.join(ENGINE_ROOT, relativeFromEngineRoot);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return absolute;
}
