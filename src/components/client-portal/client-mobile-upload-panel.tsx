"use client";

import { useEffect, useRef, useState } from "react";
import {
  CLIENT_PORTAL_MOBILE_CAMERA_CAPTURE,
  CLIENT_PORTAL_MOBILE_UPLOAD_ACCEPT,
  CLIENT_PORTAL_MOBILE_UPLOAD_DEPARTURE_WARNING,
  formatClientPortalMobileUploadLimitGuide,
} from "@/features/client-portal/client-portal-mobile-upload.policy";
import {
  CLIENT_PORTAL_MOBILE_A11Y_POLICY_MARKER_PHASE21E,
  CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
  CLIENT_PORTAL_MOBILE_SLOW_UPLOAD_MESSAGE,
  CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
  shouldShowClientPortalSlowUploadHint,
} from "@/features/client-portal/client-portal-mobile-a11y.policy";
import type { useClientPortalMobileUploadQueue } from "@/hooks/use-client-portal-mobile-upload-queue";

export const CLIENT_MOBILE_UPLOAD_PANEL_MARKER_PHASE21B =
  "phase21b-client-mobile-upload-panel" as const;

export const CLIENT_MOBILE_UPLOAD_PANEL_A11Y_MARKER_PHASE21E =
  "phase21e-client-mobile-upload-panel-a11y" as const;

type UploadQueue = ReturnType<typeof useClientPortalMobileUploadQueue>;

type Props = {
  queue: UploadQueue;
  disabled?: boolean;
  testId?: string;
  heading?: string;
};

export function ClientMobileUploadPanel({
  queue,
  disabled = false,
  testId = "client-mobile-upload-panel",
  heading = "증거자료 업로드",
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadElapsedMs, setUploadElapsedMs] = useState(0);

  useEffect(() => {
    if (!queue.hasActiveUploads) {
      setUploadElapsedMs(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setUploadElapsedMs(Date.now() - startedAt);
    }, 500);

    return () => window.clearInterval(timer);
  }, [queue.hasActiveUploads]);

  const showSlowNetworkHint = shouldShowClientPortalSlowUploadHint(
    queue.hasActiveUploads,
    uploadElapsedMs,
  );

  return (
    <div
      className={["space-y-3 text-base leading-relaxed", CLIENT_PORTAL_MOBILE_A11Y_POLICY_MARKER_PHASE21E].join(
        " ",
      )}
      data-testid={testId}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900 sm:text-base">{heading}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
          {formatClientPortalMobileUploadLimitGuide()}
        </p>
      </div>

      {queue.hasActiveUploads ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950 sm:text-sm"
          role="status"
          aria-live="polite"
          data-testid={`${testId}-departure-warning`}
        >
          {CLIENT_PORTAL_MOBILE_UPLOAD_DEPARTURE_WARNING}
        </p>
      ) : null}

      {showSlowNetworkHint ? (
        <p
          className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-950 sm:text-sm"
          role="status"
          aria-live="polite"
          data-testid={`${testId}-slow-network-hint`}
        >
          {CLIENT_PORTAL_MOBILE_SLOW_UPLOAD_MESSAGE}
        </p>
      ) : null}

      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        data-testid={`${testId}-upload-status`}
      >
        {queue.items
          .filter((item) => item.status === "uploading")
          .map((item) => `${item.fileName} 업로드 ${item.progress}%`)
          .join(", ")}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled || queue.hasActiveUploads}
          onClick={() => cameraInputRef.current?.click()}
          aria-label="카메라로 증거자료 촬영"
          className={[
            "min-h-12 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-950 disabled:opacity-60 sm:min-h-[2.75rem]",
            CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
            CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
          ].join(" ")}
          data-testid={`${testId}-camera-button`}
        >
          카메라 촬영
        </button>
        <button
          type="button"
          disabled={disabled || queue.hasActiveUploads}
          onClick={() => galleryInputRef.current?.click()}
          aria-label="사진 또는 파일 선택"
          className={[
            "min-h-12 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60 sm:min-h-[2.75rem]",
            CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
            CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
          ].join(" ")}
          data-testid={`${testId}-gallery-button`}
        >
          사진/파일 선택
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept={CLIENT_PORTAL_MOBILE_UPLOAD_ACCEPT}
        capture={CLIENT_PORTAL_MOBILE_CAMERA_CAPTURE}
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files?.length) queue.addFiles(files);
          event.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={CLIENT_PORTAL_MOBILE_UPLOAD_ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files?.length) queue.addFiles(files);
          event.target.value = "";
        }}
      />

      {queue.items.length > 0 ? (
        <ul className="space-y-2" data-testid={`${testId}-queue`}>
          {queue.items.map((item) => (
            <li
              key={item.localId}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm sm:text-base"
              data-testid={`${testId}-item-${item.localId}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{item.fileName}</p>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    {item.status === "uploading"
                      ? `업로드 중 ${item.progress}%`
                      : item.status === "success"
                        ? "업로드 완료"
                        : item.status === "failed"
                          ? item.errorMessage ?? "업로드 실패"
                          : "대기 중"}
                  </p>
                </div>
                {item.status === "failed" ? (
                  <button
                    type="button"
                    onClick={() => queue.retryUpload(item.localId)}
                    aria-label={`${item.fileName} 업로드 재시도`}
                    className={[
                      "shrink-0 rounded-lg bg-indigo-900 px-2 py-1 text-xs font-semibold text-white sm:min-h-11 sm:px-3 sm:py-2",
                      CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
                    ].join(" ")}
                    data-testid={`${testId}-retry-${item.localId}`}
                  >
                    재시도
                  </button>
                ) : null}
              </div>
              {item.status === "uploading" || (item.status === "success" && item.progress > 0) ? (
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.progress}
                  aria-label={`${item.fileName} 업로드 진행률`}
                >
                  <div
                    className="h-full rounded-full bg-indigo-700 transition-all motion-reduce:transition-none"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              ) : null}
              {item.failureCode ? (
                <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">코드: {item.failureCode}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {queue.successCount > 0 ? (
        <p
          className="text-xs font-medium text-emerald-700 sm:text-sm"
          role="status"
          aria-live="polite"
          data-testid={`${testId}-success-count`}
        >
          업로드 완료 {queue.successCount}건 · 제출 버튼을 눌러 변호사에게 전달하세요.
        </p>
      ) : null}
    </div>
  );
}
