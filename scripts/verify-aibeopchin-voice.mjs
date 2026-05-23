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
    "model VoiceLawyerReviewCompletion",
    "interviewQuestionKey",
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
    throw new Error("docs/voice/README.md roadmap must include Phase **5-J** Voice RC");
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

  const panel5hUiPath = "src/components/cases/lawyer-voice-review-panel.tsx";
  assertFileExists(panel5hUiPath);
  const panel5hUi = readFile(panel5hUiPath);
  const panel5hUiFragments = [
    "LawyerVoiceReviewPanel",
    "VOICE_LAWYER_REVIEW_PANEL_MARKER_PHASE5H_UI",
    "STT draft",
    "confirmed transcript",
    "Interview answer",
    "document finalize gate",
    "VOICE_LAWYER_REVIEW_UX_SPEC.md",
    "H-BLOCK-TRANSCRIPT-NOT-CONFIRMED",
    "H-BLOCK-MISMATCH-NOT-REVIEWED",
    "H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED",
  ];
  for (const fragment of panel5hUiFragments) {
    if (!panel5hUi.includes(fragment)) {
      throw new Error(`${panel5hUiPath} missing Phase 5-H-UI fragment "${fragment}"`);
    }
  }

  const policy5hUiFragments = [
    "H-BLOCK-TRANSCRIPT-NOT-CONFIRMED",
    "H-BLOCK-MISMATCH-NOT-REVIEWED",
    "H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED",
    "resolveVoiceReviewBlockReason",
    "canFinalizeDocumentAfterVoiceReview",
  ];
  for (const fragment of policy5hUiFragments) {
    if (!policy5h.includes(fragment)) {
      throw new Error(`voice-lawyer-review-ux-policy.ts missing Phase 5-H-UI marker "${fragment}"`);
    }
  }

  const tag5hUi = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-LAWYER-VOICE-REVIEW-PANEL";
  if (!impl.includes(tag5hUi)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5hUi}`);
  }

  const gate5hUi2Path = "src/lib/voice/voice-document-finalize-gate.service.ts";
  assertFileExists(gate5hUi2Path);
  const gate5hUi2 = readFile(gate5hUi2Path);
  const gate5hUi2Fragments = [
    "phase5h-ui-2-voice-document-finalize-gate",
    "assertVoiceDocumentFinalizeAllowed",
    "evaluateVoiceDocumentFinalizeGate",
    "resolveVoiceDocumentFinalizeBlockReason",
    "document finalize",
    "H-BLOCK-TRANSCRIPT-NOT-CONFIRMED",
    "H-BLOCK-MISMATCH-NOT-REVIEWED",
    "H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED",
  ];
  for (const fragment of gate5hUi2Fragments) {
    if (!gate5hUi2.includes(fragment)) {
      throw new Error(`${gate5hUi2Path} missing Phase 5-H-UI-2 fragment "${fragment}"`);
    }
  }

  const approveRoute = readFile("src/app/api/legal-documents/[legalDocumentId]/approve/route.ts");
  if (!approveRoute.includes("assertVoiceDocumentFinalizeAllowed")) {
    throw new Error("legal-documents approve route must call assertVoiceDocumentFinalizeAllowed");
  }

  const detailService = readFile("src/features/documents/document-detail.service.ts");
  if (!detailService.includes("assertVoiceDocumentFinalizeAllowed")) {
    throw new Error("document-detail.service review APPROVE must call assertVoiceDocumentFinalizeAllowed");
  }

  const draftService = readFile("src/features/document-drafts/document-draft.service.ts");
  if (!draftService.includes("assertVoiceDocumentFinalizeAllowed")) {
    throw new Error("finalizeDocumentDraft must call assertVoiceDocumentFinalizeAllowed");
  }

  const reviewRepoPath = "src/lib/voice/voice-lawyer-review-flags.repository.ts";
  assertFileExists(reviewRepoPath);
  const reviewRepo = readFile(reviewRepoPath);
  if (!reviewRepo.includes("PHASE5H_UI_3_VOICE_LAWYER_REVIEW_FLAGS_REPOSITORY_LOCK")) {
    throw new Error(`${reviewRepoPath} missing Phase 5-H-UI-3 repository lock marker`);
  }
  if (!reviewRepo.includes("VoiceLawyerReviewCompletion")) {
    throw new Error(`${reviewRepoPath} must persist VoiceLawyerReviewCompletion rows`);
  }

  const reviewServicePath = "src/features/voice/voice-lawyer-review.service.ts";
  assertFileExists(reviewServicePath);
  const reviewService = readFile(reviewServicePath);
  if (!reviewService.includes("VOICE_LAWYER_REVIEW_SERVICE_MARKER_PHASE5H_UI_3")) {
    throw new Error(`${reviewServicePath} missing Phase 5-H-UI-3 service marker`);
  }

  const reviewRoutePath = "src/app/api/cases/[caseId]/voice/lawyer-reviews/route.ts";
  assertFileExists(reviewRoutePath);
  if (!readFile(reviewRoutePath).includes("setLawyerVoiceReviewCompletion")) {
    throw new Error(`${reviewRoutePath} must call setLawyerVoiceReviewCompletion`);
  }

  if (!gate5hUi2.includes("includeLawyerReviewRequired: true")) {
    throw new Error(`${gate5hUi2Path} must enable includeLawyerReviewRequired for Phase 5-H-UI-3`);
  }
  if (!gate5hUi2.includes("phase5h-ui-3-voice-document-finalize-lawyer-review-required")) {
    throw new Error(`${gate5hUi2Path} missing Phase 5-H-UI-3 finalize gate marker`);
  }

  if (!panel5hUi.includes("/voice/lawyer-reviews")) {
    throw new Error(`${panel5hUiPath} must persist lawyer review via /voice/lawyer-reviews API`);
  }

  const tag5hUi3 = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-3-VOICE-LAWYER-REVIEW-PERSISTENCE";
  if (!impl.includes(tag5hUi3)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5hUi3}`);
  }

  const tag5hUi2 = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-2-VOICE-DOCUMENT-FINALIZE-GATE";
  if (!impl.includes(tag5hUi2)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5hUi2}`);
  }

  const supplementServicePath = "src/features/voice/voice-lawyer-supplement.service.ts";
  assertFileExists(supplementServicePath);
  const supplementService = readFile(supplementServicePath);
  const supplementFragments = [
    "VOICE_LAWYER_SUPPLEMENT_SERVICE_MARKER_PHASE5H_UI_4",
    "VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER",
    "createVoiceLawyerSupplementQuestion",
    "mergeVoiceSupplementItemsToInterviewOnAccepted",
    "phase5h-ui-4-voice-lawyer-review-supplement",
  ];
  for (const fragment of supplementFragments) {
    if (!supplementService.includes(fragment)) {
      throw new Error(`${supplementServicePath} missing Phase 5-H-UI-4 fragment "${fragment}"`);
    }
  }

  const supplementRoutePath = "src/app/api/cases/[caseId]/voice/supplement-questions/route.ts";
  assertFileExists(supplementRoutePath);
  if (!readFile(supplementRoutePath).includes("createVoiceLawyerSupplementQuestion")) {
    throw new Error(`${supplementRoutePath} must call createVoiceLawyerSupplementQuestion`);
  }

  const supplementRequestService = readFile("src/features/supplement-request/supplement-request.service.ts");
  if (!supplementRequestService.includes("mergeVoiceSupplementItemsToInterviewOnAccepted")) {
    throw new Error("supplement-request.service must merge voice supplements on ACCEPTED");
  }

  if (!panel5hUi.includes("/voice/supplement-questions")) {
    throw new Error(`${panel5hUiPath} must create supplements via /voice/supplement-questions API`);
  }
  if (!panel5hUi.includes("data-voice-supplement-trigger")) {
    throw new Error(`${panel5hUiPath} missing Phase 5-H-UI-4 supplement trigger marker`);
  }

  const tag5hUi4 = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-4-VOICE-LAWYER-SUPPLEMENT-QUESTION";
  if (!impl.includes(tag5hUi4)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5hUi4}`);
  }

  const openSupplementRepoPath = "src/lib/voice/voice-open-supplement-gate.repository.ts";
  assertFileExists(openSupplementRepoPath);
  const openSupplementRepo = readFile(openSupplementRepoPath);
  const openSupplementFragments = [
    "VOICE_OPEN_SUPPLEMENT_GATE_REPOSITORY_MARKER_PHASE5H_UI_5",
    "loadOpenVoiceOriginSupplementsByCaseId",
    "TERMINAL_SUPPLEMENT_REQUEST_STATUSES",
    "VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER",
  ];
  for (const fragment of openSupplementFragments) {
    if (!openSupplementRepo.includes(fragment)) {
      throw new Error(`${openSupplementRepoPath} missing Phase 5-H-UI-5 fragment "${fragment}"`);
    }
  }

  if (!gate5hUi2.includes("evaluateOpenVoiceSupplementDocumentFinalizeGate")) {
    throw new Error(`${gate5hUi2Path} must evaluate open voice supplements for Phase 5-H-UI-5`);
  }
  if (!gate5hUi2.includes("H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED")) {
    throw new Error(`${gate5hUi2Path} missing H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED (H-BLOCK-02)`);
  }
  if (!gate5hUi2.includes("phase5h-ui-5-voice-open-supplement-finalize-gate")) {
    throw new Error(`${gate5hUi2Path} missing Phase 5-H-UI-5 finalize gate marker`);
  }
  if (!policy5h.includes("H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED")) {
    throw new Error("voice-lawyer-review-ux-policy.ts missing H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED");
  }

  const tag5hUi5 = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-5-VOICE-OPEN-SUPPLEMENT-FINALIZE-GATE";
  if (!impl.includes(tag5hUi5)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5hUi5}`);
  }

  const gateUiPath = "src/lib/voice/voice-document-finalize-gate-ui.ts";
  assertFileExists(gateUiPath);
  const gateUi = readFile(gateUiPath);
  const gateUiFragments = [
    "VOICE_DOCUMENT_FINALIZE_GATE_UI_MARKER_PHASE5H_UI_6",
    "VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES",
    "resolveVoiceDocumentFinalizeGateUiSnapshot",
    "shouldShowVoiceDocumentFinalizeGatePanel",
  ];
  for (const fragment of gateUiFragments) {
    if (!gateUi.includes(fragment)) {
      throw new Error(`${gateUiPath} missing Phase 5-H-UI-6 fragment "${fragment}"`);
    }
  }

  const gatePanelPath = "src/components/cases/voice-document-finalize-gate-panel.tsx";
  assertFileExists(gatePanelPath);
  const gatePanel = readFile(gatePanelPath);
  if (!gatePanel.includes("data-voice-document-finalize-gate-panel")) {
    throw new Error(`${gatePanelPath} missing Phase 5-H-UI-6 panel marker`);
  }
  if (!gatePanel.includes("data-document-finalize-gate")) {
    throw new Error(`${gatePanelPath} must expose document finalize gate state`);
  }

  const gateRoutePath = "src/app/api/cases/[caseId]/voice/document-finalize-gate/route.ts";
  assertFileExists(gateRoutePath);
  if (!readFile(gateRoutePath).includes("buildVoiceDocumentFinalizeGateUiSnapshotForCase")) {
    throw new Error(`${gateRoutePath} must return gate UI snapshot`);
  }

  if (!gate5hUi2.includes("buildVoiceDocumentFinalizeGateUiSnapshotForCase")) {
    throw new Error(`${gate5hUi2Path} missing Phase 5-H-UI-6 snapshot builder`);
  }

  const caseDetailClient = readFile("src/components/cases/case-detail-client.tsx");
  if (!caseDetailClient.includes("VoiceDocumentFinalizeGatePanel")) {
    throw new Error("case-detail-client must render VoiceDocumentFinalizeGatePanel");
  }
  if (!caseDetailClient.includes("readVoiceDocumentFinalizeBlockedFromJson")) {
    throw new Error("case-detail-client must align approve 403 with gate UI messages");
  }

  const tag5hUi6 = "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-UI-6-VOICE-DOCUMENT-FINALIZE-GATE-UI";
  if (!impl.includes(tag5hUi6)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag5hUi6}`);
  }

  // Phase 7-A — Voice Operations & E2E Hardening
  if (!readme.includes("**7-A**")) {
    throw new Error("docs/voice/README.md must reference Phase **7-A**");
  }

  const spec7aPath = "docs/voice/VOICE_PHASE7A_OPS_E2E_SPEC.md";
  assertFileExists(spec7aPath);
  const spec7a = readFile(spec7aPath);
  const spec7aTerms = [
    "Phase 7-A",
    "E2E_VOICE_OPS_SMOKE",
    "/admin/voice/transcripts",
    "VoicePrivacyOpsRequest",
    "draftText",
    "[EVIDENCE-20260523-AIBEOPCHIN-PHASE7A-VOICE-OPS-E2E-HARDENING]",
  ];
  for (const term of spec7aTerms) {
    if (!spec7a.includes(term)) {
      throw new Error(`Missing term "${term}" in ${spec7aPath}`);
    }
  }

  const opsPolicyPath = "src/lib/voice/voice-ops-policy.ts";
  assertFileExists(opsPolicyPath);
  const opsPolicy = readFile(opsPolicyPath);
  if (!opsPolicy.includes("VOICE_PHASE7A_OPS_POLICY_MARKER")) {
    throw new Error(`${opsPolicyPath} must expose Phase 7-A SSOT marker`);
  }
  if (!opsPolicy.includes("VOICE_OPS_TRANSCRIPT_BODY_EXPOSURE_ALLOWED = false")) {
    throw new Error(`${opsPolicyPath} must forbid ops transcript body exposure`);
  }

  const opsServicePath = "src/features/voice/voice-ops.service.ts";
  assertFileExists(opsServicePath);
  const opsService = readFile(opsServicePath);
  if (!opsService.includes("VOICE_PHASE7A_OPS_SERVICE_MARKER")) {
    throw new Error(`${opsServicePath} missing Phase 7-A service marker`);
  }
  if (opsService.includes("draftText: true")) {
    throw new Error(`${opsServicePath} must not select draftText for ops listing`);
  }

  const phase7aMigration = "prisma/migrations/20260524210000_voice_phase7a_ops/migration.sql";
  assertFileExists(phase7aMigration);
  const migration7a = readFile(phase7aMigration);
  if (!migration7a.includes("VoicePrivacyOpsRequest")) {
    throw new Error(`${phase7aMigration} must create VoicePrivacyOpsRequest`);
  }
  if (!schema.includes("model VoicePrivacyOpsRequest")) {
    throw new Error("prisma/schema.prisma missing model VoicePrivacyOpsRequest (Phase 7-A)");
  }

  const adminTranscriptsRoute = "src/app/api/admin/voice/transcripts/route.ts";
  assertFileExists(adminTranscriptsRoute);
  if (!readFile(adminTranscriptsRoute).includes("listVoiceTranscriptOpsRows")) {
    throw new Error(`${adminTranscriptsRoute} must list ops transcript metadata`);
  }

  const adminPrivacyRoute = "src/app/api/admin/voice/privacy-requests/route.ts";
  assertFileExists(adminPrivacyRoute);
  if (!readFile(adminPrivacyRoute).includes("createVoicePrivacyOpsRequest")) {
    throw new Error(`${adminPrivacyRoute} must create privacy ops requests`);
  }

  const adminTranscriptsPage = "src/app/(protected)/admin/voice/transcripts/page.tsx";
  assertFileExists(adminTranscriptsPage);
  if (!readFile(adminTranscriptsPage).includes("VoiceTranscriptOpsSummaryCards")) {
    throw new Error(`${adminTranscriptsPage} must render ops dashboard`);
  }

  const e2eVoice = readFile("tests/e2e/voice-guided-interview-smoke.spec.ts");
  if (!e2eVoice.includes("E2E_VOICE_OPS_SMOKE")) {
    throw new Error("voice-guided-interview-smoke.spec.ts must gate Phase 7-A ops smoke");
  }
  if (!e2eVoice.includes("/api/admin/voice/transcripts")) {
    throw new Error("voice-guided-interview-smoke.spec.ts must cover admin voice ops API gates");
  }

  const tag7a = "EVIDENCE-20260523-AIBEOPCHIN-PHASE7A-VOICE-OPS-E2E-HARDENING";
  if (!impl.includes(tag7a)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag7a}`);
  }

  console.log("verify:aibeopchin-voice PASS (Phase 5-B〜5-H + Phase 7-A ops/E2E static gates; Phase 5-I privacy runbook enforced)");
}
main();
