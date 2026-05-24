"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminTenantPlanConsoleSnapshot } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.schema";
import {
  adminTenantBillingAdjustmentApiPath,
  adminTenantFeatureOverridesApiPath,
  adminTenantPlanApiPath,
} from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.policy";
import { TENANT_ENTITLEMENT_FEATURES } from "@/features/platform/tenant-entitlement/tenant-plan.schema";
import { TENANT_PLAN_TIERS } from "@/features/platform/tenant-entitlement/tenant-plan.schema";
import { BILLING_CHARGE_CATEGORIES } from "@/features/platform/billing-ledger/billing-usage-ledger.schema";

type Props = {
  snapshot: AdminTenantPlanConsoleSnapshot;
};

function PeriodBadge({ closed }: { closed: boolean }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        closed
          ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      ].join(" ")}
    >
      {closed ? "PERIOD CLOSED" : "PERIOD OPEN"}
    </span>
  );
}

export function AdminTenantPlanConsole({ snapshot }: Props) {
  const router = useRouter();
  const tenantId = snapshot.tenant.id;
  const [tier, setTier] = useState(snapshot.plan.tier);
  const [planStatus, setPlanStatus] = useState(snapshot.plan.status);
  const [featureFlags, setFeatureFlags] = useState(snapshot.plan.featureFlags);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [billableQuantity, setBillableQuantity] = useState(0);
  const [chargeCategory, setChargeCategory] = useState<string>("MANUAL_ADJUSTMENT");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function savePlan() {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(adminTenantPlanApiPath(tenantId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, status: planStatus }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      setMessage("Plan updated (TENANT_PLAN_UPDATED audit)");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plan update failed");
    } finally {
      setPending(false);
    }
  }

  async function saveFeatureOverrides() {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(adminTenantFeatureOverridesApiPath(tenantId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureFlags }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      setMessage("Feature overrides updated (TENANT_FEATURE_OVERRIDE_UPDATED audit)");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Feature override update failed");
    } finally {
      setPending(false);
    }
  }

  async function submitAdjustment() {
    if (snapshot.billingMutationsBlocked) {
      setError("Closed period — billing ledger mutations are blocked.");
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(adminTenantBillingAdjustmentApiPath(tenantId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingPeriodKey: snapshot.periodKey,
          chargeCategory,
          billableQuantity,
          adjustmentReason,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      setMessage("Ledger adjustment recorded (BILLING_LEDGER_ADJUSTED audit)");
      setAdjustmentReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Adjustment failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-aibeop-deep">{snapshot.tenant.legalName}</h1>
          <p className="font-mono text-sm text-aibeop-muted">{snapshot.tenant.slug}</p>
          <p className="text-sm text-aibeop-muted">
            Period {snapshot.periodKey} · org {snapshot.tenant.status}
          </p>
        </div>
        <PeriodBadge closed={snapshot.periodClosed} />
      </header>

      {snapshot.periodClosed ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          Billing period {snapshot.periodKey} is closed. Ledger adjustment mutations are disabled.
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-900">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-aibeop-border bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold text-aibeop-deep">Plan</h2>
        <div className="flex flex-wrap gap-4">
          <label className="text-sm">
            Tier
            <select
              className="mt-1 block rounded-lg border border-aibeop-border px-3 py-2"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              {TENANT_PLAN_TIERS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Plan status
            <select
              className="mt-1 block rounded-lg border border-aibeop-border px-3 py-2"
              value={planStatus}
              onChange={(e) => setPlanStatus(e.target.value)}
            >
              {["ACTIVE", "PAST_DUE", "SUSPENDED"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={savePlan}
          className="rounded-lg bg-aibeop-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Save plan
        </button>
      </section>

      <section className="rounded-xl border border-aibeop-border bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold text-aibeop-deep">Feature entitlement overrides</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {TENANT_ENTITLEMENT_FEATURES.map((feature) => (
            <label key={feature} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featureFlags[feature] ?? false}
                onChange={(e) =>
                  setFeatureFlags((prev) => ({ ...prev, [feature]: e.target.checked }))
                }
              />
              <span className="font-mono text-xs">{feature}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={saveFeatureOverrides}
          className="rounded-lg border border-aibeop-border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Save feature overrides
        </button>
      </section>

      <section className="rounded-xl border border-aibeop-border bg-white p-5">
        <h2 className="text-lg font-semibold text-aibeop-deep">Usage summary</h2>
        {snapshot.usageSummary ? (
          <pre className="mt-3 overflow-x-auto rounded-lg bg-aibeop-surface/60 p-3 text-xs">
            {JSON.stringify(snapshot.usageSummary.totals, null, 2)}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-aibeop-muted">No usage data</p>
        )}
      </section>

      <section className="rounded-xl border border-aibeop-border bg-white p-5 space-y-3">
        <h2 className="text-lg font-semibold text-aibeop-deep">Billing ledger</h2>
        <p className="text-xs text-aibeop-muted">
          Entries: {snapshot.billingLedgerSummary.entryCount} · no automatic invoice
        </p>
        {snapshot.billingLedgerSummary.entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b text-aibeop-muted">
                  <th className="py-2 pr-3">category</th>
                  <th className="py-2 pr-3">qty</th>
                  <th className="py-2 pr-3">status</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.billingLedgerSummary.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-aibeop-border/50">
                    <td className="py-2 pr-3">{entry.chargeCategory}</td>
                    <td className="py-2 pr-3">{entry.billableQuantity}</td>
                    <td className="py-2 pr-3">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-aibeop-muted">No ledger entries for this period</p>
        )}

        <div className="border-t border-aibeop-border pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-aibeop-deep">Manual adjustment</h3>
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              Category
              <select
                className="mt-1 block rounded-lg border border-aibeop-border px-3 py-2 text-xs"
                value={chargeCategory}
                disabled={snapshot.billingMutationsBlocked || pending}
                onChange={(e) => setChargeCategory(e.target.value)}
              >
                {BILLING_CHARGE_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Quantity
              <input
                type="number"
                className="mt-1 block rounded-lg border border-aibeop-border px-3 py-2"
                value={billableQuantity}
                disabled={snapshot.billingMutationsBlocked || pending}
                onChange={(e) => setBillableQuantity(Number(e.target.value))}
              />
            </label>
          </div>
          <textarea
            className="w-full rounded-lg border border-aibeop-border px-3 py-2 text-sm disabled:opacity-50"
            rows={2}
            placeholder="Adjustment reason (audit)"
            value={adjustmentReason}
            disabled={snapshot.billingMutationsBlocked || pending}
            onChange={(e) => setAdjustmentReason(e.target.value)}
          />
          <button
            type="button"
            disabled={snapshot.billingMutationsBlocked || pending || adjustmentReason.length < 3}
            title={
              snapshot.billingMutationsBlocked
                ? "Closed period — mutations blocked"
                : undefined
            }
            onClick={submitAdjustment}
            className="cursor-pointer rounded-lg border border-aibeop-border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Record adjustment
          </button>
        </div>
      </section>

      {snapshot.closedPeriodKeys.length > 0 ? (
        <section className="rounded-xl border border-aibeop-border bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-deep">Closed periods</h2>
          <p className="mt-2 font-mono text-xs text-aibeop-muted">
            {snapshot.closedPeriodKeys.join(", ")}
          </p>
        </section>
      ) : null}
    </div>
  );
}
