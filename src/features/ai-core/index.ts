export {
  AI_CORE_LEGACY_MODULE_PATHS,
  AI_CORE_OPERATIONS,
  PHASE8A_AI_CORE_DOCUMENT_UNIFICATION_MARKER,
  PHASE8C_AI_CORE_LEGACY_CLEANUP_MARKER,
  PHASE8D_AI_CORE_NATIVE_CONTEXT_AUDIT_CLOSURE_MARKER,
  type AiCoreOperation,
} from "./ai-core-policy";

export {
  AI_PROVIDER_DEFAULT_MODELS,
  AI_PROVIDER_ENV_KEYS,
  AI_PROVIDER_IDS,
  AI_PROVIDER_SSOT_MARKER,
  getDocumentGenerateModel,
  getCaseSummaryModel,
  getOpenAIClient,
  getParagraphRewriteModel,
  isAiProviderConfigured,
  type AiProviderId,
} from "./ai-provider-ssot";

export {
  AI_CORE_TASK_TYPES,
  AI_PROMPT_KEYS,
  AI_PROMPT_LEGACY_BUILDERS,
  AI_PROMPT_REGISTRY_MARKER,
  AI_PROMPT_REGISTRY_VERSION,
  AI_TEMPLATE_PROMPT_KEY_BINDINGS,
  isRegisteredAiPromptKey,
  resolvePromptKeyForOperation,
  resolveTemplateAiPromptBinding,
  type AiCoreTaskType,
  type AiPromptKey,
  type TemplateAiPromptKey,
} from "./ai-prompt-registry";

export {
  AI_PROMPT_BUILDERS_MARKER,
  buildDocumentParagraphGenerateInput,
  buildDocumentParagraphGenerateInstructions,
  buildParagraphRewriteInput,
  buildParagraphRewriteInstructions,
} from "./ai-prompt-builders";

export {
  AI_CORE_OPENAI_PROVIDER_MARKER,
  invokeOpenAiDocumentParagraphGenerate,
  invokeOpenAiDocumentParagraphRewrite,
} from "./ai-core-openai.provider";

export {
  AI_CONTEXT_BUILDER_BLOCKS,
  AI_CONTEXT_BUILDER_MARKER,
  PHASE8D_AI_CONTEXT_BUILDER_NATIVE_MARKER,
  buildDocumentGenerationPrompt,
  buildIntegratedDocumentContext,
  type AiContextBuilderBlock,
  type BuildIntegratedDocumentContextInput,
  type BuildIntegratedDocumentContextResult,
} from "./ai-context-builder";

export {
  AI_INTEGRATED_CONTEXT_BUILDER_MARKER,
} from "./ai-integrated-context-builder";

export {
  AI_CORE_AUDIT_POLICY_MARKER,
  AI_CORE_AUDIT_REQUIRED_METADATA_FIELDS,
  DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM_MARKER,
  assertPublicSafeAiAuditMetadata,
  getAiCoreAuditPolicySnapshot,
  type AiCoreAuditPolicySnapshot,
} from "./ai-core-audit-policy";

export {
  AI_GUARDRAIL_VIOLATION_CODES,
  AI_OUTPUT_SCHEMA_VALIDATOR_MARKER,
  DOCUMENT_GENERATION_POLICIES,
  checkForbiddenAssertions,
  resolveDocumentGenerationPolicy,
  type AiGuardrailViolationCode,
  type DocumentGenerationPolicy,
  type ForbiddenAssertionCheckResult,
} from "./ai-output-schema-validator";

export {
  AI_AUDIT_MARKER,
  buildAiAuditRecord,
  persistAiCoreAudit,
  toPublicSafeAiAuditRecord,
  type AiAuditRecord,
  type BuildAiAuditRecordInput,
  type PersistAiCoreAuditInput,
  type PublicSafeAiAuditRecord,
} from "./ai-audit";

export {
  GENERATION_MODE_RUNTIME_MARKER,
  DRAFT_PREVIEW_DEFAULT_GENERATION_MODE,
  parseParagraphGenerationMode,
  resolveGenerationModeRuntimeGate,
  shouldInvokeLlmOnGenerate,
  shouldInvokeLlmOnRegenerate,
  type GenerationModeRuntimeContext,
  type GenerationModeRuntimeGate,
} from "./generation-mode-runtime";

