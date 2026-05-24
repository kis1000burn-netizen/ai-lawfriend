/**
 * Product Phase 21-B — XHR upload with progress for client portal.
 */
import { readJsonApiErrorMessage } from "@/lib/client/api-error";
import {
  buildClientPortalMobileUploadFailureMeta,
  mapServerUploadErrorToFailureCode,
  type ClientPortalMobileUploadFailureCode,
} from "./client-portal-mobile-upload.policy";

export const CLIENT_MOBILE_UPLOAD_CLIENT_MARKER_PHASE21B =
  "phase21b-client-mobile-upload-client" as const;

export type ClientPortalMobileUploadSuccess = {
  fileId: string;
};

export type ClientPortalMobileUploadFailure = {
  message: string;
  failureCode: ClientPortalMobileUploadFailureCode;
  failureMeta: Record<string, unknown>;
};

export function uploadClientPortalFileWithProgress(input: {
  caseId: string;
  file: File;
  onProgress?: (percent: number) => void;
}): Promise<ClientPortalMobileUploadSuccess> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", input.file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/client/cases/${input.caseId}/files/upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !input.onProgress) return;
      input.onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      let json: unknown = null;
      try {
        json = JSON.parse(xhr.responseText || "{}");
      } catch {
        reject(buildFailure(input.file, input.caseId, "응답을 해석하지 못했습니다.", "SERVER_REJECTED", xhr.status));
        return;
      }

      const okFlag =
        xhr.status >= 200 &&
        xhr.status < 300 &&
        typeof json === "object" &&
        json !== null &&
        (json as { ok?: boolean }).ok === true;

      if (!okFlag) {
        const message = readJsonApiErrorMessage(json, "파일 업로드에 실패했습니다.");
        const failureCode = mapServerUploadErrorToFailureCode(message, xhr.status);
        reject(buildFailure(input.file, input.caseId, message, failureCode, xhr.status));
        return;
      }

      const data = (json as { data?: { fileId?: string; id?: string } }).data;
      const fileId = data?.fileId ?? data?.id;
      if (!fileId) {
        reject(
          buildFailure(
            input.file,
            input.caseId,
            "업로드 응답에 fileId가 없습니다.",
            "SERVER_REJECTED",
            xhr.status,
          ),
        );
        return;
      }

      input.onProgress?.(100);
      resolve({ fileId });
    };

    xhr.onerror = () => {
      reject(
        buildFailure(
          input.file,
          input.caseId,
          "업로드 중 네트워크 오류가 발생했습니다.",
          "NETWORK_ERROR",
        ),
      );
    };

    xhr.onabort = () => {
      reject(
        buildFailure(
          input.file,
          input.caseId,
          "업로드가 중단되었습니다.",
          "NETWORK_ERROR",
        ),
      );
    };

    xhr.send(formData);
  });
}

function buildFailure(
  file: File,
  caseId: string,
  message: string,
  failureCode: ClientPortalMobileUploadFailureCode,
  httpStatus?: number,
): ClientPortalMobileUploadFailure {
  return {
    message,
    failureCode,
    failureMeta: buildClientPortalMobileUploadFailureMeta({
      failureCode,
      caseId,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      httpStatus,
    }),
  };
}
