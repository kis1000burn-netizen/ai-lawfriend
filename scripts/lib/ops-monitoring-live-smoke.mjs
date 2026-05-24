/**
 * Phase 17-F — Expanded operations monitoring live smoke checks.
 */
import {
  apiGet,
  fetchWithTimeout,
  login,
  resolveSmokeBaseUrl,
} from "./ops-staging-smoke-common.mjs";
import {
  assertAdminApiBlocked,
  assertSnapshotResponseShape,
} from "./operations-monitoring-fixture-policy.mjs";

const ADMIN_PROTECTED_APIS = [
  "/api/admin/operations/monitoring-snapshot",
  "/api/admin/operations/aibeopchin-7-dashboard",
  "/api/release-meta",
];

const ADMIN_PAGE_RENDER_CHECKS = [
  {
    path: "/admin/operations/monitoring",
    markers: ["Ops Console", "17-D", "Observer domains"],
    label: "ops monitoring console",
  },
  {
    path: "/admin/operations/aibeopchin-7-dashboard",
    markers: ["운영", "Smoke", "Runbook"],
    label: "7.0 operation dashboard",
  },
];

export async function fetchPageHtml(baseUrl, path, cookie) {
  const res = await fetchWithTimeout(`${baseUrl}${path}`, {
    headers: { Cookie: cookie, Accept: "text/html" },
  });
  const html = await res.text();
  return { status: res.status, html };
}

export async function runOperationsMonitoringLiveSmoke(options = {}) {
  const { label = "ops:operations-monitoring-live-smoke", requireAdmin = true } = options;
  const baseUrl = resolveSmokeBaseUrl();
  const failures = [];

  console.log(`[${label}] target=${baseUrl}`);

  const healthRes = await fetchWithTimeout(`${baseUrl}/api/health`);
  const healthJson = await healthRes.json().catch(() => ({}));
  const healthOk = healthRes.status === 200 && healthJson.ok === true;
  console.log(`${healthOk ? "PASS" : "FAIL"} — GET /api/health (${healthRes.status})`);
  if (!healthOk) failures.push("health");

  for (const apiPath of ADMIN_PROTECTED_APIS) {
    const res = await fetchWithTimeout(`${baseUrl}${apiPath}`);
    const json = await res.json().catch(() => ({}));
    const authErrors = assertAdminApiBlocked(res.status, json);
    const pass = authErrors.length === 0;
    console.log(`${pass ? "PASS" : "FAIL"} — ADMIN auth regression ${apiPath} (${res.status})`);
    if (!pass) {
      for (const err of authErrors) console.error(`  ${err}`);
      failures.push(`auth:${apiPath}`);
    }
  }

  const adminEmail = process.env.OPS_SMOKE_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.OPS_SMOKE_ADMIN_PASSWORD?.trim();
  if (!adminEmail || !adminPassword) {
    if (requireAdmin) {
      throw new Error(
        "OPS_SMOKE_ADMIN_EMAIL/PASSWORD required for Phase 17-F live smoke (ADMIN auth + snapshot + dashboard render)",
      );
    }
    console.log(`[${label}] (skipped — admin checks require OPS_SMOKE_ADMIN_*)`);
    return { baseUrl, failures, skippedAdmin: true };
  }

  const cookie = await login(baseUrl, adminEmail, adminPassword);

  const release = await apiGet(baseUrl, "/api/release-meta", cookie);
  const releaseOk = release.status === 200 && release.json?.ok === true;
  console.log(`${releaseOk ? "PASS" : "FAIL"} — GET /api/release-meta (auth) (${release.status})`);
  if (!releaseOk) failures.push("release-meta");

  const snapshot = await apiGet(baseUrl, "/api/admin/operations/monitoring-snapshot", cookie);
  const snapshotOk = snapshot.status === 200 && snapshot.json?.ok === true;
  console.log(
    `${snapshotOk ? "PASS" : "FAIL"} — GET /api/admin/operations/monitoring-snapshot (auth) (${snapshot.status})`,
  );
  if (snapshotOk) {
    const shapeErrors = assertSnapshotResponseShape(snapshot.json.data);
    const shapeOk = shapeErrors.length === 0;
    console.log(`${shapeOk ? "PASS" : "FAIL"} — monitoring snapshot shape (${shapeErrors.length} issue(s))`);
    if (!shapeOk) {
      for (const err of shapeErrors) console.error(`  ${err}`);
      failures.push("snapshot-shape");
    }
    if (snapshot.json.data?.health?.ok !== true) {
      console.log("FAIL — snapshot health signal");
      failures.push("snapshot-health");
    } else {
      console.log("PASS — snapshot health signal");
    }
  } else {
    failures.push("monitoring-snapshot");
  }

  const seven = await apiGet(baseUrl, "/api/admin/operations/aibeopchin-7-dashboard", cookie);
  const sevenOk = seven.status === 200 && seven.json?.ok === true && seven.json?.data?.project;
  console.log(
    `${sevenOk ? "PASS" : "FAIL"} — GET /api/admin/operations/aibeopchin-7-dashboard (auth) (${seven.status})`,
  );
  if (!sevenOk) failures.push("7-dashboard-api");

  for (const page of ADMIN_PAGE_RENDER_CHECKS) {
    const { status, html } = await fetchPageHtml(baseUrl, page.path, cookie);
    const renderOk =
      status === 200 && page.markers.some((marker) => html.includes(marker));
    console.log(
      `${renderOk ? "PASS" : "FAIL"} — dashboard render ${page.label} (${page.path}, ${status})`,
    );
    if (!renderOk) failures.push(`render:${page.path}`);
  }

  return { baseUrl, failures, skippedAdmin: false };
}
