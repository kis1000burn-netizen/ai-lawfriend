import Link from "next/link";
import type { ReactNode } from "react";

type DashboardStateVariant = "empty" | "loading" | "error" | "restricted" | "info";

type Props = {
  variant?: DashboardStateVariant;
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
};

const variantTone: Record<DashboardStateVariant, string> = {
  empty: "border-aibeop-line bg-aibeop-soft",
  loading: "border-aibeop-line bg-aibeop-accentSoft",
  error: "border-red-200 bg-red-50",
  restricted: "border-amber-300/60 bg-amber-50",
  info: "border-aibeop-line bg-aibeop-card",
};

export function DashboardStatePanel({
  variant = "info",
  title,
  description,
  icon,
  action,
  secondaryAction,
}: Props) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:rounded-3xl sm:p-6 ${variantTone[variant]}`}
      role="region"
      aria-label={title}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="max-w-2xl min-w-0">
          {icon ? <div className="mb-3 text-2xl sm:mb-4">{icon}</div> : null}
          <h3 className="text-lg font-black text-aibeop-text sm:text-xl">{title}</h3>
          <p className="mt-2 text-pretty text-sm font-semibold leading-relaxed text-aibeop-text sm:mt-3 sm:leading-6">
            {description}
          </p>
        </div>

        {action || secondaryAction ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
            {action ? (
              <Link
                href={action.href}
                className="inline-flex justify-center rounded-2xl bg-aibeop-green px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-aibeop-deep focus-visible:outline focus-visible:ring-2 focus-visible:ring-aibeop-green"
              >
                {action.label}
              </Link>
            ) : null}
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex justify-center rounded-2xl border border-aibeop-line bg-aibeop-surface px-4 py-2.5 text-center text-sm font-bold text-aibeop-deep transition hover:bg-aibeop-soft focus-visible:outline focus-visible:ring-2 focus-visible:ring-aibeop-green"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
