"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AibeopchinLogoLockup } from "@/components/branding/aibeopchin-logo-lockup";
import { AibeopchinLogoRainbowText } from "@/components/branding/aibeopchin-logo-rainbow-text";
import { resolveLogoMode } from "@/lib/branding/aibeopchin-logo-runtime";
import { AIBEOPCHIN_LOGO_POP_FONT_CLASS } from "@/lib/branding/aibeopchin-logo-typography";
import type { DashboardRole } from "@/lib/dashboard/dashboard-role-config";
import { DASHBOARD_ROLE_CONFIG } from "@/lib/dashboard/dashboard-role-config";

type Props = {
  role: DashboardRole;
  statusText?: string;
  restricted?: boolean;
};

export function DashboardLivingHeader({
  role,
  statusText,
  restricted = false,
}: Readonly<Props>) {
  const reducedMotion = useReducedMotion();
  const config = DASHBOARD_ROLE_CONFIG[role];
  const logoMode = resolveLogoMode({ role, restricted });
  const rainbowActive = logoMode !== "restricted";

  return (
    <section className="grid gap-8 rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft ring-1 ring-aibeop-line/70 sm:rounded-[2rem] sm:p-6 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:p-8">
      <div className="flex min-w-0 flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-aibeop-deep sm:text-sm sm:tracking-[0.28em]">
          {config.eyebrow}
        </p>

        <motion.h1
          className="mt-3 max-w-3xl text-balance text-2xl font-black tracking-tight text-aibeop-text sm:mt-4 sm:text-3xl md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          {config.title}
        </motion.h1>

        <motion.p
          className="mt-4 max-w-2xl text-pretty text-sm font-semibold leading-relaxed text-aibeop-text sm:mt-5 sm:text-base sm:leading-7 md:text-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
        >
          {config.description}
        </motion.p>

        {statusText ? (
          <div className="mt-5 max-w-full rounded-full border border-aibeop-line bg-aibeop-soft px-3 py-2 text-xs font-bold leading-snug text-aibeop-deep sm:mt-6 sm:inline-flex sm:w-fit sm:px-4 sm:py-2 sm:text-sm">
            {statusText}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-center md:min-h-0">
        <AibeopchinLogoLockup
          size="lg"
          direction="vertical"
          surface="panel"
          loop
          rainbowCycleStroke={rainbowActive}
          reducedMotion={Boolean(reducedMotion)}
          strokeClassName={rainbowActive ? "text-aibeop-text" : "text-aibeop-warn"}
          className="items-center"
        >
          <AibeopchinLogoRainbowText
            active={rainbowActive}
            reducedMotion={Boolean(reducedMotion)}
            className={[AIBEOPCHIN_LOGO_POP_FONT_CLASS, "text-2xl md:text-3xl"].join(" ")}
          />
        </AibeopchinLogoLockup>
      </div>
    </section>
  );
}
