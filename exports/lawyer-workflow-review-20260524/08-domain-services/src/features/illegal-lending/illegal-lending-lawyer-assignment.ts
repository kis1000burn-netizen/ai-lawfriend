import { prisma } from "@/lib/prisma";

type LawyerCandidate = {
  id: string;
  name: string;
  email: string;
  activeCaseCount: number;
};

async function findLawyerCandidates(): Promise<LawyerCandidate[]> {
  const lawyers = await prisma.user.findMany({
    where: {
      role: "LAWYER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          assignedCases: true,
        },
      },
    },
    take: 20,
  });

  return lawyers.map((lawyer) => ({
    id: lawyer.id,
    name: lawyer.name,
    email: lawyer.email,
    activeCaseCount: lawyer._count.assignedCases,
  }));
}

export async function autoAssignIllegalLendingLawyer() {
  if (process.env.ILLEGAL_LENDING_AUTO_ASSIGN_ENABLED === "false") {
    return null;
  }

  const candidates = await findLawyerCandidates();

  if (candidates.length === 0) {
    return null;
  }

  const selected = [...candidates].sort((a, b) => {
    if (a.activeCaseCount !== b.activeCaseCount) {
      return a.activeCaseCount - b.activeCaseCount;
    }

    return a.name.localeCompare(b.name, "ko");
  })[0];

  return {
    lawyerId: selected.id,
    lawyerName: selected.name || selected.email || "변호사",
    reason: "불법사금융 피해 신고서 모듈 자동 배정: 현재 후보군 중 최소 업무량 기준",
  };
}