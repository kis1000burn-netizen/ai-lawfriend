import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@supabase/supabase-js";
import { getIllegalLendingStorageDriver } from "@/features/illegal-lending/storage/illegal-lending-storage";
import { buildLawyerVerificationContentTokenQueryParts } from "@/lib/lawyer/lawyer-verification-content-token";

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`${name} 환경변수가 필요합니다.`);
  return v;
}

/** 권장 60~300초. `LAWYER_VERIFICATION_SIGNED_URL_TTL_SEC` (정수). */
export function getLawyerVerificationSignedUrlTtlSeconds(): number {
  const raw = process.env.LAWYER_VERIFICATION_SIGNED_URL_TTL_SEC?.trim();
  const n = raw ? parseInt(raw, 10) : 120;
  if (Number.isNaN(n)) return 120;
  return Math.min(300, Math.max(60, n));
}

function createS3ClientIllegalLendingStyle(): S3Client {
  const endpoint = process.env.ILLEGAL_LENDING_S3_ENDPOINT;
  const region = process.env.ILLEGAL_LENDING_S3_REGION || "auto";
  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.ILLEGAL_LENDING_S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: requireEnv("ILLEGAL_LENDING_S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("ILLEGAL_LENDING_S3_SECRET_ACCESS_KEY"),
    },
  });
}

function resolveS3BucketForRead(dbBucket: string | null): string {
  const b =
    dbBucket?.trim() ||
    process.env.LAWYER_VERIFICATION_S3_BUCKET?.trim() ||
    process.env.ILLEGAL_LENDING_S3_BUCKET?.trim();
  if (!b) throw new Error("S3/R2 버킷(LAWYER_VERIFICATION_S3_BUCKET 또는 ILLEGAL_LENDING_S3_BUCKET)이 필요합니다.");
  return b;
}

async function presignS3Get(bucket: string, storageKey: string, expiresIn: number): Promise<string> {
  const client = createS3ClientIllegalLendingStyle();
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: storageKey });
  return getSignedUrl(client, cmd, { expiresIn });
}

function getSupabaseAdmin() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}

function resolveSupabaseBucketForRead(dbBucket: string | null): string {
  return (
    dbBucket?.trim() ||
    process.env.LAWYER_VERIFICATION_SUPABASE_BUCKET?.trim() ||
    process.env.ILLEGAL_LENDING_SUPABASE_BUCKET?.trim() ||
    "illegal-lending-private"
  );
}

async function presignSupabaseGet(
  storageKey: string,
  dbBucket: string | null,
  expiresIn: number,
): Promise<string> {
  const sb = getSupabaseAdmin().storage.from(resolveSupabaseBucketForRead(dbBucket));
  const { data, error } = await sb.createSignedUrl(storageKey, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Supabase signed URL 생성 실패");
  }
  return data.signedUrl;
}

function buildLocalContentTokenRedirectUrl(input: {
  requestOrigin: string;
  lawyerProfileId: string;
  documentId: string;
  ttlSec: number;
}): { url: string; expiresAt: Date } {
  const origin = input.requestOrigin.replace(/\/$/, "");
  const { exp, sig } = buildLawyerVerificationContentTokenQueryParts({
    lawyerProfileId: input.lawyerProfileId,
    documentId: input.documentId,
    ttlSec: input.ttlSec,
  });
  const path = `/api/admin/lawyer-verifications/${encodeURIComponent(input.lawyerProfileId)}/documents/${encodeURIComponent(input.documentId)}/content-token`;
  const url = `${origin}${path}?t=${exp}&sig=${encodeURIComponent(sig)}`;
  return { url, expiresAt: new Date(exp * 1000) };
}

/**
 * 관리자 증빙 열람 — storageKey 기반 객체에 대한 단기 열람 URL (S3/R2 presign, Supabase signed URL, local 은 content-token 리다이렉트).
 */
export async function createLawyerVerificationAdminSignedRedirectUrl(input: {
  storageKey: string;
  bucket: string | null;
  lawyerProfileId: string;
  documentId: string;
  requestOrigin: string;
}): Promise<{
  url: string;
  expiresAt: Date;
  accessMode: "signed_redirect" | "local_content_token";
}> {
  const ttl = getLawyerVerificationSignedUrlTtlSeconds();
  const driver = getIllegalLendingStorageDriver();

  if (driver === "s3" || driver === "r2") {
    const bucket = resolveS3BucketForRead(input.bucket);
    const url = await presignS3Get(bucket, input.storageKey, ttl);
    return { url, expiresAt: new Date(Date.now() + ttl * 1000), accessMode: "signed_redirect" };
  }

  if (driver === "supabase") {
    const url = await presignSupabaseGet(input.storageKey, input.bucket, ttl);
    return { url, expiresAt: new Date(Date.now() + ttl * 1000), accessMode: "signed_redirect" };
  }

  const { url, expiresAt } = buildLocalContentTokenRedirectUrl({
    requestOrigin: input.requestOrigin,
    lawyerProfileId: input.lawyerProfileId,
    documentId: input.documentId,
    ttlSec: ttl,
  });
  return { url, expiresAt, accessMode: "local_content_token" };
}
