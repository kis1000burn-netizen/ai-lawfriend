"use client";

import Link from "next/link";
import { AibeopchinLogoLockup } from "@/components/branding/aibeopchin-logo-lockup";
import { AibeopchinLogoRainbowText } from "@/components/branding/aibeopchin-logo-rainbow-text";
import { AIBEOPCHIN_LOGO_POP_SUBTITLE_CLASS } from "@/lib/branding/aibeopchin-logo-typography";

type AibeopchinLogoProps = {
  href?: string;
  compact?: boolean;
};

export function AibeopchinLogo({
  href = "/",
  compact = false,
}: Readonly<AibeopchinLogoProps>) {
  return (
    <Link
      href={href}
      aria-label="AI법친 홈으로 이동"
      className="group text-aibeop-text"
    >
      <AibeopchinLogoLockup
        size={compact ? "xs" : "sm"}
        direction="horizontal"
        surface="header"
        loop
        className="items-center"
      >
        <div className="leading-tight">
          <AibeopchinLogoRainbowText
            className={[
              "transition-opacity group-hover:opacity-90",
              compact ? "text-lg" : "text-xl",
            ].join(" ")}
          />
          {compact ? null : (
            <div
              className={[
                AIBEOPCHIN_LOGO_POP_SUBTITLE_CLASS,
                "mt-0.5 text-xs text-aibeop-muted",
              ].join(" ")}
            >
              변호사와 의뢰인을 잇는 AI 법률업무 플랫폼
            </div>
          )}
        </div>
      </AibeopchinLogoLockup>
    </Link>
  );
}
