import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClientMobileUploadPanel } from "@/components/client-portal/client-mobile-upload-panel";

describe("ClientMobileUploadPanel (Phase 21-E a11y smoke)", () => {
  it("exposes camera/gallery labels and live upload status region", () => {
    render(
      <ClientMobileUploadPanel
        queue={{
          items: [
            {
              localId: "local-1",
              fileName: "photo.jpg",
              status: "uploading",
              progress: 42,
              errorMessage: null,
              failureCode: null,
            },
          ],
          hasActiveUploads: true,
          successCount: 0,
          addFiles: () => {},
          retryUpload: () => {},
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "카메라로 증거자료 촬영" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "사진 또는 파일 선택" })).toBeTruthy();
    expect(screen.getByTestId("client-mobile-upload-panel-upload-status")).toBeTruthy();
  });
});