export { mapLegalDocumentTypeToTemplateType } from "./legal-document-template-map";

export {
  CASE_SUMMARY_AI_CORE_PLANNED_MODULE_PATHS,
  CASE_SUMMARY_AI_MODES,
  CASE_SUMMARY_AI_OPERATIONS,
  CASE_SUMMARY_LEGACY_MODULE_PATHS,
  CASE_SUMMARY_PROMPT_KEYS,
  PHASE9A_CASE_SUMMARY_AI_CORE_INTEGRATION_MARKER,
  PHASE9B_CASE_SUMMARY_AI_CORE_INTEGRATION_MARKER,
  parseCaseSummaryAiMode,
  resolveCaseSummaryAiModeFromEnv,
  assertCaseSummaryAiModeEnvValidForRc,
  shouldInvokeLlmOnCaseSummaryGenerate,
  shouldInvokeLlmOnCaseSummaryRegenerate,
  type CaseSummaryAiMode,
  type CaseSummaryAiOperation,
  type CaseSummaryAiRuntimeContext,
  type CaseSummaryPromptKey,
} from "./case-summary-ai-core-policy";

export {
  buildCaseSummaryAuditRecord,
  CASE_SUMMARY_AUDIT_MARKER,
  persistCaseSummaryAiCoreAudit,
  toPublicSafeCaseSummaryAuditRecord,
  type CaseSummaryAuditRecord,
  type PublicSafeCaseSummaryAuditRecord,
} from "./case-summary-audit";

export {
  buildCaseSummaryGenerationContext,
  CASE_SUMMARY_CONTEXT_BUILDER_MARKER,
  type BuildCaseSummaryContextInput,
  type BuildCaseSummaryContextResult,
} from "./case-summary-context-builder";

export {
  CASE_SUMMARY_OPENAI_PROVIDER_MARKER,
  invokeOpenAiCaseSummaryGenerate,
} from "./case-summary-openai.provider";

export {
  CASE_SUMMARY_DISCLAIMER,
  CASE_SUMMARY_NOT_FINAL_JUDGMENT_NOTE,
  CASE_SUMMARY_OUTPUT_VALIDATOR_MARKER,
  sanitizeCaseSummaryLegalOverclaim,
  validateCaseSummaryContent,
  type CaseSummaryValidatedContent,
} from "./case-summary-output-validator";

export {
  buildCaseSummaryGenerateInput,
  buildCaseSummaryGenerateInstructions,
  CASE_SUMMARY_PROMPT_BUILDERS_MARKER,
} from "./case-summary-prompt-builders";

export {
  CASE_SUMMARY_PROMPT_REGISTRY_MARKER,
  CASE_SUMMARY_PROMPT_REGISTRY_VERSION,
  CASE_SUMMARY_REGISTRY_PROMPT_KEYS,
  CASE_SUMMARY_TASK_TYPES,
  isRegisteredCaseSummaryPromptKey,
  resolveCaseSummaryPromptForOperation,
  type CaseSummaryRegistryPromptKey,
  type CaseSummaryTaskType,
} from "./case-summary-prompt-registry";

export {
  invokeCaseSummaryGenerate,
  PHASE9B_CASE_SUMMARY_AI_CORE_RUNTIME_MARKER,
  type InvokeCaseSummaryGenerateInput,
  type InvokeCaseSummaryGenerateResult,
} from "./case-summary-ai-core-runtime.service";

