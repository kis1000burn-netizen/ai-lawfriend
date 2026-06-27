import type { CaseIntakeSocialProof } from "@/lib/cases/case-intake-social-proof";

type Props = {
  socialProof: CaseIntakeSocialProof;
};

const toneClass: Record<CaseIntakeSocialProof["activityTone"], string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-950",
  starter: "border-aibeop-line bg-aibeop-accentSoft text-aibeop-deep",
};

export function CaseIntakeSocialProofCard({ socialProof }: Props) {
  return (
    <aside className="rounded-3xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft ring-1 ring-aibeop-line/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-aibeop-deep">{socialProof.eyebrow}</p>
          <h2 className="mt-1 text-xl font-black text-aibeop-text">{socialProof.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-aibeop-text">
            {socialProof.description}
          </p>
        </div>
        <span
          className={[
            "inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-black",
            toneClass[socialProof.activityTone],
          ].join(" ")}
        >
          {socialProof.activityLabel}
        </span>
      </div>

      <ul className="mt-4 grid gap-2 text-sm font-semibold leading-6 text-aibeop-text">
        {socialProof.bullets.map((item) => (
          <li key={item} className="rounded-2xl bg-aibeop-surface px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}
