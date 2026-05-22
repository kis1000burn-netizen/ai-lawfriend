import { describe, expect, it } from "vitest";
import { gongbuhoSampleLibraryPacketSchema } from "./gongbuho-sample-library";

describe("gongbuhoSampleLibraryPacketSchema", () => {
  it("허용: caseType 문자열 패스스루", () => {
    const r = gongbuhoSampleLibraryPacketSchema.safeParse({
      code: "Z",
      version: "0.0.1",
      name: "n",
      domain: "d",
      caseType: "ANY",
      questionFlow: [],
    });
    expect(r.success).toBe(true);
  });

  it("거부: caseType 빈 문자열", () => {
    const r = gongbuhoSampleLibraryPacketSchema.safeParse({
      code: "Z",
      version: "0.0.1",
      name: "n",
      domain: "d",
      caseType: "   ",
    });
    expect(r.success).toBe(false);
  });
});
