import { createHash, randomBytes } from "node:crypto";
import {
  getIllegalLendingStorage,
  getIllegalLendingStorageDriver,
} from "@/features/illegal-lending/storage/illegal-lending-storage";

export const LAWYER_VERIFICATION_STORAGE_KEY_PREFIX = "lawyer-verification/";

/** 가입 직전(아직 `LawyerProfile` 없음) 업로드 전용. 가입 트랜잭션에서 프로필 키로 이관 후 삭제한다. */
export const LAWYER_VERIFICATION_SIGNUP_STAGING_PREFIX =
  `${LAWYER_VERIFICATION_STORAGE_KEY_PREFIX}signup-staging/`;

export const LAWYER_VERIFICATION_UPLOAD_MAX_BYTES = 20 * 1024 * 1024;

export const LAWYER_VERIFICATION_ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** S3/R2 등일 때 DB `bucket` 기록용. local 은 null. */
export function lawyerVerificationBucketForDb(): string | null {
  const d = getIllegalLendingStorageDriver();
  if (d === "local") return null;
  const own = process.env.LAWYER_VERIFICATION_S3_BUCKET?.trim();
  if (own) return own;
  return process.env.ILLEGAL_LENDING_S3_BUCKET?.trim() || null;
}

function sanitizeOriginalFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  return base || "file.bin";
}

export function buildLawyerVerificationStorageKey(
  lawyerProfileId: string,
  originalFileName: string,
): string {
  const id = randomBytes(10).toString("hex");
  return `${LAWYER_VERIFICATION_STORAGE_KEY_PREFIX}${lawyerProfileId}/${id}-${sanitizeOriginalFileName(originalFileName)}`;
}

export function buildLawyerVerificationSignupStagingStorageKey(originalFileName: string): string {
  const sessionPart = randomBytes(8).toString("hex");
  const id = randomBytes(10).toString("hex");
  return `${LAWYER_VERIFICATION_SIGNUP_STAGING_PREFIX}${sessionPart}/${id}-${sanitizeOriginalFileName(originalFileName)}`;
}

export function isLawyerVerificationSignupStagingStorageKey(key: string): boolean {
  return key.trim().startsWith(LAWYER_VERIFICATION_SIGNUP_STAGING_PREFIX);
}

export function assertLawyerVerificationStorageKeyShape(key: string): void {
  const k = key.trim();
  if (
    !k.startsWith(LAWYER_VERIFICATION_STORAGE_KEY_PREFIX) ||
    k.includes("..") ||
    k.length > 2000
  ) {
    throw new Error("storageKey 형식이 올바르지 않습니다.");
  }
}

export type SavedLawyerVerificationBlob = {
  storageKey: string;
  bucket: string | null;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
};

export async function saveLawyerVerificationUpload(params: {
  lawyerProfileId: string;
  body: Buffer;
  contentType: string;
  originalFileName: string;
}): Promise<SavedLawyerVerificationBlob> {
  const storageKey = buildLawyerVerificationStorageKey(
    params.lawyerProfileId,
    params.originalFileName,
  );
  const storage = getIllegalLendingStorage();
  await storage.save({
    key: storageKey,
    body: params.body,
    contentType: params.contentType,
  });
  const checksum = createHash("sha256").update(params.body).digest("hex");
  return {
    storageKey,
    bucket: lawyerVerificationBucketForDb(),
    mimeType: params.contentType.slice(0, 200),
    sizeBytes: params.body.length,
    checksum,
  };
}

export async function saveLawyerVerificationSignupStagingUpload(params: {
  body: Buffer;
  contentType: string;
  originalFileName: string;
}): Promise<SavedLawyerVerificationBlob> {
  const storageKey = buildLawyerVerificationSignupStagingStorageKey(params.originalFileName);
  const storage = getIllegalLendingStorage();
  await storage.save({
    key: storageKey,
    body: params.body,
    contentType: params.contentType,
  });
  const checksum = createHash("sha256").update(params.body).digest("hex");
  return {
    storageKey,
    bucket: lawyerVerificationBucketForDb(),
    mimeType: params.contentType.slice(0, 200),
    sizeBytes: params.body.length,
    checksum,
  };
}

/**
 * 가입 스테이징 객체를 변호사 프로필 전용 키로 복사한 뒤 스테이징 객체는 best-effort 삭제.
 */
export async function claimSignupStagingLawyerVerificationDocument(params: {
  stagingStorageKey: string;
  lawyerProfileId: string;
}): Promise<SavedLawyerVerificationBlob> {
  const stagingKey = params.stagingStorageKey.trim();
  if (!isLawyerVerificationSignupStagingStorageKey(stagingKey)) {
    throw new Error("INVALID_STAGING_KEY");
  }
  assertLawyerVerificationStorageKeyShape(stagingKey);

  const storage = getIllegalLendingStorage();
  const obj = await storage.get(stagingKey);

  const lastSegment = stagingKey.split("/").pop() ?? "file.bin";
  const dash = lastSegment.indexOf("-");
  const originalHint =
    dash >= 0 && dash < lastSegment.length - 1
      ? lastSegment.slice(dash + 1)
      : lastSegment;

  const saved = await saveLawyerVerificationUpload({
    lawyerProfileId: params.lawyerProfileId,
    body: obj.body,
    contentType: (obj.contentType || "application/octet-stream").split(";")[0]?.trim() || "application/octet-stream",
    originalFileName: originalHint,
  });

  if (typeof storage.delete === "function") {
    try {
      await storage.delete(stagingKey);
    } catch {
      /* best-effort */
    }
  }

  return saved;
}

/** 가입 JSON 동반 증빙: storage 객체 존재·크기·checksum 일치 확인. */
export async function verifyLawyerVerificationDocumentMetaForSignup(
  docs: Array<{ storageKey: string; sizeBytes: number; checksum: string }>,
): Promise<void> {
  const storage = getIllegalLendingStorage();
  for (const d of docs) {
    assertLawyerVerificationStorageKeyShape(d.storageKey);
    const obj = await storage.get(d.storageKey.trim());
    const hash = createHash("sha256").update(obj.body).digest("hex");
    if (hash.toLowerCase() !== d.checksum.trim().toLowerCase()) {
      throw new Error("CHECKSUM_MISMATCH");
    }
    if (obj.body.length !== d.sizeBytes) {
      throw new Error("SIZE_MISMATCH");
    }
  }
}
