/**
 * Phase 11-B — Client Disclosure Preview & Release Control service.
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md
 */
import type { Prisma } from "@prisma/client";

import { getCaseAccessContext } from "@/features/cases/case.permissions";
import type { CaseStatus } from "@/lib/definitions/case-status";
import type { SessionUser } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import {
  buildClientSafeDisclosureLayer,
  projectClientSafeStatements,
  CLIENT_SAFE_EMPTY_RELEASE_NOTICE,
} from "./client-safe-disclosure.service";
import type { ClientSafeStatement } from "./client-safe-disclosure.schema";
import { CLIENT_SAFE_DISCLOSURE_VERSION } from "./client-safe-disclosure.schema";
import { CASE_SUMMARY_DISCLAIMER } from "./case-summary-output-validator";
import { parseLawyerJudgmentBoundaryLedger } from "./lawyer-judgment-boundary-ledger.schema";
import type { LawyerJudgmentBoundaryEntry } from "./lawyer-judgment-boundary-ledger.schema";
import {
  CLIENT_DISCLOSURE_PREVIEW_VERSION,
  clientDisclosurePreviewDiffSchema,
  clientDisclosureReleaseRecordSchema,
  type ClientDisclosurePreviewDiff,
  type ClientDisclosurePreviewResult,
  type ClientDisclosureReleaseRecord,
} from "./client-disclosure-preview.schema";
import type { ClientDisclosureReleaseBody } from "./client-disclosure-preview.api.validators";

export const PHASE11B_CLIENT_DISCLOSURE_PREVIEW_SERVICE_MARKER =
  "PHASE11B_CLIENT_DISCLOSURE_PREVIEW_SERVICE" as const;

function canViewClientDisclosurePreview(
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
): boolean {
  return access.isAdmin || access.isAssignedLawyer || access.isAssignedStaff;
}

function canRecordClientDisclosureRelease(
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
): boolean {
  return access.isAdmin || access.isAssignedLawyer;
}

function isEligibleLedgerEntry(entry: LawyerJudgmentBoundaryEntry): boolean {
  if (entry.subjectKind !== "CLAIM") {
    return false;
  }
  if (entry.judgmentState !== "CONFIRMED" && entry.judgmentState !== "EDITED") {
    return false;
  }
  return entry.clientVisible && entry.boundaryLanes.includes("CLIENT_VISIBLE");
}

function summarizeEligibility(ledger: ReturnType<typeof parseLawyerJudgmentBoundaryLedger>) {
  let blockedEntryCount = 0;
  let pendingClientVisibleCount = 0;

  for (const entry of ledger.entries) {
    if (entry.clientVisible && entry.judgmentState === "PENDING") {
      pendingClientVisibleCount += 1;
    }
    if (!isEligibleLedgerEntry(entry)) {
      blockedEntryCount += 1;
    }
  }

  return { blockedEntryCount, pendingClientVisibleCount };
}

export function computeClientDisclosurePreviewDiff(
  current: ClientSafeStatement[],
  previous: ClientSafeStatement[] | null | undefined,
): ClientDisclosurePreviewDiff {
  const prev = previous ?? [];
  const prevBySource = new Map(prev.map((s) => [s.sourceEntryId, s]));
  const currBySource = new Map(current.map((s) => [s.sourceEntryId, s]));

  const added: ClientSafeStatement[] = [];
  const removed: ClientDisclosurePreviewDiff["removed"] = [];
  const changed: ClientDisclosurePreviewDiff["changed"] = [];

  for (const statement of current) {
    const before = prevBySource.get(statement.sourceEntryId);
    if (!before) {
      added.push(statement);
      continue;
    }
    if (before.text !== statement.text) {
      changed.push({
        sourceEntryId: statement.sourceEntryId,
        beforeText: before.text,
        afterText: statement.text,
      });
    }
  }

  for (const statement of prev) {
    if (!currBySource.has(statement.sourceEntryId)) {
      removed.push({
        statementId: statement.statementId,
        sourceEntryId: statement.sourceEntryId,
        text: statement.text,
      });
    }
  }

  const hasUnreleasedChanges =
    added.length > 0 || removed.length > 0 || changed.length > 0;

  return clientDisclosurePreviewDiffSchema.parse({
    added,
    removed,
    changed,
    hasUnreleasedChanges: prev.length === 0 ? current.length > 0 : hasUnreleasedChanges,
  });
}