export {
  AUDIENCE_VISIBILITY,
  CASE_CLAIM_TYPES,
  CASE_INTELLIGENCE_GRAPH_VERSION,
  caseIntelligenceClaimSchema,
  caseIntelligenceGraphSchema,
  CONFIDENCE_LEVELS,
  EVIDENCE_SOURCE_KINDS,
  evidenceRefSchema,
  LAWYER_REVIEW_STATES,
  legalBasisRefSchema,
  parseCaseIntelligenceGraph,
  PHASE9D_CASE_INTELLIGENCE_GRAPH_MARKER,
  safeParseCaseIntelligenceGraph,
  type AudienceVisibility,
  type CaseClaimType,
  type CaseIntelligenceClaim,
  type CaseIntelligenceGraph,
  type ConfidenceLevel,
  type EvidenceRef,
  type EvidenceSourceKind,
  type LawyerReviewState,
  type LegalBasisRef,
} from "./case-intelligence-graph.schema";

export {
  buildCaseIntelligenceGraphDraft,
  buildInterviewAnswerClaims,
  buildWageBackpayExampleClaim,
  CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD,
  CASE_SUMMARY_PROVENANCE_MAP_MARKER,
  type CaseSummaryOutputSectionKey,
} from "./case-summary-provenance-map";

export {
  assertClaimHasSources,
  assertClaimNoFinalJudgment,
  assertUserClaimFraming,
  CASE_SUMMARY_CLAIM_VALIDATOR_MARKER,
  validateCaseIntelligenceClaim,
  validateCaseIntelligenceClaims,
  type CaseClaimValidationResult,
} from "./case-summary-claim-validator";

export {
  attachRadarToGraph,
  caseContradictionRadarResultSchema,
  caseContradictionSignalSchema,
  CONTRADICTION_RADAR_AXES,
  CONTRADICTION_RADAR_VERSION,
  CONTRADICTION_SIGNAL_TYPES,
  CONTRADICTION_SEVERITIES,
  PHASE9E_CONTRADICTION_RADAR_MARKER,
  scanCaseContradictionRadar,
  type CaseContradictionRadarAttachment,
  type CaseContradictionRadarGongbuho,
  type CaseContradictionRadarInput,
  type CaseContradictionRadarLawyerMemo,
  type CaseContradictionRadarResult,
  type CaseContradictionSignal,
  type ContradictionRadarAxis,
  type ContradictionSeverity,
  type ContradictionSignalType,
} from "./case-contradiction-radar";

export {
  assertSignalAxesValid,
  assertSignalNoFinalJudgment,
  CASE_CONTRADICTION_VALIDATOR_MARKER,
  validateCaseContradictionRadarResult,
  validateCaseContradictionSignal,
  type CaseContradictionValidationResult,
} from "./case-contradiction-validator";

export {
  buildCaseIntelligenceGraphRuntime,
  PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME_MARKER,
  type BuildCaseIntelligenceGraphRuntimeInput,
  type CaseIntelligenceGraphRuntimeResult,
} from "./case-intelligence-graph-runtime.service";

export {
  LAWYER_JUDGMENT_BOUNDARY_LANES,
  LAWYER_JUDGMENT_BOUNDARY_LEDGER_VERSION,
  LAWYER_JUDGMENT_BOUNDARY_MOTTO,
  LAWYER_JUDGMENT_STATES,
  LAWYER_JUDGMENT_SUBJECT_KINDS,
  lawyerJudgmentBoundaryEntrySchema,
  lawyerJudgmentBoundaryLedgerSchema,
  parseLawyerJudgmentBoundaryLedger,
  PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_MARKER,
  safeParseLawyerJudgmentBoundaryLedger,
  type LawyerJudgmentBoundaryEntry,
  type LawyerJudgmentBoundaryLane,
  type LawyerJudgmentBoundaryLedger,
  type LawyerJudgmentBoundaryLedgerSummary,
  type LawyerJudgmentState,
  type LawyerJudgmentSubjectKind,
} from "./lawyer-judgment-boundary-ledger.schema";

export {
  applyLawyerJudgmentDecision,
  applyLawyerJudgmentDecisions,
  buildLawyerJudgmentBoundaryLedgerDraft,
  buildWageClaimConfirmedLedgerExample,
  PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SERVICE_MARKER,
  projectClientVisibleEntries,
  projectSubmissionReadyEntries,
  type LawyerJudgmentDecisionInput,
} from "./lawyer-judgment-boundary-ledger.service";

