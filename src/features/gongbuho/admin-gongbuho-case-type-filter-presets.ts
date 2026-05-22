/**
 * 관리 목록 필터 선택지·표시명.
 * 패킷 `caseType` 문자열(SSOT)`과 README 샘플 라이브러리 행 정합 유지를 권장한다.
 */
export const GONGGBUHO_ADMIN_CASE_TYPE_FILTER_PRESETS_ORDERED = [
  { caseType: "FRAUD", label: "FRAUD (사기 패킷 LAW-FRAUD-001 등)" },
  { caseType: "WAGE_BACKPAY", label: "WAGE_BACKPAY (임금 체불 LAW-WAGE-001)" },
  { caseType: "LAND_DISPUTE", label: "LAND_DISPUTE (토지 분쟁 LAW-LAND-001)" },
  {
    caseType: "CONTENTS_CERTIFIED_DEMAND",
    label: "CONTENTS_CERTIFIED_DEMAND (내용증명 LAW-CONTENT-001)",
  },
  {
    caseType: "CRIMINAL_COMPLAINT_DRAFT",
    label: "CRIMINAL_COMPLAINT_DRAFT (고소장 초안 LAW-COMPLAINT-001)",
  },
] as const;
