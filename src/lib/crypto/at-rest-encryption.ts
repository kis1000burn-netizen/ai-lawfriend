import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const AT_REST_ENCRYPTION_MARKER = "aibeop-at-rest-encryption-v1" as const;
export const AT_REST_FILE_MAGIC = Buffer.from("AIB1", "ascii");

const IV_BYTES = 12;
const TAG_BYTES = 16;

function resolveEncryptionKey(): Buffer {
  const fromEnv = process.env.APP_DATA_ENCRYPTION_KEY?.trim();
  if (fromEnv) {
    if (/^[0-9a-fA-F]{64}$/.test(fromEnv)) {
      return Buffer.from(fromEnv, "hex");
    }
    const decoded = Buffer.from(fromEnv, "base64");
    if (decoded.length === 32) {
      return decoded;
    }
    throw new Error("APP_DATA_ENCRYPTION_KEY must be 32 bytes (base64 or 64-char hex).");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing APP_DATA_ENCRYPTION_KEY in production.");
  }

  const jwtSecret = process.env.JWT_SECRET?.trim() || "dev-only-insecure-key";
  return createHash("sha256").update(`${jwtSecret}:aibeop-data-v1`).digest();
}

/** AES-256-GCM — 사건 첨부 등 민감 파일 at-rest */
export function encryptAtRestBuffer(plaintext: Buffer): Buffer {
  const key = resolveEncryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([AT_REST_FILE_MAGIC, iv, tag, ciphertext]);
}

export function decryptAtRestBuffer(payload: Buffer): Buffer {
  if (payload.length < AT_REST_FILE_MAGIC.length + IV_BYTES + TAG_BYTES + 1) {
    throw new Error("Encrypted payload is too short.");
  }

  const magic = payload.subarray(0, AT_REST_FILE_MAGIC.length);
  if (!magic.equals(AT_REST_FILE_MAGIC)) {
    throw new Error("Unsupported encrypted payload format.");
  }

  let offset = AT_REST_FILE_MAGIC.length;
  const iv = payload.subarray(offset, offset + IV_BYTES);
  offset += IV_BYTES;
  const tag = payload.subarray(offset, offset + TAG_BYTES);
  offset += TAG_BYTES;
  const ciphertext = payload.subarray(offset);

  const key = resolveEncryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function isAtRestEncryptedBuffer(payload: Buffer): boolean {
  return (
    payload.length >= AT_REST_FILE_MAGIC.length &&
    payload.subarray(0, AT_REST_FILE_MAGIC.length).equals(AT_REST_FILE_MAGIC)
  );
}
