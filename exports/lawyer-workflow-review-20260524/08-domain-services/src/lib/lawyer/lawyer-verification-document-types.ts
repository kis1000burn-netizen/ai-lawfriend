/**
 * 변호사 자격 검증 증빙 유형 — 일반적인 온라인 자격 확인 절차(등록 증명 + 본인 확인)와 맞춤.
 * 저장은 `LawyerVerificationDocument.type` 문자열 필드(DB enum 없음).
 */
export const LAWYER_VERIFICATION_DOCUMENT_TYPE = {
  /** 변호사 등록증, 등록 증명, 공적 조회 결과 등 ‘등록 상태’ 증명 */
  BAR_REGISTRATION_CERTIFICATE: "BAR_REGISTRATION_CERTIFICATE",
  /** 신분증(주민증·운전면허증 등 본인 동일 확인). 제출 안내는 UI에서 마스킹 안내와 함께 노출 */
  LEGAL_REPRESENTATIVE_ID: "LEGAL_REPRESENTATIVE_ID",
  /** 지방변호사회 회원증·납세 등 보조 증명(선택) */
  MEMBERSHIP_PROOF: "MEMBERSHIP_PROOF",
  /** 사무실 등록 정보 등 선택 증명 */
  OFFICE_REGISTRY: "OFFICE_REGISTRY",
  /** 기타 관리자·운영 매뉴얼 안내 후 제출되는 보충 증명 */
  ADDITIONAL_PROOF: "ADDITIONAL_PROOF",
} as const;

export type LawyerVerificationDocumentTypeId =
  (typeof LAWYER_VERIFICATION_DOCUMENT_TYPE)[keyof typeof LAWYER_VERIFICATION_DOCUMENT_TYPE];

export const LAWYER_VERIFICATION_DOCUMENT_TYPE_ORDER: LawyerVerificationDocumentTypeId[] =
  Object.values(LAWYER_VERIFICATION_DOCUMENT_TYPE);

export function isLawyerVerificationDocumentTypeId(
  value: string,
): value is LawyerVerificationDocumentTypeId {
  return (LAWYER_VERIFICATION_DOCUMENT_TYPE_ORDER as string[]).includes(value);
}

/** 가입·심사에서 반드시 갖춰야 하는 유형 */
export const REQUIRED_LAWYER_VERIFICATION_DOCUMENT_TYPES: LawyerVerificationDocumentTypeId[] = [
  LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE,
  LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID,
];

export function lawyerVerificationDocumentTypeLabelKo(type: string): string {
  switch (type) {
    case LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE:
      return "변호사 등록(또는 등록 상태) 증명";
    case LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID:
      return "본인 확인용 신분증";
    case LAWYER_VERIFICATION_DOCUMENT_TYPE.MEMBERSHIP_PROOF:
      return "변호사회 회원증 등(선택)";
    case LAWYER_VERIFICATION_DOCUMENT_TYPE.OFFICE_REGISTRY:
      return "사무소 등록·연락처 증명(선택)";
    case LAWYER_VERIFICATION_DOCUMENT_TYPE.ADDITIONAL_PROOF:
      return "추가 보완 증빙(선택)";
    default:
      return type;
  }
}

export function getMissingRequiredLawyerVerificationDocumentTypes(
  uploadedTypes: string[],
): LawyerVerificationDocumentTypeId[] {
  const set = new Set(uploadedTypes.map((t) => t.trim()));
  return REQUIRED_LAWYER_VERIFICATION_DOCUMENT_TYPES.filter((required) => !set.has(required));
}

export function hasAllRequiredLawyerVerificationDocumentTypes(
  uploadedTypes: string[],
): boolean {
  return getMissingRequiredLawyerVerificationDocumentTypes(uploadedTypes).length === 0;
}
