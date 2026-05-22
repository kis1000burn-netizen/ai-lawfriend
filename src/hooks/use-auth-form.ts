"use client";

import { useState } from "react";
import { readJsonApiErrorEnvelope, readJsonApiErrorMessage } from "@/lib/client/api-error";
import { getErrorMessage } from "@/lib/error-messages";

type SubmitOptions<TBody, TSuccessData> = {
  endpoint: string;
  body: TBody;
  onSuccess: (data: TSuccessData) => void | Promise<void>;
};

export type AccountPendingNotice = {
  message: string;
  pendingAccountRole?: string;
};

export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountPending, setAccountPending] = useState<AccountPendingNotice | null>(null);

  async function submit<TBody, TSuccessData>({
    endpoint,
    body,
    onSuccess,
  }: SubmitOptions<TBody, TSuccessData>) {
    setLoading(true);
    setErrorMessage("");
    setAccountPending(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json: unknown = await res.json();

      if (!res.ok) {
        const env = readJsonApiErrorEnvelope(json, "요청에 실패했습니다.");
        if (env.code === "ACCOUNT_PENDING") {
          setAccountPending({
            message: env.message,
            pendingAccountRole: env.pendingAccountRole,
          });
          return;
        }
        setErrorMessage(env.message);
        return;
      }

      if (!json || typeof json !== "object" || (json as { ok?: boolean }).ok !== true) {
        setErrorMessage(readJsonApiErrorMessage(json, "요청에 실패했습니다."));
        return;
      }

      const data = (json as { data?: TSuccessData }).data;
      if (data === undefined) {
        setErrorMessage("응답 형식이 올바르지 않습니다.");
        return;
      }

      await onSuccess(data);
    } catch {
      setErrorMessage(getErrorMessage({ code: "NETWORK_ERROR" }));
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    errorMessage,
    accountPending,
    setErrorMessage,
    submit,
  };
}