export {
  assertEntryBoundaryRules,
  LAWYER_JUDGMENT_BOUNDARY_VALIDATOR_MARKER,
  validateLawyerJudgmentBoundaryLedger,
  type LawyerJudgmentBoundaryValidationResult,
} from "./lawyer-judgment-boundary-validator";

export {
  AI_GOVERNANCE_CONTROL_ACTIONS,
  AI_GOVERNANCE_CONTROL_DIMENSIONS,
  AI_GOVERNANCE_CONTROL_MATRIX_VERSION,
  AI_GOVERNANCE_FEATURES,
  aiGovernanceControlMatrixSchema,
  aiGovernanceGateResultSchema,
  aiGovernanceTenantPolicySchema,
  parseAiGovernanceControlMatrix,
  PHASE10A_AI_GOVERNANCE_CONTROL_MARKER,
  type AiGovernanceControlAction,
  type AiGovernanceControlDimension,
  type AiGovernanceControlMatrix,
  type AiGovernanceFeature,
  type AiGovernanceGateResult,
  type AiGovernanceTenantPolicy,
  type AiGovernanceUiRole,
} from "./ai-governance-control.schema";

export {
  assertCaseSummaryAiGovernanceAllowsInvoke,
  canReleaseLedgerEntryToClient,
  evaluateAiGovernanceGate,
  filterIntelligenceGraphForRole,
  PHASE10A_AI_GOVERNANCE_POLICY_SERVICE_MARKER,
  resolveDefaultAiGovernanceControlMatrix,
  sessionUserToGovernanceRole,
  type EvaluateAiGovernanceGateInput,
} from "./ai-governance-policy.service";

export {
  assertClientReleaseOrdering,
  assertMatrixRoleCoverage,
  AI_GOVERNANCE_VALIDATOR_MARKER,
  validateAiGovernanceControlMatrix,
  type AiGovernanceValidationResult,
} from "./ai-governance-validator";

export {
  AI_GOVERNANCE_AUDIT_EVENT_TYPES,
  AI_GOVERNANCE_AUDIT_OUTCOMES,
  AI_GOVERNANCE_AUDIT_VERSION,
  aiGovernanceAuditRecordSchema,
  aiGovernanceFeatureUsageSchema,
  aiGovernanceMeterGateResultSchema,
  aiGovernanceUsageMeterSnapshotSchema,
  parseAiGovernanceAuditRecord,
  PHASE10B_AI_GOVERNANCE_AUDIT_MARKER,
  type AiGovernanceAuditEventType,
  type AiGovernanceAuditOutcome,
  type AiGovernanceAuditRecord,
  type AiGovernanceFeatureUsage,
  type AiGovernanceMeterGateResult,
  type AiGovernanceUsageMeterSnapshot,
} from "./ai-governance-audit.schema";

export {
  buildAiGovernanceUsageMeterSnapshot,
  evaluateAiGovernanceMeterGate,
  PHASE10B_AI_GOVERNANCE_USAGE_METER_MARKER,
  recordAiGovernanceFeatureUsage,
  resetAiGovernanceUsageMetersForTests,
  resolveMeterPeriodKey,
} from "./ai-governance-usage-meter.service";

export {
  assertCaseSummaryGovernanceAndMeterAllowsInvoke,
  buildAiGovernanceAuditRecord,
  persistAiGovernanceAuditRecord,
  persistAiGovernanceDenialAudit,
  PHASE10B_AI_GOVERNANCE_AUDIT_SERVICE_MARKER,
  recordAiGovernanceInvokeAudit,
  validateAiGovernanceAuditRecord,
  type BuildAiGovernanceAuditRecordInput,
} from "./ai-governance-audit.service";

export {
  CLIENT_SAFE_BLOCKED_CATEGORIES,
  CLIENT_SAFE_DISCLOSURE_VERSION,
  clientSafeDisclosureLayerSchema,
  clientSafeStatementSchema,
  parseClientSafeDisclosureLayer,
  PHASE10C_CLIENT_SAFE_DISCLOSURE_MARKER,
  type ClientSafeBlockedCategory,
  type ClientSafeDisclosureLayer,
  type ClientSafeReleasedJudgmentState,
  type ClientSafeStatement,
} from "./client-safe-disclosure.schema";

