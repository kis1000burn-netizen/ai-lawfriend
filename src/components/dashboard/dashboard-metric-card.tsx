type Props = {
  title: string;
  value: string | number;
  description?: string;
};

export function DashboardMetricCard({ title, value, description }: Props) {
  return (
    <div className="rounded-2xl border border-aibeop-line bg-aibeop-card p-4 shadow-soft ring-1 ring-aibeop-line/70 sm:rounded-3xl sm:p-5 md:p-6">
      <p className="text-xs font-bold text-aibeop-deep sm:text-sm">{title}</p>
      <p className="mt-1.5 tabular-nums text-2xl font-black tracking-tight text-aibeop-text sm:mt-2 sm:text-3xl">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-xs font-semibold leading-relaxed text-aibeop-text sm:text-sm sm:leading-6">
          {description}
        </p>
      ) : null}
    </div>
  );
}
