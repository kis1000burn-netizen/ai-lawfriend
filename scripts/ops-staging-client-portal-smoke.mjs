/**
 * Staging Client Collaboration Portal live smoke (Phase 16-B).
 *
 * Requires: PLAYWRIGHT_BASE_URL or STAGING_BASE_URL, OPS_SMOKE_CASE_ID,
 * OPS_SMOKE_CLIENT_EMAIL / OPS_SMOKE_CLIENT_PASSWORD (remote).
 */
import {
  apiGet,
  assertHealth,
  assertRemoteSmokeAccounts,
  isRemoteStagingSmoke,
  login,
  resolveSmokeBaseUrl,
  resolveSmokeCaseId,
  smokeAccount,
} from "./lib/ops-staging-smoke-common.mjs";

const baseUrl = resolveSmokeBaseUrl();
const client = smokeAccount("CLIENT", "user@aibupchin.com", "Admin1234!");

async function main() {
  console.log(`[ops:staging-client-portal-smoke] baseUrl=${baseUrl}`);
  if (isRemoteStagingSmoke(baseUrl)) {
    assertRemoteSmokeAccounts(["CLIENT"]);
  }

  await assertHealth(baseUrl);
  const caseId = resolveSmokeCaseId();
  console.log(`[ops:staging-client-portal-smoke] caseId=${caseId}`);

  const cookie = await login(baseUrl, client.email, client.password);

  const checks = [
    ["GET /api/client/cases", await apiGet(baseUrl, "/api/client/cases", cookie)],
    ["GET /api/client/cases/:id", await apiGet(baseUrl, `/api/client/cases/${caseId}`, cookie)],
    [
      "GET /api/client/cases/:id/submissions",
      await apiGet(baseUrl, `/api/client/cases/${caseId}/submissions`, cookie),
    ],
    [
      "GET /api/client/cases/:id/messages",
      await apiGet(baseUrl, `/api/client/cases/${caseId}/messages`, cookie),
    ],
    [
      "GET /api/client/cases/:id/supplement-requests",
      await apiGet(baseUrl, `/api/client/cases/${caseId}/supplement-requests`, cookie),
    ],
    [
      "GET /api/client/cases/:id/shared-documents",
      await apiGet(baseUrl, `/api/client/cases/${caseId}/shared-documents`, cookie),
    ],
    [
      "GET /api/client/cases/:id/deadlines",
      await apiGet(baseUrl, `/api/client/cases/${caseId}/deadlines`, cookie),
    ],
  ];

  let failed = 0;
  for (const [label, result] of checks) {
    const ok = result.status === 200 && result.json?.ok === true;
    console.log(`${ok ? "PASS" : "FAIL"} — ${label} (${result.status})`);
    if (!ok) failed += 1;
  }

  if (failed > 0) {
    throw new Error(`${failed} client portal smoke check(s) failed`);
  }

  console.log(`ops:staging-client-portal-smoke PASS (${checks.length} checks)`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
