import type { ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
}>;

export function DashboardShell({ children }: Props) {
  return (
    <div className="relative -mx-6 min-h-[min(70vh,520px)] overflow-hidden bg-aibeop-canvas text-aibeop-text sm:min-h-[60vh]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(143,184,158,0.28),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(47,107,79,0.18),transparent_30%),linear-gradient(180deg,rgba(245,248,244,0),rgba(231,240,234,0.92))]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
        {children}
      </div>
    </div>
  );
}
