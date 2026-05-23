/**
 * Phase 11-C — Client Disclosure Delivery / Client Portal Binding service.
 * Release된 CaseClientDisclosureRelease만 의뢰인 포털에 노출한다.
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md
 */
import type { Prisma } from "@prisma/client";

import { getCaseAccessContext } from "@/features/cases/case.permissions";
import type { CaseStatus } from "@/lib/definitions/case-status";
import type { SessionUser } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import { sessionUserToGovernanceRole } from "./ai-governance-policy.service";
import {
  buildClientSafeSummaryContent,
  CLIENT_SAFE_EMPTY_RELEASE_NOTICE,
} from "./client-safe-disclosure.service";
import {
  CLIENT_SAFE_BLOCKED_CATEGORIES,
  CLIENT_SAFE_DISCLOSURE_VERSION,
  type ClientSafeStatement,
} from "./client-safe-disclosure.schema";
import { CASE_SUMMARY_DISCLAIMER } from "./case-summary-output-validator";
import {
  CLIENT_DISCLOSURE_DELIVERY_EMPTY_NOTICE,
  CLIENT_DISCLOSURE_DELIVERY_VERSION,
  clientDisclosureDeliveryPayloadSchema,
  type ClientDisclosureDeliveryPayload,
  type ClientDisclosureDeliveryResult,
} from "./client-disclosure-delivery.schema";
import {
  CLIENT_DISCLOSURE_PREVIEW_VERSION,
  clientDisclosureReleaseRecordSchema,
  type ClientDisclosureReleaseRecord,
} from "./client-disclosure-preview.schema";

export const PHASE11C_CLIENT_DISCLOSURE_DELIVERY_SERVICE_MARKER =
  "PHASE11C_CLIENT_DISCLOSURE_DELIVERY_SERVICE" as const;

function canAccessClientPortalDelivery(
  user: SessionUser,
  access: Awaited<ReturnType<typeof getCaseAccessContext>>,
): boolean {
  return access.isOwner && sessionUserToGovernanceRole(user) === "CLIENT";
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

export async function loadLatestClientDisclosureReleaseRecord(
  caseId: string,
): Promise<ClientDisclosureReleaseRecord | null> {
  const row = await prisma.caseClientDisclosureRelease.findFirst({
    where: { caseId },
    orderBy: { releasedAt: "desc" },
  });
  if (!row) {
    return null;
  }
  return rowToReleaseRecord(row);
}

export function buildClientDisclosureDeliveryPayloadFromRelease(input: {
  release: ClientDisclosureReleaseRecord;
  caseStatus: CaseStatus;
}): ClientDisclosureDeliveryPayload {
  const statements = input.release.statements;
  const safeContent = buildClientSafeSummaryContent(statements);
  const generatedAt = input.release.releasedAt;

  const clientSafeDisclosure = {
    disclosureVersion: CLIENT_SAFE_DISCLOSURE_VERSION,
    caseId: input.release.caseId,
    caseStatus: input.caseStatus,
    generatedAt,
    releaseGatePassed: statements.length > 0,
    statements,
    blockedCategories: [...CLIENT_SAFE_BLOCKED_CATEGORIES],
    disclaimer: CASE_SUMMARY_DISCLAIMER,
    emptyReleaseNotice: statements.length === 0 ? CLIENT_SAFE_EMPTY_RELEASE_NOTICE : undefined,
  };

  return clientDisclosureDeliveryPayloadSchema.parse({
    generatedAt,
    caseStatus: input.caseStatus,
    releaseId: input.release.releaseId,
    releasedAt: input.release.releasedAt,
    content: {
      ...safeContent,
      disclaimer: CASE_SUMMARY_DISCLAIMER,
      structuredSummaryNote:
        statements.length === 0 ? CLIENT_DISCLOSURE_DELIVERY_EMPTY_NOTICE : undefined,
    },
    clientSafeDisclosure,
  });
}

export async function getClientDisclosureDelivery(
  user: SessionUser,
  caseId: string,
): Promise<ClientDisclosureDeliveryResult> {
  const access = await getCaseAccessContext(user, caseId);
  if (!canAccessClientPortalDelivery(user, access)) {
    throw new ForbiddenError("의뢰인 공개 delivery는 사건 의뢰인(CLIENT)만 조회할 수 있습니다.");
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: { status: true },
  });
  if (!caseRecord) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const caseStatus = caseRecord.status as CaseStatus;
  const release = await loadLatestClientDisclosureReleaseRecord(caseId);

  if (!release) {
    return {
      deliveryVersion: CLIENT_DISCLOSURE_DELIVERY_VERSION,
      caseId,
      caseStatus,
      hasReleasedContent: false,
      release: null,
      delivery: null,
      emptyNotice: CLIENT_DISCLOSURE_DELIVERY_EMPTY_NOTICE,
    };
  }

  const delivery = buildClientDisclosureDeliveryPayloadFromRelease({ release, caseStatus });

  return {
    deliveryVersion: CLIENT_DISCLOSURE_DELIVERY_VERSION,
    caseId,
    caseStatus,
    hasReleasedContent: release.statements.length > 0,
    release: {
      releaseId: release.releaseId,
      releasedAt: release.releasedAt,
      previewVersion: CLIENT_DISCLOSURE_PREVIEW_VERSION,
      disclosureVersion: CLIENT_SAFE_DISCLOSURE_VERSION,
      statementCount: release.statements.length,
    },
    delivery,
    emptyNotice: CLIENT_DISCLOSURE_DELIVERY_EMPTY_NOTICE,
  };
}

