export const CASE_PACKAGE_CLIENT_CONSENT_TEXT =
  "본인은 선택한 사건 정보, 사건 요약, AI 인터뷰 요약, 첨부자료 목록 및 문서 초안의 기초가 지정한 변호사 또는 전문가에게 제공될 수 있음을 확인합니다.\n\n" +
  "공유 실행 시점에 사건 패키지 본문이 스냅샷(JSON)과 무결성 해시로 고정되며, 이후 의뢰인이 사건 내용을 수정하더라도 해당 공유 열람 화면·요약 출력에는 원 공유 시점의 내용이 유지됨을 확인합니다.\n\n" +
  "본인은 공유 범위, 첨부파일 다운로드 허용 여부, 사건 패키지 요약본 다운로드 허용 여부, 공유 기간을 확인했습니다.\n\n" +
  "본인은 사건 패키지 공유 후 변호사 또는 전문가의 열람·다운로드 기록이 시스템에 저장될 수 있음을 확인합니다.\n\n" +
  "본인은 공유를 언제든 취소할 수 있으며, 공유가 취소되거나 만료된 이후에는 열람이 차단됨을 안내받았습니다.\n\n" +
  "AI가 정리한 사건 요약과 문서 초안의 기초는 법률 자문이나 최종 문서가 아니며, 최종 법률 판단과 문서 사용 여부는 반드시 변호사 또는 적법한 전문가의 검토를 거쳐야 함을 확인합니다.";

export const CASE_PACKAGE_LAWYER_REVIEW_NOTICE =
  "본 사건 패키지는 의뢰인이 공유한 사건 정리 자료입니다. AI가 정리한 사건 요약, 인터뷰 요약, 문서 초안의 기초는 법률 자문이나 최종 문서가 아니며, 변호사의 독립적인 검토와 판단을 대체하지 않습니다. 본 자료에는 의뢰인이 허용한 범위의 정보만 포함되며, 사건 패키지 열람 및 다운로드 기록은 보안과 분쟁 예방을 위해 로그로 저장될 수 있습니다.";

export const CASE_PACKAGE_AI_LAWYER_ACT_NOTICE =
  "AI법친은 변호사를 대체하지 않습니다. AI법친이 제공하는 사건 요약, 질문 정리, 문서 초안의 기초, 사건 패키지 요약본은 법률 자문이나 최종 법률문서가 아닙니다. 최종 법률 판단, 전략 수립, 문서 제출 여부, 수사·재판 대응은 반드시 변호사 또는 적법한 전문가의 검토를 거쳐야 합니다.";

export const CASE_PACKAGE_OUTPUT_EXCLUDED_NOTICE =
  "본 출력물에는 첨부파일 원문, 첨부파일 직접 URL, 내부 prompt, 인터뷰 raw JSON, 모델 raw response, snapshotJson 전체, accessToken, optionalPin이 포함되지 않습니다.";

export const CASE_PACKAGE_ALLOWED_OUTPUT_FIELDS = [
  "publicCode",
  "caseTitle",
  "caseCategory",
  "caseStatus",
  "maskedOwnerDisplayName",
  "caseSummary",
  "attachmentList",
  "documentList",
  "expiresAt",
  "safetyNotice",
  "excludedNotice",
] as const;

export const CASE_PACKAGE_FORBIDDEN_OUTPUT_FIELDS = [
  "databaseUrl",
  "accessToken",
  "accessTokenHash",
  "optionalPin",
  "optionalPinHash",
  "attachmentDirectUrl",
  "storagePath",
  "internalPrompt",
  "interviewAnswersRawJson",
  "modelRawResponse",
  "snapshotJson",
  "guardrailIssuesDetail",
  "suggestedQuestions",
] as const;

export const CASE_PACKAGE_ALLOWED_MARKETING_PHRASES = [
  "사건을 정리합니다.",
  "변호사 검토 전 자료를 준비합니다.",
  "질문 흐름에 따라 사실관계를 구조화합니다.",
  "문서 초안의 기초를 제공합니다.",
  "최종 검토는 변호사가 수행합니다.",
] as const;

export const CASE_PACKAGE_FORBIDDEN_MARKETING_PHRASES = [
  "AI가 법률상담을 제공합니다.",
  "AI가 고소장을 완성합니다.",
  "변호사 없이 해결 가능합니다.",
  "승소 가능성을 보장합니다.",
  "법률 판단을 자동으로 확정합니다.",
  "AI 변호사가 검토합니다.",
] as const;
