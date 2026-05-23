import Link from "next/link";

type Props = {
  title: string;
  description: string;
  href: string;
  label?: string;
  /** CTA 한 줄(기본: 바로 가기) */
  ctaLabel?: string;
};

export function DashboardActionCard({
  title,
  description,
  href,
  label,
  ctaLabel = "바로 가기 →",
}: Props) {
  return (
    <Link
      href={href}
      className="group flex min-h-[min(100%,8.5rem)] flex-col rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-aibeop-green hover:bg-aibeop-accentSoft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-green sm:min-h-0 sm:rounded-3xl sm:p-6"
    >
      {label ? (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-aibeop-deep sm:mb-3 sm:text-xs sm:tracking-[0.2em]">
          {label}
        </p>
      ) : null}
      <h3 className="text-lg font-bold leading-snug text-aibeop-text sm:text-xl">{title}</h3>
      <p className="mt-2 flex-1 text-sm font-semibold leading-relaxed text-aibeop-text sm:mt-3 sm:leading-6">
        {description}
      </p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-aibeop-deep transition group-hover:gap-1.5 group-hover:text-aibeop-green">
        <span>{ctaLabel}</span>
      </div>
    </Link>
  );
}
