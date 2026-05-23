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
    throw new Error(`Missing required file for Phase 5-J: ${relativePath}`);
  }
}

function main() {
  console.log("[verify:aibeopchin-voice-rc] running verify:aibeopchin-voice …");
  execSync("npm run verify:aibeopchin-voice", { stdio: "inherit", cwd: root });

  const rcSummaryPath = "docs/voice/VOICE_RC_LOCK_SUMMARY.md";
  const rcChecklistPath = "docs/voice/VOICE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md";
  assertFileExists(rcSummaryPath);
  assertFileExists(rcChecklistPath);

  const rcSummary = readFile(rcSummaryPath);
  const rcChecklist = readFile(rcChecklistPath);
  const rcLockTs = readFile("src/lib/voice/voice-rc-lock.ts");
  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const readme = readFile("docs/voice/README.md");

  const tag5j = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5J-VOICE-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tag5j)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5j}`);
  }

  for (const fragment of [
    "Phase **5‑J**",
    tag5j,
    "VOICE_RC_PREDEPLOY_CLOSURE_CHECKLIST",
    "5-H-UI-6",
    "verify:aibeopchin-voice-rc",
  ]) {
    if (!rcSummary.includes(fragment)) {
      throw new Error(`${rcSummaryPath} missing Phase 5-J marker "${fragment}"`);
    }
  }

  for (const fragment of [
    tag5j,
    "verify:aibeopchin-voice-rc",
    "20260524120000_voice_lawyer_review_completion_phase5h_ui3",
    "20260524143000_voice_lawyer_supplement_phase5h_ui4",
  ]) {
    if (!rcChecklist.includes(fragment)) {
      throw new Error(`${rcChecklistPath} missing Phase 5-J marker "${fragment}"`);
    }
  }

  if (!rcLockTs.includes("VOICE_RC_LOCK_MARKER_PHASE5J")) {
    throw new Error("voice-rc-lock.ts missing VOICE_RC_LOCK_MARKER_PHASE5J");
  }
  if (!rcLockTs.includes("phase5j-voice-rc-predeploy-closure")) {
    throw new Error("voice-rc-lock.ts missing phase5j-voice-rc-predeploy-closure marker");
  }

  const migrationDirs = [
    "20260524120000_voice_lawyer_review_completion_phase5h_ui3",
    "20260524143000_voice_lawyer_supplement_phase5h_ui4",
  ];
  for (const dir of migrationDirs) {
    const migrationSql = path.join(root, "prisma", "migrations", dir, "migration.sql");
    if (!fs.existsSync(migrationSql)) {
      throw new Error(`Missing Phase 5-J required migration: prisma/migrations/${dir}/migration.sql`);
    }
  }

  const evidenceTags5hUi = [
    "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-6-VOICE-DOCUMENT-FINALIZE-GATE-UI",
    "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-5-VOICE-OPEN-SUPPLEMENT-FINALIZE-GATE",
    "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-4-VOICE-LAWYER-SUPPLEMENT-QUESTION",
    "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-3-VOICE-LAWYER-REVIEW-PERSISTENCE",
    "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-2-VOICE-DOCUMENT-FINALIZE-GATE",
    "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-LAWYER-VOICE-REVIEW-PANEL",
    "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-LAWYER-VOICE-REVIEW-UX-SPEC",
  ];
  for (const tag of evidenceTags5hUi) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag} (Phase 5-J RC requires full 5-H stack)`);
    }
  }

  if (!readme.includes("./VOICE_RC_LOCK_SUMMARY.md")) {
    throw new Error("docs/voice/README.md must link VOICE_RC_LOCK_SUMMARY.md (Phase 5-J)");
  }
  if (!readme.includes("./VOICE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md")) {
    throw new Error("docs/voice/README.md must link VOICE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md (Phase 5-J)");
  }
  if (!readme.includes("| **5-J** |") || !readme.includes("Voice RC")) {
    throw new Error("docs/voice/README.md roadmap must include Phase **5-J** Voice RC LOCKED row");
  }

  console.log(
    "verify:aibeopchin-voice-rc PASS (Phase 5-J Voice RC / Predeploy Closure; includes verify:aibeopchin-voice)",
  );
}

main();
