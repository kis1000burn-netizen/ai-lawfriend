import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

/** @param {string} relativePath */
function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function main() {
  const schema = readFile("prisma/schema.prisma");

  const mustHave = [
    "enum VoiceTranscriptStatus",
    "enum VoiceInteractionTraceEvent",
    "CAPTURED",
    "NEEDS_CONFIRMATION",
    "CONFIRMED",
    "REJECTED",
    "VOICE_TRANSCRIPT_CREATED",
    "VOICE_INTERVIEW_ANSWER_BOUND",
    "model VoiceTranscript",
    "model VoiceInteractionTrace",
  ];

  const storageDoc = readFile("docs/voice/VOICE_TRANSCRIPT_STORAGE_SCHEMA.md");
  if (!storageDoc.includes("VoiceTranscript") || !storageDoc.includes("expiresAt")) {
    throw new Error("docs/voice/VOICE_TRANSCRIPT_STORAGE_SCHEMA.md must document VoiceTranscript + expiresAt");
  }

  for (const fragment of mustHave) {
    if (!schema.includes(fragment)) {
      throw new Error(`prisma/schema.prisma missing Voice Phase 5-B marker: "${fragment}"`);
    }
  }

  if (!/storeOriginalAudio\s+Boolean\s+@default\(false\)/.test(schema)) {
    throw new Error("VoiceTranscript.storeOriginalAudio must default to false (@default(false))");
  }

  const policyTs = readFile("src/lib/voice/voice-transcript-policy.ts");
  if (!policyTs.includes("VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT")) {
    throw new Error("voice-transcript-policy.ts must export VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT");
  }

  const readme = readFile("docs/voice/README.md");
  if (!readme.includes("**5-B**")) {
    throw new Error("docs/voice/README.md must reference Phase **5-B**");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag5b = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5B-VOICE-TRANSCRIPT-DRAFT-STORAGE";
  if (!impl.includes(tag5b)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5b}`);
  }

  if (!readme.includes("**5-C**")) {
    throw new Error("docs/voice/README.md must reference Phase **5-C**");
  }

  const spec5cPath = "docs/voice/VOICE_PROMPT_TTS_SPEC.md";
  const spec5c = readFile(spec5cPath);
  const spec5cTerms = [
    "Phase 5-C",
    "voicePrompt",
    "QuestionSetQuestion",
    "TTS",
    "재질문",
    "천천히",
    "민감",
    "[EVIDENCE-20260523-AIBEOPCHIN-PHASE5C-VOICE-PROMPT-TTS-LAYER]",
  ];

  for (const term of spec5cTerms) {
    if (!spec5c.includes(term)) {
      throw new Error(`Missing term "${term}" in ${spec5cPath}`);
    }
  }

  const ttsPolicy = readFile("src/lib/voice/voice-prompt-tts-policy.ts");
  if (!ttsPolicy.includes("VOICE_PROMPT_SPEC_MARKER_PHASE5_C")) {
    throw new Error("voice-prompt-tts-policy.ts must expose Phase 5-C SSOT marker");
  }

  const tag5c = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5C-VOICE-PROMPT-TTS-LAYER";
  if (!impl.includes(tag5c)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5c}`);
  }

  if (!readme.includes("**5-D**")) {
    throw new Error("docs/voice/README.md must reference Phase **5-D**");
  }

  if (!readme.includes("**5-E**")) {
    throw new Error("docs/voice/README.md must reference Phase **5-E**");
  }

  const tag5d = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5D-STT-CONFIRM-INTERVIEW-BINDING";
  if (!impl.includes(tag5d)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5d}`);
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required file for Phase 5-D: ${relativePath}`);
    }
  }

  const apiPhase5Path = "docs/voice/VOICE_TRANSCRIPT_API.md";
  assertFileExists(apiPhase5Path);
  const apiMd = readFile(apiPhase5Path);
  const apiMarkers = ["Phase 5-D", "stt-capture", "VOICE_INTERVIEW_ANSWER_BOUND"];
  for (const m of apiMarkers) {
    if (!apiMd.includes(m)) {
      throw new Error(`Missing "${m}" in ${apiPhase5Path}`);
    }
  }

  const svc5dPath = "src/features/voice/voice-transcript.service.ts";
  const svc5d = readFile(svc5dPath);
  const svc5dFragments = [
    "createVoiceTranscriptFromSttCapture",
    "confirmVoiceTranscriptAndBindInterviewAnswer",
    "rejectVoiceTranscriptDraft",
    "VoiceInteractionTraceEvent",
    "saveInterviewAnswer",
    "VOICE_PHASE5_D_SERVICE_MARKER",
  ];
  for (const fragment of svc5dFragments) {
    if (!svc5d.includes(fragment)) {
      throw new Error(`${svc5dPath} missing Phase 5-D marker: "${fragment}"`);
    }
  }

  const routes5d = [
    "src/app/api/cases/[caseId]/voice/transcripts/stt-capture/route.ts",
    "src/app/api/cases/[caseId]/voice/transcripts/[transcriptId]/confirm/route.ts",
    "src/app/api/cases/[caseId]/voice/transcripts/[transcriptId]/reject/route.ts",
  ];
  for (const rp of routes5d) {
    assertFileExists(rp);
    if (!readFile(rp).includes("Phase 5-D")) {
      throw new Error(`${rp} must include doc marker "Phase 5-D"`);
    }
  }

  const guidedUxPath = "docs/voice/VOICE_TTS_GUIDED_UX.md";
  assertFileExists(guidedUxPath);
  const ux5 = readFile(guidedUxPath);
  const ux5Fragments = ["Phase 5-E", "InterviewVoiceGuidedPanel", "VOICE_TTS_TRACE_POLICY.md"];
  for (const fragment of ux5Fragments) {
    if (!ux5.includes(fragment)) {
      throw new Error(`Missing "${fragment}" in ${guidedUxPath}`);
    }
  }

  const trace5Path = "docs/voice/VOICE_TTS_TRACE_POLICY.md";
  assertFileExists(trace5Path);
  const trace5 = readFile(trace5Path);
  const traceFragments = ["Phase 5-E", "VoiceInteractionTrace", "재생"];
  for (const fragment of traceFragments) {
    if (!trace5.includes(fragment)) {
      throw new Error(`Missing "${fragment}" in ${trace5Path}`);
    }
  }

  const panel5Path = "src/components/cases/interview-voice-guided-panel.tsx";
  assertFileExists(panel5Path);
  const panelTs = readFile(panel5Path);
  const panelFrags = [
    "phase5-e-interview-guided-voice-panel",
    "InterviewVoiceGuidedPanel",
    "Phase 5-E",
    "phase5-e-tts-guided-interview-ux",
    "Phase 5-F",
    "data-phase5-f",
    "pagehide",
    "visibilitychange",
    "manualTextDraftLocked",
  ];
  for (const fr of panelFrags) {
    if (!panelTs.includes(fr)) {
      throw new Error(`${panel5Path} missing guided voice panel marker: "${fr}"`);
    }
  }

  const interviewClientPath = "src/components/cases/case-interview-client.tsx";
  const interviewTs = readFile(interviewClientPath);
  if (!interviewTs.includes("InterviewVoiceGuidedPanel")) {
    throw new Error(`${interviewClientPath} must render InterviewVoiceGuidedPanel`);
  }

  const policy5Again = readFile("src/lib/voice/voice-prompt-tts-policy.ts");
  for (const fragment of ["VOICE_PROMPT_SPEC_MARKER_PHASE5_E", "buildInterviewPrimaryTtsMainScript"]) {
    if (!policy5Again.includes(fragment)) {
      throw new Error(`voice-prompt-tts-policy.ts missing Phase 5-E fragment: "${fragment}"`);
    }
  }

  const tag5e = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5E-TTS-PLAYER-GUIDED-INTERVIEW-UX";
  if (!impl.includes(tag5e)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5e}`);
  }

  if (!readme.includes("VOICE_QA_ACCESSIBILITY_SMOKE")) {
    throw new Error("docs/voice/README.md must reference VOICE_QA_ACCESSIBILITY_SMOKE (Phase 5-F)");
  }

  const mvpSummaryPath = "docs/voice/VOICE_MVP_LOCK_SUMMARY.md";
  assertFileExists(mvpSummaryPath);
  const mvpMd = readFile(mvpSummaryPath);
  for (const f of ["Phase **5‑G**", "[EVIDENCE-20260523-AIBEOPCHIN-PHASE5G-VOICE-MVP-LOCK-PREDEPLOY-QA]", "VOICE_PREDEPLOY_QA_CHECKLIST"]) {
    if (!mvpMd.includes(f)) {
      throw new Error(`${mvpSummaryPath} missing MVP lock marker: "${f}"`);
    }
  }

  const prePath = "docs/voice/VOICE_PREDEPLOY_QA_CHECKLIST.md";
  assertFileExists(prePath);

  if (!readme.includes("./VOICE_MVP_LOCK_SUMMARY.md")) {
    throw new Error("docs/voice/README.md must link VOICE_MVP_LOCK_SUMMARY.md (Phase 5-G)");
  }
  if (!readme.includes("./VOICE_PREDEPLOY_QA_CHECKLIST.md")) {
    throw new Error("docs/voice/README.md must link VOICE_PREDEPLOY_QA_CHECKLIST.md (Phase 5-G)");
  }
  if (!readme.includes("| **5-G** |") || !readme.includes("Voice MVP Lock")) {
    throw new Error("docs/voice/README.md roadmap must include Phase **5-G** Voice MVP Lock");
  }
  if (!readme.includes("| **5-H** |")) {
    throw new Error("docs/voice/README.md roadmap must include Phase **5-H** (lawyer UX)");
  }
  if (!readme.includes("| **5-I** |") || !readme.includes("Privacy, Retention")) {
    throw new Error("docs/voice/README.md must include Phase **5-I** privacy runbook row");
  }
  if (!readme.includes("| **5-J** |")) {
    throw new Error("docs/voice/README.md roadmap must include Phase **5-J** backlog / RC");
  }

  if (!readme.includes("./VOICE_PRIVACY_RETENTION_RUNBOOK.md")) {
    throw new Error("docs/voice/README.md must link VOICE_PRIVACY_RETENTION_RUNBOOK.md (Phase 5-I)");
  }
  if (!readme.includes("./VOICE_TTL_CLEANUP_POLICY.md")) {
    throw new Error("docs/voice/README.md must link VOICE_TTL_CLEANUP_POLICY.md (Phase 5-I)");
  }

  const qaDocPath = "docs/voice/VOICE_QA_ACCESSIBILITY_SMOKE.md";
  assertFileExists(qaDocPath);
  const qaMd = readFile(qaDocPath);
  const qaFrags = ["Phase 5-F", "Chrome", "iOS Safari", "interview-voice-guided-panel.test.tsx"];
  for (const f of qaFrags) {
    if (!qaMd.includes(f)) {
      throw new Error(`Missing "${f}" in ${qaDocPath}`);
    }
  }

  const msgVoicePath = "src/lib/voice/interview-voice-guided-messages.ts";
  assertFileExists(msgVoicePath);
  const msgVoice = readFile(msgVoicePath);
  for (const fragment of [
    "phase5-f-voice-qa-accessibility-smoke",
    "MESSAGE_TTS_UNAVAILABLE_KO",
    "MESSAGE_MIC_PERMISSION_DENIED_KO",
  ]) {
    if (!msgVoice.includes(fragment)) {
      throw new Error(`${msgVoicePath} missing Phase 5-F fragment "${fragment}"`);
    }
  }

  if (!panelTs.includes("data-phase5-f")) {
    throw new Error(`${panel5Path} must set data-phase5-f (Phase 5-F QA marker binding)`);
  }

  assertFileExists("src/lib/voice/interview-voice-guided-messages.test.ts");
  assertFileExists("src/components/cases/interview-voice-guided-panel.test.tsx");
  assertFileExists("src/lib/voice/voice-transcript-retention-policy.test.ts");
  assertFileExists("tests/e2e/voice-guided-interview-smoke.spec.ts");

  const phase5IDocs = [
    "docs/voice/VOICE_PRIVACY_RETENTION_RUNBOOK.md",
    "docs/voice/VOICE_TTL_CLEANUP_POLICY.md",
  ];
  const phase5IRequiredFragments = [
    "Phase 5-I",
    "Voice Privacy",
    "Retention",
    "Operations Runbook",
    "Original audio is not stored by default",
    "CONFIRMED",
    "REJECTED",
    "TTL",
    "72 hours",
    "Browser TTS playback",
    "Trace",
  ];
  for (const docPath of phase5IDocs) {
    assertFileExists(docPath);
    const body = readFile(docPath);
    for (const fragment of phase5IRequiredFragments) {
      if (!body.includes(fragment)) {
        throw new Error(`${docPath} missing Phase 5-I fragment "${fragment}"`);
      }
    }
  }

  const phase5ICodeMarkers = [
    "PHASE5I_VOICE_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK",
    "VOICE_ORIGINAL_AUDIO_STORAGE_DEFAULT",
    "VOICE_BROWSER_TTS_TRACE_ALLOWED",
    "VOICE_TRANSCRIPT_BODY_LOGGING_ALLOWED",
    "isVoiceTranscriptDraftCleanupEligible",
  ];
  const policy5i = readFile("src/lib/voice/voice-transcript-policy.ts");
  for (const m of phase5ICodeMarkers) {
    if (!policy5i.includes(m)) {
      throw new Error(`voice-transcript-policy.ts missing Phase 5-I marker "${m}"`);
    }
  }
  const tag5f = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-VOICE-QA-ACCESSIBILITY-SMOKE";
  if (!impl.includes(tag5f)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5f}`);
  }

  const tag5fFinal = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-FINAL-QA-TEXT-PRODUCT-ALIGNMENT";
  if (!impl.includes(tag5fFinal)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5fFinal}`);
  }

  const tag5g = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5G-VOICE-MVP-LOCK-PREDEPLOY-QA";
  if (!impl.includes(tag5g)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5g}`);
  }

  const tag5i = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5I-VOICE-PRIVACY-RETENTION-OPERATIONS-RUNBOOK";
  if (!impl.includes(tag5i)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5i}`);
  }

  const spec5hPath = "docs/voice/VOICE_LAWYER_REVIEW_UX_SPEC.md";
  assertFileExists(spec5hPath);
  const spec5h = readFile(spec5hPath);
  const tag5h = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-LAWYER-VOICE-REVIEW-UX-SPEC";
  const spec5hFragments = [
    "Phase 5-H",
    tag5h,
    "Lawyer Voice Review",
    "STT draft",
    "confirmed transcript",
    "Interview answer",
    "Lawyer",
    "Supplement",
    "document",
    "block",
    "H-BLOCK",
    "voice-lawyer-review-ux-policy.ts",
    "VoiceTranscript",
    "CONFIRMED",
    "VOICE_LAWYER_REVIEW_UX_SPEC_MARKER_PHASE5H",
  ];
  for (const fragment of spec5hFragments) {
    if (!spec5h.includes(fragment)) {
      throw new Error(`${spec5hPath} missing Phase 5-H fragment "${fragment}"`);
    }
  }

  if (!readme.includes("./VOICE_LAWYER_REVIEW_UX_SPEC.md")) {
    throw new Error("docs/voice/README.md must link VOICE_LAWYER_REVIEW_UX_SPEC.md (Phase 5-H)");
  }

  assertFileExists("src/lib/voice/voice-lawyer-review-ux-policy.ts");
  const policy5h = readFile("src/lib/voice/voice-lawyer-review-ux-policy.ts");
  if (!policy5h.includes("VOICE_LAWYER_REVIEW_UX_SPEC_MARKER_PHASE5H")) {
    throw new Error("voice-lawyer-review-ux-policy.ts must expose VOICE_LAWYER_REVIEW_UX_SPEC_MARKER_PHASE5H");
  }
  if (!policy5h.includes(tag5h)) {
    throw new Error(`voice-lawyer-review-ux-policy.ts must reference evidence id substring ${tag5h}`);
  }

  assertFileExists("src/lib/voice/voice-lawyer-review-ux-policy.test.ts");

  if (!impl.includes(tag5h)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5h}`);
  }

  console.log("verify:aibeopchin-voice PASS (Phase 5-B〜5-H static gates; Phase 5-I privacy runbook enforced)");
}
main();
