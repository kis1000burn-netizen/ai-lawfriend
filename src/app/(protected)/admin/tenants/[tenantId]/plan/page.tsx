import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTenantPlanConsole } from "@/components/admin/tenants/admin-tenant-plan-console";
import { getAdminTenantPlanConsoleSnapshot } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.service";
import { ADMIN_TENANT_LIST_PATH } from "@/features/platform/admin-tenant-plan/admin-tenant-plan-console.policy";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ tenantId: string }>;
};

export default async function AdminTenantPlanPage({ params }: Props) {
  await requireAdmin();
  const { tenantId } = await params;

  let snapshot;
  try {
    snapshot = await getAdminTenantPlanConsoleSnapshot(tenantId);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href={ADMIN_TENANT_LIST_PATH} className="text-sm text-aibeop-accent hover:underline">
        ← Tenant list
      </Link>
      <AdminTenantPlanConsole snapshot={snapshot} />
    </div>
  );
}
