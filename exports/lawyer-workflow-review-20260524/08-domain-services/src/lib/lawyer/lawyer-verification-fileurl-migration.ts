import { createHash } from "node:crypto";
import {
  LAWYER_VERIFICATION_ALLOWED_MIME,
  LAWYER_VERIFICATION_UPLOAD_MAX_BYTES,
  LAWYER_VERIFICATION_STORAGE_KEY_PREFIX,
  lawyerVerificationBucketForDb,
} from "@/lib/lawyer/lawyer-verification-storage";
import { getIllegalLendingStorage } from "@/features/illegal-lending/storage/illegal-lending-storage";
import {
  isHttpLegacyLawyerVerificationFileUrl,
  isLawyerVerificationLegacyExternalOnlyDoc,
} from "@/lib/lawyer/lawyer-verification-legacy-policy";
import {
  mapLawyerVerificationMigrationFailureStage,
  type LawyerVerificationMigrationFailureStage,
} from "@/lib/lawyer/lawyer-verification-migration-audit";

export const P4_LAWYER_VERIFICATION_DOWNLOAD_MAX_BYTES = LAWYER_VERIFICATION_UPLOAD_MAX_BYTES;
export const P4_LAWYER_VERIFICATION_FETCH_TIMEOUT_MS = 120_000;

function sanitizeMigrationFileSegment(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  return base || "file.bin";
}

/** 이관 오브젝트 키 — documentId 기준으로 멱등(같은 행 재실행 시 덮어쓰기). */
export function buildP4MigrationStorageKey(
  lawyerProfileId: string,
  documentId: string,
  fileName: string,
): string {
  const safe = sanitizeMigrationFileSegment(fileName);
  return `${LAWYER_VERIFICATION_STORAGE_KEY_PREFIX}${lawyerProfileId}/p4-migrate-${documentId}-${safe}`;
}

export type P4DownloadResult = {
  body: Buffer;
  contentType: string;
};

export async function downloadLegacyLawyerVerificationFile(
  fileUrl: string,
  opts?: { maxBytes?: number; timeoutMs?: number },
): Promise<P4DownloadResult> {
  const maxBytes = opts?.maxBytes ?? P4_LAWYER_VERIFICATION_DOWNLOAD_MAX_BYTES;
  const timeoutMs = opts?.timeoutMs ?? P4_LAWYER_VERIFICATION_FETCH_TIMEOUT_MS;
  const u = fileUrl.trim();
  if (!isHttpLegacyLawyerVerificationFileUrl(u)) {
    throw new Error("LEGACY_URL_NOT_HTTP");
  }
  const res = await fetch(u, {
    redirect: "follow",
    headers: { "User-Agent": "AIBeopchinLawyerVerificationP4Migrate/1.0" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`DOWNLOAD_HTTP_${res.status}`);
  }
  const lenHeader = res.headers.get("content-length");
  if (lenHeader) {
    const n = parseInt(lenHeader, 10);
    if (Number.isFinite(n) && n > maxBytes) {
      throw new Error("DOWNLOAD_TOO_LARGE");
    }
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > maxBytes) {
    throw new Error("DOWNLOAD_TOO_LARGE");
  }
  const rawCt = res.headers.get("content-type")?.split(";")[0]?.trim();
  const contentType =
    rawCt && rawCt.length > 0 && rawCt.length <= 200 ? rawCt : "application/octet-stream";
  return { body: buf, contentType };
}

export type P4MigrateOneRowInput = {
  id: string;
  lawyerProfileId: string;
  fileName: string;
  fileUrl: string | null;
  type: string;
  storageKey: string | null;
};

export type P4MigrateOneRowSuccess = {
  documentId: string;
  storageKey: string;
  sizeBytes: number;
  checksum: string;
  mimeType: string;
};

export type P4MigrateOneRowFailure = {
  documentId: string;
  lawyerProfileId: string;
  error: string;
  stage: LawyerVerificationMigrationFailureStage;
};

export type P4MigrateResult =
  | { ok: true; dryRun: boolean; wouldMigrate?: P4MigrateOneRowSuccess; migrated?: P4MigrateOneRowSuccess }
  | { ok: false; dryRun: boolean; failure: P4MigrateOneRowFailure };

/** dryRun 이면 업로드·DB 갱신 생략, 대상만 검증 */
export async function migrateLawyerVerificationDocumentRow(
  prisma: {
    lawyerVerificationDocument: {
      update: (args: unknown) => Promise<unknown>;
    };
  },
  row: P4MigrateOneRowInput,
  dryRun: boolean,
): Promise<P4MigrateResult> {
  const fail = (
    code: string,
    stage?: LawyerVerificationMigrationFailureStage,
  ): P4MigrateResult => ({
    ok: false,
    dryRun,
    failure: {
      documentId: row.id,
      lawyerProfileId: row.lawyerProfileId,
      error: code,
      stage: stage ?? mapLawyerVerificationMigrationFailureStage(code),
    },
  });

  if (!isLawyerVerificationLegacyExternalOnlyDoc(row)) {
    return fail("SKIP_NOT_ELIGIBLE");
  }

  const srcUrl = row.fileUrl!.trim();
  let body: Buffer;
  let contentType: string;
  try {
    ({ body, contentType } = await downloadLegacyLawyerVerificationFile(srcUrl));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "DOWNLOAD_FAILED";
    return fail(msg);
  }

  const mimeType = contentType.slice(0, 200);
  if (!LAWYER_VERIFICATION_ALLOWED_MIME.has(mimeType)) {
    return fail(`MIME_NOT_ALLOWED:${mimeType}`);
  }

  const storageKey = buildP4MigrationStorageKey(row.lawyerProfileId, row.id, row.fileName);
  const checksum = createHash("sha256").update(body).digest("hex");
  const bucket = lawyerVerificationBucketForDb();
  const sizeBytes = body.length;

  const payload: P4MigrateOneRowSuccess = {
    documentId: row.id,
    storageKey,
    sizeBytes,
    checksum,
    mimeType,
  };

  if (dryRun) {
    return { ok: true, dryRun: true, wouldMigrate: payload };
  }

  try {
    const storage = getIllegalLendingStorage();
    await storage.save({
      key: storageKey,
      body,
      contentType: mimeType,
    });
  } catch {
    return fail("STORAGE_SAVE_FAILED", "storage");
  }

  try {
    await prisma.lawyerVerificationDocument.update({
      where: { id: row.id },
      data: {
        storageKey,
        bucket,
        mimeType,
        sizeBytes,
        checksum: checksum.toLowerCase(),
        migratedAt: new Date(),
      },
    });
  } catch {
    return fail("DB_UPDATE_FAILED", "db");
  }

  return { ok: true, dryRun: false, migrated: payload };
}
