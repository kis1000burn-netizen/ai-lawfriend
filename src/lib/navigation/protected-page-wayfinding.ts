export type FlowPreviousStep = {
  href: string;
  label: string;
};

export type ProtectedPageWayfindingModel = {
  show: boolean;
  caseId?: string;
  showCaseDetailLink: boolean;
  showCasesListLink: boolean;
  currentHint?: string;
  previousStep?: FlowPreviousStep;
};

const CASE_SUBPAGE_LABELS: Record<string, string> = {
  interview: "AI 인터뷰",
  edit: "사건 수정",
  guidance: "사건 진단",
  share: "공유",
  supplement: "보완 안내",
  "intelligence-review": "사건 인텔리전스 검토",
  "client-disclosure-preview": "의뢰인 공개 미리보기",
  documents: "문서",
};

const PROTECTED_HUB_PATHS = new Set(["/dashboard", "/cases"]);
const LAWYER_HUB_PATHS = new Set(["/lawyer", "/lawyer/verification-pending"]);
const ADMIN_HUB_PATHS = new Set(["/admin"]);

function resolveCaseWayfinding(pathname: string): ProtectedPageWayfindingModel | null {
  const caseMatch = pathname.match(/^\/cases\/([^/]+)(?:\/(.*))?$/);
  if (!caseMatch) return null;

  const caseId = caseMatch[1];
  if (caseId === "new") {
    return {
      show: true,
      showCaseDetailLink: false,
      showCasesListLink: true,
      currentHint: "새 사건 등록",
      previousStep: { href: "/cases", label: "내 사건" },
    };
  }

  const rest = caseMatch[2] ?? "";
  const firstSegment = rest.split("/").filter(Boolean)[0];
  const nestedLabel =
    firstSegment === "documents" && rest.includes("/")
      ? "문서 상세"
      : firstSegment
        ? (CASE_SUBPAGE_LABELS[firstSegment] ?? firstSegment)
        : "사건 상세";

  return {
    show: true,
    caseId,
    showCaseDetailLink: rest.length > 0,
    showCasesListLink: true,
    currentHint: nestedLabel,
    previousStep: resolveCaseFlowPreviousStep(caseId, rest),
  };
}

/** 사건 접수·인터뷰·문서 흐름 — 이전 단계 (표시 전용, 상태 전이 없음) */
function resolveCaseFlowPreviousStep(
  caseId: string,
  rest: string,
): FlowPreviousStep | undefined {
  if (!rest) {
    return { href: `/cases/${caseId}/interview`, label: "AI 인터뷰" };
  }

  const segments = rest.split("/").filter(Boolean);
  const first = segments[0];

  if (first === "edit") {
    return { href: `/cases/${caseId}`, label: "사건 상세" };
  }
  if (first === "interview") {
    return { href: `/cases/${caseId}/edit`, label: "사건 수정" };
  }
  if (
    first === "guidance" ||
    first === "supplement" ||
    first === "intelligence-review" ||
    first === "client-disclosure-preview"
  ) {
    return { href: `/cases/${caseId}`, label: "사건 상세" };
  }
  if (first === "share") {
    if (segments[1]) {
      return { href: `/cases/${caseId}/share`, label: "공유 관리" };
    }
    return { href: `/cases/${caseId}`, label: "사건 상세" };
  }
  if (first === "documents") {
    if (segments[1] === "new") {
      return { href: `/cases/${caseId}`, label: "사건 상세" };
    }
    if (segments[1]) {
      return { href: `/cases/${caseId}/documents/new`, label: "문서 초안 생성" };
    }
  }

  return { href: `/cases/${caseId}`, label: "사건 상세" };
}

