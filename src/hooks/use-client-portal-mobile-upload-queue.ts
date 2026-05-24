"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadClientPortalFileWithProgress } from "@/features/client-portal/client-portal-mobile-upload.client";
import {
  CLIENT_PORTAL_MOBILE_UPLOAD_DEPARTURE_WARNING,
  validateClientPortalMobileUploadFile,
  type ClientPortalMobileUploadFailureCode,
} from "@/features/client-portal/client-portal-mobile-upload.policy";

export const CLIENT_MOBILE_UPLOAD_QUEUE_MARKER_PHASE21B =
  "phase21b-client-mobile-upload-queue" as const;

export type ClientPortalUploadQueueItemStatus =
  | "pending"
  | "uploading"
  | "success"
  | "failed";

export type ClientPortalUploadQueueItem = {
  localId: string;
  file: File;
  fileName: string;
  status: ClientPortalUploadQueueItemStatus;
  progress: number;
  fileId?: string;
  errorMessage?: string;
  failureCode?: ClientPortalMobileUploadFailureCode;
  failureMeta?: Record<string, unknown>;
};

function createLocalId() {
  return `cpu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useClientPortalMobileUploadQueue(input: {
  caseId: string;
  onFileUploaded?: (fileId: string, fileName: string) => void;
}) {
  const [items, setItems] = useState<ClientPortalUploadQueueItem[]>([]);
  const processingRef = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const hasActiveUploads = items.some(
    (item) => item.status === "pending" || item.status === "uploading",
  );

  useEffect(() => {
    if (!hasActiveUploads) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = CLIENT_PORTAL_MOBILE_UPLOAD_DEPARTURE_WARNING;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasActiveUploads]);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      while (true) {
        const next = itemsRef.current.find((item) => item.status === "pending");
        if (!next) break;

        setItems((prev) =>
          prev.map((item) =>
            item.localId === next.localId
              ? { ...item, status: "uploading", progress: 0, errorMessage: undefined }
              : item,
          ),
        );

        try {
          const result = await uploadClientPortalFileWithProgress({
            caseId: input.caseId,
            file: next.file,
            onProgress: (percent) => {
              setItems((prev) =>
                prev.map((item) =>
                  item.localId === next.localId ? { ...item, progress: percent } : item,
                ),
              );
            },
          });

          setItems((prev) =>
            prev.map((item) =>
              item.localId === next.localId
                ? {
                    ...item,
                    status: "success",
                    progress: 100,
                    fileId: result.fileId,
                  }
                : item,
            ),
          );
          input.onFileUploaded?.(result.fileId, next.fileName);
        } catch (error) {
          const failure = error as {
            message?: string;
            failureCode?: ClientPortalMobileUploadFailureCode;
            failureMeta?: Record<string, unknown>;
          };
          setItems((prev) =>
            prev.map((item) =>
              item.localId === next.localId
                ? {
                    ...item,
                    status: "failed",
                    progress: 0,
                    errorMessage: failure.message ?? "업로드 실패",
                    failureCode: failure.failureCode ?? "SERVER_REJECTED",
                    failureMeta: failure.failureMeta,
                  }
                : item,
            ),
          );
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, [input.caseId, input.onFileUploaded]);

  const addFiles = useCallback((files: File[] | FileList) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const nextItems: ClientPortalUploadQueueItem[] = [];
    for (const file of list) {
      const validation = validateClientPortalMobileUploadFile(file);
      if (!validation.ok) {
        nextItems.push({
          localId: createLocalId(),
          file,
          fileName: file.name,
          status: "failed",
          progress: 0,
          errorMessage: validation.reason,
          failureCode: validation.failureCode,
        });
        continue;
      }
      nextItems.push({
        localId: createLocalId(),
        file,
        fileName: file.name,
        status: "pending",
        progress: 0,
      });
    }

    setItems((prev) => [...prev, ...nextItems]);
  }, []);

  useEffect(() => {
    if (!items.some((item) => item.status === "pending")) return;
    void processQueue();
  }, [items, processQueue]);

  const retryUpload = useCallback((localId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.localId === localId && item.status === "failed"
          ? {
              ...item,
              status: "pending",
              progress: 0,
              errorMessage: undefined,
              failureCode: undefined,
              failureMeta: undefined,
            }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((localId: string) => {
    setItems((prev) => prev.filter((item) => item.localId !== localId));
  }, []);

  const clearSuccessful = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.status !== "success"));
  }, []);

  return {
    items,
    addFiles,
    retryUpload,
    removeItem,
    clearSuccessful,
    hasActiveUploads,
    successCount: items.filter((item) => item.status === "success").length,
  };
}
