import fs from "node:fs";
import path from "node:path";

export function createCustomerGoLiveAdoptionRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Customer Go-Live Adoption RC file: ${relativePath}`);
    }
  }
  function assertIncludes(relativePath, terms) {
    const content = readFile(relativePath);
    for (const term of terms) {
      if (!content.includes(term)) {
        throw new Error(`Missing term "${term}" in ${relativePath}`);
      }
    }
  }
  return { readFile, assertFileExists, assertIncludes };
}

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37A-GO-LIVE-EXECUTION-CHECKLIST",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37B-FIRST-30-DAYS-ADOPTION",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37C-ADMIN-LAWYER-ACTIVATION",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37D-CLIENT-PORTAL-ADOPTION",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37E-GO-LIVE-ISSUE-CHANGE-LOOP",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-customer-go-live-adoption-phase37a",
  "verify:aibeopchin-customer-go-live-adoption-phase37b",
  "verify:aibeopchin-customer-go-live-adoption-phase37c",
  "verify:aibeopchin-customer-go-live-adoption-phase37d",
  "verify:aibeopchin-customer-go-live-adoption-phase37e",
];

export function runCustomerGoLiveAdoptionRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-customer-go-live-adoption-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createCustomerGoLiveAdoptionRcFsHelpers(root);

  assertFileExists("src/features/customer-go-live-adoption/customer-go-live-adoption-rc-lock.ts");
  assertFileExists("src/features/customer-go-live-adoption/customer-go-live-adoption-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_RUNBOOK.md");

  assertIncludes("src/features/customer-go-live-adoption/customer-go-live-adoption-rc-lock.ts", [
    "CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_MARKER_PHASE37F",
    "verify:aibeopchin-customer-go-live-adoption-rc",
    "CUSTOMER_GO_LIVE_ADOPTION_RC_PRODUCT_CROSS_LINK",
    "phase37a-go-live-execution-checklist-gate",
    "phase37-customer-go-live-adoption-policy-only-boundary",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_SUMMARY.md", [
    "37-A",
    "37-F",
    "verify:aibeopchin-customer-go-live-adoption-rc",
    "36-F",
    "no automatic adoption success claim",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_SUMMARY.md",
    "Product 37-F",
  ]);

  assertIncludes(
    "src/features/customer-go-live-adoption/go-live-execution/go-live-execution-checklist.service.ts",
    ["buildGoLiveExecutionChecklist"],
  );
  assertIncludes(
    "src/features/customer-go-live-adoption/adoption-monitoring/first-30-days-adoption-monitoring.service.ts",
    ["buildFirst30DaysAdoptionMonitoring"],
  );
  assertIncludes(
    "src/features/customer-go-live-adoption/activation-review/admin-lawyer-activation-review.service.ts",
    ["buildAdminLawyerActivationReview"],
  );
  assertIncludes(
    "src/features/customer-go-live-adoption/portal-adoption/client-portal-adoption-review.service.ts",
    ["buildClientPortalAdoptionReview"],
  );
  assertIncludes(
    "src/features/customer-go-live-adoption/issue-change-loop/go-live-issue-change-request-loop.service.ts",
    ["buildGoLiveIssueChangeRequestLoop"],
  );

  assertIncludes("docs/platform/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_LOCK_SUMMARY.md", [
    "Customer Go-Live / Adoption",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-customer-go-live-adoption-rc")) {
    throw new Error("package.json must define verify:aibeopchin-customer-go-live-adoption-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["37-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] customer-go-live-adoption-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/customer-go-live-adoption/customer-go-live-adoption-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
