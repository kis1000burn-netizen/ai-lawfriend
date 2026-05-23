/**
 * Phase 10-C — Client-Safe Disclosure Layer service.
 * @see docs/ai/AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md
 */
import type { CaseStatus } from "@/lib/definitions/case-status";
import type { SessionUser } from "@/lib/auth/session";

import {
  canReleaseLedgerEntryToClient,
  sessionUserToGovernanceRole,
} from "./ai-governance-policy.service";
import type { CaseIntelligenceGraphRuntimeResult } from "./case-intelligence-graph-runtime.service";
import type { LawyerJudgmentBoundaryEntry, LawyerJudgmentBoundaryLedger } from "./lawyer-judgment-boundary-ledger.schema";
import {
  CASE_SUMMARY_DISCLAIMER,
} from "./case-summary-output-validator";
import type { CaseSummaryValidatedContent } from "./case-summary-output-validator";
import {
  CLIENT_SAFE_BLOCKED_CATEGORIES,
  CLIENT_SAFE_DISCLOSURE_VERSION,
  type ClientSafeDisclosureLayer,
  type ClientSafeStatement,
  clientSafeDisclosureLayerSchema,
} from "./client-safe-disclosure.schema";

export const PHASE10C_CLIENT_SAFE_DISCLOSURE_SERVICE_MARKER =
  "PHASE10C_CLIENT_SAFE_DISCLOSURE_SERVICE" as const;

export const CLIENT_SAFE_EMPTY_RELEASE_NOTICE =
  "변호사 검토·공개 승인된 내용만 의뢰인에게 표시됩니다. 현재 공개 가능한 항목이 없습니다." as const;

function isInternalLawyerMemoEntry(entry: LawyerJudgmentBoundaryEntry): boolean {
  return (
    entry.entryId.includes("lawyer-memo") ||
    entry.subjectId.includes("LawyerMemo") ||
    /LawyerMemo\./.test(entry.aiDetectedText)
  );
}

function isNeverClientDisclosableEntry(entry: LawyerJudgmentBoundaryEntry): boolean {
  if (entry.subjectKind === "RADAR_SIGNAL" || entry.subjectKind === "CONTRADICTION_EDGE") {
    return true;
  }
  if (entry.judgmentState === "PENDING" || entry.judgmentState === "REJECTED") {
    return true;
  }
  if (isInternalLawyerMemoEntry(entry)) {
    return true;
  }
  if (!entry.clientVisible || !entry.boundaryLanes.includes("CLIENT_VISIBLE")) {
    return true;
  }
  return false;
}

function resolveClientSafeText(entry: LawyerJudgmentBoundaryEntry): string | null {
  if (entry.judgmentState === "EDITED" && entry.lawyerEditedText?.trim()) {
    return entry.lawyerEditedText.trim();
  }
  if (entry.judgmentState === "CONFIRMED") {
    return entry.aiDetectedText.trim();
  }
  return null;
}

export function projectClientSafeStatements(input: {
  ledger?: LawyerJudgmentBoundaryLedger;
  caseStatus: CaseStatus;
}): ClientSafeStatement[] {
  if (!input.ledger) {
    return [];
  }

  const statements: ClientSafeStatement[] = [];

  for (const entry of input.ledger.entries) {
    if (isNeverClientDisclosableEntry(entry)) {
      continue;
    }

    const release = canReleaseLedgerEntryToClient({
      entry,
      caseStatus: input.caseStatus,
      actorRole: "CLIENT",
    });
    if (!release.allowed) {
      continue;
    }

    const text = resolveClientSafeText(entry);
    if (!text) {
      continue;
    }

    statements.push({
      statementId: `client-safe-${entry.entryId}`,
      text,
      sourceEntryId: entry.entryId,
      judgmentState: entry.judgmentState as "CONFIRMED" | "EDITED",
      clientVisibleLane: true,
      releaseGatePassed: true,
      releasedAt: entry.judgedAt ?? entry.aiDetectedAt,
    });
  }

  return statements;
}

