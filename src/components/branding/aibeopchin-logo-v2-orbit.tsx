"use client";

import { motion } from "framer-motion";

type Props = {
  active: boolean;
  variant?: "light" | "dark";
};

export function AibeopchinLogoV2Orbit({
  active,
  variant = "light",
}: Props) {
  const borderClass =
    variant === "light"
      ? "border-aibeop-accent/50"
      : "border-cyan-200/20";

  const innerBorderClass =
    variant === "light"
      ? "border-aibeop-green/25"
      : "border-cyan-100/15";

  return (
    <>
      <motion.div
        className={[
          "pointer-events-none absolute inset-2 rounded-[1.85rem] border-2 border-dashed",
          borderClass,
        ].join(" ")}
        animate={
          active
            ? {
                rotate: [0, 4, -4, 0],
                opacity: [0.35, 0.75, 0.45, 0.35],
                scale: [1, 1.02, 0.99, 1],
              }
            : { rotate: 0, opacity: 0.22, scale: 1 }
        }
        transition={{
          duration: active ? 5.5 : 0.4,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {active ? (
        <motion.div
          className={[
            "pointer-events-none absolute inset-5 rounded-[1.5rem] border",
            innerBorderClass,
          ].join(" ")}
          animate={{ rotate: 360, opacity: [0.2, 0.45, 0.2] }}
          transition={{
            rotate: { duration: 14, repeat: Infinity, ease: "linear" },
            opacity: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ) : null}
    </>
  );
}
