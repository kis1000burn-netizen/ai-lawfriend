import type { AibeopchinCmbConfigStatus, Prisma } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/session";
import type { AibeopchinCmbCaseConfig, AibeopchinCmbStatus } from "@/cmb/core/cmb-schema";
import { listCmbCaseConfigs, getCmbCaseConfig } from "@/cmb/core/cmb-registry";
import { validateSingleCmbConfig } from "@/cmb/core/cmb-validator";
import { parseCmbCaseConfigJson, serializeCmbCaseConfig } from "@/cmb/publish/cmb-config-json";
import {
  assertCmbPublishTransitionAllowed,
  assertNoCmbGateWeakening,
  getAllowedCmbPublishTransitions,
  requiresCmbChangeReasonForTransition,
  requiresCmbVerifyPassForTransition,
} from "@/cmb/publish/cmb-publish-lock-gates";
import {
  CMB_AUDIT_ACTIONS,
  CMB_PHASE6F_EVIDENCE_TAG,
} from "@/cmb/publish/cmb-publish-lock-marker";
import { writeAuditLog } from "@/lib/audit-log";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

function toTsStatus(status: AibeopchinCmbConfigStatus): AibeopchinCmbStatus {
  return status as AibeopchinCmbStatus;
}

function mapRevision(row: {
  id: string;
  caseType: string;
  configId: string;
  version: string;
  status: AibeopchinCmbConfigStatus;
  evidenceTag: string;
  changeReason: string | null;
  verifyPassedAt: Date | null;
  lockedAt: Date | null;
  publishedAt: Date | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    caseType: row.caseType,
    configId: row.configId,
    version: row.version,
    status: toTsStatus(row.status),
    evidenceTag: row.evidenceTag,
    changeReason: row.changeReason,
    verifyPassedAt: row.verifyPassedAt?.toISOString() ?? null,
    lockedAt: row.lockedAt?.toISOString() ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function syncBaselineCmbRevisionsFromRegistry(actorUserId: string) {
  const configs = listCmbCaseConfigs();
  const results: { caseType: string; version: string; created: boolean }[] = [];

  for (const config of configs) {
    const existing = await prisma.aibeopchinCmbConfigRevision.findUnique({
      where: {
        caseType_version: { caseType: config.caseType, version: config.version },
      },
    });

    if (existing) {
      results.push({ caseType: config.caseType, version: config.version, created: false });
      continue;
    }

    await prisma.aibeopchinCmbConfigRevision.create({
      data: {
        caseType: config.caseType,
        configId: config.id,
        version: config.version,
        status: "LOCKED",
        configJson: serializeCmbCaseConfig(config) as Prisma.InputJsonValue,
        evidenceTag: config.audit.evidenceTag,
        lockedAt: new Date(),
        createdByUserId: actorUserId,
      },
    });

    results.push({ caseType: config.caseType, version: config.version, created: true });
  }

  await writeAuditLog({
    actorUserId,
    action: CMB_AUDIT_ACTIONS.CMB_BASELINE_SYNCED,
    entityType: "AIBEOPCHIN_CMB",
    entityId: "baseline-sync",
    message: "CMB baseline revisions synced from TS registry",
    metadata: { results, evidenceTag: CMB_PHASE6F_EVIDENCE_TAG },
  });

  return results;
}

export async function listCmbRevisionsForCaseType(caseType: string) {
  return prisma.aibeopchinCmbConfigRevision.findMany({
    where: { caseType },
    orderBy: [{ version: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      caseType: true,
      configId: true,
      version: true,
      status: true,
      evidenceTag: true,
      changeReason: true,
      verifyPassedAt: true,
      lockedAt: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
}

export async function getPublishedCmbRevision(caseType: string) {
  return prisma.aibeopchinCmbConfigRevision.findFirst({
    where: { caseType, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedCmbCaseConfig(
  caseType: string,
): Promise<AibeopchinCmbCaseConfig | null> {
  const published = await getPublishedCmbRevision(caseType);
  if (published) {
    return parseCmbCaseConfigJson(published.configJson);
  }
  return getCmbCaseConfig(caseType);
}

export async function listCmbPublishEvents(revisionId: string, limit = 20) {
  return prisma.aibeopchinCmbPublishEvent.findMany({
    where: { revisionId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      evidenceTag: true,
      changeReason: true,
      verifyPassed: true,
      createdAt: true,
      actor: { select: { id: true, email: true, role: true } },
    },
  });
}

export type CmbPublishLockPanelModel = {
  caseType: string;
  activeRevision: ReturnType<typeof mapRevision> | null;
  publishedRevision: ReturnType<typeof mapRevision> | null;
  allowedTransitions: AibeopchinCmbStatus[];
  publishEvents: Awaited<ReturnType<typeof listCmbPublishEvents>>;
  canTransition: boolean;
};

export async function buildCmbPublishLockPanel(
  caseType: string,
  viewer: SessionUser,
): Promise<CmbPublishLockPanelModel> {
  const revisions = await listCmbRevisionsForCaseType(caseType);
  const active =
    revisions.find((r) => r.status === "PUBLISHED") ??
    revisions.find((r) => r.status === "LOCKED") ??
    revisions[0] ??
    null;

  const published = revisions.find((r) => r.status === "PUBLISHED") ?? null;

  const canTransition =
    viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN";

  const allowedTransitions = active
    ? [...getAllowedCmbPublishTransitions(toTsStatus(active.status))]
    : [];

  const publishEvents = active
    ? await listCmbPublishEvents(active.id)
    : [];

  return {
    caseType,
    activeRevision: active ? mapRevision(active) : null,
    publishedRevision: published ? mapRevision(published) : null,
    allowedTransitions,
    publishEvents,
    canTransition,
  };
}

type TransitionParams = {
  revisionId: string;
  toStatus: AibeopchinCmbStatus;
  actor: SessionUser;
  changeReason?: string;
  evidenceTag?: string;
};

export async function transitionCmbRevisionStatus(params: TransitionParams) {
  if (params.actor.role !== "ADMIN" && params.actor.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("CMB Publish/Lock 전이는 ADMIN 이상만 가능합니다.");
  }

  const revision = await prisma.aibeopchinCmbConfigRevision.findUnique({
    where: { id: params.revisionId },
  });

  if (!revision) {
    throw new NotFoundError("CMB revision을 찾을 수 없습니다.");
  }

  const fromStatus = toTsStatus(revision.status);
  const transitionError = assertCmbPublishTransitionAllowed(fromStatus, params.toStatus);
  if (transitionError) {
    throw new ValidationError(transitionError, { code: "CMB_INVALID_TRANSITION" });
  }

  const config = parseCmbCaseConfigJson(revision.configJson);
  if (!config) {
    throw new ValidationError("revision configJson 형식이 올바르지 않습니다.", {
      code: "CMB_INVALID_CONFIG_JSON",
    });
  }

  const baseline = getCmbCaseConfig(revision.caseType);
  if (baseline) {
    const weakenErrors = assertNoCmbGateWeakening(baseline, config);
    if (weakenErrors.length > 0) {
      throw new ValidationError(weakenErrors.join(" "), {
        code: "CMB_GATE_WEAKENING_BLOCKED",
        details: weakenErrors,
      });
    }
  }

  if (requiresCmbChangeReasonForTransition(params.toStatus, config)) {
    if (!params.changeReason?.trim()) {
      throw new ValidationError("changeReason 이 필요합니다.", {
        code: "CMB_CHANGE_REASON_REQUIRED",
      });
    }
  }

  let verifyPassed = false;
  if (requiresCmbVerifyPassForTransition(params.toStatus)) {
    const errors = validateSingleCmbConfig(config);
    if (errors.length > 0) {
      throw new ValidationError(
        `verify 통과 전 ${params.toStatus} 전이 불가: ${errors.join("; ")}`,
        { code: "CMB_VERIFY_FAILED", details: errors },
      );
    }
    verifyPassed = true;
  }

  const evidenceTag =
    params.evidenceTag?.trim() ||
    revision.evidenceTag ||
    CMB_PHASE6F_EVIDENCE_TAG;

  const now = new Date();
  const data: Prisma.AibeopchinCmbConfigRevisionUpdateInput = {
    status: params.toStatus as AibeopchinCmbConfigStatus,
    evidenceTag,
    changeReason: params.changeReason?.trim() || revision.changeReason,
  };

  if (params.toStatus === "VERIFY_PASS") {
    data.verifyPassedAt = now;
  }
  if (params.toStatus === "LOCKED") {
    data.lockedAt = now;
  }
  if (params.toStatus === "PUBLISHED") {
    data.publishedAt = now;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (params.toStatus === "PUBLISHED") {
      await tx.aibeopchinCmbConfigRevision.updateMany({
        where: {
          caseType: revision.caseType,
          status: "PUBLISHED",
          NOT: { id: revision.id },
        },
        data: { status: "LOCKED" },
      });
    }

    const row = await tx.aibeopchinCmbConfigRevision.update({
      where: { id: revision.id },
      data,
    });

    await tx.aibeopchinCmbPublishEvent.create({
      data: {
        revisionId: revision.id,
        fromStatus: revision.status,
        toStatus: params.toStatus as AibeopchinCmbConfigStatus,
        evidenceTag,
        changeReason: params.changeReason?.trim(),
        verifyPassed,
        actorUserId: params.actor.id,
      },
    });

    return row;
  });

  await writeAuditLog({
    actorUserId: params.actor.id,
    action:
      params.toStatus === "PUBLISHED"
        ? CMB_AUDIT_ACTIONS.CMB_REVISION_PUBLISHED
        : CMB_AUDIT_ACTIONS.CMB_REVISION_TRANSITION,
    entityType: "AIBEOPCHIN_CMB_REVISION",
    entityId: revision.id,
    message: `${fromStatus} → ${params.toStatus}`,
    metadata: {
      caseType: revision.caseType,
      version: revision.version,
      evidenceTag,
      verifyPassed,
      fromStatus,
      toStatus: params.toStatus,
    },
  });

  return mapRevision(updated);
}
