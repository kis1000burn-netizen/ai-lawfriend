/**
 * Product Phase 41-A — CriminalJudgmentSentencingCorpusRegistry SSOT.
 */
import type { CriminalJudgmentSentencingCorpusRegistryResult } from "./criminal-judgment-sentencing-corpus-registry.schema";

export const CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_REGISTRY_MARKER_41A =
  "phase41a-criminal-judgment-sentencing-corpus-registry-registry" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "sentencing-outcome-assessment-001" as const;

type CriminalJudgmentSentencingCorpusRegistryItem = Omit<CriminalJudgmentSentencingCorpusRegistryResult["items"][number], "defined">;

export const CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_ITEMS: CriminalJudgmentSentencingCorpusRegistryItem[] = [
  { itemId: "CRIMINAL_JUDGMENT_SOURCE", label: "Criminal judgment source registry", required: true },
  { itemId: "SENTENCING_OUTCOME_INDEX", label: "Sentencing outcome index", required: true },
  { itemId: "OFFENSE_TAXONOMY", label: "Offense taxonomy mapping", required: true },
  { itemId: "SENTENCING_REASON_CORPUS", label: "Sentencing reason paragraph corpus", required: true },
  { itemId: "SOURCE_URL_AND_SCOPE", label: "Source URL and usage scope", required: true },
  { itemId: "ORIGINAL_TEXT_ACCESS", label: "Original judgment text access", required: true },
  { itemId: "CORPUS_LAWYER_REVIEW", label: "Lawyer review of sentencing corpus", required: true },
];
