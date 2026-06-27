export type LawyerArgumentSocialProofSignal = {
  visible: boolean;
  eyebrow: string;
  title: string;
  themes: string[];
  disclaimer: string;
  emptyStateMessage: string | null;
};

export const LAWYER_ARGUMENT_SOCIAL_PROOF_THEMES = [
  {
    label: "부동산 관련 분쟁",
    matchesCategory: (category: string | null) => {
      if (!category) {
        return false;
      }
      const normalized = category.toUpperCase();
      return (
        normalized.includes("LAND") ||
        normalized.includes("REAL_ESTATE") ||
        normalized.includes("EASEMENT") ||
        normalized.includes("PROPERTY")
      );
    },
  },
  {
    label: "산업재해 및 손해배상 관련 검토",
    matchesCategory: (category: string | null) => {
      if (!category) {
        return false;
      }
      const normalized = category.toUpperCase();
      return (
        normalized.includes("CONSTRUCTION") ||
        normalized.includes("INJURY") ||
        normalized.includes("INDUSTRIAL") ||
        normalized.includes("WORKPLACE")
      );
    },
  },
] as const;

export const LAWYER_ARGUMENT_SOCIAL_PROOF_MIN_SIGNAL_COUNT = 5;

const FIXTURE_CASE_ID_PREFIXES = [
  "case-joohwan-",
  "case-recent-construction-injury-",
] as const;

export type LawyerArgumentSocialProofThemeInput = {
  label: string;
  signalCount: number;
};

type LawyerArgumentSocialProofAggregateInput = {
  themes: LawyerArgumentSocialProofThemeInput[];
};

export function isFixtureCaseIdForSocialProof(caseId: string) {
  return FIXTURE_CASE_ID_PREFIXES.some((prefix) => caseId.startsWith(prefix));
}

export function buildLawyerArgumentSocialProofSignal(
  input: LawyerArgumentSocialProofAggregateInput,
): LawyerArgumentSocialProofSignal {
  const visibleThemes = input.themes
    .filter(
      (theme) => theme.signalCount >= LAWYER_ARGUMENT_SOCIAL_PROOF_MIN_SIGNAL_COUNT,
    )
    .map((theme) => theme.label);
  const visible = visibleThemes.length > 0;

  if (!visible) {
    return {
      visible: false,
      eyebrow: "익명화된 운영 신호",
      title: "현재 축적된 익명 운영 신호가 없습니다",
      themes: [],
      disclaimer:
        "특정 사건·의뢰인·변호사 또는 업무 결과를 의미하지 않습니다.",
      emptyStateMessage:
        "실제 검토 활동이 테마별 최소 집계 기준을 통과하면 범주형 실무 주제만 표시됩니다.",
    };
  }

  return {
    visible: true,
    eyebrow: "최근 검토된 실무 주제",
    title: "익명화된 운영 신호를 바탕으로 표시됩니다",
    themes: visibleThemes,
    disclaimer:
      "특정 사건, 의뢰인, 변호사의 수임·성과·결과를 의미하지 않습니다.",
    emptyStateMessage: null,
  };
}

export async function fetchLawyerArgumentSocialProofSignal() {
  const { prisma } = await import("@/lib/prisma");
  const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [peerReviews, argumentCandidates] = await Promise.all([
    prisma.aiLawyerReviewFeedback.findMany({
      where: { createdAt: { gte: recentCutoff } },
      select: { caseId: true },
    }),
    prisma.legalReliabilityActionCandidate.findMany({
      where: { createdAt: { gte: recentCutoff } },
      select: { caseId: true },
    }),
  ]);

  const signalRows = [...peerReviews, ...argumentCandidates].filter(
    (row) => !isFixtureCaseIdForSocialProof(row.caseId),
  );
  const caseIds = [...new Set(signalRows.map((row) => row.caseId))];
  const cases =
    caseIds.length === 0
      ? []
      : await prisma.case.findMany({
          where: { id: { in: caseIds } },
          select: { id: true, category: true },
        });
  const categoryByCaseId = new Map(
    cases.map((item) => [item.id, item.category ?? null]),
  );

  const themeCounts = new Map<string, number>(
    LAWYER_ARGUMENT_SOCIAL_PROOF_THEMES.map((theme) => [theme.label, 0]),
  );

  for (const row of signalRows) {
    const category = categoryByCaseId.get(row.caseId) ?? null;
    for (const theme of LAWYER_ARGUMENT_SOCIAL_PROOF_THEMES) {
      if (theme.matchesCategory(category)) {
        themeCounts.set(theme.label, (themeCounts.get(theme.label) ?? 0) + 1);
      }
    }
  }

  return buildLawyerArgumentSocialProofSignal({
    themes: LAWYER_ARGUMENT_SOCIAL_PROOF_THEMES.map((theme) => ({
      label: theme.label,
      signalCount: themeCounts.get(theme.label) ?? 0,
    })),
  });
}
