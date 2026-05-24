import type {
  Case,
  CaseAttachment,
  CasePackageShare,
  LegalDocument,
  User,
} from "@prisma/client";
import type { CasePackageDto } from "@/features/case-package/case-package-dto";


type ShareForSummary = CasePackageShare & {
  case: Case & {
    attachments?: CaseAttachment[];
    legalDocuments?: LegalDocument[];
  };
  owner?: Pick<User, "id" | "name" | "email" | "phone"> | null;
  lawyer?: Pick<User, "id" | "name" | "email" | "phone"> | null;
};

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "미기입";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatBoolean(value: boolean): string {
  return value ? "허용" : "비허용";
}

function formatBytes(value: number | null | undefined): string {
  const size = Number(value ?? 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function renderCasePackageSummaryHtml(
  share: ShareForSummary,
  options?: {
    verifiedSnapshot?: CasePackageDto | null;
  },
): string {
  const dto = options?.verifiedSnapshot ?? null;

  const attachments: Array<{
    originalName: string;
    mimeType: string | null;
    sizeBytes: number | null;
    category: string | null;
  }> = share.allowAttachmentList
    ? dto
      ? dto.attachments.map((a) => ({
          originalName: a.filename,
          mimeType: a.mimeType ?? null,
          sizeBytes: a.sizeBytes ?? null,
          category: a.category ?? a.mimeType ?? null,
        }))
      : (share.case.attachments ?? []).map((a) => ({
          originalName: a.originalName,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          category: a.category ?? null,
        }))
    : [];

  const documentRows: Array<{ title: string; typeLabel: string; status: string }> =
    share.allowDocumentDraft
      ? dto
        ? dto.documents.map((d) => ({
            title: d.title,
            typeLabel: "—",
            status: d.status,
          }))
        : (share.case.legalDocuments ?? []).map((document) => ({
            title: document.title,
            typeLabel: document.type,
            status: document.status,
          }))
      : [];

  const caseTitle = dto?.caseInfo.title ?? share.case.title;
  const caseCategory = dto?.caseInfo.caseType ?? share.case.category;
  const caseStatus = dto?.caseInfo.status ?? share.case.status;

  const summaryBody = share.allowSummary
    ? dto
      ? dto.summary.shortSummary
      : share.case.description || "공유된 사건 요약이 아직 없습니다."
    : null;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>AI법친 사건 패키지 요약본</title>
  <style>
    @page {
      size: A4;
      margin: 18mm;
    }

    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.65;
    }

    .page {
      max-width: 860px;
      margin: 0 auto;
    }

    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }

    .eyebrow {
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: 0.02em;
    }

    h1 {
      font-size: 28px;
      margin: 8px 0 8px;
      letter-spacing: -0.04em;
    }

    h2 {
      font-size: 18px;
      margin: 28px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    .notice {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      color: #9a3412;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 13px;
      margin: 16px 0 24px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      break-inside: avoid;
    }

    .label {
      font-size: 11px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .value {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      white-space: pre-wrap;
    }

    .summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 13px;
      white-space: pre-wrap;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
    }

    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 11px;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="page">
    <section class="header">
      <div class="eyebrow">AI법친 사건 패키지</div>
      <h1>변호사 검토용 사건 패키지 요약본</h1>
      <div class="badge">${escapeHtml(share.publicCode)}</div>
    </section>

    <section class="notice">
      이 요약본은 의뢰인이 입력한 사실관계와 AI 정리 결과를 기반으로 구성된 변호사 검토용 자료입니다.
      AI 정리 내용은 법률 자문, 소송 대리, 사건 수임 또는 최종 법률 판단이 아닙니다.
      최종 법률 판단과 문서 사용 여부는 변호사 또는 적법한 전문가의 검토를 거쳐야 합니다.
    </section>

    <h2>1. 공유 정보</h2>
    <div class="grid">
      <div class="item"><div class="label">사건 고유번호</div><div class="value">${escapeHtml(share.publicCode)}</div></div>
      <div class="item"><div class="label">공유 상태</div><div class="value">${escapeHtml(share.status)}</div></div>
      <div class="item"><div class="label">공유 방식</div><div class="value">${escapeHtml(share.shareMode)}</div></div>
      <div class="item"><div class="label">공유 만료일</div><div class="value">${formatDate(share.expiresAt)}</div></div>
      <div class="item"><div class="label">공유 생성일</div><div class="value">${formatDate(share.createdAt)}</div></div>
      <div class="item"><div class="label">동의 일시</div><div class="value">${formatDate(share.consentedAt)}</div></div>
    </div>

    <h2>2. 사건 기본 정보</h2>
    <div class="grid">
      <div class="item"><div class="label">사건 제목</div><div class="value">${escapeHtml(caseTitle)}</div></div>
      <div class="item"><div class="label">사건 유형</div><div class="value">${escapeHtml(caseCategory ?? "미분류")}</div></div>
      <div class="item"><div class="label">사건 상태</div><div class="value">${escapeHtml(caseStatus)}</div></div>
      <div class="item"><div class="label">사건 발생일</div><div class="value">${formatDate(share.case.incidentDate)}</div></div>
      <div class="item"><div class="label">상대방</div><div class="value">${share.allowOpponentDetail ? escapeHtml(share.case.opponentName) : "비공개"}</div></div>
      <div class="item"><div class="label">의뢰인</div><div class="value">${share.allowClientContact ? escapeHtml(share.owner?.name) : "비공개"}</div></div>
    </div>

    <h2>3. 사건 요약</h2>
    ${share.allowSummary ? `<div class="summary">${escapeHtml(summaryBody ?? "")}</div>` : `<div class="summary">의뢰인이 사건 요약 열람을 허용하지 않았습니다.</div>`}

    <h2>4. 공유 범위</h2>
    <table>
      <thead><tr><th>항목</th><th>허용 여부</th></tr></thead>
      <tbody>
        <tr><td>사건 요약</td><td>${formatBoolean(share.allowSummary)}</td></tr>
        <tr><td>AI 인터뷰</td><td>${formatBoolean(share.allowInterview)}</td></tr>
        <tr><td>첨부자료 목록</td><td>${formatBoolean(share.allowAttachmentList)}</td></tr>
        <tr><td>첨부파일 다운로드</td><td>${formatBoolean(share.allowAttachmentDownload)}</td></tr>
        <tr><td>문서 초안</td><td>${formatBoolean(share.allowDocumentDraft)}</td></tr>
        <tr><td>문서 PDF</td><td>${formatBoolean(share.allowDocumentPdf)}</td></tr>
        <tr><td>사건 패키지 요약본 출력</td><td>${formatBoolean(share.allowPackagePdf)}</td></tr>
        <tr><td>의뢰인 연락처</td><td>${formatBoolean(share.allowClientContact)}</td></tr>
        <tr><td>상대방 상세 정보</td><td>${formatBoolean(share.allowOpponentDetail)}</td></tr>
      </tbody>
    </table>

    <h2>5. 첨부자료 목록</h2>
    ${attachments.length > 0 ? `<table><thead><tr><th>파일명</th><th>유형</th><th>크기</th><th>다운로드</th></tr></thead><tbody>${attachments.map((attachment) => `
      <tr>
        <td>${escapeHtml(attachment.originalName)}</td>
        <td>${escapeHtml(attachment.category || attachment.mimeType)}</td>
        <td>${formatBytes(attachment.sizeBytes)}</td>
        <td>${share.allowAttachmentDownload ? "허용" : "비허용"}</td>
      </tr>`).join("")}</tbody></table>` : `<div class="summary">공유된 첨부자료 목록이 없습니다.</div>`}

    <h2>6. 문서 초안</h2>
    ${documentRows.length > 0 ? `<table><thead><tr><th>문서명</th><th>유형</th><th>상태</th><th>PDF</th></tr></thead><tbody>${documentRows.map((document) => `
      <tr>
        <td>${escapeHtml(document.title)}</td>
        <td>${escapeHtml(document.typeLabel)}</td>
        <td>${escapeHtml(document.status)}</td>
        <td>${share.allowDocumentPdf ? "허용" : "비허용"}</td>
      </tr>`).join("")}</tbody></table>` : `<div class="summary">공유된 문서 초안이 없습니다.</div>`}

    <section class="footer">
      <p>출력 기준일: ${formatDate(new Date())}</p>
      <p>본 자료는 AI법친 사건 패키지 공유 범위에 따라 생성된 검토용 요약본입니다.</p>
      <p>최종 법률 판단과 문서 사용 여부는 변호사 또는 적법한 전문가의 검토를 거쳐야 합니다.</p>
    </section>
  </div>
</body>
</html>`;
}