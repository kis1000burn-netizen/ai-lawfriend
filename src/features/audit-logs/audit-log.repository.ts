import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AuditLogListQueryInput,
  AuditLogSummaryQueryInput,
} from "@/features/audit-logs/audit-log.validators";
import { AUDIT_LOG_EXPORT_MAX_ROWS } from "@/lib/data-governance/audit-log-export-policy";
import { getAuditLogRetentionQueryFloorDate } from "@/lib/data-governance/audit-log-retention-policy";

function buildDateRange(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return undefined;

  const createdAt: Prisma.DateTimeFilter = {};

  if (dateFrom) {
    createdAt.gte = new Date(dateFrom);
  }

  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    createdAt.lte = end;
  }

  return createdAt;
}

function applyRetentionFloor(
  createdAt: Prisma.DateTimeFilter | undefined,
): Prisma.DateTimeFilter {
  const floor = getAuditLogRetentionQueryFloorDate();
  if (!createdAt) {
    return { gte: floor };
  }
  const existingGte = createdAt.gte ? new Date(createdAt.gte) : undefined;
  const gte =
    existingGte && existingGte.getTime() > floor.getTime() ? existingGte : floor;
  return { ...createdAt, gte };
}

function buildAuditLogWhere(
  filters:
    | AuditLogListQueryInput
    | (AuditLogSummaryQueryInput & {
        actorUserId?: string;
        action?: string;
        entityType?: string;
        entityId?: string;
        search?: string;
      })
): Prisma.AuditLogWhereInput {
  const createdAt = applyRetentionFloor(
    buildDateRange(filters.dateFrom, filters.dateTo),
  );

  return {
    ...(filters.actorUserId ? { actorUserId: filters.actorUserId } : {}),
    ...(filters.action
      ? {
          action: {
            contains: filters.action,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(filters.entityType
      ? {
          entityType: {
            contains: filters.entityType,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(filters.entityId
      ? {
          entityId: {
            contains: filters.entityId,
            mode: "insensitive" as const,
          },
        }
      : {}),
    createdAt,
    ...(filters.search
      ? {
          OR: [
            {
              action: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              entityType: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              entityId: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              actorUserId: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              message: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };
}

export async function findAuditLogs(filters: AuditLogListQueryInput) {
  const where = buildAuditLogWhere(filters);

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: {
        id: true,
        actorUserId: true,
        action: true,
        entityType: true,
        entityId: true,
        message: true,
        metadata: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total };
}

export async function findAuditLogById(id: string) {
  return prisma.auditLog.findUnique({
    where: { id },
    select: {
      id: true,
      actorUserId: true,
      action: true,
      entityType: true,
      entityId: true,
      message: true,
      metadata: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function findAuditLogsForExport(
  filters: Omit<AuditLogListQueryInput, "page" | "pageSize">
) {
  const where = buildAuditLogWhere(filters);

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: AUDIT_LOG_EXPORT_MAX_ROWS,
    select: {
      id: true,
      actorUserId: true,
      action: true,
      entityType: true,
      entityId: true,
      message: true,
      metadata: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function getAuditLogSummary(filters: AuditLogSummaryQueryInput) {
  const where = buildAuditLogWhere(filters);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalCount,
    todayCount,
    caseCount,
    attachmentCount,
    timelineCount,
    assignmentCount,
    topActions,
  ] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.count({
      where: {
        AND: [
          where,
          {
            createdAt: {
              gte: todayStart,
            },
          },
        ],
      },
    }),
    prisma.auditLog.count({
      where: {
        ...where,
        entityType: "CASE",
      },
    }),
    prisma.auditLog.count({
      where: {
        ...where,
        entityType: "CASE_ATTACHMENT",
      },
    }),
    prisma.auditLog.count({
      where: {
        ...where,
        entityType: "CASE_TIMELINE_MEMO",
      },
    }),
    prisma.auditLog.count({
      where: {
        ...where,
        entityType: "CASE_ASSIGNMENT",
      },
    }),
    prisma.auditLog.groupBy({
      by: ["action"],
      where,
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return {
    totalCount,
    todayCount,
    caseCount,
    attachmentCount,
    timelineCount,
    assignmentCount,
    topActions: topActions.map((item) => ({
      action: item.action,
      count: item._count.action,
    })),
  };
}

export async function getAuditLogActionChart(filters: AuditLogSummaryQueryInput) {
  const where = buildAuditLogWhere(filters);

  const grouped = await prisma.auditLog.groupBy({
    by: ["action"],
    where,
    _count: {
      action: true,
    },
    orderBy: {
      _count: {
        action: "desc",
      },
    },
    take: 12,
  });

  return grouped.map((item) => ({
    action: item.action,
    count: item._count.action,
  }));
}

export async function getAuditLogDailyTrend(filters: AuditLogSummaryQueryInput) {
  const where = buildAuditLogWhere(filters);

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
    },
  });

  const map = new Map<string, number>();

  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

export async function getAuditLogTopActors(filters: AuditLogSummaryQueryInput) {
  const where = buildAuditLogWhere(filters);

  const grouped = await prisma.auditLog.groupBy({
    by: ["actorUserId"],
    where,
    _count: {
      actorUserId: true,
    },
    orderBy: {
      _count: {
        actorUserId: "desc",
      },
    },
    take: 10,
  });

  if (grouped.length === 0) {
    return [];
  }

  const actorIds = grouped.map((item) => item.actorUserId);

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: actorIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const userMap = new Map(users.map((user) => [user.id, user]));

  return grouped.map((item, index) => {
    const user = userMap.get(item.actorUserId);

    return {
      rank: index + 1,
      actorUserId: item.actorUserId,
      count: item._count.actorUserId,
      actor: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : {
            id: item.actorUserId,
            name: null,
            email: "(삭제되었거나 조회 불가)",
            role: "UNKNOWN",
          },
    };
  });
}

export async function getAuditLogHourlyDistribution(
  filters: AuditLogSummaryQueryInput
) {
  const where = buildAuditLogWhere(filters);

  const rows = await prisma.auditLog.findMany({
    where,
    select: {
      createdAt: true,
    },
  });

  const counts = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
  }));

  for (const row of rows) {
    const hour = row.createdAt.getHours();
    counts[hour].count += 1;
  }

  return counts;
}

export async function getAuditLogDashboardSignals() {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const last7DaysStart = new Date(todayStart);
  last7DaysStart.setDate(todayStart.getDate() - 7);

  const last7DaysRows = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: last7DaysStart,
        lt: todayStart,
      },
    },
    select: {
      createdAt: true,
      action: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const todayRows = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lt: tomorrowStart,
      },
    },
    select: {
      createdAt: true,
      action: true,
    },
  });

  const dayMap = new Map<string, number>();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(last7DaysStart);
    d.setDate(last7DaysStart.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, 0);
  }

  for (const row of last7DaysRows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  }

  const dailyCounts = Array.from(dayMap.values());
  const last7DaysAverage =
    dailyCounts.length > 0
      ? dailyCounts.reduce((sum, value) => sum + value, 0) / dailyCounts.length
      : 0;

  const todayCount = todayRows.length;

  const recentActionMap = new Map<string, number>();
  const todayActionMap = new Map<string, number>();

  for (const row of last7DaysRows) {
    recentActionMap.set(row.action, (recentActionMap.get(row.action) ?? 0) + 1);
  }

  for (const row of todayRows) {
    todayActionMap.set(row.action, (todayActionMap.get(row.action) ?? 0) + 1);
  }

  const spikeActions = Array.from(todayActionMap.entries())
    .map(([action, todayCountForAction]) => {
      const recentTotal = recentActionMap.get(action) ?? 0;
      const recentDailyAverage = recentTotal / 7;

      const multiplier =
        recentDailyAverage > 0
          ? todayCountForAction / recentDailyAverage
          : todayCountForAction > 0
            ? 999
            : 0;

      return {
        action,
        todayCount: todayCountForAction,
        recentDailyAverage: Number(recentDailyAverage.toFixed(2)),
        multiplier: Number(multiplier.toFixed(2)),
      };
    })
    .filter((item) => item.todayCount >= 3 && item.multiplier >= 2)
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 5);

  const todayVsAverageRatio =
    last7DaysAverage > 0
      ? todayCount / last7DaysAverage
      : todayCount > 0
        ? 999
        : 0;

  const severity =
    todayCount >= 20 && todayVsAverageRatio >= 2.5
      ? "critical"
      : todayCount >= 10 && todayVsAverageRatio >= 1.5
        ? "warning"
        : "normal";

  return {
    todayCount,
    last7DaysAverage: Number(last7DaysAverage.toFixed(2)),
    todayVsAverageRatio: Number(todayVsAverageRatio.toFixed(2)),
    spikeActions,
    severity,
  };
}

function normalizeAuditRoleForSpike(role: string): "ADMIN" | "LAWYER" | "USER" | null {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "ADMIN";
  if (role === "LAWYER") return "LAWYER";
  if (role === "USER") return "USER";
  return null;
}

export async function getAuditLogAdvancedSignals() {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const last7DaysStart = new Date(todayStart);
  last7DaysStart.setDate(todayStart.getDate() - 7);

  const [recentRows, todayRows] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: last7DaysStart,
          lt: todayStart,
        },
      },
      select: {
        createdAt: true,
        action: true,
        actorUserId: true,
        actor: {
          select: {
            role: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
      select: {
        createdAt: true,
        action: true,
        actorUserId: true,
        actor: {
          select: {
            role: true,
            email: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const roleKeys = ["ADMIN", "LAWYER", "USER"] as const;

  const recentRoleTotals = {
    ADMIN: 0,
    LAWYER: 0,
    USER: 0,
  };

  const todayRoleTotals = {
    ADMIN: 0,
    LAWYER: 0,
    USER: 0,
  };

  for (const row of recentRows) {
    const role = normalizeAuditRoleForSpike(row.actor.role);
    if (role) {
      recentRoleTotals[role] += 1;
    }
  }

  for (const row of todayRows) {
    const role = normalizeAuditRoleForSpike(row.actor.role);
    if (role) {
      todayRoleTotals[role] += 1;
    }
  }

  const roleSpikes = roleKeys
    .map((role) => {
      const recentDailyAverage = recentRoleTotals[role] / 7;
      const todayCount = todayRoleTotals[role];
      const multiplier =
        recentDailyAverage > 0
          ? todayCount / recentDailyAverage
          : todayCount > 0
            ? 999
            : 0;

      return {
        role,
        todayCount,
        recentDailyAverage: Number(recentDailyAverage.toFixed(2)),
        multiplier: Number(multiplier.toFixed(2)),
      };
    })
    .filter((item) => item.todayCount >= 3 && item.multiplier >= 1.8)
    .sort((a, b) => b.multiplier - a.multiplier);

  const NIGHT_HOUR_START = 0;
  const NIGHT_HOUR_END = 5;

  const nightRows = todayRows.filter((row) => {
    const hour = row.createdAt.getHours();
    return hour >= NIGHT_HOUR_START && hour <= NIGHT_HOUR_END;
  });

  const nightByRole = {
    ADMIN: 0,
    LAWYER: 0,
    USER: 0,
  };

  for (const row of nightRows) {
    const role = normalizeAuditRoleForSpike(row.actor.role);
    if (role) {
      nightByRole[role] += 1;
    }
  }

  const nightSignal = {
    totalNightCount: nightRows.length,
    byRole: nightByRole,
    severity:
      nightRows.length >= 10
        ? "critical"
        : nightRows.length >= 5
          ? "warning"
          : "normal",
  };

  const BLACKLIST_ACTIONS = ["CASE_SOFT_DELETE", "CASE_ASSIGNMENT_END"] as const;

  const WHITELIST_ACTIONS = ["CASE_ATTACHMENT_DOWNLOAD"] as const;

  const blacklistHits = todayRows
    .filter((row) => (BLACKLIST_ACTIONS as readonly string[]).includes(row.action))
    .map((row) => ({
      action: row.action,
      actorUserId: row.actorUserId,
      actorName: row.actor.name,
      actorEmail: row.actor.email,
      role: row.actor.role,
      createdAt: row.createdAt,
    }));

  const recentActionMap = new Map<string, number>();
  const todayActionMap = new Map<string, number>();

  for (const row of recentRows) {
    if ((WHITELIST_ACTIONS as readonly string[]).includes(row.action)) continue;
    recentActionMap.set(row.action, (recentActionMap.get(row.action) ?? 0) + 1);
  }

  for (const row of todayRows) {
    if ((WHITELIST_ACTIONS as readonly string[]).includes(row.action)) continue;
    todayActionMap.set(row.action, (todayActionMap.get(row.action) ?? 0) + 1);
  }

  const actionSpikes = Array.from(todayActionMap.entries())
    .map(([action, todayCount]) => {
      const recentDailyAverage = (recentActionMap.get(action) ?? 0) / 7;
      const multiplier =
        recentDailyAverage > 0 ? todayCount / recentDailyAverage : todayCount > 0 ? 999 : 0;

      return {
        action,
        todayCount,
        recentDailyAverage: Number(recentDailyAverage.toFixed(2)),
        multiplier: Number(multiplier.toFixed(2)),
      };
    })
    .filter((item) => item.todayCount >= 3 && item.multiplier >= 2)
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 5);

  return {
    roleSpikes,
    nightSignal,
    blacklistHits,
    actionSpikes,
    config: {
      blacklistActions: BLACKLIST_ACTIONS,
      whitelistActions: WHITELIST_ACTIONS,
      nightHours: [NIGHT_HOUR_START, NIGHT_HOUR_END],
    },
  };
}
