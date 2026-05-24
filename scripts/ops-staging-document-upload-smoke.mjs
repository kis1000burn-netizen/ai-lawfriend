/**
 * Staging document upload live smoke (Phase 16-B).
 * CLIENT uploads a tiny file via /api/client/cases/:id/files/upload.
 */
import {
  assertHealth,
  assertRemoteSmokeAccounts,
  isRemoteStagingSmoke,
  login,
  resolveSmokeBaseUrl,
  resolveSmokeCaseId,
  smokeAccount,
  uploadClientFile,
} from "./lib/ops-staging-smoke-common.mjs";

const baseUrl = resolveSmokeBaseUrl();
const client = smokeAccount("CLIENT", "user@aibupchin.com", "Admin1234!");

async function main() {
  console.log(`[ops:staging-document-upload-smoke] baseUrl=${baseUrl}`);
  if (isRemoteStagingSmoke(baseUrl)) {
    assertRemoteSmokeAccounts(["CLIENT"]);
  }

  await assertHealth(baseUrl);
  const caseId = resolveSmokeCaseId();
  console.log(`[ops:staging-document-upload-smoke] caseId=${caseId}`);

  const cookie = await login(baseUrl, client.email, client.password);
  const stamp = new Date().toISOString();
  const fileName = `staging-smoke-${stamp.replace(/[:.]/g, "-")}.txt`;
  const content = `AI법친 staging document upload smoke ${stamp}\n`;

  const upload = await uploadClientFile(baseUrl, caseId, cookie, fileName, content);
  const ok = upload.status === 201 && upload.json?.ok === true;
  console.log(`${ok ? "PASS" : "FAIL"} — POST /api/client/cases/:id/files/upload (${upload.status})`);

  if (!ok) {
    throw new Error("document upload smoke failed");
  }

  const fileId = upload.json?.data?.fileId;
  if (!fileId) {
    throw new Error("upload response missing fileId");
  }

  console.log(`ops:staging-document-upload-smoke PASS (fileId=${fileId})`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
