import { describe, expect, it } from "vitest";
import { mapLawyerVerificationMigrationFailureStage } from "./lawyer-verification-migration-audit";

describe("lawyer-verification-migration-audit", () => {
  it("mapLawyerVerificationMigrationFailureStage", () => {
    expect(mapLawyerVerificationMigrationFailureStage("SKIP_NOT_ELIGIBLE")).toBe("eligibility");
    expect(mapLawyerVerificationMigrationFailureStage("MIME_NOT_ALLOWED:application/zip")).toBe("mime");
    expect(mapLawyerVerificationMigrationFailureStage("DOWNLOAD_HTTP_404")).toBe("download");
    expect(mapLawyerVerificationMigrationFailureStage("STORAGE_SAVE_FAILED")).toBe("storage");
    expect(mapLawyerVerificationMigrationFailureStage("DB_UPDATE_FAILED")).toBe("db");
    expect(mapLawyerVerificationMigrationFailureStage("WEIRD")).toBe("unknown");
  });
});
