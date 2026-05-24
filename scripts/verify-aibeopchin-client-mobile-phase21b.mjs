import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/client-portal/client-portal-mobile-upload.policy.ts",
  "src/features/client-portal/client-portal-mobile-upload.policy.test.ts",
  "src/features/client-portal/client-portal-mobile-upload.client.ts",
  "src/hooks/use-client-portal-mobile-upload-queue.ts",
  "src/components/client-portal/client-mobile-upload-panel.tsx",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21B-UPLOAD-UX";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required Phase 21-B file: ${file}`);
  }
}

assertIncludes("src/features/client-portal/client-portal-mobile-upload.policy.ts", [
  "capture",
  "CLIENT_PORTAL_MOBILE_CAMERA_CAPTURE",
  "validateClientPortalMobileUploadFile",
  "buildClientPortalMobileUploadFailureMeta",
  "19-B",
  "19-D",
  "client_portal_upload",
]);

assertIncludes("src/features/client-portal/client-portal-mobile-upload.client.ts", [
  "uploadClientPortalFileWithProgress",
  "xhr.upload.onprogress",
]);

assertIncludes("src/hooks/use-client-portal-mobile-upload-queue.ts", [
  "retryUpload",
  "beforeunload",
  "CLIENT_PORTAL_MOBILE_UPLOAD_DEPARTURE_WARNING",
]);

assertIncludes("src/components/client-portal/client-mobile-upload-panel.tsx", [
  "capture={CLIENT_PORTAL_MOBILE_CAMERA_CAPTURE}",
  "multiple",
  "재시도",
  "camera-button",
]);

assertIncludes("src/components/client-portal/client-portal-client.tsx", [
  "ClientMobileUploadPanel",
  "useClientPortalMobileUploadQueue",
  "phase21b-client-portal-mobile-upload-shell",
  "client-portal-supplement-upload",
  "client-portal-free-upload-panel",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md",
  ["21-B", "capture", "progress", "retry", "19-B"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["21-B"]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-client-mobile-phase21b")) {
  throw new Error("package.json must define verify:aibeopchin-client-mobile-phase21b");
}

execSync(
  "npm run test -- src/features/client-portal/client-portal-mobile-upload.policy.test.ts",
  {
    stdio: "inherit",
    cwd: root,
  },
);

console.log(
  "verify:aibeopchin-client-mobile-phase21b PASS (Product Phase 21-B Mobile Upload UX)",
);
