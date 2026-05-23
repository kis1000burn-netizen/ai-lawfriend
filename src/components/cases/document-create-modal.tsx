"use client";

import { useMemo, useState } from "react";
import { DocumentGenerationGuardrailErrorPanel } from "@/components/documents/document-generation-guardrail-error-panel";
import {
  DocumentGenerationSupplementRequestPanel,
  type GuardrailSuggestion,
  type GuardrailTraceCandidate,
  type SupplementRequestDraft,
} from "@/components/documents/document-generation-supplement-request-panel";
import { DocumentGenerationWarningPanel } from "@/components/documents/document-generation-warning-panel";
import { requireOkData } from "@/lib/client/api-error";

type MissingWarningField = {
  fieldKey: string;
  label: string;
  severity: "WARNING" | "BLOCKING";
  suggestedQuestions?: string[];
};

type GuardrailGenerationError = {
  code: "DOCUMENT_GENERATION_GUARDRAIL_VIOLATION";
  message: string;
  issues?: string[];
  suggestedQuestions?: string[];
  suggestions?: GuardrailSuggestion[];
  guardrailTrace?: GuardrailTraceCandidate | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  caseId: string;
  interviewCompleted: boolean;
  onCreated: () => Promise<void> | void;
};

const DOCUMENT_OPTIONS = [
  {
    type: "STATEMENT",
    label: "진술서",
    questionSetCode: "STATEMENT_DEFAULT_V1",
    questionSetVersion: "1.0.0",
    templateCode: "STATEMENT_TEMPLATE_V1",
    templateVersion: "1.0.0",
  },
  {
    type: "OPINION",
    label: "의견서",
    questionSetCode: "STATEMENT_DEFAULT_V1",
    questionSetVersion: "1.0.0",
    templateCode: "OPINION_TEMPLATE_V1",
    templateVersion: "1.0.0",
  },
  {
    type: "CONSULT_NOTE",
    label: "상담기록서",
    questionSetCode: "STATEMENT_DEFAULT_V1",
    questionSetVersion: "1.0.0",
    templateCode: "CONSULT_NOTE_TEMPLATE_V1",
    templateVersion: "1.0.0",
  },
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeMissingWarningFields(value: unknown): MissingWarningField[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const record = asRecord(item);
    const severity = record.severity;

    if (severity !== "WARNING" && severity !== "BLOCKING") {
      return [];
    }

    return [
      {
        fieldKey: typeof record.fieldKey === "string" ? record.fieldKey : "unknown",
        label: typeof record.label === "string" ? record.label : "미확인 항목",
        severity,
        suggestedQuestions: normalizeStringArray(record.suggestedQuestions),
      },
    ];
  });
}

function normalizeGuardrailSuggestions(value: unknown): GuardrailSuggestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const record = asRecord(item);

    return [
      {
        type: typeof record.type === "string" ? record.type : "UNCLASSIFIED",
        issue: typeof record.issue === "string" ? record.issue : "안전 정책 위반 항목",
        suggestedQuestions: normalizeStringArray(record.suggestedQuestions),
      },
    ];
  });
}

function normalizeGuardrailCheckStatus(
  value: unknown,
): GuardrailTraceCandidate["guardrailCheckStatus"] | null {
  if (value === "PASSED" || value === "FAILED" || value === "SKIPPED") {
    return value;
  }

  return null;
}

function normalizeWarningMissingFields(
  value: unknown,
): GuardrailTraceCandidate["warningMissingFields"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const record = asRecord(item);

    if (
      typeof record.fieldKey !== "string" ||
      typeof record.label !== "string" ||
      record.severity !== "WARNING"
    ) {
      return [];
    }

    return [
      {
        fieldKey: record.fieldKey,
        label: record.label,
        severity: "WARNING",
        suggestedQuestions: normalizeStringArray(record.suggestedQuestions),
      },
    ];
  });
}

function normalizeGuardrailTraceCandidate(value: unknown): GuardrailTraceCandidate | null {
  const record = asRecord(value);
  const generationPolicy = record.generationPolicy;
  const guardrailCheckStatus = normalizeGuardrailCheckStatus(record.guardrailCheckStatus);
  const checkedAt = record.checkedAt;

  if (
    typeof generationPolicy !== "string" ||
    guardrailCheckStatus === null ||
    typeof checkedAt !== "string"
  ) {
    return null;
  }

  return {
    generationPolicy,
    guardrailCheckStatus,
    guardrailIssues: normalizeStringArray(record.guardrailIssues),
    warningMissingFields: normalizeWarningMissingFields(record.warningMissingFields),
    checkedAt,
  };
}

function buildGuardrailGenerationError(
  resultRecord: Record<string, unknown>,
  guardrailTrace: GuardrailTraceCandidate | null,
): GuardrailGenerationError {
  return {
    code: "DOCUMENT_GENERATION_GUARDRAIL_VIOLATION",
    message:
      typeof resultRecord.message === "string"
        ? resultRecord.message
        : "문서 생성 결과가 안전 정책에 맞지 않아 중단되었습니다.",
    issues: normalizeStringArray(resultRecord.issues),
    suggestedQuestions: normalizeStringArray(resultRecord.suggestedQuestions),
    suggestions: normalizeGuardrailSuggestions(resultRecord.suggestions),
    guardrailTrace,
  };
}

function getErrorMessageFromResponse(resultRecord: Record<string, unknown>) {
  return typeof resultRecord.message === "string"
    ? resultRecord.message
    : "보완 요청 생성에 실패했습니다.";
}

