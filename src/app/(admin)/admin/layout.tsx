import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import AuthStatus from "@/components/auth/auth-status";
import { AdminHeaderAlertBell } from "@/components/admin/alerts/admin-header-alert-bell";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import { AppBuildBadge } from "@/components/common/AppBuildBadge";
import { ProtectedPageWayfinding } from "@/components/layout/protected-page-wayfinding";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-aibeop-bg text-aibeop-text">
      <header className="border-b border-aibeop-line bg-aibeop-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-2">
            <AibeopchinLogo href="/admin" compact />
            <div className="text-sm font-bold text-aibeop-text">관리자 콘솔</div>
            <div className="text-sm font-bold text-aibeop-subtle">
              권한: {user.role} ·{" "}
              <Link href="/dashboard" className="text-aibeop-text underline">
                사용자 화면(대시보드)
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AdminHeaderAlertBell />
            <AuthStatus user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <ProtectedPageWayfinding homeHref="/admin" homeLabel="관리자 홈" scope="admin" />
        {children}
      </main>

      <footer className="border-t border-aibeop-line bg-aibeop-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <AppBuildBadge />
        </div>
      </footer>
    </div>
  );
}
