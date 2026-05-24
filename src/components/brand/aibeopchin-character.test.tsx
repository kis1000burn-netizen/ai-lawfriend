import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AibeopchinCharacter } from "@/components/brand/aibeopchin-character";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

describe("AibeopchinCharacter", () => {
  it("renders SVG mascot with marker", () => {
    const { getByTestId } = render(<AibeopchinCharacter size={120} />);
    const el = getByTestId("aibeopchin-character");
    expect(el.getAttribute("data-marker")).toBe("aibeopchin-character-v1");
    expect(el.querySelector("svg")).toBeTruthy();
  });
});