export function DocumentCreateModal({
  open,
  onClose,
  caseId,
  interviewCompleted,
  onCreated,
}: Readonly<Props>) {
  const [documentType, setDocumentType] = useState<(typeof DOCUMENT_OPTIONS)[number]["type"]>(
    "STATEMENT",
  );
  const [title, setTitle] = useState("진술서 초안");
  const [submitting, setSubmitting] = useState(false);
  const [generationWarnings, setGenerationWarnings] = useState<string[]>([]);
  const [missingWarningFields, setMissingWarningFields] = useState<MissingWarningField[]>([]);
  const [guardrailError, setGuardrailError] = useState<GuardrailGenerationError | null>(null);
  const [guardrailTraceCandidate, setGuardrailTraceCandidate] =
    useState<GuardrailTraceCandidate | null>(null);
  const [isCreatingSupplementRequest, setIsCreatingSupplementRequest] = useState(false);

  const selected = useMemo(
    () => DOCUMENT_OPTIONS.find((item) => item.type === documentType)!,
    [documentType],
  );

  if (!open) return null;

  async function handleCreateSupplementRequest(draft: SupplementRequestDraft) {
    setIsCreatingSupplementRequest(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/supplement-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draft.title,
          reason: draft.reason,
          questions: draft.questions,
          source: "DOCUMENT_GENERATION_GUARDRAIL",
          guardrailTrace: draft.guardrailTrace,
        }),
      });

      const result: unknown = await response.json().catch(() => null);
      const resultRecord = asRecord(result);

      if (!response.ok) {
        throw new Error(getErrorMessageFromResponse(resultRecord));
      }

      await onCreated();
      alert("보완 요청을 생성했습니다.");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "보완 요청 생성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsCreatingSupplementRequest(false);
    }
  }

  async function handleSubmit() {
    if (!interviewCompleted) {
      alert("인터뷰 완료 후에만 문서를 생성할 수 있습니다.");
      return;
    }

    try {
      setSubmitting(true);
      setGenerationWarnings([]);
      setMissingWarningFields([]);
      setGuardrailError(null);
      setGuardrailTraceCandidate(null);

      const res = await fetch(`/api/cases/${caseId}/documents/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: selected.type,
          title,
          questionSetCode: selected.questionSetCode,
          questionSetVersion: selected.questionSetVersion,
          templateCode: selected.templateCode,
          templateVersion: selected.templateVersion,
        }),
      });

      const raw: unknown = await res.json().catch(() => null);
      const rawRecord = asRecord(raw);

      if (!res.ok) {
        if (rawRecord.code === "DOCUMENT_GENERATION_GUARDRAIL_VIOLATION") {
          const normalizedGuardrailTrace = normalizeGuardrailTraceCandidate(rawRecord.guardrailTrace);

          setGuardrailTraceCandidate(normalizedGuardrailTrace);
          setGuardrailError(buildGuardrailGenerationError(rawRecord, normalizedGuardrailTrace));

          return;
        }

        alert(
          typeof rawRecord.message === "string"
            ? rawRecord.message
            : "문서 생성에 실패했습니다.",
        );
        return;
      }

      const data = requireOkData<Record<string, unknown>>(res, raw, "문서 생성에 실패했습니다.");

      setGenerationWarnings(normalizeStringArray(data.generationWarnings));
      setMissingWarningFields(normalizeMissingWarningFields(data.missingWarningFields));

      await onCreated();
      alert("문서 초안이 생성되었습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">문서 초안 생성</h3>
            <p className="mt-1 text-sm text-aibeop-subtle">
              질문셋과 템플릿 정의 기준으로 초안을 생성합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-sm"
          >
            닫기
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <DocumentGenerationGuardrailErrorPanel
            message={guardrailError?.message}
            issues={guardrailError?.issues}
            suggestedQuestions={guardrailError?.suggestedQuestions}
            suggestions={guardrailError?.suggestions}
          />

          <DocumentGenerationSupplementRequestPanel
            suggestions={guardrailError?.suggestions ?? []}
            suggestedQuestions={guardrailError?.suggestedQuestions ?? []}
            guardrailTrace={guardrailTraceCandidate}
            isSubmitting={isCreatingSupplementRequest}
            onCreateSupplementRequest={handleCreateSupplementRequest}
          />

          <DocumentGenerationWarningPanel
            generationWarnings={generationWarnings}
            missingWarningFields={missingWarningFields}
          />

          <div>
            <label htmlFor="document-type" className="mb-1 block text-sm font-medium">
              문서 종류
            </label>
            <select
              id="document-type"
              value={documentType}
              onChange={(e) => {
                const nextType = e.target.value as typeof documentType;
                setDocumentType(nextType);
                const label = DOCUMENT_OPTIONS.find((d) => d.type === nextType)?.label ?? "문서";
                setTitle(`${label} 초안`);
              }}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              {DOCUMENT_OPTIONS.map((item) => (
                <option key={item.type} value={item.type}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="document-title" className="mb-1 block text-sm font-medium">
              문서 제목
            </label>
            <input
              id="document-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="문서 제목"
            />
          </div>

          <div className="rounded-xl bg-gray-50 p-4 text-sm">
            <div>질문셋 코드: {selected.questionSetCode}</div>
            <div>질문셋 버전: {selected.questionSetVersion}</div>
            <div>템플릿 코드: {selected.templateCode}</div>
            <div>템플릿 버전: {selected.templateVersion}</div>
          </div>

          {!interviewCompleted && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              인터뷰 완료 전에는 초안을 생성할 수 없습니다.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            취소
          </button>
          <button
            type="button"
            disabled={submitting || !interviewCompleted}
            onClick={handleSubmit}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "생성 중..." : "생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