function rowToReleaseRecord(row: {
  id: string;
  caseId: string;
  snapshotId: string | null;
  caseStatus: string;
  previewVersion: string;
  disclosureVersion: string;
  statementsJson: Prisma.JsonValue;
  diffJson: Prisma.JsonValue;
  releaseNotes: string | null;
  releasedByUserId: string;
  releasedAt: Date;
}): ClientDisclosureReleaseRecord {
  return clientDisclosureReleaseRecordSchema.parse({
    releaseId: row.id,
    caseId: row.caseId,
    snapshotId: row.snapshotId ?? undefined,
    caseStatus: row.caseStatus,
    previewVersion: CLIENT_DISCLOSURE_PREVIEW_VERSION,
    disclosureVersion: CLIENT_SAFE_DISCLOSURE_VERSION,
    statements: row.statementsJson,
    diff: row.diffJson,
    releaseNotes: row.releaseNotes ?? undefined,
    releasedByUserId: row.releasedByUserId,
    releasedAt: row.releasedAt.toISOString(),
  });
}

async function loadReleaseHistory(caseId: string, limit = 10): Promise<ClientDisclosureReleaseRecord[]> {
  const rows = await prisma.caseClientDisclosureRelease.findMany({
    where: { caseId },
    orderBy: { releasedAt: "desc" },
    take: limit,
  });
  return rows.map(rowToReleaseRecord);
}

