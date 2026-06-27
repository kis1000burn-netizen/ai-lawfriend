import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Windows·Unix 모두에서 올바른 절대 경로를 반환합니다.
export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const EVENTS_DIR = path.join(ROOT, '_nurion_events');
export const ARCHIVE_DIR = path.join(EVENTS_DIR, 'archive');
export const ACTIVE_INCIDENT_FILE = path.join(EVENTS_DIR, 'active-incident.json');

export function isoNow() { return new Date().toISOString(); }
export async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }); }
export async function readJson(file, fallback = null) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}
export async function writeJson(file, value) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}
export async function appendNdjson(file, value) {
  await ensureDir(path.dirname(file));
  await fs.appendFile(file, JSON.stringify(value) + '\n', 'utf8');
}
export function parseArgs(argv) {
  return new Set(argv.slice(2));
}
export function matchSignal(pattern, signal) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${escaped}$`).test(signal);
}
export function severityRank(value) {
  return ({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 })[value] ?? 0;
}

/**
 * 현재 스크립트가 직접 실행된 경우에만 true를 반환합니다.
 * `import.meta.url === \`file://\${process.argv[1]}\`` 패턴은
 * Windows에서 경로 형식 차이로 오작동하므로 이 함수를 사용하세요.
 *
 * @example
 * if (isMainScript(import.meta.url)) main().catch(...);
 */
export function isMainScript(importMetaUrl) {
  try {
    return fileURLToPath(importMetaUrl) === path.resolve(process.argv[1] ?? '');
  } catch { return false; }
}
