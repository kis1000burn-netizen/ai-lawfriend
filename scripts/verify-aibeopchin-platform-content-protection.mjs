import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-PLATFORM-CONTENT-PROTECTION";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function assertIncludes(p, terms) {
  const content = read(p);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing "${term}" in ${p}`);
    }
  }
}

const requiredFiles = [
  "src/lib/crypto/at-rest-encryption.ts",
  "src/lib/crypto/secret-token-hash.ts",
  "src/lib/security/platform-content-protection.policy.ts",
  "src/lib/security/http-security-headers.ts",
  "src/lib/security/auth-rate-limit.ts",
  "src/features/case-attachments/case-attachment.storage.ts",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing ${file}`);
  }
}

assertIncludes("src/middleware.ts", ["LEGACY_PUBLIC_UPLOAD_PATH_PREFIX", "/uploads/:path*"]);
assertIncludes("next.config.ts", ["buildNextSecurityHeaderRules"]);
assertIncludes("src/lib/robots-disallow-policy.ts", ["/uploads/", "/private-encrypted/"]);
assertIncludes(".env.example", ["APP_DATA_ENCRYPTION_KEY", "SECRET_TOKEN_PEPPER"]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`Missing ${EVIDENCE_TAG}`);
}

if (!read("package.json").includes("verify:aibeopchin-platform-content-protection")) {
  throw new Error("missing verify:aibeopchin-platform-content-protection script");
}

execSync(
  "npm run test -- src/lib/crypto/at-rest-encryption.test.ts src/lib/crypto/secret-token-hash.test.ts src/features/case-attachments/case-attachment.storage.test.ts src/lib/security/http-security-headers.test.ts src/features/case-package/case-package-share-policy-utils.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("verify:aibeopchin-platform-content-protection PASS");
