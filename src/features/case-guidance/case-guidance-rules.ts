import type {
  CaseGuidanceCardModel,
  CaseGuidanceSection,
} from "@/features/case-guidance/case-guidance.types";

type RuleBundle = {
  key: string;
  categoryLabel: string;
  suggestedNextSteps: CaseGuidanceSection;
  institutionChecklist: CaseGuidanceSection;
  researchAndCasesHint: CaseGuidanceSection;
};

const COMMON_DISCLAIMERS: string[] = [
  "본 화면은 국내 공개 안내 및 일반적인 절차를 정리한 참고 자료입니다. 최종적인 법률 해석·승패·조치 필요 여부를 판단하지 않습니다.",
  "실제 신청·제출·소송·신고에는 관할 기관 안내 및 변호사·법률구조공단 등 전문가의 검토가 필요할 수 있습니다.",
  "판례·판결문은 검색 포털에서 직접 확인하고, 최신 법령·사실관계에 맞는지 반드시 대조해 주세요.",
];

function section(
  id: string,
  title: string,
  bullets: string[],
  links?: CaseGuidanceSection["links"],
): CaseGuidanceSection {
  return { id, title, bullets, ...(links?.length ? { links } : {}) };
}

/** 사건 등록 폼 카테고리(형사·민사·가사) 및 미분류 */
const RULES: Record<string, RuleBundle> = {
  형사: {
    key: "criminal",
    categoryLabel: "형사 분쟁·수사 단계 참고",
    suggestedNextSteps: section("next-steps", "먼저 정리하면 좋은 방향", [
      "사건 일시·장소·인물 관계와 금품·증거 보관 상태를 간단히 메모합니다.",
      "신고 또는 고소·고발 검토 중이면 접수처(경찰·검찰 등)별 요구 안내 일정을 확인합니다.",
      "피해 확대 방지 및 증거 훼손 방지를 위해 관련 문자·통화 녹음·송금 증빙을 보관합니다.",
    ]),
    institutionChecklist: section(
      "institutions",
      "상담·접수에 참고할 기관 체크리스트",
      [
        "관할 지구대·경찰서 신고 접수 또는 민원실 안내 확인",
        "검찰 민원·고발 창구(민원실) 업무 시간·서류 안내 확인",
        "변호사 선임 검토 또는 대한법률구조공단 등 상담 기관 활용 검토",
        "피해 유형별 수사 및 민사 병행 여부를 전문가와 상의합니다.",
      ],
      [
        { label: "대한법률구조공단", href: "https://www.klac.or.kr" },
        { label: "대검찰청", href: "https://www.spo.go.kr" },
        { label: "경찰청", href: "https://www.police.go.kr" },
      ],
    ),
    researchAndCasesHint: section(
      "research",
      "판례·법령 등 조사 방법(직접 확인)",
      [
        "종합법률정보에서 키워드 검색 후 판결문 요지만 읽더라도 쟁점 용어를 익히는 것이 도움이 됩니다.",
        "형사 특정 검색어보다 ‘죄명 + 핵심 행위’ 조합으로 1차 탐색을 권합니다.",
        "판례는 사실관계가 조금만 달라도 결론이 달라질 수 있습니다. 자동 매칭·단정 기능은 제공하지 않습니다.",
      ],
      [
        {
          label: "대법원 종합법률정보",
          href: "https://www.scourt.go.kr",
        },
        {
          label: "국가법령정보센터",
          href: "https://www.law.go.kr",
        },
      ],
    ),
  },
  민사: {
    key: "civil",
    categoryLabel: "민사 분쟁·채권·계약 참고",
    suggestedNextSteps: section("next-steps", "먼저 정리하면 좋은 방향", [
      "분쟁 대상 행위(계약 체결·이행 거절 등) 시기별로 간단 타임라인을 만듭니다.",
      "청구 또는 방어 근거가 될 증거(계약서, 송금, 문자, 녹음 동의 내역 등) 목록화를 시작합니다.",
      "소송·조정 중 어느 경로부터 시도할지 전문 상담을 검토합니다.",
    ]),
    institutionChecklist: section(
      "institutions",
      "상담·접수에 참고할 기관 체크리스트",
      [
        "관할 소액사건 또는 민사 지원 등 법원 민원실 안내",
        "전자소송·서식 안내 페이지 확인",
        "노동·임대 등 분야별 특별 기구가 있으면 관할 안내 확인 — 사실관계에 따라 다릅니다",
        "대한법률구조공단·변호사 상담으로 절차 선택 검토",
      ],
      [
        { label: "대한민국 법원", href: "https://portal.scourt.go.kr" },
        { label: "대한법률구조공단", href: "https://www.klac.or.kr" },
      ],
    ),
    researchAndCasesHint: section(
      "research",
      "판례·법령 등 조사 방법(직접 확인)",
      [
        "종합법률정보나 판결문 DB에서 검색어를 줄여 가며 확인합니다.",
        "민사는 청구권 발생·실효 및 입증이 중요합니다. 검색 결과만으로 단정하지 않습니다.",
      ],
      [
        {
          label: "대법원 종합법률정보",
          href: "https://www.scourt.go.kr",
        },
        { label: "국가법령정보센터", href: "https://www.law.go.kr" },
      ],
    ),
  },
  가사: {
    key: "family",
    categoryLabel: "가사(이혼·친양자 등) 참고",
    suggestedNextSteps: section("next-steps", "먼저 정리하면 좋은 방향", [
      "당사자 및 미성년 자녀가 있다면 즉각적인 안전·주거 필요 여부를 점검합니다.",
      "재산 또는 양육과 관련해 정리 가능한 명단(부동산·금융 계좌·부채)을 준비합니다.",
      "조정·재판 선택은 가정법원 또는 전문 상담을 통해 검토하는 것이 일반적입니다.",
    ]),
    institutionChecklist: section(
      "institutions",
      "상담·접수에 참고할 기관 체크리스트",
      [
        "관할 가정법원 또는 가족관계등록 민원 업무 안내 확인",
        "가사조정 신청 또는 상담 절차 확인",
        "가정폭력 등 긴급 지원 채널이 필요하면 1391 등 공식 안내 확인",
        "대한법률구조공단 또는 가사 전문 상담 검토",
      ],
      [
        { label: "대한민국 법원", href: "https://portal.scourt.go.kr" },
        { label: "대한법률구조공단", href: "https://www.klac.or.kr" },
      ],
    ),
    researchAndCasesHint: section(
      "research",
      "판례·법령 등 조사 방법(직접 확인)",
      [
        "가사는 판례 외에 당사자 합의·조정 결과에 따라 결과가 크게 달라질 수 있습니다.",
        "법령·판례 검색 후 적용 가능성은 전문가 확인이 필요합니다.",
      ],
      [
        {
          label: "대법원 종합법률정보",
          href: "https://www.scourt.go.kr",
        },
        { label: "국가법령정보센터", href: "https://www.law.go.kr" },
      ],
    ),
  },
};

