import Link from "next/link";
import { AdminTenantListTable } from "@/components/admin/tenants/admin-tenant-list-table";
import { getAdminTenantListSnapshot } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.service";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminTenantsPage() {
  await requireAdmin();
  const tenants = await getAdminTenantListSnapshot();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-aibeop-muted">Product Phase 22-E — Admin Plan Console</p>
        <h1 className="text-2xl font-bold text-aibeop-deep">Tenant / Plan</h1>
        <p className="text-sm text-aibeop-muted">
          tenant별 plan · entitlement · usage · billing ledger 상태를 운영자 관점에서 조회합니다.
        </p>
        <Link href="/admin/operations/data-governance" className="text-sm text-aibeop-accent hover:underline">
          Data Governance
        </Link>
      </header>
      <AdminTenantListTable tenants={tenants} />
    </div>
  );
}