export function buildClientSafeSummaryContent(
  statements: ClientSafeStatement[],
): CaseSummaryValidatedContent {
  const texts = statements.map((s) => s.text);
  return {
    caseOverview: texts[0] ?? "",
    timeline: texts.slice(1),
    issues: [],
    riskNotes: [],
    checklist: [],
  };
}

export function buildClientSafeDisclosureLayer(input: {
  caseId: string;
  caseStatus: CaseStatus;
  generatedAt: string;
  ledger?: LawyerJudgmentBoundaryLedger;
}): ClientSafeDisclosureLayer {
  const statements = projectClientSafeStatements({
    ledger: input.ledger,
    caseStatus: input.caseStatus,
  });

  return clientSafeDisclosureLayerSchema.parse({
    disclosureVersion: CLIENT_SAFE_DISCLOSURE_VERSION,
    caseId: input.caseId,
    caseStatus: input.caseStatus,
    generatedAt: input.generatedAt,
    releaseGatePassed: statements.length > 0,
    statements,
    blockedCategories: [...CLIENT_SAFE_BLOCKED_CATEGORIES],
    disclaimer: CASE_SUMMARY_DISCLAIMER,
    emptyReleaseNotice:
      statements.length === 0 ? CLIENT_SAFE_EMPTY_RELEASE_NOTICE : undefined,
  });
}

export function isClientSafeDisclosureAudience(currentUser: SessionUser): boolean {
  return sessionUserToGovernanceRole(currentUser) === "CLIENT";
}

export type ClientSafeDisclosureSummaryPayload = {
  generatedAt: string;
  outputContractApplied?: boolean;
  gongbuhoResolution?: {
    via: string;
    traceId?: string;
    gongbuhoPacketId?: string;
    code?: string;
    version?: string;
  };
  content: CaseSummaryValidatedContent & {
    disclaimer: string;
    structuredSummaryNote?: string;
    contractSections?: { heading: string; body: string }[];
  };
  disclaimerApplied: boolean;
  caseStatus: string;
  intelligenceGraph?: CaseIntelligenceGraphRuntimeResult;
  clientSafeDisclosure?: ClientSafeDisclosureLayer;
};

export function applyClientSafeDisclosureToSummaryResult(input: {
  result: ClientSafeDisclosureSummaryPayload;
  currentUser: SessionUser;
  caseId: string;
  caseStatus: CaseStatus;
}): ClientSafeDisclosureSummaryPayload {
  if (!isClientSafeDisclosureAudience(input.currentUser)) {
    return input.result;
  }

  const clientSafeDisclosure = buildClientSafeDisclosureLayer({
    caseId: input.caseId,
    caseStatus: input.caseStatus,
    generatedAt: input.result.generatedAt,
    ledger: input.result.intelligenceGraph?.ledger,
  });

  const safeContent = buildClientSafeSummaryContent(clientSafeDisclosure.statements);

  return {
    ...input.result,
    intelligenceGraph: undefined,
    gongbuhoResolution: undefined,
    outputContractApplied: false,
    content: {
      ...safeContent,
      disclaimer: clientSafeDisclosure.disclaimer,
      structuredSummaryNote: clientSafeDisclosure.emptyReleaseNotice,
      contractSections: undefined,
    },
    clientSafeDisclosure,
  };
}

/** Vitest — intelligence graph shape guard */
export function assertNoInternalIntelligenceInClientPayload(input: {
  intelligenceGraph?: CaseIntelligenceGraphRuntimeResult;
  clientSafeDisclosure?: ClientSafeDisclosureLayer;
}): boolean {
  if (input.intelligenceGraph) {
    return false;
  }
  if (!input.clientSafeDisclosure) {
    return true;
  }
  return input.clientSafeDisclosure.blockedCategories.length > 0;
}
