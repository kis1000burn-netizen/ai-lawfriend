"use client";

import { motion } from "framer-motion";
import {
  EMPTY_CLIENT_CASE_READINESS,
  type ClientCaseReadiness,
} from "@/lib/dashboard/dashboard-metrics";

const READINESS_HINT =
  "입력된 정보를 기준으로 사건 정리 준비 상태를 보여줍니다.";

type Props = {
  readiness?: ClientCaseReadiness;
};

export function ClientCaseReadinessCard({
  readiness = EMPTY_CLIENT_CASE_READINESS,
}: Props) {
  const percent = readiness.percent;
  const items = readiness.items;

  return (
    <div className="rounded-2xl border border-aibeop-line bg-aibeop-soft p-5 shadow-soft ring-1 ring-aibeop-line/70 sm:rounded-3xl sm:p-6">
      <p className="text-xs font-bold text-aibeop-deep sm:text-sm">사건 정리도</p>

      <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-end sm:gap-3">
        <span className="text-4xl font-black tabular-nums text-aibeop-text sm:text-5xl">
          {percent}%
        </span>
        <span className="max-w-[20rem] text-xs font-semibold leading-snug text-aibeop-text sm:pb-2 sm:text-sm">
          {READINESS_HINT}
        </span>
      </div>

      {readiness.sourceCaseTitle ? (
        <p className="mt-3 text-xs font-semibold text-aibeop-deep">
          기준 사건: {readiness.sourceCaseTitle}
        </p>
      ) : null}

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-aibeop-line">
        <motion.div
          className="h-full rounded-full bg-aibeop-green"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>

      <ul className="mt-5 grid gap-2 sm:mt-6 sm:gap-3">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex min-h-11 flex-col gap-1 rounded-xl border border-aibeop-line/70 bg-aibeop-card px-3 py-2.5 text-sm sm:min-h-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:px-4 sm:py-3"
          >
            <div className="min-w-0">
              <span className="font-bold text-aibeop-text">{item.label}</span>
              {item.description ? (
                <p className="mt-1 text-xs font-semibold leading-relaxed text-aibeop-deep">
                  {item.description}
                </p>
              ) : null}
            </div>
            <span
              className={
                item.done ? "shrink-0 font-bold text-aibeop-green" : "shrink-0 font-bold text-aibeop-muted"
              }
            >
              {item.done ? "완료" : "대기"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
