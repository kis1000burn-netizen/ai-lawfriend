"use client";

import { useState } from "react";
import type { CmbAdminCasePreview } from "@/cmb/admin/cmb-admin-preview";
import { cmbStatusBadgeClass } from "@/cmb/admin/cmb-admin-preview";
import type { CmbRuntimeRole } from "@/cmb/core/cmb-runtime";

const ROLES: { id: CmbRuntimeRole; label: string }[] = [
  { id: "CLIENT", label: "의뢰인 (CLIENT)" },
  { id: "LAWYER", label: "변호사 (LAWYER)" },
  { id: "STAFF", label: "STAFF" },
  { id: "ADMIN", label: "ADMIN" },
];

type Props = {
  preview: CmbAdminCasePreview;
};

function BoolBadge({ value, label }: { value: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        value ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-aibeop-muted"
      }`}
    >
      {label}: {value ? "ON" : "off"}
    </span>
  );
}

export function CmbConfigPreviewPanel({ preview }: Readonly<Props>) {
  const [role, setRole] = useState<CmbRuntimeRole>("CLIENT");
  const blocks = preview.roleBlocks[role];

  return (
    <div className="space-y-6" data-testid="cmb-config-preview-panel">
      {preview.lockNotice ? (
        <div
          className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-aibeop-subtle"
          data-testid="cmb-lock-notice"
        >
          {preview.lockNotice}
        </div>
      ) : null}

      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-aibeop-text">{preview.config.title}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cmbStatusBadgeClass(preview.config.status)}`}
          >
            {preview.config.status}
          </span>
        </div>
        <p className="mt-2 font-mono text-sm text-aibeop-muted">
          {preview.config.caseType} · {preview.config.id} · v{preview.config.version}
        </p>
        <p className="mt-3 text-xs text-aibeop-muted">
          evidenceTag: <code className="font-mono">{preview.evidenceTag}</code>
        </p>
      </section>

      <section
        className={`rounded-2xl border p-5 shadow-soft ${
          preview.validation.ok
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-red-200 bg-red-50/50"
        }`}
        data-testid="cmb-case-validation"
      >
        <h2 className="text-sm font-semibold text-aibeop-text">단일 config validator</h2>
        <p className="mt-1 text-xs text-aibeop-muted">
          {preview.validation.ok ? "PASS" : "FAIL"} — LOCKED config는 수정 UI 없이 preview만 제공합니다.
        </p>
        {!preview.validation.ok ? (
          <ul className="mt-3 space-y-1 text-xs text-red-800">
            {preview.validation.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-aibeop-text">Registry 연결</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-aibeop-muted">QuestionSet</dt>
            <dd className="mt-1 text-sm">
              <code className="font-mono text-xs">{preview.questionSet.registryKey}</code>
              <p className="mt-1">{preview.questionSet.title}</p>
              {!preview.questionSet.found ? (
                <p className="mt-1 text-xs text-red-600">registry 미등록</p>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-aibeop-muted">Document Template</dt>
            <dd className="mt-1 text-sm">
              <code className="font-mono text-xs">{preview.documentTemplate.registryKey}</code>
              <p className="mt-1">{preview.documentTemplate.title}</p>
              {!preview.documentTemplate.found ? (
                <p className="mt-1 text-xs text-red-600">registry 미등록</p>
              ) : null}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <dt className="text-xs font-medium uppercase text-aibeop-muted">Gongbuho packets</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {preview.gongbuhoPackets.map((code) => (
              <span
                key={code}
                className="rounded-lg bg-aibeop-soft px-2 py-1 font-mono text-xs text-aibeop-deep"
              >
                {code}
              </span>
            ))}
          </dd>
          <p className="mt-2 text-xs text-aibeop-muted">
            requireApprovedPacketsOnly:{" "}
            {preview.config.gongbuho.requireApprovedPacketsOnly ? "true (CORE)" : "false"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-indigo-950">Modules</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {Object.entries(preview.modules).map(([key, value]) => (
            <div key={key} className="rounded-lg bg-white/80 px-3 py-2">
              <dt className="text-xs text-indigo-800">{key}</dt>
              <dd className="font-mono text-xs text-indigo-950">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-amber-950">Gates (CMB flags + keys)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <BoolBadge value={preview.gateFlags.requireConfirmedInterview} label="confirmedInterview" />
          <BoolBadge value={preview.gateFlags.requireVoiceFinalizeGate} label="voiceFinalize" />
          <BoolBadge
            value={preview.gateFlags.requireOpenSupplementResolved}
            label="openSupplement"
          />
          <BoolBadge
            value={preview.gateFlags.requireLawyerReviewBeforeFinalize}
            label="lawyerReview"
          />
        </div>
        <ul className="mt-4 space-y-1">
          {preview.gateFlags.keys.map((key) => (
            <li key={key} className="font-mono text-xs text-amber-950">
              {key}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-amber-900/90">
          실제 enforce는 Voice/Gongbuho/CORE 서비스가 담당합니다. CMB Runtime은 읽기 전용입니다.
        </p>
      </section>

      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-aibeop-text">UI blocks (전체 순서)</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
          {preview.blocks.map((block) => (
            <li key={block} className="font-mono text-xs">
              {block}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 shadow-soft"
        data-testid="cmb-role-blocks-preview"
      >
        <h2 className="text-sm font-semibold text-violet-950">Role별 block 노출</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              data-testid={`cmb-role-tab-${r.id}`}
              onClick={() => setRole(r.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                role === r.id
                  ? "bg-violet-700 text-white"
                  : "border border-violet-300 bg-white text-violet-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-violet-200 rounded-xl border border-violet-200 bg-white text-sm">
          {blocks.map((block) => (
            <li key={block} className="px-4 py-2 font-mono text-xs text-violet-950">
              {block}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-violet-900/90">
          {role} — {blocks.length} blocks (client UI에 admin-only block 없음 validator 적용)
        </p>
      </section>
    </div>
  );
}
