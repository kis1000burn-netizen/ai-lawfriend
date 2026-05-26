import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  readCaseAttachmentFromDisk,
  saveCaseAttachmentToDisk,
} from "@/features/case-attachments/case-attachment.storage";
import { ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX } from "@/lib/security/platform-content-protection.policy";

describe("case-attachment.storage", () => {
  let tempRoot = "";
  const previousKey = process.env.APP_DATA_ENCRYPTION_KEY;
  const previousRoot = process.env.CASE_ATTACHMENT_UPLOAD_ROOT;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "aibeop-case-att-"));
    process.env.CASE_ATTACHMENT_UPLOAD_ROOT = tempRoot;
    process.env.APP_DATA_ENCRYPTION_KEY = Buffer.alloc(32, 3).toString("base64");
  });

  afterEach(async () => {
    await rm(tempRoot, { recursive: true, force: true });
    if (previousKey === undefined) {
      delete process.env.APP_DATA_ENCRYPTION_KEY;
    } else {
      process.env.APP_DATA_ENCRYPTION_KEY = previousKey;
    }
    if (previousRoot === undefined) {
      delete process.env.CASE_ATTACHMENT_UPLOAD_ROOT;
    } else {
      process.env.CASE_ATTACHMENT_UPLOAD_ROOT = previousRoot;
    }
  });

  it("stores encrypted attachments outside public web root", async () => {
    const original = Buffer.from("민감한 사건 첨부");
    const saved = await saveCaseAttachmentToDisk({
      caseId: "case_test_1",
      originalName: "evidence.pdf",
      buffer: original,
    });

    expect(saved.storagePath.startsWith(ENCRYPTED_CASE_ATTACHMENT_PATH_PREFIX)).toBe(true);
    expect(saved.absolutePath.includes(`${path.sep}public${path.sep}`)).toBe(false);

    const loaded = await readCaseAttachmentFromDisk(saved.storagePath);
    expect(loaded.buffer.equals(original)).toBe(true);
  });
});
