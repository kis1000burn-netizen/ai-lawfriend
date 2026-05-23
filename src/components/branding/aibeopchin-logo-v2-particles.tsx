"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { AIBEOPCHIN_LOGO_V2_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-config";

type Props = {
  active: boolean;
  variant?: "light" | "dark";
};

function buildParticles(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const angleDeg = (index / count) * 360;
    const radius = 34 + (index % 6) * 5;

    return {
      id: index,
      angleDeg,
      radius,
      delay: (index % 10) * 0.12,
      size: index % 3 === 0 ? 6 : 4,
    };
  });
}

export function AibeopchinLogoV2Particles({
  active,
  variant = "light",
}: Props) {
  const particles = useMemo(
    () => buildParticles(Math.min(AIBEOPCHIN_LOGO_V2_CONFIG.particleCount, 24)),
    [],
  );

  const particleClass =
    variant === "light"
      ? "bg-aibeop-green shadow-[0_0_10px_rgba(47,107,79,0.55)]"
      : "bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.75)]";

  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      <motion.div
        className="absolute left-1/2 top-[38%] h-0 w-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className={["absolute rounded-full", particleClass].join(" ")}
            style={{
              width: particle.size,
              height: particle.size,
              left: 0,
              top: 0,
              transform: `rotate(${particle.angleDeg}deg) translateX(${particle.radius}px)`,
              transformOrigin: "0 0",
            }}
            animate={{
              opacity: [0.25, 0.95, 0.35],
              scale: [0.7, 1.15, 0.85],
            }}
            transition={{
              delay: particle.delay,
              duration: 2.2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
