import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, isoNow } from './nurion-utils.mjs';

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, status: 0, latencyMs: Date.now() - started, error: String(error?.message || error) };
  } finally { clearTimeout(timer); }
}

export async function loadConfig(configPath = path.join(ROOT, 'config', 'nurion.config.json')) {
  try { return JSON.parse(await fs.readFile(configPath, 'utf8')); }
  catch { throw new Error(`설정 파일이 없습니다: ${configPath}\nconfig/nurion.config.example.json을 복사해 값들을 입력하세요.`); }
}

export async function collectSignals(config) {
  const observedAt = isoNow();
  const signals = [];
  for (const probe of config.probes ?? []) {
    if (probe.type === 'manual') {
      signals.push({ id: probe.id, status: probe.status ?? 'warn', message: probe.message ?? '', observedAt, critical: !!probe.critical });
      continue;
    }
    if (probe.type !== 'http') {
      signals.push({ id: probe.id, status: 'warn', message: `미지원 probe type: ${probe.type}`, observedAt, critical: !!probe.critical });
      continue;
    }
    const response = await fetchWithTimeout(probe.url, probe.timeoutMs ?? 5000);
    signals.push({
      id: probe.id,
      status: response.ok ? 'pass' : 'fail',
      message: response.ok ? `HTTP ${response.status}` : (response.error || `HTTP ${response.status}`),
      httpStatus: response.status,
      latencyMs: response.latencyMs,
      observedAt,
      critical: !!probe.critical,
      url: probe.url
    });
  }
  return { observedAt, signals };
}
