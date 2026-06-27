import fs from 'node:fs/promises';
import path from 'node:path';
import { ARCHIVE_DIR, ACTIVE_INCIDENT_FILE, appendNdjson, ensureDir, isoNow, readJson, writeJson } from './nurion-utils.mjs';

const DEFAULT_RETENTION_DAYS = 7;

export async function archiveRun(report, retentionDays = DEFAULT_RETENTION_DAYS) {
  const day = report.observedAt.slice(0, 10);
  const platform = report.platformId || 'unknown-platform';
  const archiveFile = path.join(ARCHIVE_DIR, `${platform}-${day}.ndjson`);
  await appendNdjson(archiveFile, report);
  await writeJson(path.join(ARCHIVE_DIR, 'index.json'), { updatedAt: isoNow(), lastReport: report, retentionDays });
  await pruneArchive(retentionDays);
  return archiveFile;
}

/**
 * retentionDays보다 오래된 NDJSON 아카이브 파일을 삭제합니다.
 * 파일명 패턴: {platform}-{YYYY-MM-DD}.ndjson
 * @returns {number} 삭제된 파일 수
 */
export async function pruneArchive(retentionDays = DEFAULT_RETENTION_DAYS) {
  await ensureDir(ARCHIVE_DIR);
  const files = await fs.readdir(ARCHIVE_DIR).catch(() => []);
  const cutoff = Date.now() - retentionDays * 86400000;
  let pruned = 0;
  for (const file of files) {
    if (!file.endsWith('.ndjson')) continue;
    const match = file.match(/(\d{4}-\d{2}-\d{2})\.ndjson$/);
    if (!match) continue;
    const fileDate = Date.parse(`${match[1]}T00:00:00Z`);
    if (isNaN(fileDate) || fileDate >= cutoff) continue;
    try {
      await fs.unlink(path.join(ARCHIVE_DIR, file));
      pruned++;
    } catch { /* 이미 삭제됐거나 잠긴 파일 무시 */ }
  }
  return pruned;
}

/**
 * 가장 최근에 아카이브된 보고서를 반환합니다.
 * index.json의 lastReport를 활용하여 빠르게 조회합니다.
 * @param {string} platformId
 */
export async function loadLastReport(platformId) {
  try {
    const index = await readJson(path.join(ARCHIVE_DIR, 'index.json'), null);
    if (!index?.lastReport) return null;
    if (platformId && index.lastReport.platformId !== platformId) return null;
    return index.lastReport;
  } catch { return null; }
}

export async function loadActiveIncident() { return readJson(ACTIVE_INCIDENT_FILE, null); }
export async function saveActiveIncident(incident) { return writeJson(ACTIVE_INCIDENT_FILE, incident); }
export async function clearActiveIncident() { try { await fs.unlink(ACTIVE_INCIDENT_FILE); } catch {} }

export function makeIncidentId(report) {
  const keys = report.signals.filter(s => s.status !== 'pass').map(s => `${s.id}:${s.status}`).sort().join('|') || 'healthy';
  return `${report.platformId}:${report.grade}:${Buffer.from(keys).toString('base64url').slice(0, 18)}`;
}

export async function loadEventsSince(days = 7, platformId = null) {
  await ensureDir(ARCHIVE_DIR);
  const files = await fs.readdir(ARCHIVE_DIR).catch(() => []);
  const min = Date.now() - days * 86400000;
  const events = [];
  for (const file of files.filter(f => f.endsWith('.ndjson'))) {
    if (platformId && !file.startsWith(`${platformId}-`)) continue;
    const text = await fs.readFile(path.join(ARCHIVE_DIR, file), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        const item = JSON.parse(line);
        if (Date.parse(item.observedAt) >= min) events.push(item);
      } catch {}
    }
  }
  return events.sort((a,b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));
}
