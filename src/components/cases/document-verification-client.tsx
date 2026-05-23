"use client";

import { useCallback, useEffect, useState } from "react";
import { DocumentGuardrailTracePanel } from "@/components/documents/document-guardrail-trace-panel";
import { requireOkData } from "@/lib/client/api-error";
import {
  assertDocumentVerificationResult,
  type DocumentVerificationVerifyResult,
} from "@/lib/client/parse-document-verification-response";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatProvider(provider?: string | null) {
  const labels: Record<string, string> = {
    INTERNAL_STANDARD: "내부 표준",
    GOVERNMENT24: "정부24",
    SUPREME_COURT: "대한민국 법원",
    PROSECUTION: "검찰",
    POLICE: "경찰",
    MINISTRY_OF_JUSTICE: "법무부",
    OTHER: "기타",
  };

  if (!provider) return "-";
  return labels[provider] ?? provider;
}

function formatSourceStatus(status?: string | null) {
  const labels: Record<string, string> = {
    ACTIVE: "활성",
    INACTIVE: "비활성",
    ARCHIVED: "보관",
  };

  if (!status) return "-";
  return labels[status] ?? status;
}

export default function DocumentVerificationClient() {
  const [verificationCode, setVerificationCode] = useState("");
  const [result, setResult] = useState<DocumentVerificationVerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (codeOverride?: string, currentInput?: string) => {
    const code = (codeOverride ?? currentInput ?? "").trim();

    if (!code) {
      setError("검증코드를 입력해주세요.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/document-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationCode: code,
        }),
      });

      const raw = await res.json().catch(() => null);
      const data = requireOkData<unknown>(
        res,
        raw,
        "문서 검증에 실패했습니다.",
      );

      setResult(assertDocumentVerificationResult(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "문서 검증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const code = params.get("code");

    if (code) {
      setVerificationCode(code);
      void verify(code, code);
    }
  }, [verify]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:py-10">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold tracking-tight text-aibeop-text sm:text-3xl">
              문서 검증
            </h1>
            <p className="mt-2 text-sm leading-6 text-aibeop-muted">
              승인본 PDF 또는 출력본의 검증코드를 입력하거나, QR 코드를 스캔해 접속하면 해당
              문서가 실제 승인 잠금 버전 기준 문서인지 확인할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="검증코드를 입력하세요"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => void verify(undefined, verificationCode)}
              disabled={loading}
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "검증 중..." : "검증하기"}
            </button>
          </div>

          <div className="mt-3 rounded-2xl bg-neutral-50 px-4 py-3 text-xs leading-5 text-aibeop-subtle">
            모바일에서는 PDF 하단의 QR 코드를 스캔하면 검증코드가 자동 입력된 상태로 열립니다.
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </section>

        {result?.isValid ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-semibold text-emerald-800">유효한 승인본입니다.</div>
                <p className="mt-1 text-sm text-emerald-700">
                  입력된 검증코드는 실제 승인 잠금 버전과 일치합니다.
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                VERIFIED
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-aibeop-subtle">문서명</div>
                <div className="mt-1 text-sm font-semibold text-aibeop-text sm:text-base">
                  {result.document.title}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-aibeop-subtle">사건명</div>
                <div className="mt-1 text-sm font-semibold text-aibeop-text sm:text-base">
                  {result.document.caseTitle || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-aibeop-subtle">사건번호</div>
                <div className="mt-1 text-sm font-semibold text-aibeop-text sm:text-base">
                  {result.document.caseNumber || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-aibeop-subtle">승인 기준 버전</div>
                <div className="mt-1 text-sm font-semibold text-aibeop-text sm:text-base">
                  v{result.approvedVersion.versionNumber}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-aibeop-subtle">승인자</div>
                <div className="mt-1 text-sm font-semibold text-aibeop-text sm:text-base">
                  {result.approver.name || "-"}{" "}
                  {result.approver.role ? `(${result.approver.role})` : ""}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-aibeop-subtle">승인 시각</div>
                <div className="mt-1 text-sm font-semibold text-aibeop-text sm:text-base">
                  {formatDateTime(result.approver.approvedAt)}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 sm:col-span-2">
                <div className="text-xs text-aibeop-subtle">검증코드</div>
                <div className="mt-2 break-all font-mono text-sm font-semibold tracking-wide text-aibeop-text">
                  {result.verificationCode}
                </div>
                <div className="mt-3 break-all text-[11px] leading-5 text-aibeop-subtle">
                  {result.fullHash}
                </div>
              </div>

              {result.sourceTrace ? (
                <div className="rounded-2xl bg-white p-4 sm:col-span-2">
                  <div className="text-xs text-aibeop-subtle">참조 공식서식 / 내부표준</div>
                  <div className="mt-1 text-sm font-semibold text-aibeop-text sm:text-base">
                    {result.sourceTrace.templateTitle}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-aibeop-subtle">템플릿 버전</div>
                      <div className="mt-1 text-sm text-aibeop-text">
                        {result.sourceTrace.templateCode} v{result.sourceTrace.templateVersion}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-aibeop-subtle">출처 구분</div>
                      <div className="mt-1 text-sm text-aibeop-text">
                        {formatProvider(result.sourceTrace.sourceProvider)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-aibeop-subtle">출처명</div>
                      <div className="mt-1 text-sm text-aibeop-text">
                        {result.sourceTrace.sourceName || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-aibeop-subtle">출처 상태</div>
                      <div className="mt-1 text-sm text-aibeop-text">
                        {formatSourceStatus(result.sourceTrace.sourceStatus)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-aibeop-subtle">생성 스냅샷 시각</div>
                      <div className="mt-1 text-sm text-aibeop-text">
                        {formatDateTime(result.sourceTrace.generatedSnapshotAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-aibeop-subtle">승인 스냅샷 시각</div>
                      <div className="mt-1 text-sm text-aibeop-text">
                        {formatDateTime(result.sourceTrace.approvedSnapshotAt)}
                      </div>
                    </div>
                  </div>
                  {result.sourceTrace.sourceUrl ? (
                    <a
                      href={result.sourceTrace.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-medium text-aibeop-subtle underline underline-offset-2"
                    >
                      원문 출처 열기
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <DocumentGuardrailTracePanel
                guardrailTrace={result.guardrailTrace}
                title="검증된 문서의 AI 생성 안전검사 이력"
              />
            </div>
          </section>
        ) : null}

        {result && !result.isValid ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-semibold text-rose-800">유효하지 않은 문서입니다.</div>
                <p className="mt-1 text-sm text-rose-700">
                  입력된 검증코드와 일치하는 승인 잠금 버전을 찾지 못했습니다.
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                INVALID
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <div className="text-xs text-aibeop-subtle">입력 코드</div>
              <div className="mt-2 break-all font-mono text-sm font-semibold tracking-wide text-aibeop-text">
                {result.verificationCode}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
