"use client";

import Link from "next/link";
import type { AdminTenantListItem } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.schema";
import { adminTenantPlanDetailPath } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.policy";

type Props = {
  tenants: AdminTenantListItem[];
};

export function AdminTenantListTable({ tenants }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-aibeop-border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-aibeop-surface/60 text-aibeop-muted">
            <th className="px-4 py-3">tenant</th>
            <th className="px-4 py-3">slug</th>
            <th className="px-4 py-3">org status</th>
            <th className="px-4 py-3">plan tier</th>
            <th className="px-4 py-3">plan status</th>
            <th className="px-4 py-3">seats</th>
            <th className="px-4 py-3">action</th>
          </tr>
        </thead>
        <tbody>
          {tenants.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-aibeop-muted">
                등록된 tenant 없음
              </td>
            </tr>
          ) : (
            tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-aibeop-border/60">
                <td className="px-4 py-3 font-medium text-aibeop-deep">{tenant.legalName}</td>
                <td className="px-4 py-3 font-mono text-xs">{tenant.slug}</td>
                <td className="px-4 py-3">{tenant.status}</td>
                <td className="px-4 py-3">{tenant.tier}</td>
                <td className="px-4 py-3">{tenant.planStatus}</td>
                <td className="px-4 py-3">{tenant.activeMembershipCount}</td>
                <td className="px-4 py-3">
                  <Link
                    href={adminTenantPlanDetailPath(tenant.id)}
                    className="text-aibeop-accent hover:underline"
                  >
                    Plan Console
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
