import type { LawyerArgumentSocialProofSignal } from "@/lib/dashboard/lawyer-argument-social-proof";

type Props = {
  socialProof: LawyerArgumentSocialProofSignal;
};

export function LawyerArgumentSocialProofCard({ socialProof }: Props) {
  if (!socialProof.visible) {
    return (
      <aside className="rounded-3xl border border-dashed border-aibeop-line bg-aibeop-surface p-5 text-sm font-semibold leading-6 text-aibeop-muted">
        <p className="text-sm font-bold text-aibeop-deep">{socialProof.eyebrow}</p>
        <p className="mt-2 text-base font-black text-aibeop-text">{socialProof.title}</p>
        {socialProof.emptyStateMessage ? (
          <p className="mt-2">{socialProof.emptyStateMessage}</p>
        ) : null}
        <p className="mt-3">{socialProof.disclaimer}</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft ring-1 ring-aibeop-line/70">
      <div>
        <p className="text-sm font-bold text-aibeop-deep">{socialProof.eyebrow}</p>
        <h2 className="mt-1 text-xl font-black text-aibeop-text">{socialProof.title}</h2>
      </div>

      <ul className="mt-4 grid gap-2 text-sm font-semibold leading-6 text-aibeop-text">
        {socialProof.themes.map((theme) => (
          <li key={theme} className="rounded-2xl bg-aibeop-surface px-4 py-3">
            · {theme}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm font-semibold leading-6 text-aibeop-muted">
        {socialProof.disclaimer}
      </p>
    </aside>
  );
}
