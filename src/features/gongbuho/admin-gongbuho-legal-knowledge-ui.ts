export type LegalKnowledgeAdminViewer = {
  role: string;
};

export function legalKnowledgeIntakeStatusBadgeClass(status: string): string {
  switch (status) {
    case "READY_FOR_RESEARCH":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "RESEARCH_IN_PROGRESS":
    case "LAWYER_REVIEW_PENDING":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "PACKET_DRAFT_LINKED":
    case "PACKET_APPROVED":
      return "bg-violet-50 text-violet-800 ring-violet-200";
    case "PIPELINE_REJECTED":
    case "REJECTED":
      return "bg-red-50 text-red-800 ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export function legalKnowledgeBriefStatusBadgeClass(status: string): string {
  switch (status) {
    case "READY_FOR_LAWYER_REVIEW":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    case "REVISION_REQUESTED":
      return "bg-orange-50 text-orange-900 ring-orange-200";
    case "ARCHIVED":
    case "SUPERSEDED":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-50 text-slate-800 ring-slate-200";
  }
}

export function readNormalizedKeywordFromIntake(querySignature: unknown): string {
  if (typeof querySignature !== "object" || querySignature === null) return "—";
  const v = (querySignature as Record<string, unknown>).normalizedKeyword;
  return typeof v === "string" && v.trim() ? v.trim() : "—";
}

export function readMappedCaseTypeFromIntake(caseTypeMapping: unknown): string | null {
  if (typeof caseTypeMapping !== "object" || caseTypeMapping === null) return null;
  const v = (caseTypeMapping as Record<string, unknown>).mappedCaseType;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function deriveLegalKnowledgeAdminCapabilities(viewer: LegalKnowledgeAdminViewer) {
  const isPlatformAdmin =
    viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN";
  const isLawyer = viewer.role === "LAWYER";
  const isStaff = viewer.role === "STAFF";

  return {
    canRead: isStaff || isPlatformAdmin || isLawyer,
    canWriteIntakeOrBrief: isPlatformAdmin,
    canRecordLawyerReview: isLawyer || isPlatformAdmin,
    canCompilePacketDraft: isPlatformAdmin,
    staffReadOnlyBanner: isStaff
      ? "Research Brief 생성·ready-for-review·compile은 ADMIN 이상만 가능합니다. Lawyer Review는 LAWYER 또는 ADMIN 위임만 기록할 수 있습니다."
      : null,
  };
}

export function canCreateResearchBriefForIntake(status: string): boolean {
  return status === "READY_FOR_RESEARCH" || status === "RESEARCH_IN_PROGRESS";
}

export function canMarkBriefReadyForReview(status: string): boolean {
  return status === "DRAFT" || status === "REVISION_REQUESTED";
}

export function canRecordLawyerReviewOnBrief(status: string): boolean {
  return status === "READY_FOR_LAWYER_REVIEW";
}

export function countCanonicalSourceRefs(canonicalSourceRefs: unknown): number {
  return Array.isArray(canonicalSourceRefs) ? canonicalSourceRefs.length : 0;
}
