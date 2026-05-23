import Link from "next/link";

type DashboardPreviewCardTone = "cyan" | "indigo" | "amber" | "slate";

export type DashboardPreviewCardBadgeTone = "cyan" | "amber" | "slate";

export type DashboardPreviewCardProps = {
  title: string;
  href: string;
  ctaLabel?: string;
  status?: string;
  statusLabel?: string;
  updatedAtLabel?: string;
  reason?: string;
  tone?: DashboardPreviewCardTone;
  badgeLabel?: string;
  badgeTone?: DashboardPreviewCardBadgeTone;
};

const badgeToneClass: Record<DashboardPreviewCardBadgeTone, string> = {
  cyan: "border-aibeop-line bg-aibeop-soft text-aibeop-deep",
  amber: "border-amber-300/60 bg-amber-50 text-amber-950",
  slate: "border-aibeop-line bg-aibeop-accentSoft text-aibeop-text",
};

const toneClass: Record<
  DashboardPreviewCardTone,
  {
    badge: string;
    hover: string;
  }
> = {
  cyan: {
    badge: "bg-aibeop-soft text-aibeop-deep",
    hover: "hover:border-aibeop-green",
  },
  indigo: {
    badge: "bg-indigo-50 text-indigo-950",
    hover: "hover:border-indigo-400",
  },
  amber: {
    badge: "bg-amber-50 text-amber-950",
    hover: "hover:border-amber-400",
  },
  slate: {
    badge: "bg-aibeop-accentSoft text-aibeop-text",
    hover: "hover:border-aibeop-line",
  },
};

export function DashboardPreviewCard({
  title,
  href,
  ctaLabel = "자세히 보기",
  status,
  statusLabel,
  updatedAtLabel,
  reason,
  tone = "cyan",
  badgeLabel,
  badgeTone = "slate",
}: DashboardPreviewCardProps) {
  const toneStyle = toneClass[tone];
  const displayStatus = statusLabel ?? status;

  return (
    <li>
      <Link
        href={href}
        className={[
          "block rounded-2xl border border-aibeop-line bg-aibeop-surface p-4 transition",
          "hover:bg-aibeop-accentSoft focus:outline-none focus:ring-2 focus:ring-aibeop-green/40",
          toneStyle.hover,
        ].join(" ")}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h4 className="truncate font-black text-aibeop-text">{title}</h4>

            {badgeLabel ? (
              <span
                className={[
                  "mt-2 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-bold",
                  badgeToneClass[badgeTone],
                ].join(" ")}
              >
                {badgeLabel}
              </span>
            ) : null}

            {(displayStatus || updatedAtLabel) && (
              <p className="mt-1 text-xs font-semibold leading-5 text-aibeop-deep">
                {displayStatus ? `상태: ${displayStatus}` : ""}
                {displayStatus && updatedAtLabel ? " · " : ""}
                {updatedAtLabel ? `업데이트: ${updatedAtLabel}` : ""}
              </p>
            )}

            {reason && (
              <p className="mt-2 text-sm font-semibold leading-6 text-aibeop-text">{reason}</p>
            )}
          </div>

          <span
            className={[
              "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
              toneStyle.badge,
            ].join(" ")}
          >
            {ctaLabel}
          </span>
        </div>
      </Link>
    </li>
  );
}
