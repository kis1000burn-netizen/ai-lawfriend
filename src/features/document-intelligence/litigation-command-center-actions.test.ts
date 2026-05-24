import { describe, expect, it } from "vitest";
import {
  commandCenterDraftGenerateResultSchema,
  updateCommandCenterDeadlineBodySchema,
  updateCommandCenterTaskBodySchema,
} from "./litigation-command-center-actions.schema";

describe("litigation-command-center-actions.schema (Phase 14-B)", () => {
  it("parses task status update body", () => {
    const parsed = updateCommandCenterTaskBodySchema.parse({ status: "IN_PROGRESS" });
    expect(parsed.status).toBe("IN_PROGRESS");
  });

  it("requires at least one deadline patch field", () => {
    expect(() => updateCommandCenterDeadlineBodySchema.parse({})).toThrow();
    const parsed = updateCommandCenterDeadlineBodySchema.parse({
      status: "COMPLETED",
      memo: "변론기일 연기 협의",
    });
    expect(parsed.status).toBe("COMPLETED");
    expect(parsed.memo).toContain("연기");
  });

  it("parses draft generate result", () => {
    const parsed = commandCenterDraftGenerateResultSchema.parse({
      draftContextId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      documentId: "clxxxxxxxxxxxxxxxxxxxxxxxy",
      documentHref: "/cases/clxxxxxxxxxxxxxxxxxxxxxxxxx/documents/clxxxxxxxxxxxxxxxxxxxxxxxy",
      title: "준비서면 초안",
    });
    expect(parsed.title).toBe("준비서면 초안");
  });
});
