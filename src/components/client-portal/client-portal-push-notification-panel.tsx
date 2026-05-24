"use client";

import { useCallback, useEffect, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";
import {
  CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
  CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
} from "@/features/client-portal/client-portal-mobile-a11y.policy";
import {
  resolveClientPortalNotificationPermissionState,
  urlBase64ToUint8Array,
  type ClientPortalNotificationPermissionState,
} from "@/features/client-portal/client-portal-push-notification.policy";

export const CLIENT_PORTAL_PUSH_PANEL_MARKER_PHASE21D =
  "phase21d-client-portal-push-notification-panel" as const;

export const CLIENT_PORTAL_PUSH_PANEL_A11Y_MARKER_PHASE21E =
  "phase21e-client-portal-push-notification-panel-a11y" as const;

type PushSurfaceState = {
  vapidPublicKey: string | null;
  liveSendEnabled: boolean;
  preferences: {
    webPushOptIn: boolean;
    kakaoOptIn: boolean;
    emailOptIn: boolean;
    documentShareNoticeEnabled: boolean;
    litigationDeadlineReminderEnabled: boolean;
  };
  subscriptions: Array<{ id: string; endpoint: string }>;
};

const PERMISSION_LABEL: Record<ClientPortalNotificationPermissionState, string> = {
  unsupported: "브라우저 미지원",
  default: "아직 요청하지 않음",
  granted: "허용됨",
  denied: "거부됨",
};

export function ClientPortalPushNotificationPanel() {
  const [permission, setPermission] = useState<ClientPortalNotificationPermissionState>("default");
  const [state, setState] = useState<PushSurfaceState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setPermission(resolveClientPortalNotificationPermissionState());
    const res = await fetch("/api/client/push-subscriptions", {
      credentials: "include",
      cache: "no-store",
    });
    const raw = await res.json().catch(() => null);
    const data = requireOkData<PushSurfaceState>(
      res,
      raw,
      "알림 설정을 불러오지 못했습니다.",
    );
    setState(data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchPreferences(patch: Partial<PushSurfaceState["preferences"]>) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/client/notification-preferences", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "알림 설정 저장에 실패했습니다.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function requestPermissionAndSubscribe() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setMessage("이 브라우저는 웹 푸시를 지원하지 않습니다.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult as ClientPortalNotificationPermissionState);
      if (permissionResult !== "granted") {
        setMessage("브라우저 알림 권한이 필요합니다.");
        return;
      }

      const keyRes = await fetch("/api/client/push-subscriptions/vapid-public-key", {
        credentials: "include",
        cache: "no-store",
      });
      const keyRaw = await keyRes.json().catch(() => null);
      const keyData = requireOkData<{ publicKey: string | null; liveSendEnabled: boolean }>(
        keyRes,
        keyRaw,
        "푸시 키를 불러오지 못했습니다.",
      );

      if (!keyData.publicKey) {
        setMessage("푸시 구독 준비 중입니다. 알림함은 포털에서 확인할 수 있습니다.");
        await patchPreferences({ webPushOptIn: true });
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("구독 정보가 올바르지 않습니다.");
      }

      const res = await fetch("/api/client/push-subscriptions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        }),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "푸시 구독 등록에 실패했습니다.");
      await load();
      setMessage("웹 푸시 구독이 등록되었습니다. (실제 발송은 운영 정책에 따라 제한됩니다)");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribeAll() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/client/push-subscriptions", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disableAll: true }),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "구독 해제에 실패했습니다.");
      await load();
      setMessage("웹 푸시 구독이 해제되었습니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const subscribed = (state?.subscriptions.length ?? 0) > 0;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-labelledby="client-portal-push-panel-title"
      data-testid="client-portal-push-notification-panel"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
        Product Phase 21-D · 알림 설정
      </p>
      <h2 id="client-portal-push-panel-title" className="mt-1 text-lg font-bold text-slate-900">
        웹 푸시 · 알림 수신
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        알림 본문에는 사건 내용이 포함되지 않으며, 보안 포털 링크로만 이동합니다.
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">브라우저 권한</dt>
          <dd className="font-semibold text-slate-900" data-testid="client-portal-push-permission">
            {PERMISSION_LABEL[permission]}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">웹 푸시 동의</dt>
          <dd className="font-semibold text-slate-900">
            {state?.preferences.webPushOptIn ? "ON" : "OFF"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">구독 기기</dt>
          <dd className="font-semibold text-slate-900">{state?.subscriptions.length ?? 0}대</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">실제 push 발송</dt>
          <dd className="font-semibold text-amber-800">
            {state?.liveSendEnabled ? "운영 ON" : "기본 OFF"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          aria-label="브라우저 알림 허용 및 웹 푸시 구독"
          className={[
            "rounded-xl bg-indigo-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 sm:min-h-11",
            CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
            CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
          ].join(" ")}
          onClick={() => void requestPermissionAndSubscribe()}
          data-testid="client-portal-push-subscribe"
        >
          알림 허용 · 구독
        </button>
        {subscribed ? (
          <button
            type="button"
            disabled={busy}
            aria-label="웹 푸시 구독 해제"
            className={[
              "rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60 sm:min-h-11",
              CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
              CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
            ].join(" ")}
            onClick={() => void unsubscribeAll()}
            data-testid="client-portal-push-unsubscribe"
          >
            구독 해제
          </button>
        ) : null}
      </div>

      {message ? (
        <p
          className="mt-3 text-xs leading-5 text-indigo-900 sm:text-sm"
          role="status"
          aria-live="polite"
          data-testid="client-portal-push-message"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
