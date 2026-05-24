import { describe, expect, it } from "vitest";
import {
  isOperationsObserverIssueAction,
  resolveOperationsObserverDomain,
} from "./operations-observer.constants";

describe("operations-observer.constants (Phase 17-B)", () => {
  it("maps AI governance actions to AI_USAGE", () => {
    expect(resolveOperationsObserverDomain("AI_GOVERNANCE_GOVERNANCE_INVOKE_DENIED")).toBe(
      "AI_USAGE",
    );
  });

  it("maps document intelligence actions to DOCUMENT_PROCESSING", () => {
    expect(resolveOperationsObserverDomain("LITIGATION_ANALYZE_FAILED")).toBe("AI_USAGE");
    expect(resolveOperationsObserverDomain("LITIGATION_CMD_CENTER_DRAFT_GENERATED")).toBe(
      "DOCUMENT_PROCESSING",
    );
  });

  it("detects issue actions", () => {
    expect(isOperationsObserverIssueAction("LITIGATION_ANALYZE_FAILED")).toBe(true);
    expect(isOperationsObserverIssueAction("CASE_CREATE")).toBe(false);
  });
});