async function loadLatestSnapshot(caseId: string) {
  return prisma.caseIntelligenceSnapshot.findFirst({
    where: { caseId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientDisclosurePreview(
  user: SessionUser,
  caseId: string,
): Promise<ClientDisclosurePreviewResult> {
  const access = await getCaseAccessContext(user, caseId);
  if (!canViewClientDisclosurePreview(access)) {
    throw new ForbiddenError("의뢰인 공개 미리보기를 볼 권한이 없습니다.");
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: { status: true },
  });
  if (!caseRecord) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const caseStatus = caseRecord.status as CaseStatus;
  const snapshot = await loadLatestSnapshot(caseId);
  const releaseHistory = await loadReleaseHistory(caseId);
  const lastRelease = releaseHistory[0] ?? null;

  if (!snapshot) {
    return {
      previewVersion: CLIENT_DISCLOSURE_PREVIEW_VERSION,
      caseId,
      caseStatus,
      clientPreview: {
        disclosureVersion: CLIENT_SAFE_DISCLOSURE_VERSION,
        statements: [],
        disclaimer: CASE_SUMMARY_DISCLAIMER,
        emptyReleaseNotice: CLIENT_SAFE_EMPTY_RELEASE_NOTICE,
        releaseGatePassed: false,
      },
      eligibilitySummary: {
        eligibleStatementCount: 0,
        blockedEntryCount: 0,
        pendingClientVisibleCount: 0,
      },
      diff: computeClientDisclosurePreviewDiff([], lastRelease?.statements),
      lastRelease,
      releaseHistory,
      readOnly: !canRecordClientDisclosureRelease(access),
    };
  }

  const ledger = parseLawyerJudgmentBoundaryLedger(snapshot.ledgerJson);
  const generatedAt = snapshot.generatedAt.toISOString();
  const layer = buildClientSafeDisclosureLayer({
    caseId,
    caseStatus,
    generatedAt,
    ledger,
  });
  const eligibility = summarizeEligibility(ledger);
  const diff = computeClientDisclosurePreviewDiff(
    layer.statements,
    lastRelease?.statements,
  );

  return {
    previewVersion: CLIENT_DISCLOSURE_PREVIEW_VERSION,
    caseId,
    caseStatus,
    snapshotId: snapshot.id,
    generatedAt,
    clientPreview: {
      disclosureVersion: layer.disclosureVersion,
      statements: layer.statements,
      disclaimer: layer.disclaimer,
      emptyReleaseNotice: layer.emptyReleaseNotice,
      releaseGatePassed: layer.releaseGatePassed,
    },
    eligibilitySummary: {
      eligibleStatementCount: layer.statements.length,
      blockedEntryCount: eligibility.blockedEntryCount,
      pendingClientVisibleCount: eligibility.pendingClientVisibleCount,
    },
    diff,
    lastRelease,
    releaseHistory,
    readOnly: !canRecordClientDisclosureRelease(access),
  };
}

export async function recordClientDisclosureRelease(
  user: SessionUser,
  caseId: string,
  body: ClientDisclosureReleaseBody,
): Promise<ClientDisclosurePreviewResult> {
  const access = await getCaseAccessContext(user, caseId);
  if (!canRecordClientDisclosureRelease(access)) {
    throw new ForbiddenError("의뢰인 공개 release를 기록할 권한이 없습니다.");
  }

  const preview = await getClientDisclosurePreview(user, caseId);
  if (!preview.snapshotId) {
    throw new ValidationError(
      "intelligence snapshot이 없습니다. Lawyer Review Console에서 스냅샷을 먼저 생성하세요.",
      { code: "CLIENT_DISCLOSURE_PREVIEW_NO_SNAPSHOT" },
    );
  }

  if (!preview.diff.hasUnreleasedChanges && preview.lastRelease) {
    throw new ValidationError("공개 diff가 없습니다. 변경 후 release하세요.", {
      code: "CLIENT_DISCLOSURE_PREVIEW_NO_DIFF",
    });
  }

  const row = await prisma.caseClientDisclosureRelease.create({
    data: {
      caseId,
      snapshotId: preview.snapshotId,
      caseStatus: preview.caseStatus,
      previewVersion: CLIENT_DISCLOSURE_PREVIEW_VERSION,
      disclosureVersion: CLIENT_SAFE_DISCLOSURE_VERSION,
      statementsJson: preview.clientPreview.statements as Prisma.InputJsonValue,
      diffJson: preview.diff as Prisma.InputJsonValue,
      releaseNotes: body.releaseNotes?.trim() || null,
      releasedByUserId: user.id,
    },
  });

  void row;

  return getClientDisclosurePreview(user, caseId);
}

/** Vitest helper — project statements without DB */
export function buildPreviewFromLedger(input: {
  caseId: string;
  caseStatus: CaseStatus;
  generatedAt: string;
  ledger: ReturnType<typeof parseLawyerJudgmentBoundaryLedger>;
  previousStatements?: ClientSafeStatement[];
}): Pick<
  ClientDisclosurePreviewResult,
  "clientPreview" | "eligibilitySummary" | "diff"
> {
  const layer = buildClientSafeDisclosureLayer({
    caseId: input.caseId,
    caseStatus: input.caseStatus,
    generatedAt: input.generatedAt,
    ledger: input.ledger,
  });
  const eligibility = summarizeEligibility(input.ledger);

  return {
    clientPreview: {
      disclosureVersion: layer.disclosureVersion,
      statements: layer.statements,
      disclaimer: layer.disclaimer,
      emptyReleaseNotice: layer.emptyReleaseNotice,
      releaseGatePassed: layer.releaseGatePassed,
    },
    eligibilitySummary: {
      eligibleStatementCount: layer.statements.length,
      blockedEntryCount: eligibility.blockedEntryCount,
      pendingClientVisibleCount: eligibility.pendingClientVisibleCount,
    },
    diff: computeClientDisclosurePreviewDiff(
      layer.statements,
      input.previousStatements,
    ),
  };
}

export { projectClientSafeStatements };