export {
  applyClientSafeDisclosureToSummaryResult,
  assertNoInternalIntelligenceInClientPayload,
  buildClientSafeDisclosureLayer,
  buildClientSafeSummaryContent,
  CLIENT_SAFE_EMPTY_RELEASE_NOTICE,
  isClientSafeDisclosureAudience,
  PHASE10C_CLIENT_SAFE_DISCLOSURE_SERVICE_MARKER,
  projectClientSafeStatements,
  type ClientSafeDisclosureSummaryPayload,
} from "./client-safe-disclosure.service";

export {
  assertLedgerEntryNotInClientBundle,
  assertStatementClientSafe,
  CLIENT_SAFE_DISCLOSURE_VALIDATOR_MARKER,
  validateClientSafeDisclosureLayer,
  type ClientSafeDisclosureValidationResult,
} from "./client-safe-disclosure-validator";

export {
  CASE_SUMMARY_RC_BASELINE_MIGRATION_DIRS,
  CASE_SUMMARY_RC_DESIGN_EVIDENCE_TAG,
  CASE_SUMMARY_RC_LOCK_MARKER_PHASE9C,
  CASE_SUMMARY_RC_PHASE_VERIFY_SCRIPTS,
  CASE_SUMMARY_RC_PREDEPLOY_EVIDENCE_TAG,
  CASE_SUMMARY_RC_PROVIDER_ENV_KEYS,
  CASE_SUMMARY_RC_VITEST_TARGETS,
} from "./case-summary-rc-lock";

export {
  AI_CORE_RC_AI_GOVERNANCE_TIER3_VERIFY_SCRIPTS,
  AI_CORE_RC_BASELINE_MIGRATION_DIRS,
  AI_CORE_RC_CASE_SUMMARY_TIER2_VERIFY_SCRIPTS,
  AI_CORE_RC_CLIENT_DISCLOSURE_TIER4_VERIFY_SCRIPTS,
  AI_CORE_RC_INCLUDES_AI_GOVERNANCE_PHASE10D,
  AI_CORE_RC_INCLUDES_CASE_SUMMARY_PHASE9C,
  AI_CORE_RC_INCLUDES_CLIENT_DISCLOSURE_PHASE11D,
  AI_CORE_RC_INCLUDES_FULL_MASTER_PHASE12A,
  AI_CORE_RC_LOCK_MARKER_PHASE8E,
  AI_CORE_RC_PHASE_VERIFY_SCRIPTS,
  AI_CORE_RC_PREDEPLOY_EVIDENCE_TAG,
  AI_CORE_RC_PROVIDER_ENV_KEYS,
} from "./ai-rc-lock";

export {
  AI_GOVERNANCE_RC_BASELINE_MIGRATION_DIRS,
  AI_GOVERNANCE_RC_ENV_KEYS,
  AI_GOVERNANCE_RC_LOCK_MARKER_PHASE10D,
  AI_GOVERNANCE_RC_PHASE_VERIFY_SCRIPTS,
  AI_GOVERNANCE_RC_PREDEPLOY_EVIDENCE_TAG,
  AI_GOVERNANCE_RC_VITEST_TARGETS,
} from "./ai-governance-rc-lock";

export {
  FULL_AI_CORE_RC_BASELINE_MIGRATION_DIRS,
  FULL_AI_CORE_RC_ENV_KEYS,
  FULL_AI_CORE_RC_LOCK_MARKER_PHASE12A,
  FULL_AI_CORE_RC_MASTER_VERIFY_SCRIPT,
  FULL_AI_CORE_RC_PREDEPLOY_EVIDENCE_TAG,
  FULL_AI_CORE_RC_STANDALONE_VERIFY_SCRIPT,
  FULL_AI_CORE_RC_TIER_EVIDENCE_TAGS,
} from "./full-ai-core-rc-lock";

