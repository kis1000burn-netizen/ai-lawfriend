import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  decryptAtRestBuffer,
  encryptAtRestBuffer,
  isAtRestEncryptedBuffer,
} from "./at-rest-encryption";

describe("at-rest-encryption", () => {
  const previousKey = process.env.APP_DATA_ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.APP_DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  });

  afterEach(() => {
    if (previousKey === undefined) {
      delete process.env.APP_DATA_ENCRYPTION_KEY;
    } else {
      process.env.APP_DATA_ENCRYPTION_KEY = previousKey;
    }
  });

  it("round-trips buffer encryption", () => {
    const plaintext = Buffer.from("사건 첨부 테스트 PDF 내용");
    const encrypted = encryptAtRestBuffer(plaintext);
    expect(isAtRestEncryptedBuffer(encrypted)).toBe(true);
    expect(decryptAtRestBuffer(encrypted).equals(plaintext)).toBe(true);
  });

  it("persists encrypted blob to disk", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "aibeop-enc-"));
    const plaintext = Buffer.from("encrypted-on-disk");
    const encrypted = encryptAtRestBuffer(plaintext);
    const filePath = path.join(dir, "sample.aenc");
    await writeFile(filePath, encrypted);
    const loaded = await readFile(filePath);
    expect(decryptAtRestBuffer(loaded).equals(plaintext)).toBe(true);
    await rm(dir, { recursive: true, force: true });
  });
});
