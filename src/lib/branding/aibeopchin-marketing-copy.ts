/**
 * 공개 랜딩·홈 카피 SSOT — 어절/구·문장 단위 phrase 배열.
 * 좁은 뷰포트 줄정리·PC 문단 연결 모두 이 배열 하나로 유지.
 */
export const AIBEOPCHIN_MARKETING_COPY_MARKER = "aibeopchin-marketing-copy-v1" as const;

export const AIBEOPCHIN_HERO_HEADING_LINES = [
  "사건의 흐름을 정리하고,",
  "법률 문서의 시작점을 함께 만듭니다.",
] as const;

export const AIBEOPCHIN_HERO_TAGLINE_LINES = [
  "법률의 문턱을 낮추는",
  "AI 동반자",
] as const;

export const AIBEOPCHIN_HERO_DESCRIPTION_LINES = [
  "AI법친은 법률 전문가의 판단을 대체하지 않고,",
  "사건 자료와 진술 흐름을 정리해",
  "더 빠르고 정확한 상담 준비를 돕습니다.",
] as const;

export const AIBEOPCHIN_HERO_CTA_CLIENT_LINES = [
  "질문에 답하며",
  "사건의 흐름과 필요한 자료를 정리합니다.",
] as const;

export const AIBEOPCHIN_HERO_CTA_LAWYER_LINES = [
  "의뢰인의 진술과 자료를",
  "구조화된 사건 단위로 확인합니다.",
] as const;

export const AIBEOPCHIN_HERO_CTA_ADMIN_LINES = [
  "사용자, 사건 흐름, 승인 상태,",
  "운영 기준을 관리합니다.",
] as const;

export const AIBEOPCHIN_HOME_FLOW_HEADING_LINES = [
  "질문에서 문서 준비까지,",
  "흐름을 잃지 않게 돕습니다.",
] as const;

export const AIBEOPCHIN_HOME_FLOW_STEPS = [
  {
    title: "1. 사건 입력",
    bodyLines: ["기본 정보와 사건 경위를", "질문 흐름에 따라 입력합니다."],
  },
  {
    title: "2. 자료 정리",
    bodyLines: ["첨부자료를 사건 단위로 연결하고", "필요한 자료를 분류합니다."],
  },
  {
    title: "3. 요약 생성",
    bodyLines: ["진술과 자료를 바탕으로", "사건 요약의 출발점을 만듭니다."],
  },
  {
    title: "4. 전문가 검토",
    bodyLines: ["변호사 또는 담당자가", "최종 판단과 문서 검토를 진행합니다."],
  },
] as const;

export const AIBEOPCHIN_HOME_ROLE_HEADING_LINES = [
  "역할에 맞는 작업 공간으로",
  "바로 이동합니다.",
] as const;

export const AIBEOPCHIN_HOME_ROLE_SUBCOPY_LINES = [
  "동일한 로그인 화면을 사용합니다.",
  "계정 유형·승인 상태에 따라 허용된 메뉴만 열립니다.",
] as const;

export const AIBEOPCHIN_HOME_ROLE_CARDS = [
  {
    title: "의뢰인",
    bodyLines: ["질문에 답하며", "사건의 핵심 사실과 자료를 정리합니다."],
  },
  {
    title: "변호사",
    bodyLines: ["사건 요약, 첨부자료,", "문서 초안을 검토합니다."],
  },
  {
    title: "관리자·운영",
    bodyLines: ["권한, 승인,", "운영 흐름을 관리합니다."],
  },
] as const;

export const AIBEOPCHIN_HOME_TRUST_ITEMS = [
  {
    title: "법률 면책",
    bodyLines: [
      "AI법친은 정보 제공·업무 보조 목적의 도구입니다.",
      "법률 자문·소송 대리·결과 보장을 하지 않습니다.",
      "중요한 결정은 자격 있는 변호사와 상담하세요.",
    ],
  },
  {
    title: "데이터·보안",
    bodyLines: [
      "접근 제어는 계정 역할·사건 권한에 따라 적용됩니다.",
      "AI는 변호사를 대체하지 않으며,",
      "최종 법률 판단은 전문가 검토를 전제로 합니다.",
    ],
  },
  {
    title: "기능 범위",
    bodyLines: [
      "사건 자료와 진술 흐름을 구조화해 상담 준비를 돕습니다.",
      "본 화면은 공개 랜딩(2차) 구성이며",
      "사건·인터뷰·문서·API·상태·권한의 기술적 동작은 기존 구현을 변경하지 않습니다.",
    ],
  },
] as const;

export const LANDING_HERO_HEADING_LINES = [
  "사건 정리와 상담 준비를 돕는",
  "법률 보조 플랫폼",
] as const;

export const LANDING_HERO_BODY_LINES = [
  "AI법친은 법률 자문·소송 대리를 대신하지 않습니다.",
  "의뢰인·변호사·운영이 같은 정보 위에서",
  "안전하게 협업할 수 있도록",
  "인터뷰·문서·사건 흐름을 정리합니다.",
] as const;

/** 단일 문자열이 필요한 메타·설명 필드용 */
export function joinKoreanPhrases(phrases: readonly string[]): string {
  return phrases.join(" ");
}
