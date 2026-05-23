import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

/** @param {string} relativePath */
function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required file for Phase 4-H: ${relativePath}`);
  }
}

function main() {
  console.log("[verify:gongbuho-legal-knowledge-rc] running verify:gongbuho …");
  execSync("npm run verify:gongbuho", { stdio: "inherit", cwd: root });

  const rcSummaryPath = "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md";
  const rcChecklistPath =
    "docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md";
  assertFileExists(rcSummaryPath);
  assertFileExists(rcChecklistPath);

  const rcSummary = readFile(rcSummaryPath);
  const rcChecklist = readFile(rcChecklistPath);
  const rcLockTs = readFile("src/lib/gongbuho/gongbuho-legal-knowledge-rc-lock.ts");
  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const readme = readFile("docs/gongbuho/README.md");

  const tag4h = "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tag4h)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag4h}`);
  }

  for (const fragment of [
    "Phase **4‑H**",
    tag4h,
    "GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST",
    "LAWYER_PORTAL",
    "verify:gongbuho-legal-knowledge-rc",
  ]) {
    if (!rcSummary.includes(fragment)) {
      throw new Error(`${rcSummaryPath} missing Phase 4-H marker "${fragment}"`);
    }
  }

  for (const fragment of [
    tag4h,
    "verify:gongbuho-legal-knowledge-rc",
    "20260524180000_legal_knowledge_pipeline",
    "READY_FOR_LAWYER_REVIEW",
  ]) {
    if (!rcChecklist.includes(fragment)) {
      throw new Error(`${rcChecklistPath} missing Phase 4-H marker "${fragment}"`);
    }
  }

  if (!rcLockTs.includes("GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_MARKER_PHASE4H")) {
    throw new Error(
      "gongbuho-legal-knowledge-rc-lock.ts missing GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_MARKER_PHASE4H",
    );
  }
  if (!rcLockTs.includes("phase4h-gongbuho-legal-knowledge-rc-predeploy-closure")) {
    throw new Error(
      "gongbuho-legal-knowledge-rc-lock.ts missing phase4h-gongbuho-legal-knowledge-rc-predeploy-closure marker",
    );
  }

  const migrationDirs = ["20260524180000_legal_knowledge_pipeline"];
  for (const dir of migrationDirs) {
    const migrationSql = path.join(root, "prisma", "migrations", dir, "migration.sql");
    if (!fs.existsSync(migrationSql)) {
      throw new Error(
        `Missing Phase 4-H required migration: prisma/migrations/${dir}/migration.sql`,
      );
    }
  }

  const evidenceTagsStack = [
    "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-COMPILER-POLICY",
    "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-INTAKE-SPEC",
    "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-PACKET-PIPELINE-SPEC",
    "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-PIPELINE-IMPLEMENTATION",
    "EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-LAWYER-PORTAL",
  ];
  for (const tag of evidenceTagsStack) {
    if (!impl.includes(tag)) {
      throw new Error(
        `IMPLEMENTATION_EVIDENCE.md missing ${tag} (Phase 4-H RC requires full Legal Knowledge stack)`,
      );
    }
  }

  if (!readme.includes("./GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md")) {
    throw new Error("docs/gongbuho/README.md must link GONGBUHO_LEGAL_KNOWLEDGE_RC_LOCK_SUMMARY.md (Phase 4-H)");
  }
  if (!readme.includes("./GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md")) {
    throw new Error(
      "docs/gongbuho/README.md must link GONGBUHO_LEGAL_KNOWLEDGE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md (Phase 4-H)",
    );
  }
  if (!readme.includes("| **4-H** |") || !readme.includes("Legal Knowledge RC")) {
    throw new Error(
      "docs/gongbuho/README.md roadmap must include Phase **4-H** Legal Knowledge RC LOCKED row",
    );
  }

  console.log(
    "verify:gongbuho-legal-knowledge-rc PASS (Phase 4-H Legal Knowledge RC / Predeploy Closure; includes verify:gongbuho)",
  );
}

main();
