import { LAWYER_VERIFICATION_DOCUMENT_TYPE } from "@/lib/lawyer/lawyer-verification-document-types";
import {
  LAWYER_VERIFICATION_ALLOWED_MIME,
  LAWYER_VERIFICATION_UPLOAD_MAX_BYTES,
  saveLawyerVerificationSignupStagingUpload,
} from "@/lib/lawyer/lawyer-verification-storage";
import { ok, fail } from "@/lib/domain-api-response";
import { simpleRateLimit } from "@/lib/server/simple-rate-limit";

function clientIpFromRequest(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip")?.trim() ??
    "unknown"
  );
}

const STAGING_UPLOAD_WINDOW_MS = 60_000;
const STAGING_UPLOAD_MAX_PER_WINDOW = 24;

export const dynamic = "force-dynamic";

const SIGNUP_ALLOWED_TYPES = new Set<string>([
  LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE,
  LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID,
]);

async function readBlobAsBuffer(blob: Blob): Promise<Buffer> {
  if (typeof blob.arrayBuffer === "function") {
    return Buffer.from(await blob.arrayBuffer());
  }
  return Buffer.from(await new Response(blob).arrayBuffer());
}

/** 변호사 가입 전 증빙 임시 업로드(비로그인). 가입 신청 성공 시 스토리지 객체가 프로필 키로 이관됩니다. */
export async function POST(req: Request) {
  try {
    const ipKey = clientIpFromRequest(req);
    const rl = simpleRateLimit({
      key: `signup-lawyer-staging:${ipKey}`,
      limit: STAGING_UPLOAD_MAX_PER_WINDOW,
      windowMs: STAGING_UPLOAD_WINDOW_MS,
    });
    if (!rl.ok) {
      return fail(
        "동일 출처에서 업로드 요청이 너무 빈번합니다. 잠시 후 다시 시도해 주세요.",
        429,
        {
          code: "RATE_LIMITED",
          retryAfterMs: rl.retryAfterMs,
        },
      );
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return fail("요청 본문을 읽을 수 없습니다.", 400, { code: "VALIDATION_ERROR" });
    }

    const typeRaw = form.get("type");
    if (typeof typeRaw !== "string" || !SIGNUP_ALLOWED_TYPES.has(typeRaw.trim())) {
      return fail("허용되지 않는 증빙 유형입니다.", 422, { code: "VALIDATION_ERROR" });
    }

    const file = form.get("file");
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

    let mime =
      (file.type || "application/octet-stream").split(";")[0]?.trim().toLowerCase() ?? "";
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

    const body = await readBlobAsBuffer(file);
    const saved = await saveLawyerVerificationSignupStagingUpload({
      body,
      contentType: mime,
      originalFileName: originalName,
    });

    return ok(
      {
        document: {
          type: typeRaw.trim(),
          fileName: originalName.slice(0, 500),
          storageKey: saved.storageKey,
          bucket: saved.bucket ?? null,
          mimeType: saved.mimeType,
          sizeBytes: saved.sizeBytes,
          checksum: saved.checksum.toLowerCase(),
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("[SIGNUP_LAWYER_STAGING_UPLOAD]", error);
    return fail("증빙 업로드 처리 중 오류가 발생했습니다.", 500, { code: "INTERNAL_ERROR" });
  }
}
