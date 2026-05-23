/**
 * AI Core predeploy role smoke — seeded DB + running server required.
 *
 * Local:
 *   npm run dev
 *   npm run ops:ai-core-role-smoke
 *
 * Staging (remote):
 *   PLAYWRIGHT_BASE_URL=https://staging.example.com
 *   OPS_SMOKE_CASE_ID=<caseId>
 *   OPS_SMOKE_CLIENT_EMAIL=...  OPS_SMOKE_CLIENT_PASSWORD=...
 *   (repeat for LAWYER, STAFF, ADMIN)
 *   npm run ops:ai-core-role-smoke
 */
import { PrismaClient } from "@prisma/client";
import { isLocalhostOrigin, resolveStagingBaseUrl } from "./lib/staging-secrets-env-policy.mjs";

const FETCH_TIMEOUT_MS = Number(process.env.OPS_SMOKE_FETCH_TIMEOUT_MS || "30000");

const baseUrl = (
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.STAGING_BASE_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

const isRemoteSmoke =
  !isLocalhostOrigin(baseUrl) && process.env.STAGING_ALLOW_LOCAL !== "1";

function smokeAccount(label, defaultEmail, defaultPassword) {
  return {
    label,
    email: process.env[`OPS_SMOKE_${label}_EMAIL`] ?? defaultEmail,
    password: process.env[`OPS_SMOKE_${label}_PASSWORD`] ?? defaultPassword,
  };
}

const ACCOUNTS = [
  smokeAccount("CLIENT", "user@aibupchin.com", "Admin1234!"),
  smokeAccount("LAWYER", "lawyer@aibupchin.com", "Admin1234!"),
  smokeAccount("STAFF", "staff@example.com", "Admin1234!"),
  smokeAccount("ADMIN", "admin@aibupchin.com", "Admin1234!"),
];

function assertRemoteSmokeAccounts() {
  if (!isRemoteSmoke) return;
  const missing = [];
  for (const label of ["CLIENT", "LAWYER", "STAFF", "ADMIN"]) {
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

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isBlocked(status) {
  return status === 403 || status === 401;
}

async function login(email, password) {
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

async function apiGet(path, cookie) {
  const res = await fetchWithTimeout(`${baseUrl}${path}`, {
    headers: { Cookie: cookie },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function apiPost(path, cookie, body) {
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

async function ensureSmokeCase() {
  const prisma = new PrismaClient();
  try {
    const owner = await prisma.user.findUnique({ where: { email: "user@aibupchin.com" } });
    const lawyer = await prisma.user.findUnique({ where: { email: "lawyer@aibupchin.com" } });
    const staff = await prisma.user.findUnique({ where: { email: "staff@example.com" } });
    if (!owner) throw new Error("seed user missing — run npm run db:seed");

    let caseRow = await prisma.case.findFirst({
      where: { ownerUserId: owner.id },
      orderBy: { createdAt: "desc" },
    });

    if (!caseRow) {
      caseRow = await prisma.case.create({
        data: {
          ownerUserId: owner.id,
          assignedLawyerUserId: lawyer?.id ?? null,
          assignedStaffUserId: staff?.id ?? null,
          title: "AI Core Role Smoke Case",
          status: "IN_INTERVIEW",
        },
      });
    } else {
      caseRow = await prisma.case.update({
        where: { id: caseRow.id },
        data: {
          assignedLawyerUserId: lawyer?.id ?? caseRow.assignedLawyerUserId,
          assignedStaffUserId: staff?.id ?? caseRow.assignedStaffUserId,
        },
      });
    }

    const admin = await prisma.user.findUnique({ where: { email: "admin@aibupchin.com" } });
    const assignerId = admin?.id ?? owner.id;

    for (const assignee of [lawyer, staff].filter(Boolean)) {
      const existing = await prisma.caseAssignment.findFirst({
        where: { caseId: caseRow.id, assigneeUserId: assignee.id, isActive: true },
      });
      if (!existing) {
        await prisma.caseAssignment.create({
          data: {
            caseId: caseRow.id,
            assigneeUserId: assignee.id,
            assignedByUserId: assignerId,
          },
        });
      }
    }

    return caseRow.id;
  } finally {
    await prisma.$disconnect();
  }
}

async function resolveSmokeCaseId() {
  const preset = process.env.OPS_SMOKE_CASE_ID?.trim();
  if (preset) {
    console.log(`[ops-ai-core-role-smoke] using OPS_SMOKE_CASE_ID=${preset}`);
    return preset;
  }
  if (isRemoteSmoke) {
    throw new Error("Remote smoke requires OPS_SMOKE_CASE_ID");
  }
  return ensureSmokeCase();
}

async function main() {
  console.log(`[ops-ai-core-role-smoke] baseUrl=${baseUrl}`);
  assertRemoteSmokeAccounts();

  const health = await fetchWithTimeout(`${baseUrl}/api/health`).catch(() => null);
  if (!health) {
    throw new Error(`server not reachable at ${baseUrl}`);
  }

  const caseId = await resolveSmokeCaseId();
  console.log(`[ops-ai-core-role-smoke] caseId=${caseId}`);

  const cookies = {};
  for (const account of ACCOUNTS) {
    cookies[account.label] = await login(account.email, account.password);
  }

  const results = [];

  for (const account of ACCOUNTS) {
    const cookie = cookies[account.label];
    const summary = await apiPost(`/api/cases/${caseId}/summary/generate`, cookie);
    const delivery = await apiGet(`/api/cases/${caseId}/client-disclosure-delivery`, cookie);
    const preview = await apiGet(`/api/cases/${caseId}/client-disclosure-preview`, cookie);
    const review = await apiGet(`/api/cases/${caseId}/intelligence-review`, cookie);
    const auditPolicy = await apiGet("/api/admin/ai-core/audit-policy", cookie);
    const refreshReview = await apiPost(`/api/cases/${caseId}/intelligence-review`, cookie);

    const graphPresent = Boolean(summary.json?.data?.summary?.intelligenceGraph);

    results.push({
      role: account.label,
      summaryStatus: summary.status,
      graphPresent,
      deliveryStatus: delivery.status,
      previewStatus: preview.status,
      reviewStatus: review.status,
      refreshReviewStatus: refreshReview.status,
      auditPolicyStatus: auditPolicy.status,
    });
  }

  const client = results.find((r) => r.role === "CLIENT");
  const lawyer = results.find((r) => r.role === "LAWYER");
  const staff = results.find((r) => r.role === "STAFF");
  const admin = results.find((r) => r.role === "ADMIN");

  const checks = [
    ["CLIENT summary 200 without graph", client?.summaryStatus === 200 && client?.graphPresent === false],
    ["CLIENT delivery 200", client?.deliveryStatus === 200],
    ["CLIENT preview blocked", isBlocked(client?.previewStatus ?? 0)],
    ["CLIENT review blocked", isBlocked(client?.reviewStatus ?? 0)],
    ["CLIENT refresh blocked", isBlocked(client?.refreshReviewStatus ?? 0)],
    ["LAWYER summary 200 with graph", lawyer?.summaryStatus === 200 && lawyer?.graphPresent === true],
    ["LAWYER preview 200", lawyer?.previewStatus === 200],
    ["LAWYER review 200", lawyer?.reviewStatus === 200],
    ["LAWYER delivery blocked", isBlocked(lawyer?.deliveryStatus ?? 0)],
    ["LAWYER audit-policy blocked", isBlocked(lawyer?.auditPolicyStatus ?? 0)],
    ["STAFF summary 200 with graph", staff?.summaryStatus === 200 && staff?.graphPresent === true],
    ["STAFF preview 200", staff?.previewStatus === 200],
    ["STAFF review 200", staff?.reviewStatus === 200],
    ["STAFF delivery blocked", isBlocked(staff?.deliveryStatus ?? 0)],
    ["STAFF refresh blocked", isBlocked(staff?.refreshReviewStatus ?? 0)],
    ["STAFF audit-policy 200", staff?.auditPolicyStatus === 200],
    ["ADMIN audit-policy 200", admin?.auditPolicyStatus === 200],
    ["ADMIN preview 200", admin?.previewStatus === 200],
    ["ADMIN review 200", admin?.reviewStatus === 200],
  ];

  console.table(results);

  let failed = 0;
  for (const [label, ok] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
    if (!ok) failed += 1;
  }

  if (failed > 0) {
    process.exitCode = 1;
    throw new Error(`${failed} role smoke check(s) failed`);
  }

  console.log(`ops-ai-core-role-smoke PASS (${checks.length} checks)`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
