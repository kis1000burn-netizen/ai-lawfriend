import { describe, expect, it } from "vitest";
import {
  resolveAdminPageWayfinding,
  resolveFlowPreviousStep,
  resolveLawyerPageWayfinding,
  resolveProtectedPageWayfinding,
} from "@/lib/navigation/protected-page-wayfinding";

describe("resolveProtectedPageWayfinding", () => {
  it("hides on workspace hub pages", () => {
    expect(resolveProtectedPageWayfinding("/dashboard").show).toBe(false);
    expect(resolveProtectedPageWayfinding("/cases").show).toBe(false);
  });

  it("shows flow bar on new case page", () => {
    const model = resolveProtectedPageWayfinding("/cases/new");
    expect(model.show).toBe(true);
    expect(model.previousStep).toEqual({ href: "/cases", label: "내 사건" });
  });

  it("shows home trail on case detail", () => {
    const model = resolveProtectedPageWayfinding("/cases/case-1");
    expect(model.show).toBe(true);
    expect(model.caseId).toBe("case-1");
    expect(model.showCaseDetailLink).toBe(false);
    expect(model.showCasesListLink).toBe(true);
    expect(model.currentHint).toBe("사건 상세");
    expect(model.previousStep).toEqual({
      href: "/cases/case-1/interview",
      label: "AI 인터뷰",
    });
  });

  it("shows case detail link on nested case pages", () => {
    const model = resolveProtectedPageWayfinding("/cases/case-1/interview");
    expect(model.showCaseDetailLink).toBe(true);
    expect(model.currentHint).toBe("AI 인터뷰");
    expect(model.previousStep).toEqual({
      href: "/cases/case-1/edit",
      label: "사건 수정",
    });
  });
});

describe("resolveFlowPreviousStep", () => {
  it("maps document print to document detail", () => {
    expect(resolveFlowPreviousStep("/documents/doc-1/print")).toEqual({
      href: "/documents/doc-1",
      label: "문서 상세",
    });
  });

  it("maps case document detail to draft page", () => {
    expect(resolveFlowPreviousStep("/cases/case-1/documents/doc-1")).toEqual({
      href: "/cases/case-1/documents/new",
      label: "문서 초안 생성",
    });
  });
});

describe("resolveLawyerPageWayfinding", () => {
  it("hides on lawyer home", () => {
    expect(resolveLawyerPageWayfinding("/lawyer").show).toBe(false);
  });

  it("shows on lawyer subpages with previous step", () => {
    const model = resolveLawyerPageWayfinding("/lawyer/legal-knowledge/reviews/b1");
    expect(model.show).toBe(true);
    expect(model.previousStep).toEqual({
      href: "/lawyer/legal-knowledge/reviews",
      label: "검수 목록",
    });
  });
});

describe("resolveAdminPageWayfinding", () => {
  it("shows on admin detail routes", () => {
    expect(resolveAdminPageWayfinding("/admin/illegal-lending-reports/r1").show).toBe(true);
  });

  it("links admin detail to list", () => {
    const model = resolveAdminPageWayfinding("/admin/illegal-lending-reports/r1");
    expect(model.previousStep).toEqual({
      href: "/admin/illegal-lending-reports",
      label: "목록",
    });
  });
});
