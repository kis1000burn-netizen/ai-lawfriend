"use client";

import { motion } from "framer-motion";
import { DASHBOARD_AMBIENCE_COPY } from "@/lib/dashboard/dashboard-copy";

const points = [
  { label: "긴급", x: 18, y: 32, size: 18 },
  { label: "검토", x: 52, y: 24, size: 14 },
  { label: "보완", x: 72, y: 58, size: 16 },
  { label: "승인", x: 34, y: 70, size: 12 },
  { label: "대기", x: 62, y: 78, size: 10 },
];

export function LawyerCaseRadar() {
  return (
    <div className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft ring-1 ring-aibeop-line/70 sm:rounded-3xl sm:p-6">
      <div className="mb-3 sm:mb-4">
        <p className="text-xs font-bold text-aibeop-deep sm:text-sm">AI 사건 레이더</p>
        <h3 className="mt-1.5 text-lg font-black leading-snug text-aibeop-text sm:mt-2 sm:text-xl">
          {DASHBOARD_AMBIENCE_COPY.lawyerRadarCaption}
        </h3>
      </div>

      <div className="relative h-56 min-h-[200px] overflow-hidden rounded-2xl border border-white/12 bg-slate-950 sm:h-64 md:h-72 md:rounded-[2rem]">
        <div className="absolute inset-8 rounded-full border border-cyan-200/10" />
        <div className="absolute inset-16 rounded-full border border-cyan-200/10" />
        <div className="absolute inset-24 rounded-full border border-cyan-200/10" />

        {points.map((point, index) => (
          <motion.div
            key={point.label}
            className="absolute rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.65)]"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: point.size,
              height: point.size,
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0.5, 0.82, 0.5], scale: [0.96, 1.08, 0.96] }}
            transition={{
              delay: index * 0.22,
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            title={point.label}
          />
        ))}
      </div>
    </div>
  );
}
