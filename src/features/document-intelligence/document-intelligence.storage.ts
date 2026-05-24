/**
 * Phase 13-B — private local storage for litigation uploads (not public/).
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const PHASE13B_DOCUMENT_STORAGE_MARKER = "PHASE13B_DOCUMENT_STORAGE" as const;

const STORAGE_ROOT = path.join(process.cwd(), "storage", "document-intelligence");

export function computeFileSha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function saveLitigationFileToDisk(params: {
  caseId: string;
  originalFileName: string;
  buffer: Buffer;
}) {
  const extension = path.extname(params.originalFileName || "") || ".bin";
  const storedName = `${randomUUID()}${extension}`;
  const relativeDir = path.join(params.caseId);
  const absoluteDir = path.join(STORAGE_ROOT, relativeDir);

  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, storedName);
  await writeFile(absolutePath, params.buffer);

  const storagePath = path
    .join("document-intelligence", relativeDir, storedName)
    .replace(/\\/g, "/");

  return {
    storedName,
    storagePath,
    absolutePath,
    sha256: computeFileSha256(params.buffer),
  };
}

export async function readLitigationFileFromDisk(storagePath: string) {
  const normalized = storagePath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "storage", normalized);
  const buffer = await readFile(absolutePath);
  return { absolutePath, buffer };
}