const DEFAULT_RULE: RuleBundle = {
  key: "default",
  categoryLabel: "사건 유형 미분류·일반 참고",
  suggestedNextSteps: section("next-steps", "먼저 정리하면 좋은 방향", [
    "사건 제목과 설명·인터뷰 내용을 기준으로 증거를 목록화합니다.",
    "형사·민사·가사 중 하나로 카테고리를 맞추면 더 구체적인 안내가 표시됩니다. 사건 수정에서 유형을 지정해 주세요.",
    "변호사·법률구조공단·노무사 등 분야별 전문 상담을 검토합니다.",
  ]),
  institutionChecklist: section(
    "institutions",
    "상담·접수에 참고할 기관(일반)",
    [
      "대한법률구조공단 상담",
      "지방변호사회 법률구조 참고",
      "분야별 공공 플랫폼이 있으면 관할 안내 페이지 확인 — 사건에 따라 다름",
    ],
    [
      { label: "대한법률구조공단", href: "https://www.klac.or.kr" },
      { label: "대한변호사협회", href: "https://www.koreanbar.or.kr" },
    ],
  ),
  researchAndCasesHint: RULES["민사"]!.researchAndCasesHint,
};

export function resolveCaseGuidanceRule(category: string | null | undefined): RuleBundle {
  const trimmed = typeof category === "string" ? category.trim() : "";
  if (trimmed in RULES) {
    return RULES[trimmed]!;
  }
  return DEFAULT_RULE;
}

export function buildCaseGuidanceCard(params: {
  category: string | null;
  interviewCompleted: boolean;
  situationBulletsFromInputs: string[];
}): CaseGuidanceCardModel {
  const rule = resolveCaseGuidanceRule(params.category);
  const situationSummaryBullets: string[] = [];

  if (!params.interviewCompleted) {
    situationSummaryBullets.push(
      "AI 인터뷰가 아직 완료되지 않았습니다. 정리 신뢰도를 높이려면 인터뷰를 마친 뒤 다시 확인해 주세요.",
    );
  } else {
    situationSummaryBullets.push(
      "인터뷰가 완료된 상태입니다. 아래는 입력하신 내용을 바탕으로 한 참고 요약입니다.",
    );
  }

  for (const line of params.situationBulletsFromInputs.slice(0, 10)) {
    if (line.trim()) situationSummaryBullets.push(line.trim());
  }

  if (situationSummaryBullets.length < 2) {
    situationSummaryBullets.push(
      "등록된 사건 정보가 부족합니다. 제목·설명 보완과 인터뷰 진행 후 다시 열어보면 정리 포인트를 채울 수 있습니다.",
    );
  }

  return {
    caseCategoryLabel: rule.categoryLabel,
    ruleKey: rule.key,
    situationSummaryBullets,
    suggestedNextSteps: rule.suggestedNextSteps,
    institutionChecklist: rule.institutionChecklist,
    researchAndCasesHint: rule.researchAndCasesHint,
    disclaimers: COMMON_DISCLAIMERS,
  };
}
