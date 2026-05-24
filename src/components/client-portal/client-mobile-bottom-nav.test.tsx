import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClientMobileBottomNav } from "@/components/client-portal/client-mobile-bottom-nav";

describe("ClientMobileBottomNav (Phase 21-E a11y smoke)", () => {
  it("exposes nav label, tab labels, and aria-current for active tab", () => {
    const onSelect = vi.fn();
    render(<ClientMobileBottomNav activeTab="chat" onSelect={onSelect} />);

    expect(screen.getByRole("navigation", { name: "의뢰인 포털 주요 메뉴" })).toBeTruthy();

    const chatButton = screen.getByRole("button", { name: "대화 탭" });
    expect(chatButton.getAttribute("aria-current")).toBe("page");

    const uploadButton = screen.getByRole("button", { name: "제출 탭" });
    expect(uploadButton.getAttribute("aria-current")).toBeNull();

    fireEvent.click(uploadButton);
    expect(onSelect).toHaveBeenCalledWith("uploads");
  });
});
