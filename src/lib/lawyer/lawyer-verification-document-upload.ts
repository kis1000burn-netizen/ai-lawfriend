import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/domain-api-response";
import {
  LAWYER_VERIFICATION_ALLOWED_MIME,
  LAWYER_VERIFICATION_UPLOAD_MAX_BYTES,
  saveLawyerVerificationUpload,
} from "@/lib/lawyer/lawyer-verification-storage";
import { isLawyerVerificationDocumentTypeId } from "@/lib/lawyer/lawyer-verification-document-types";

/** jsdom 등 `Blob.prototype.arrayBuffer` 미구현 환경 대비 */
async function readBlobAsBuffer(blob: Blob): Promise<Buffer> {
  if (typeof blob.arrayBuffer === "function") {
    return Buffer.from(await blob.arrayBuffer());
  }
  return Buffer.from(await new Response(blob).arrayBuffer());
}

/** FormData 본문 파싱 이후 실제 저장(P2). 단위 테스트에서 Request 없이 호출 가능. */
export async function createLawyerVerificationDocumentFromForm(
  lawyerProfileId: string,
  form: FormData,
) {
  const typeRaw = form.get("type");
  const file = form.get("file");

  if (typeof typeRaw !== "string" || typeRaw.trim().length === 0) {
    return fail("type 이 필요합니다.", 422, { code: "VALIDATION_ERROR" });
  }
  const type = typeRaw.trim().slice(0, 64);
  if (!isLawyerVerificationDocumentTypeId(type)) {
    return fail("증빙 유형이 올바르지 않습니다.", 422, { code: "VALIDATION_ERROR" });
  }

  if (!(file instanceof Blob) || file.size === 0) {
    return fail("파일이 필요합니다.", 422, { code: "VALIDATION_ERROR" });
  }

  if (file.size > LAWYER_VERIFICATION_UPLOAD_MAX_BYTES) {
    return fail(
      `파일 크기는 ${LAWYER_VERIFICATION_UPLOAD_MAX_BYTES / (1024 * 1024)}MB 이하여야 합니다.`,
      413,
      { code: "PAYLOAD_TOO_LARGE" },
    );
  }

  const originalName =
    file instanceof File && file.name?.trim() ? file.name.trim() : "upload.bin";

  let mime = (file.type || "application/octet-stream").split(";")[0]?.trim().toLowerCase() ?? "";
  if (!mime || mime === "application/octet-stream") {
    const lower = originalName.toLowerCase();
    if (lower.endsWith(".pdf")) mime = "application/pdf";
    else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mime = "image/jpeg";
    else if (lower.endsWith(".png")) mime = "image/png";
    else if (lower.endsWith(".webp")) mime = "image/webp";
  }
  if (!LAWYER_VERIFICATION_ALLOWED_MIME.has(mime)) {
    return fail("허용되지 않은 파일 형식입니다. PDF 또는 JPEG/PNG/WebP 만 업로드할 수 있습니다.", 422, {
      code: "VALIDATION_ERROR",
    });
  }

  const buf = await readBlobAsBuffer(file);

  const saved = await saveLawyerVerificationUpload({
    lawyerProfileId,
    body: buf,
    contentType: mime,
    originalFileName: originalName,
  });

  const doc = await prisma.lawyerVerificationDocument.create({
    data: {
      lawyerProfileId,
      type,
      fileName: originalName.slice(0, 500),
      fileUrl: null,
      storageKey: saved.storageKey,
      bucket: saved.bucket,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      checksum: saved.checksum,
    },
    select: {
      id: true,
      type: true,
      fileName: true,
      storageKey: true,
      uploadedAt: true,
      mimeType: true,
      sizeBytes: true,
    },
  });

  return ok({ document: doc }, { status: 201 });
}