export function resolveFlowPreviousStep(pathname: string): FlowPreviousStep | undefined {
  if (pathname === "/cases/new") {
    return { href: "/cases", label: "내 사건" };
  }

  const caseMatch = pathname.match(/^\/cases\/([^/]+)(?:\/(.*))?$/);
  if (caseMatch) {
    const caseId = caseMatch[1];
    if (caseId === "new") {
      return { href: "/cases", label: "내 사건" };
    }
    return resolveCaseFlowPreviousStep(caseId, caseMatch[2] ?? "");
  }

  const caseDocumentMatch = pathname.match(
    /^\/cases\/([^/]+)\/documents\/([^/]+)(?:\/(.*))?$/,
  );
  if (caseDocumentMatch) {
    const [, caseId, documentId, tail] = caseDocumentMatch;
    if (tail === "print") {
      return {
        href: `/cases/${caseId}/documents/${documentId}`,
        label: "문서 상세",
      };
    }
    return { href: `/cases/${caseId}/documents/new`, label: "문서 초안 생성" };
  }

  const docPrintMatch = pathname.match(/^\/documents\/([^/]+)\/print$/);
  if (docPrintMatch) {
    return {
      href: `/documents/${docPrintMatch[1]}`,
      label: "문서 상세",
    };
  }

  const docMatch = pathname.match(/^\/documents\/([^/]+)$/);
  if (docMatch) {
    return { href: "/cases", label: "내 사건" };
  }

  const lawyerBriefMatch = pathname.match(/^\/lawyer\/legal-knowledge\/reviews\/([^/]+)$/);
  if (lawyerBriefMatch) {
    return { href: "/lawyer/legal-knowledge/reviews", label: "검수 목록" };
  }

  const lawyerPackageMatch = pathname.match(/^\/lawyer\/case-packages\/([^/]+)$/);
  if (lawyerPackageMatch && lawyerPackageMatch[1] !== "lookup") {
    return { href: "/lawyer/case-packages/lookup", label: "사건 고유번호 조회" };
  }

  const adminNestedMatch = pathname.match(/^\/admin\/([^/]+)\/([^/]+)(?:\/(.*))?$/);
  if (adminNestedMatch) {
    const [, section, idOrSub] = adminNestedMatch;
    if (idOrSub === "predeploy-check") {
      return { href: `/admin/${section}`, label: "목록" };
    }
    if (section === "alerts" && idOrSub === "bulk-jobs") {
      const tail = adminNestedMatch[3];
      if (tail?.startsWith("schedules/")) {
        return { href: "/admin/alerts/bulk-jobs/schedules", label: "예약 목록" };
      }
      if (tail?.match(/^[^/]+$/)) {
        return { href: "/admin/alerts/bulk-jobs", label: "Bulk Jobs" };
      }
    }
    return { href: `/admin/${section}`, label: "목록" };
  }

  return undefined;
}

export function resolveProtectedPageWayfinding(
  pathname: string,
  hubPaths: ReadonlySet<string> = PROTECTED_HUB_PATHS,
): ProtectedPageWayfindingModel {
  if (hubPaths.has(pathname)) {
    return { show: false, showCaseDetailLink: false, showCasesListLink: false };
  }

  const caseModel = resolveCaseWayfinding(pathname);
  if (caseModel) return caseModel;

  if (pathname.startsWith("/documents/")) {
    return {
      show: true,
      showCaseDetailLink: false,
      showCasesListLink: true,
      currentHint: pathname.includes("/print") ? "문서 인쇄" : "문서 상세",
      previousStep: resolveFlowPreviousStep(pathname),
    };
  }

  const depth = pathname.split("/").filter(Boolean).length;
  if (depth >= 2) {
    return {
      show: true,
      showCaseDetailLink: false,
      showCasesListLink: pathname.includes("/cases/") || pathname.startsWith("/cases/"),
      currentHint: undefined,
      previousStep: resolveFlowPreviousStep(pathname),
    };
  }

  return { show: false, showCaseDetailLink: false, showCasesListLink: false };
}

export function resolveLawyerPageWayfinding(pathname: string): ProtectedPageWayfindingModel {
  if (LAWYER_HUB_PATHS.has(pathname)) {
    return { show: false, showCaseDetailLink: false, showCasesListLink: false };
  }

  if (pathname.startsWith("/lawyer/")) {
    const rest = pathname.replace(/^\/lawyer\/?/, "");
    const firstSegment = rest.split("/").filter(Boolean)[0];
    return {
      show: true,
      showCaseDetailLink: false,
      showCasesListLink: false,
      currentHint: firstSegment ?? undefined,
      previousStep: resolveFlowPreviousStep(pathname),
    };
  }

  return resolveProtectedPageWayfinding(pathname);
}

export function resolveAdminPageWayfinding(pathname: string): ProtectedPageWayfindingModel {
  if (ADMIN_HUB_PATHS.has(pathname)) {
    return { show: false, showCaseDetailLink: false, showCasesListLink: false };
  }

  if (pathname.startsWith("/admin/")) {
    const segments = pathname.split("/").filter(Boolean);
    return {
      show: true,
      showCaseDetailLink: false,
      showCasesListLink: false,
      currentHint: segments.length >= 2 ? segments[segments.length - 1] : undefined,
      previousStep: resolveFlowPreviousStep(pathname),
    };
  }

  return { show: false, showCaseDetailLink: false, showCasesListLink: false };
}