export {
  CLIENT_DISCLOSURE_RC_BASELINE_MIGRATION_DIRS,
  CLIENT_DISCLOSURE_RC_LOCK_MARKER_PHASE11D,
  CLIENT_DISCLOSURE_RC_PHASE_VERIFY_SCRIPTS,
  CLIENT_DISCLOSURE_RC_PREDEPLOY_EVIDENCE_TAG,
  CLIENT_DISCLOSURE_RC_VITEST_TARGETS,
} from "./client-disclosure-rc-lock";

export {
  caseIntelligenceJudgmentBodySchema,
  type CaseIntelligenceJudgmentBody,
} from "./case-intelligence-review.api.validators";

export {
  applyCaseIntelligenceJudgment,
  extractSavedDecisions,
  getCaseIntelligenceReviewSnapshot,
  mergeSavedDecisionsIntoLedger,
  PHASE11A_LAWYER_REVIEW_CONSOLE_SERVICE_MARKER,
  refreshCaseIntelligenceReviewSnapshot,
  type CaseIntelligenceReviewSnapshot,
} from "./case-intelligence-review.service";

export {
  LAWYER_REVIEW_CONSOLE_API_ROUTES,
  LAWYER_REVIEW_CONSOLE_EVIDENCE_TAG,
  LAWYER_REVIEW_CONSOLE_LOCK_MARKER_PHASE11A,
  LAWYER_REVIEW_CONSOLE_PAGE_PATH,
  LAWYER_REVIEW_CONSOLE_VITEST_TARGETS,
} from "./lawyer-review-console-lock";

export {
  clientDisclosureReleaseBodySchema,
  type ClientDisclosureReleaseBody,
} from "./client-disclosure-preview.api.validators";

export {
  buildPreviewFromLedger,
  computeClientDisclosurePreviewDiff,
  getClientDisclosurePreview,
  PHASE11B_CLIENT_DISCLOSURE_PREVIEW_SERVICE_MARKER,
  recordClientDisclosureRelease,
} from "./client-disclosure-preview.service";

export {
  CLIENT_DISCLOSURE_PREVIEW_VERSION,
  PHASE11B_CLIENT_DISCLOSURE_PREVIEW_MARKER,
  type ClientDisclosurePreviewDiff,
  type ClientDisclosurePreviewResult,
  type ClientDisclosureReleaseRecord,
} from "./client-disclosure-preview.schema";

export {
  buildClientDisclosureDeliveryPayloadFromRelease,
  getClientDisclosureDelivery,
  loadLatestClientDisclosureReleaseRecord,
  mapClientDisclosureDeliveryToSummaryShape,
  PHASE11C_CLIENT_DISCLOSURE_DELIVERY_SERVICE_MARKER,
} from "./client-disclosure-delivery.service";

export {
  CLIENT_DISCLOSURE_DELIVERY_EMPTY_NOTICE,
  CLIENT_DISCLOSURE_DELIVERY_VERSION,
  PHASE11C_CLIENT_DISCLOSURE_DELIVERY_MARKER,
  type ClientDisclosureDeliveryPayload,
  type ClientDisclosureDeliveryResult,
} from "./client-disclosure-delivery.schema";

export {
  CLIENT_DISCLOSURE_DELIVERY_API_ROUTES,
  CLIENT_DISCLOSURE_DELIVERY_EVIDENCE_TAG,
  CLIENT_DISCLOSURE_DELIVERY_LOCK_MARKER_PHASE11C,
  CLIENT_DISCLOSURE_DELIVERY_VITEST_TARGETS,
} from "./client-disclosure-delivery-lock";

export {
  PHASE8B_AI_CORE_RUNTIME_MARKER,
  PHASE8C_AI_CORE_RUNTIME_MARKER,
  invokeDocumentParagraphGenerate,
  invokeDocumentParagraphRegenerate,
  invokeDraftParagraphRegenerateBatch,
  type AiCoreAuditContext,
  type InvokeDocumentParagraphGenerateInput,
  type InvokeDocumentParagraphGenerateResult,
  type InvokeDocumentParagraphRegenerateInput,
  type InvokeDocumentParagraphRegenerateResult,
  type InvokeDraftParagraphRegenerateBatchInput,
} from "./ai-core-runtime.service";
