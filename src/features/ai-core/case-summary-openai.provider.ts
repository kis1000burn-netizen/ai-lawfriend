/**
 * Phase 9-B — Case Summary OpenAI provider (document provider와 분리).
 */
import { z } from "zod";
import {
  buildCaseSummaryGenerateInput,
  buildCaseSummaryGenerateInstructions,
} from "./case-summary-prompt-builders";
import type { CaseSummaryAiMode } from "./case-summary-ai-core-policy";
import { getCaseSummaryModel, getOpenAIClient } from "./ai-provider-ssot";
import type { CaseSummaryValidatedContent } from "./case-summary-output-validator";

export const CASE_SUMMARY_OPENAI_PROVIDER_MARKER =
  "PHASE9B_CASE_SUMMARY_OPENAI_PROVIDER" as const;

const llmSummarySchema = z.object({
  caseOverview: z.string(),
  timeline: z.array(z.string()),
  issues: z.array(z.string()),
  riskNotes: z.array(z.string()),
  checklist: z.array(z.string()),
  contractSections: z
    .array(
      z.object({
        heading: z.string(),
        body: z.string(),
      }),
    )
    .optional(),
});

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Case summary LLM response is not JSON");
  }
  return JSON.parse(match[0]);
}

export async function invokeOpenAiCaseSummaryGenerate(params: {
  prompt: string;
  mode: Extract<CaseSummaryAiMode, "AI_ENRICH" | "AI_REGENERATE">;
}): Promise<{ model: string; content: CaseSummaryValidatedContent }> {
  const client = getOpenAIClient();
  const model = getCaseSummaryModel();

  const response = await client.responses.create({
    model,
    instructions: buildCaseSummaryGenerateInstructions(params.mode),
    input: buildCaseSummaryGenerateInput(params.prompt),
  });

  const text = (response.output_text ?? "").trim();
  if (!text) {
    throw new Error("Case summary AI result is empty");
  }

  const parsed = llmSummarySchema.parse(extractJsonObject(text));
  return { model, content: parsed };
}
