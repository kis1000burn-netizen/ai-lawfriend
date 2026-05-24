import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { assertPredeployMasterOrGate } from "./lib/predeploy-gate-assertions.mjs";

const root = process.cwd();

/** @param {string} relativePath */
function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required file for Phase 6-G: ${relativePath}`);
  }
}

function main() {
  console.log("[verify:aibeopchin-cmb-rc] running verify:aibeopchin-cmb …");
  execSync("npm run verify:aibeopchin-cmb", { stdio: "inherit", cwd: root });

  const rcSummaryPath = "docs/cmb/AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md";
  const rcChecklistPath = "docs/cmb/AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md";
  assertFileExists(rcSummaryPath);
  assertFileExists(rcChecklistPath);

  const rcSummary = readFile(rcSummaryPath);
  const rcChecklist = readFile(rcChecklistPath);
  const rcLockTs = readFile("src/cmb/publish/cmb-rc-lock.ts");
  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const readme = readFile("docs/cmb/README.md");
  const predeploy = readFile("scripts/predeploy-check.ts");

  const tag6g = "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6G-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tag6g)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag6g}`);
  }

  for (const fragment of [
    "Phase **6‑G**",
    tag6g,
    "AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST",
    "verify:aibeopchin-cmb-rc",
    "Publish/Lock",
  ]) {
    if (!rcSummary.includes(fragment)) {
      throw new Error(`${rcSummaryPath} missing Phase 6-G marker "${fragment}"`);
    }
  }

  for (const fragment of [
    tag6g,
    "verify:aibeopchin-cmb-rc",
    "20260524200000_aibeopchin_cmb_publish_lock",
    "Baseline sync",
    "predeploy:check",
  ]) {
    if (!rcChecklist.includes(fragment)) {
      throw new Error(`${rcChecklistPath} missing Phase 6-G marker "${fragment}"`);
    }
  }

  if (!rcLockTs.includes("AIBEOPCHIN_CMB_RC_LOCK_MARKER_PHASE6G")) {
    throw new Error("cmb-rc-lock.ts missing AIBEOPCHIN_CMB_RC_LOCK_MARKER_PHASE6G");
  }
  if (!rcLockTs.includes("phase6g-aibeopchin-cmb-rc-predeploy-closure")) {
    throw new Error("cmb-rc-lock.ts missing phase6g-aibeopchin-cmb-rc-predeploy-closure marker");
  }

  const migrationDirs = ["20260524200000_aibeopchin_cmb_publish_lock"];
  for (const dir of migrationDirs) {
    const migrationSql = path.join(root, "prisma", "migrations", dir, "migration.sql");
    if (!fs.existsSync(migrationSql)) {
      throw new Error(`Missing Phase 6-G required migration: prisma/migrations/${dir}/migration.sql`);
    }
  }

  const evidenceStack = [
    "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6-FOUNDATION",
    "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6E-ADMIN-PREVIEW-UI",
    "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6F-PUBLISH-LOCK",
  ];
  for (const tag of evidenceStack) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag} (Phase 6-G RC requires full 6-A〜F stack)`);
    }
  }

  if (!readme.includes("./AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md")) {
    throw new Error("docs/cmb/README.md must link AIBEOPCHIN_CMB_RC_LOCK_SUMMARY.md (Phase 6-G)");
  }
  if (!readme.includes("./AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md")) {
    throw new Error(
      "docs/cmb/README.md must link AIBEOPCHIN_CMB_RC_PREDEPLOY_CLOSURE_CHECKLIST.md (Phase 6-G)",
    );
  }
  if (!readme.includes("| **6-G** |") || !readme.includes("RC LOCKED")) {
    throw new Error("docs/cmb/README.md must include Phase **6-G** RC LOCKED row");
  }

  assertPredeployMasterOrGate(predeploy, "verify:aibeopchin-cmb-rc", "Phase 6-G CMB RC");

  console.log(
    "verify:aibeopchin-cmb-rc PASS (Phase 6-G CMB RC / Predeploy Closure; includes verify:aibeopchin-cmb)",
  );
}

main();