/** summary/generate CLIENT branch — release binding only, no intelligenceGraph */
export function mapClientDisclosureDeliveryToSummaryShape(
  delivery: ClientDisclosureDeliveryResult,
): {
  generatedAt: string;
  outputContractApplied: false;
  gongbuhoResolution: undefined;
  intelligenceGraph: undefined;
  content: ClientDisclosureDeliveryPayload["content"];
  disclaimerApplied: true;
  caseStatus: string;
  clientSafeDisclosure: ClientDisclosureDeliveryPayload["clientSafeDisclosure"];
  clientDisclosureDelivery: {
    deliveryVersion: typeof CLIENT_DISCLOSURE_DELIVERY_VERSION;
    releaseId?: string;
    releasedAt?: string;
  };
} {
  if (!delivery.delivery) {
    return {
      generatedAt: new Date().toISOString(),
      outputContractApplied: false,
      gongbuhoResolution: undefined,
      intelligenceGraph: undefined,
      content: {
        caseOverview: "",
        timeline: [],
        issues: [],
        riskNotes: [],
        checklist: [],
        disclaimer: CASE_SUMMARY_DISCLAIMER,
        structuredSummaryNote: delivery.emptyNotice,
      },
      disclaimerApplied: true,
      caseStatus: delivery.caseStatus,
      clientSafeDisclosure: {
        disclosureVersion: CLIENT_SAFE_DISCLOSURE_VERSION,
        caseId: delivery.caseId,
        caseStatus: delivery.caseStatus,
        generatedAt: new Date().toISOString(),
        releaseGatePassed: false,
        statements: [],
        blockedCategories: [...CLIENT_SAFE_BLOCKED_CATEGORIES],
        disclaimer: CASE_SUMMARY_DISCLAIMER,
        emptyReleaseNotice: delivery.emptyNotice,
      },
      clientDisclosureDelivery: {
        deliveryVersion: CLIENT_DISCLOSURE_DELIVERY_VERSION,
      },
    };
  }

  return {
    generatedAt: delivery.delivery.generatedAt,
    outputContractApplied: false,
    gongbuhoResolution: undefined,
    intelligenceGraph: undefined,
    content: delivery.delivery.content,
    disclaimerApplied: true,
    caseStatus: delivery.caseStatus,
    clientSafeDisclosure: delivery.delivery.clientSafeDisclosure,
    clientDisclosureDelivery: {
      deliveryVersion: CLIENT_DISCLOSURE_DELIVERY_VERSION,
      releaseId: delivery.delivery.releaseId,
      releasedAt: delivery.delivery.releasedAt,
    },
  };
}

/** Vitest — release-only statements, never live ledger */
export function assertClientDeliveryUsesReleasedStatementsOnly(input: {
  statements: ClientSafeStatement[];
  delivery: ClientDisclosureDeliveryPayload;
}): boolean {
  if (input.delivery.clientSafeDisclosure.statements.length !== input.statements.length) {
    return false;
  }
  return input.delivery.clientSafeDisclosure.statements.every(
    (s, i) => s.statementId === input.statements[i]?.statementId,
  );
}
