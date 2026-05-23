"use client";

import { motion } from "framer-motion";
import type { DashboardTone } from "@/lib/dashboard/dashboard-role-config";

type Props = {
  tone?: DashboardTone;
  label?: string;
  className?: string;
};

const toneRing: Record<DashboardTone, string> = {
  calm: "from-cyan-400/50 to-sky-500/30",
  focus: "from-indigo-400/50 to-cyan-400/30",
  control: "from-amber-400/45 to-rose-500/25",
};

/** Living Dashboard 확장용 상태 오브. 헤더·카드 옆 메타 표시에 재사용 가능 */
export function DashboardStatusOrb({
  tone = "calm",
  label,
  className = "",
}: Props) {
  return (
    <div
      className={["relative inline-flex items-center gap-2", className].join(" ")}
      aria-hidden={label ? undefined : true}
    >
      <motion.span
        className={[
          "relative flex h-3 w-3 rounded-full bg-gradient-to-br shadow-[0_0_12px_rgba(103,232,249,0.45)]",
          toneRing[tone],
        ].join(" ")}
        animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {label ? (
        <span className="text-xs font-bold text-aibeop-text">{label}</span>
      ) : null}
    </div>
  );
}
