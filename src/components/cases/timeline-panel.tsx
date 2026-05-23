type Props = {
  timelineEvents: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    createdAt: string;
  }>;
};

export function TimelinePanel({ timelineEvents }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold">사건 타임라인</h3>

      <div className="mt-3 space-y-3">
        {timelineEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-aibeop-subtle">
            타임라인 이력이 없습니다.
          </div>
        ) : (
          timelineEvents.map((event) => (
            <div key={event.id} className="rounded-xl border p-3">
              <div className="text-sm font-semibold">{event.title}</div>
              <div className="mt-1 text-xs text-aibeop-subtle">
                {event.type} · {new Date(event.createdAt).toLocaleString()}
              </div>
              {event.description ? (
                <div className="mt-2 text-sm text-aibeop-subtle">{event.description}</div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
