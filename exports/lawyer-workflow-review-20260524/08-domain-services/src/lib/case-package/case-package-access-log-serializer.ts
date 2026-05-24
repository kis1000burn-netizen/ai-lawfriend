import type { CasePackageAccessLog, User } from "@prisma/client";

type AccessLogWithActor = CasePackageAccessLog & {
  actor?: Pick<User, "id" | "name" | "email" | "role"> | null;
};

export function serializeCasePackageAccessLog(log: AccessLogWithActor) {
  return {
    id: log.id,
    shareId: log.shareId,
    caseId: log.caseId,
    actorUserId: log.actorUserId,
    actor: log.actor
      ? {
          id: log.actor.id,
          name: log.actor.name,
          email: log.actor.email,
          role: log.actor.role,
        }
      : null,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    resultMessage: log.resultMessage,
    ip: maskIp(log.ip),
    userAgent: log.userAgent,
    createdAt: log.createdAt,
  };
}

function maskIp(ip: string | null): string | null {
  if (!ip) return null;

  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
    }
  }

  if (ip.includes(":")) {
    return `${ip.slice(0, 12)}…`;
  }

  return ip;
}