type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function DashboardSectionHeading({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-6 md:mb-8">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-aibeop-deep sm:text-sm sm:tracking-[0.24em]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-balance text-xl font-black tracking-tight text-aibeop-text sm:text-2xl md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-pretty text-sm font-semibold leading-relaxed text-aibeop-text">
          {description}
        </p>
      ) : null}
    </div>
  );
}
