/**
 * Product Phase 23-E — Client-safe case progress pack service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { assembleClientSafeCaseProgressPack } from "./client-safe-case-progress-pack.policy";
import type { ClientSafeCaseProgressPack } from "./client-safe-case-progress-pack.schema";

export const CLIENT_SAFE_CASE_PROGRESS_PACK_SERVICE_MARKER_PHASE23E =
  "phase23e-client-safe-case-progress-pack-service" as const;

export async function buildClientSafeCaseProgressPackForCase(
  currentUser: SessionUser,
  caseId: string,
): Promise<ClientSafeCaseProgressPack> {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!access.canRead) {
    throw new NotFoundError();
  }

  const [caseRecord, latestRelease] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
      select: { status: true },
    }),
    prisma.caseClientDisclosureRelease.findFirst({
      where: { caseId },
      orderBy: { releasedAt: "desc" },
      select: { id: true },
    }),
  ]);

  if (!caseRecord) {
    throw new NotFoundError();
  }

  return assembleClientSafeCaseProgressPack({
    caseId,
    caseStatus: caseRecord.status,
    hasReleasedStatements: Boolean(latestRelease),
  });
}
