"use client";

import { useState } from "react";
import type { BrainDiagnosis } from "@/features/control-tower-brain/phase60c-conflict-diagnosis.schema";
import type { BrainDetectedIssue } from "@/features/control-tower-brain/phase60b-error-detection.schema";
import type { BrainPatchPlan } from "@/features/control-tower-brain/phase60d-patch-plan.schema";
import type { ControlTowerBrainStatus } from "@/features/control-tower-brain/phase60e-safe-auto-fix.schema";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";

type Snapshot = {
  status: ControlTowerBrainStatus;
  issues: BrainDetectedIssue[];
  diagnoses: BrainDiagnosis[];
  plans: BrainPatchPlan[];
};

type Props = {
  initialSnapshot: Snapshot;
};

function HealthBadge({ health }: { health: ControlTowerBrainStatus["health"] }) {
  const styles =
    health === "OK"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : health === "ATTENTION"
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles}`}>
      {health}
    </span>
  );
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : "{}",
  });
  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(json.error ?? "Request failed");
  }
  return json.data as T;
}

export function ControlTowerBrainConsole({ initialSnapshot }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshSnapshot() {
    const response = await fetch("/api/admin/control-tower/brain/snapshot");
    const json = await response.json();
    if (json.ok) {
      setSnapshot(json.data);
    }
  }

  async function runAction(label: string, action: () => Promise<void>) {
    setBusy(label);
    setMessage(null);
    try {
      await action();
      await refreshSnapshot();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  const safeQueue = snapshot.plans.filter((plan) => plan.riskLevel === "SAFE" && !plan.approved);
  const approvalQueue = snapshot.plans.filter(
    (plan) => plan.requiresHumanApproval && !plan.approved,
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-aibeop-muted">Product Phase 60 — Control Tower Brain</p>
        <h1 className="text-2xl font-bold text-aibeop-deep">AI법친 Control Tower Brain</h1>
        <p className="text-sm text-aibeop-muted">{snapshot.status.oneLineStandard}</p>
        <p className="text-xs text-aibeop-muted">
          Console: {PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK.adminConsolePath} · RC{" "}
          {PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK.version}
        </p>
      </header>

      {message ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Brain Status</p>
          <div className="mt-2">
            <HealthBadge health={snapshot.status.health} />
          </div>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Detected Issues</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.status.openIssueCount}</p>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Approval Required</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.status.pendingApprovalCount}</p>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Safe Auto-fix Queue</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.status.safeAutoFixQueueCount}</p>
        </div>
      </section>

      <section className="rounded-xl border border-aibeop-border bg-white p-5">
        <h2 className="text-lg font-semibold text-aibeop-deep">Brain Actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy !== null}
            className="rounded-lg bg-aibeop-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            onClick={() =>
              runAction("scan", async () => {
                await postJson("/api/admin/control-tower/brain/scan", {
                  includeStaticRepoChecks: true,
                });
              })
            }
          >
            {busy === "scan" ? "Scanning…" : "Scan"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            className="rounded-lg border border-aibeop-border px-3 py-2 text-sm"
            onClick={() => runAction("diagnose", () => postJson("/api/admin/control-tower/brain/diagnose"))}
          >
            {busy === "diagnose" ? "Diagnosing…" : "Diagnose"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            className="rounded-lg border border-aibeop-border px-3 py-2 text-sm"
            onClick={() =>
              runAction("patch-plan", () => postJson("/api/admin/control-tower/brain/patch-plan"))
            }
          >
            {busy === "patch-plan" ? "Planning…" : "Patch Plan"}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-aibeop-border bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-deep">Detected Issues</h2>
          <ul className="mt-4 space-y-3">
            {snapshot.issues.length === 0 ? (
              <li className="text-sm text-aibeop-muted">No issues detected yet. Run Scan.</li>
            ) : (
              snapshot.issues.slice(0, 12).map((issue) => (
                <li key={issue.issueId} className="rounded-lg border border-aibeop-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{issue.source}</span>
                    <span className="text-xs text-aibeop-muted">{issue.severity}</span>
                  </div>
                  <p className="mt-1 text-aibeop-muted">{issue.summary}</p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-aibeop-border bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-deep">Phase Conflict Map</h2>
          <ul className="mt-4 space-y-3">
            {snapshot.diagnoses.length === 0 ? (
              <li className="text-sm text-aibeop-muted">Run Diagnose after Scan.</li>
            ) : (
              snapshot.diagnoses.slice(0, 12).map((diagnosis) => (
                <li
                  key={diagnosis.diagnosisId}
                  className="rounded-lg border border-aibeop-border p-3 text-sm"
                >
                  <div className="font-medium">{diagnosis.code}</div>
                  <p className="mt-1 text-aibeop-muted">{diagnosis.likelyRootCause}</p>
                  {diagnosis.affectedPhase ? (
                    <p className="mt-1 text-xs text-aibeop-muted">Phase {diagnosis.affectedPhase}</p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-aibeop-border bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-deep">Patch Plans</h2>
          <ul className="mt-4 space-y-3">
            {snapshot.plans.length === 0 ? (
              <li className="text-sm text-aibeop-muted">Run Patch Plan after Diagnose.</li>
            ) : (
              snapshot.plans.slice(0, 8).map((plan) => (
                <li key={plan.planId} className="rounded-lg border border-aibeop-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{plan.riskLevel}</span>
                    <span className="text-xs text-aibeop-muted">
                      {plan.approved ? "APPROVED" : "PENDING"}
                    </span>
                  </div>
                  <p className="mt-1 text-aibeop-muted">{plan.proposedChanges[0]?.changeSummary}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!plan.approved ? (
                      <button
                        type="button"
                        className="rounded border border-aibeop-border px-2 py-1 text-xs"
                        onClick={() =>
                          runAction("approve", async () => {
                            await postJson("/api/admin/control-tower/brain/approve-patch", {
                              planId: plan.planId,
                            });
                          })
                        }
                      >
                        Approve
                      </button>
                    ) : null}
                    {plan.riskLevel === "SAFE" ? (
                      <button
                        type="button"
                        className="rounded border border-aibeop-border px-2 py-1 text-xs"
                        onClick={() =>
                          runAction("autofix", async () => {
                            await postJson("/api/admin/control-tower/brain/auto-fix", {
                              planId: plan.planId,
                              dryRun: true,
                            });
                          })
                        }
                      >
                        Dry-run Auto-fix
                      </button>
                    ) : null}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-aibeop-border bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-deep">Queues · Rollback</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-aibeop-muted">Safe Auto-fix Queue</dt>
              <dd className="font-medium">{safeQueue.length} plan(s)</dd>
            </div>
            <div>
              <dt className="text-aibeop-muted">Approval Required</dt>
              <dd className="font-medium">{approvalQueue.length} plan(s)</dd>
            </div>
            <div>
              <dt className="text-aibeop-muted">Rollback Plan (default)</dt>
              <dd className="font-mono text-xs">git restore &lt;files&gt; → re-run verify scripts</dd>
            </div>
            <div>
              <dt className="text-aibeop-muted">Evidence Writer</dt>
              <dd className="text-aibeop-muted">
                IMPLEMENTATION_EVIDENCE.md 후보는 Patch Plan 생성 후 human review
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
