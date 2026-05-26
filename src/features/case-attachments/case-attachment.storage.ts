import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  decryptAtRestBuffer,
  encryptAtRestBuffer,
  isAtRestEncryptedBuffer,
} from "@/lib/crypto/at-rest-encryption";
import {
  DEFAULT_PRIVATE_UPLOAD_ROOT,
  ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX,
  LEGACY_PUBLIC_UPLOAD_PATH_PREFIX,
  PRIVATE_UPLOAD_ROOT_ENV,
} from "@/lib/security/platform-content-protection.policy";

function getPrivateUploadRoot(): string {
  const fromEnv = process.env[PRIVATE_UPLOAD_ROOT_ENV]?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  return path.join(process.cwd(), DEFAULT_PRIVATE_UPLOAD_ROOT);
}

function safeJoinPrivateRoot(relativePath: string): string {
  const root = getPrivateUploadRoot();
  const normalized = relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
  const absolute = path.resolve(root, normalized);
  if (!absolute.startsWith(root)) {
    throw new Error("허용되지 않는 첨부 파일 경로입니다.");
  }
  return absolute;
}

function toEncryptedStoragePath(caseId: string, storedName: string): string {
  return `${ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX}${caseId}/${storedName}`;
}

function toEncryptedRelativePath(caseId: string, storedName: string): string {
  return path.join(caseId, storedName).replace(/\\/g, "/");
}

export async function saveCaseAttachmentToDisk(params: {
  caseId: string;
  originalName: string;
  buffer: Buffer;
}) {
  const extension = path.extname(params.originalName || "");
  const storedName = `${randomUUID()}${extension}.aenc`;
  const relativePath = toEncryptedRelativePath(params.caseId, storedName);
  const absolutePath = safeJoinPrivateRoot(relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, encryptAtRestBuffer(params.buffer));

  return {
    storedName,
    storagePath: toEncryptedStoragePath(params.caseId, storedName),
    absolutePath,
  };
}

export async function readCaseAttachmentFromDisk(storagePath: string) {
  if (storagePath.startsWith(ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX)) {
    const relative = storagePath.slice(ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX.length);
    const absolutePath = safeJoinPrivateRoot(relative);
    const encrypted = await readFile(absolutePath);
    const buffer = decryptAtRestBuffer(encrypted);

    return {
      absolutePath,
      buffer,
    };
  }

  if (storagePath.startsWith(LEGACY_PUBLIC_UPLOAD_PATH_PREFIX)) {
    const normalized = storagePath.startsWith("/") ? storagePath.slice(1) : storagePath;
    const absolutePath = path.join(process.cwd(), "public", normalized);
    const raw = await readFile(absolutePath);
    const buffer = isAtRestEncryptedBuffer(raw) ? decryptAtRestBuffer(raw) : raw;

    return {
      absolutePath,
      buffer,
    };
  }

  throw new Error("지원되지 않는 첨부 storagePath 입니다.");
}

export async function deleteCaseAttachmentFromDisk(storagePath: string) {
  try {
    if (storagePath.startsWith(ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX)) {
      const relative = storagePath.slice(ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX.length);
      const absolutePath = safeJoinPrivateRoot(relative);
      await unlink(absolutePath);
      return;
    }

    if (storagePath.startsWith(LEGACY_PUBLIC_UPLOAD_PATH_PREFIX)) {
      const normalized = storagePath.startsWith("/") ? storagePath.slice(1) : storagePath;
      const absolutePath = path.join(process.cwd(), "public", normalized);
      await unlink(absolutePath);
    }
  } catch {
    // soft delete 우선
  }
}
