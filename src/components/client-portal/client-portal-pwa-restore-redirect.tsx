"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildClientPortalRestorePath,
  isPwaStandaloneDisplayMode,
  readClientPortalLastVisit,
  shouldRestoreClientPortalFromPwaLaunch,
} from "@/features/client-portal/client-portal-pwa.policy";

export const CLIENT_PORTAL_PWA_RESTORE_MARKER_PHASE21C =
  "phase21c-client-portal-pwa-restore" as const;

export function ClientPortalPwaRestoreRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const search = searchParams.toString();
    const query = search ? `?${search}` : "";
    const fromPwa = shouldRestoreClientPortalFromPwaLaunch(query) || isPwaStandaloneDisplayMode();
    if (!fromPwa) return;

    const last = readClientPortalLastVisit();
    if (!last?.caseId) return;

    handled.current = true;
    router.replace(buildClientPortalRestorePath(last));
  }, [router, searchParams]);

  return null;
}
