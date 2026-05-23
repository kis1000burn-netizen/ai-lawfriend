"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  resolveAdminPageWayfinding,
  resolveLawyerPageWayfinding,
  resolveProtectedPageWayfinding,
  type ProtectedPageWayfindingModel,
} from "@/lib/navigation/protected-page-wayfinding";

type Scope = "protected" | "lawyer" | "admin";

type Props = {
  homeHref: string;
  homeLabel: string;
  scope?: Scope;
};

const secondaryLinkClass =
  "inline-flex items-center rounded-xl border border-aibeop-line bg-aibeop-surface px-3 py-2 text-xs font-bold text-aibeop-deep transition hover:bg-aibeop-card sm:text-sm";

function resolveModel(pathname: string, scope: Scope): ProtectedPageWayfindingModel {
  if (scope === "lawyer") return resolveLawyerPageWayfinding(pathname);
  if (scope === "admin") return resolveAdminPageWayfinding(pathname);
  return resolveProtectedPageWayfinding(pathname);
}

export function ProtectedPageWayfinding({
  homeHref,
  homeLabel,
  scope = "protected",
}: Props) {
  const pathname = usePathname() ?? "";
  const model = resolveModel(pathname, scope);

  if (!model.show) return null;

  return (
    <nav
      aria-label="페이지 이동"
      className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-aibeop-line bg-aibeop-soft/90 px-3 py-2.5 sm:gap-3 sm:px-4"
    >
      <Link href={homeHref} className="aibeop-btn-primary px-3 py-2 text-xs sm:text-sm">
        ← {homeLabel}
      </Link>

      {model.previousStep ? (
        <Link href={model.previousStep.href} className={secondaryLinkClass}>
          ← 이전: {model.previousStep.label}
        </Link>
      ) : null}

      {model.showCasesListLink ? (
        <Link href="/cases" className={secondaryLinkClass}>
          내 사건
        </Link>
      ) : null}

      {model.showCaseDetailLink && model.caseId ? (
        <Link href={`/cases/${model.caseId}`} className={secondaryLinkClass}>
          사건 상세
        </Link>
      ) : null}

      <Link href="/" className={secondaryLinkClass}>
        공개 홈
      </Link>

      {scope === "protected" && homeHref !== "/dashboard" ? (
        <Link href="/dashboard" className={secondaryLinkClass}>
          대시보드
        </Link>
      ) : null}

      {model.currentHint ? (
        <span className="w-full text-xs font-bold text-aibeop-subtle sm:ml-auto sm:w-auto">
          현재: {model.currentHint}
        </span>
      ) : null}
    </nav>
  );
}
