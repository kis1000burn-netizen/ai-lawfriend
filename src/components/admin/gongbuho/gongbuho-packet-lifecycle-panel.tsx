"use client";

import { useRouter } from "next/navigation";
import type { GongbuhoPacketStatus } from "@prisma/client";
import { useCallback, useState } from "react";
import { deriveGongbuhoPacketLifecycleUi } from "@/features/gongbuho/admin-gongbuho-lifecycle-ui";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      message?: string;
      code?: string;
    };

async function parseApi<T>(res: Response): Promise<ApiEnvelope<T>> {
  const raw = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!raw || typeof raw !== "object" || typeof raw.ok !== "boolean") {
    return { ok: false, message: "응답 형식 오류입니다." };
  }
  return raw;
}

export function GongbuhoPacketLifecyclePanel(props: Readonly<{
  packetId: string;
  status: GongbuhoPacketStatus;
  viewerCanMutateLifecycle: boolean;
}>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ui = deriveGongbuhoPacketLifecycleUi({
    status: props.status,
    viewerCanMutateLifecycle: props.viewerCanMutateLifecycle,
  });

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  async function handleApprove() {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/gongbuho/${props.packetId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      const body = await parseApi<{ alreadyApproved?: boolean }>(res);
      if (!body.ok) {
        throw new Error(body.message ?? `승인 실패 (${res.status})`);
      }
      if (body.data && "alreadyApproved" in body.data && body.data.alreadyApproved) {
        alert("이미 승인된 패킷입니다.");
      } else {
        alert("승인이 반영되었습니다.");
      }
      refresh();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "알 수 없는 오류로 승인에 실패했습니다.";
      setErrorMsg(msg);
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (
      !globalThis.confirm(
        "선택한 공부호를 보관 처리(ARCHIVED)합니다. 계속할까요?",
      )
    ) {
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/gongbuho/${props.packetId}/archive`, {
        method: "POST",
        credentials: "include",
      });
      const body = await parseApi<{ alreadyArchived?: boolean }>(res);
      if (!body.ok) {
        throw new Error(body.message ?? `보관 실패 (${res.status})`);
      }
      if (
        body.data &&
        "alreadyArchived" in body.data &&
        body.data.alreadyArchived
      ) {
        alert("이미 보관된 패킷입니다.");
      } else {
        alert("보관 처리가 반영되었습니다.");
      }
      refresh();
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "알 수 없는 오류로 보관 처리에 실패했습니다.";
      setErrorMsg(msg);
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="공부호 패킷 라이프사이클"
      className="rounded-xl border border-teal-200 bg-teal-50/70 p-5"
    >
      <h2 className="text-sm font-semibold text-teal-950">패킷 운영 승인·보관 (Phase 4-B)</h2>

      {ui.staffReadOnlyBanner ? (
        <p className="mt-2 text-sm leading-relaxed text-teal-900">{ui.staffReadOnlyBanner}</p>
      ) : null}

      {errorMsg ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
          {errorMsg}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {ui.approve.showButton ? (
          <button
            type="button"
            disabled={busy || ui.approve.disabled}
            onClick={handleApprove}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              ui.approve.disabled
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                : "border border-teal-800 bg-teal-900 text-white hover:bg-teal-950 disabled:opacity-70"
            }`}
          >
            패킷 승인(APPROVED)
          </button>
        ) : null}

        {ui.archive.showButton ? (
          <button
            type="button"
            disabled={busy || ui.archive.disabled}
            onClick={handleArchive}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              ui.archive.disabled
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                : "border border-amber-800 bg-amber-800 text-white hover:bg-amber-900 disabled:opacity-70"
            }`}
          >
            보관 처리(ARCHIVED)
          </button>
        ) : null}
      </div>

      <dl className="mt-4 space-y-2 text-xs leading-relaxed text-teal-900/95">
        <div>
          <dt className="font-semibold">승인</dt>
          <dd>{ui.approve.caption}</dd>
        </div>
        <div>
          <dt className="font-semibold">보관</dt>
          <dd>{ui.archive.caption}</dd>
        </div>
      </dl>

      <p className="mt-3 text-[11px] text-teal-900/85">
        삭제 및 적용 이력(`GongbuhoTrace`) 제거 기능은 제공하지 않습니다. 보관 처리 시 새 사건 적용 후보에서는
        제외됩니다.
      </p>
    </section>
  );
}
