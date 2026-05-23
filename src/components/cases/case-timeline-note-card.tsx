import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  item: {
    id: string;
    content: string;
    memoType: string;
    noteType?: string | null;
    createdAt: Date | string;
    alertEventId?: string | null;
    author: {
      name: string | null;
      email: string;
    };
    alertEvent?: {
      id: string;
      title: string;
      severity: "INFO" | "WARNING" | "CRITICAL";
      status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
    } | null;
  };
  focused?: boolean;
  actions?: ReactNode;
};

export function CaseTimelineNoteCard({ item, focused, actions }: Props) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white p-4 shadow-sm",
        focused ? "border-amber-300 bg-amber-50 ring-2 ring-amber-200" : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {item.noteType ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-aibeop-subtle">
              {item.noteType}
            </span>
          ) : null}

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-aibeop-muted">
            {item.memoType}
          </span>

          {item.alertEvent ? (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
              연결 경고: {item.alertEvent.id.slice(0, 8)}…
            </span>
          ) : null}

          <span className="text-xs text-aibeop-subtle">
            {new Date(item.createdAt).toLocaleString()}
          </span>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {item.alertEvent ? (
        <div className="mt-2">
          <Link
            href="/admin/alerts/history"
            className="text-sm font-semibold text-blue-700 underline"
          >
            {item.alertEvent.title}
          </Link>
        </div>
      ) : null}

      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-aibeop-subtle">
        {item.content}
      </pre>

      <div className="mt-3 text-xs text-aibeop-subtle">
        작성자: {item.author?.name ?? item.author?.email ?? "-"}
      </div>
    </div>
  );
}
