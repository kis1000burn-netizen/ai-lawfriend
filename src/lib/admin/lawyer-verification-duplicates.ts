import { prisma } from "@/lib/prisma";

export type LawyerVerificationDuplicateBadge = {
  /** 같은 등록번호·지방회를 가진 다른 프로필 수 (본인 제외) */
  otherCount: number;
  /** 다른 프로필 중 이미 승인된 건이 있는지 */
  hasApprovedConflict: boolean;
  /** 다른 프로필 중 심사 대기·보완 요청 건이 있는지 */
  hasQueueConflict: boolean;
};

/**
 * 목록 행에 표시할 등록번호+지방회 중복 의심 정보.
 * 현재 화면에 없는 APPROVED 등 다른 상태도 DB에서 함께 조회한다.
 */
export async function fetchLawyerVerificationDuplicateBadges(
  items: ReadonlyArray<{
    id: string;
    registrationNumber: string | null;
    barAssociation: string | null;
  }>,
): Promise<Map<string, LawyerVerificationDuplicateBadge>> {
  const out = new Map<string, LawyerVerificationDuplicateBadge>();
  const pairMap = new Map<string, { r: string; b: string }>();
  for (const it of items) {
    const r = it.registrationNumber?.trim();
    const b = it.barAssociation?.trim();
    if (!r || !b) continue;
    pairMap.set(`${r}\0${b}`, { r, b });
  }
  if (pairMap.size === 0) return out;

  const or = [...pairMap.values()].map((p) => ({
    registrationNumber: p.r,
    barAssociation: p.b,
  }));

  const related = await prisma.lawyerProfile.findMany({
    where: { OR: or },
    select: {
      id: true,
      registrationNumber: true,
      barAssociation: true,
      verificationStatus: true,
    },
  });

  const byKey = new Map<string, typeof related>();
  for (const row of related) {
    const r = row.registrationNumber?.trim();
    const b = row.barAssociation?.trim();
    if (!r || !b) continue;
    const k = `${r}\0${b}`;
    byKey.set(k, [...(byKey.get(k) ?? []), row]);
  }

  for (const it of items) {
    const r = it.registrationNumber?.trim();
    const b = it.barAssociation?.trim();
    if (!r || !b) continue;
    const group = byKey.get(`${r}\0${b}`) ?? [];
    const others = group.filter((o) => o.id !== it.id);
    if (others.length === 0) continue;
    out.set(it.id, {
      otherCount: others.length,
      hasApprovedConflict: others.some((o) => o.verificationStatus === "APPROVED"),
      hasQueueConflict: others.some(
        (o) => o.verificationStatus === "PENDING" || o.verificationStatus === "NEEDS_MORE_INFO",
      ),
    });
  }

  return out;
}
