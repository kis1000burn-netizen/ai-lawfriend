/**
 * Shared helpers for staging live smoke scripts (Phase 16-B).
 */
import { isLocalhostOrigin } from "./staging-secrets-env-policy.mjs";

const FETCH_TIMEOUT_MS = Number(process.env.OPS_SMOKE_FETCH_TIMEOUT_MS || "30000");

export function resolveSmokeBaseUrl() {
  return (
    process.env.PLAYWRIGHT_BASE_URL ??
    process.env.STAGING_BASE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function isRemoteStagingSmoke(baseUrl) {
  return !isLocalhostOrigin(baseUrl) && process.env.STAGING_ALLOW_LOCAL !== "1";
}

export function smokeAccount(label, defaultEmail, defaultPassword) {
  return {
    label,
    email: process.env[`OPS_SMOKE_${label}_EMAIL`] ?? defaultEmail,
    password: process.env[`OPS_SMOKE_${label}_PASSWORD`] ?? defaultPassword,
  };
}

export function assertRemoteSmokeAccounts(labels) {
  const missing = [];
  for (const label of labels) {
    if (!process.env[`OPS_SMOKE_${label}_EMAIL`]?.trim()) {
      missing.push(`OPS_SMOKE_${label}_EMAIL`);
    }
    if (!process.env[`OPS_SMOKE_${label}_PASSWORD`]?.trim()) {
      missing.push(`OPS_SMOKE_${label}_PASSWORD`);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Remote smoke requires dedicated staging accounts — missing: ${missing.join(", ")}`,
    );
  }
}

export async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function login(baseUrl, email, password) {
  const res = await fetchWithTimeout(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`login failed for ${email}: ${res.status}`);
  }
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.find((c) => c.startsWith("aibupchin_access_token="));
  if (!cookie) {
    throw new Error(`missing session cookie for ${email}`);
  }
  return cookie.split(";")[0];
}

export async function apiGet(baseUrl, path, cookie) {
  const res = await fetchWithTimeout(`${baseUrl}${path}`, {
    headers: { Cookie: cookie },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

export async function apiPost(baseUrl, path, cookie, body) {
  const res = await fetchWithTimeout(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

export async function uploadClientFile(baseUrl, caseId, cookie, fileName, content) {
  const form = new FormData();
  form.append(
    "file",
    new Blob([content], { type: "text/plain" }),
    fileName,
  );
  const res = await fetchWithTimeout(`${baseUrl}/api/client/cases/${caseId}/files/upload`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

export function resolveSmokeCaseId() {
  const preset = process.env.OPS_SMOKE_CASE_ID?.trim();
  if (!preset) {
    throw new Error("OPS_SMOKE_CASE_ID is required for staging live smoke");
  }
  return preset;
}

export async function assertHealth(baseUrl) {
  const health = await fetchWithTimeout(`${baseUrl}/api/health`).catch(() => null);
  if (!health || health.status !== 200) {
    throw new Error(`server not reachable or unhealthy at ${baseUrl}/api/health`);
  }
  const json = await health.json().catch(() => ({}));
  if (json.ok !== true) {
    throw new Error(`/api/health returned ok !== true`);
  }
}
