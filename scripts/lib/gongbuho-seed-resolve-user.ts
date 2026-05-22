import type { PrismaClient } from "@prisma/client";
import { UserRole } from "@prisma/client";

export async function resolveGongbuhoSeedCreatedByUserId(
  prisma: PrismaClient,
): Promise<string | undefined> {
  const explicit = process.env.GONGBUHO_SEED_CREATED_BY_USER_ID?.trim();
  if (explicit) return explicit;

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, status: "ACTIVE" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (admin) return admin.id;

  const superAdmin = await prisma.user.findFirst({
    where: { role: UserRole.SUPER_ADMIN, status: "ACTIVE" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return superAdmin?.id;
}
