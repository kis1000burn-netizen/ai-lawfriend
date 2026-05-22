import type { CaseGongbuhoReviewUxModel } from "@/features/gongbuho/case-gongbuho-review-ux";

function safeStringifyPreview(value: unknown, maxChars = 8000): string {
  try {
    const s = JSON.stringify(value, null, 2);
    if (s.length <= maxChars) return s;
    return `${s.slice(0, maxChars)}\n…(truncated)`;
  } catch {
    return "(직렬화할 수 없는 값입니다.)";
  }
}

function summarizeTraceExpertReview(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((s) => s.trim())
    .slice(0, 8);
}

type CaseGongbuhoReviewCardProps = {
  model: CaseGongbuhoReviewUxModel;
};

export function CaseGongbuhoReviewCard({ model }: Readonly<CaseGongbuhoReviewCardProps>) {
  const isClient = model.viewerKind === "client";
  const isAdmin = model.viewerKind === "platform_admin";

  const displayedExpertReviewPoints =
    isClient ? model.packetExpertReviewPoints.slice(0, 2) : model.packetExpertReviewPoints;

  const cardTitle =
    model.viewerKind === "platform_admin"
      ? "공부호 적용 기준 (플랫폼 관리자)"
      : isClient
        ? "사건 정리 기준"
        : "공부호 적용 기준";

  const disclaimer =
    model.viewerKind === "platform_admin"
      ? "플랫폼 관리자용 상세 패널입니다. 패킷·Trace·문서 검토 결과는 참고 신호일 뿐이며 최종 법률 판단을 대신하지 않습니다."
      : model.viewerKind === "lawyer_staff"
        ? "공부호는 판결문이 아니라, 패킷에 정리된 검토·작성 보조 신호입니다. 변호사는 Trace·금지 규칙 후보 등을 사람이 확인해야 합니다."
        : "이 화면의 정리 안내와 체크 항목은 참고용이며 최종 법률 검토와 판단을 대신하지 않습니다. 담당 변호사의 확인이 필요합니다.";

  if (!model.hasGongbuhoSignal && isClient) {
    return (
      <section
        className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700"
        aria-label="사건 유형별 정리 기준"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          정리 기준
        </div>
        <p className="mt-2 leading-relaxed">
          아직 사건 유형에 맞춘 표준화된 정리 기준이 적용된 기록이 없습니다. AI 인터뷰 또는 담당
          변호사 안내가 진행되면 여기에 요약이 표시될 수 있습니다.
        </p>
      </section>
    );
  }

  if (!model.hasGongbuhoSignal && !isClient) {
    return (
      <section
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 shadow-sm"
        aria-label={cardTitle}
      >
        <h2 className="text-base font-semibold">{cardTitle}</h2>
        <p className="mt-2 leading-relaxed">
          Gongbuho Trace·패킷 후보·질문셋 공부호 envelope가 아직 확인되지 않습니다. 사건
          카테고리(APPROVED 공부호 후)·인터뷰 바인딩·Trace 생성 상태를 확인하세요.
          {model.resolutionReason === "CASE_TYPE_REQUIRED" ? (
            <span className="mt-2 block font-medium">
              현재 코드: CASE_TYPE_REQUIRED — 사건 카테고리 미설정으로 APPROVED 후보 조회 불가입니다.
            </span>
          ) : null}
        </p>
      </section>
    );
  }

  const operationalLabel =
    model.questionSetOperational === "operational"
      ? isClient
        ? "질문·인터뷰에 정리 표준이 연결됨"
        : "공부호 기반 질문셋 연결됨 (게시·활성)"
      : model.questionSetOperational === "not_operational"
        ? "질문셋 연결 있음 · 게시/활성 조건 불충족"
        : "질문셋 미연결";

  const contractLabel =
    model.outputContractApplied && model.outputContractSectionCount > 0
      ? `outputContract 요약 목차 ${model.outputContractSectionCount}개 적용 예정`
      : "outputContract(요약 목차) 패킷에 없거나 미반영";

  const packetFriendly = model.appliedPacketLabel
    ? isClient
      ? "유형별 정리 패키지 적용 가능 상태"
      : `Gongbuho 패킷 표시명: ${model.appliedPacketLabel}`
    : isClient
      ? "패키지 식별자는 내부 검토 후 확정됩니다"
      : "적용 패킷 라벨을 아직 특정하지 못했습니다";

  const traceLine =
    model.latestTrace &&
    `${model.latestTrace.code} v${model.latestTrace.version} · Trace ${model.latestTrace.id.slice(0, 8)}… · ${new Date(model.latestTrace.createdAt).toLocaleString("ko-KR")}${
      model.latestTrace.humanApprovalStatus
        ? ` · 승인상태 ${model.latestTrace.humanApprovalStatus}`
        : ""
    }`;

  const forbiddenLine =
    model.documentRules.forbiddenHitCount > 0
      ? `forbiddenRules 위험 후보 ${model.documentRules.forbiddenHitCount}건`
      : "forbiddenRules 위험 후보 없음(초안 검토 결과)";

  return (
    <section
      className="rounded-2xl border bg-white p-5 shadow-sm"
      aria-label={cardTitle}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{cardTitle}</h2>
          {model.questionSetTitle ? (
            <div className="mt-1 text-xs text-slate-500">{model.questionSetTitle}</div>
          ) : null}
        </div>
        <div className="rounded-xl border bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {isAdmin && model.caseType ? <div>카테고리 매칭용 caseType: {model.caseType}</div> : null}
          {!isClient && model.selectionPolicy ? (
            <div>후보 선택 정책: {model.selectionPolicy}</div>
          ) : null}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border bg-slate-50 p-4">
          <dt className="text-xs font-medium text-slate-500">
            {isClient ? "정리 패키지" : "적용 패킷 / 정체성"}
          </dt>
          <dd className="mt-1 font-semibold text-slate-900">{packetFriendly}</dd>
          {!isClient && model.latestTrace ? (
            <div className="mt-2 text-xs text-slate-600">
              패킷 id:{" "}
              <span className="font-mono text-[11px]">{model.latestTrace.gongbuhoPacketId}</span>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <dt className="text-xs font-medium text-slate-500">
            {isClient ? "질문 진행 표준" : "질문셋 상태"}
          </dt>
          <dd className="mt-1 font-semibold text-slate-900">{operationalLabel}</dd>
          {!isClient && model.questionSetTitle ? (
            <div className="mt-1 text-xs text-slate-600">제목 {model.questionSetTitle}</div>
          ) : null}
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <dt className="text-xs font-medium text-slate-500">요약(outputContract)</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {model.outputContractApplied ? "패킷 outputContract(summary) 존재" : "패킷 outputContract(summary) 미적용"}
          </dd>
          <div className="mt-1 text-xs text-slate-600">{contractLabel}</div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <dt className="text-xs font-medium text-slate-500">
            {isClient ? "문서 자동 검토 표시" : "문서 규칙(gongbuhoDocumentRules)"}
          </dt>
          <dd className="mt-1 font-semibold text-slate-900">
            validation 규칙·체크 {model.documentRules.validationPendingCount}건{" "}
            {model.documentRules.applied ? "(스냅샷 평가됨)" : "(패킷 정의 또는 문서 평가 대기)"}
          </dd>
          <div className="mt-1 text-xs text-slate-600">{forbiddenLine}</div>
          <div className="mt-1 text-xs text-slate-600">
            문서 riskFlags 신호 {model.documentRules.documentRiskFlagCount}건
          </div>
          {!isClient && model.latestTrace ? (
            <div className="mt-1 text-xs text-slate-600">
              Trace riskFlags 카운트 {model.latestTrace.riskFlagsCount}건 (최근 Trace 행 요약)
            </div>
          ) : null}
        </div>
      </dl>

      {!isClient && traceLine ? (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs leading-relaxed text-indigo-950">
          <span className="font-semibold">Latest Trace</span>
          <div className="mt-1 whitespace-pre-wrap break-all font-mono text-[11px]">{traceLine}</div>
        </div>
      ) : null}

      {!isClient ? (
        <div className="mt-4 rounded-xl border p-4 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            APPROVED 후보 패킷 요약 (Trace 반영 포함)
          </div>
          {model.candidates.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              카테고리 기준 후보 패킷이 없습니다.{model.caseType === null ? " caseType 필요." : ""}
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-xs text-slate-800">
              {model.candidates.map((c) => (
                <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-mono">{c.code}</span> · v<span className="font-mono">{c.version}</span>{" "}
                  <span className="text-slate-600">{c.name}</span>
                  <div className="mt-1 text-[11px] text-slate-500">
                    traceApplied: {String(c.traceApplied)} · draft 질문셋 스캔:
                    {String(c.questionSetDraftProjected)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : model.outputContractApplied ? (
        <div className="mt-4 rounded-xl border bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
          사건 유형별 요약 목차 규격이 패킷과 연결되어 있습니다. 「사건 진단 카드」「요약」화면과 함께
          활용하면 정리 상태를 빠르게 확인할 수 있습니다.
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50/60 p-4 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-purple-900">
          전문가 검토 포인트 (패킷 또는 문서 스냅샷 기준 표시 카운트:{" "}
          {model.documentRules.expertReviewPointCount}건)
        </div>
        <ul className="mt-2 list-decimal space-y-1 ps-5 text-purple-950">
          {displayedExpertReviewPoints.length === 0 &&
          model.documentRules.expertReviewPointCount === 0 ? (
            <li className="list-none ps-0 text-slate-600">
              패킷 또는 문서 검토 결과에 검토 포인트가 비어 있습니다.
            </li>
          ) : null}
          {displayedExpertReviewPoints.length === 0 &&
          model.documentRules.expertReviewPointCount > 0 ? (
            <li className="list-none ps-0 text-slate-600">
              표시 문자열 목록 없음 · 문서/패킷 카운트 {model.documentRules.expertReviewPointCount}건(요약 카드).
            </li>
          ) : null}
          {displayedExpertReviewPoints.map((p, idx) => (
            <li key={`${idx}-${p.slice(0, 40)}`} className="leading-relaxed">
              {isClient ? (p.length > 120 ? `${p.slice(0, 120)}…` : p) : p}
            </li>
          ))}
        </ul>
        {isClient && model.packetExpertReviewPoints.length > 2 ? (
          <div className="mt-2 text-xs text-purple-900/80">
            나머지는 담당 변호사에게 문의하거나 문서 초안 작성 후 안내합니다.
          </div>
        ) : null}
      </div>

      {isAdmin && model.traceExpertReviewPoints ? (
        <div className="mt-3 rounded-xl border p-4 text-xs text-slate-800">
          <div className="font-semibold text-slate-900">Trace.expertReviewPoints (JSON 원문 분해)</div>
          <ul className="mt-2 space-y-1">
            {summarizeTraceExpertReview(model.traceExpertReviewPoints).map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {isAdmin ? (
        <details className="mt-4 rounded-xl border bg-slate-900/5">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            packetJson 미리보기 / Trace.validationResult
          </summary>
          <div className="border-t px-4 py-3 text-xs leading-relaxed text-slate-800">
            {model.packetJsonPreview ? (
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded bg-white p-3 font-mono text-[11px] text-slate-900">
                {model.packetJsonPreview}
              </pre>
            ) : (
              <p>packetJson 미리보기를 만들 수 없습니다.</p>
            )}
            <div className="mt-4 font-semibold text-slate-900">Trace.validationResult</div>
            <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap break-all rounded bg-white p-3 font-mono text-[11px] text-slate-900">
              {safeStringifyPreview(model.traceValidationResult)}
            </pre>
            {model.documentRules.present ? (
              <p className="mt-3 text-[11px] text-slate-600">
                최신 스냅샷 참조 문서: {model.documentRules.sourceDocumentTitle ?? "(미상)"}{" "}
                v{model.documentRules.versionNo ?? "?"}
              </p>
            ) : (
              <p className="mt-3 text-[11px] text-slate-600">저장된 LegalDocument 버전 스냅샷 없음.</p>
            )}
          </div>
        </details>
      ) : null}

      <blockquote className="mt-6 border-l-4 border-slate-300 pl-4 text-sm italic text-slate-700">
        {disclaimer}
      </blockquote>

      {!isAdmin && (
        <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
          참고 안내 문구 공통: Gongbuho는 플랫폼이 제공하는 패킷 신호입니다. 결과는 사람의 법적 최종판단과
          다를 수 있습니다.
        </p>
      )}
    </section>
  );
}
