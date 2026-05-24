import { describe, expect, it } from "vitest";
import {
  adoptConversationRecordBodySchema,
} from "./client-portal.schema";
import { PHASE15C3_COMMAND_CENTER_CHAT_ADOPT_MARKER } from "./case-conversation-adopt.service";

describe("case-conversation-adopt (Phase 15-C.3)", () => {
  it("exposes phase marker", () => {
    expect(PHASE15C3_COMMAND_CENTER_CHAT_ADOPT_MARKER).toBe(
      "PHASE15C3_COMMAND_CENTER_CHAT_ADOPT",
    );
  });

  it("parses body scope", () => {
    const parsed = adoptConversationRecordBodySchema.parse({ scope: "body" });
    expect(parsed.scope).toBe("body");
  });

  it("requires uploadedFileId for attachment scope", () => {
    const result = adoptConversationRecordBodySchema.safeParse({ scope: "attachment" });
    expect(result.success).toBe(false);
  });

  it("parses attachment scope with file id", () => {
    const parsed = adoptConversationRecordBodySchema.parse({
      scope: "attachment",
      uploadedFileId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    });
    expect(parsed.uploadedFileId).toBe("clxxxxxxxxxxxxxxxxxxxxxxxxx");
  });
});
