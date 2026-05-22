import { describe, expect, it } from "vitest";
import { buildCasePackageDto } from "./build-case-package-dto";
import { computeCasePackageSnapshotSha256 } from "./build-case-package-share-snapshot";
import {
  buildLawyerCasePackageApiPayload,
  parseStoredCasePackageDto,
  resolveVerifiedCasePackageSnapshot,
} from "./case-package-share-snapshot-utils";

describe("computeCasePackageSnapshotSha256 + verify", () => {
  it("round-trips through parse and hash", () => {
    const dto = buildCasePackageDto({
      caseRecord: {
        id: "c1",
        title: "테스트",
        status: "CREATED",
      },
    });
    dto.packageMeta.packageVersion = "6.2";
    const h = computeCasePackageSnapshotSha256(dto);
    const parsed = parseStoredCasePackageDto(JSON.parse(JSON.stringify(dto)) as unknown);
    expect(parsed).not.toBeNull();
    expect(resolveVerifiedCasePackageSnapshot(dto, h)).not.toBeNull();
    expect(resolveVerifiedCasePackageSnapshot(dto, "deadbeef")).toBeNull();
  });
});

describe("buildLawyerCasePackageApiPayload", () => {
  const liveCase = {
    id: "case_x",
    title: "라이브 제목",
    status: "IN_INTERVIEW",
    category: "민사",
    description: "라이브 설명",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    attachments: [
      {
        id: "a1",
        originalName: "live.pdf",
        mimeType: "application/pdf",
        sizeBytes: 10,
        createdAt: new Date("2026-01-03T00:00:00.000Z"),
      },
    ],
    legalDocuments: [
      {
        id: "d1",
        title: "라이브 문서",
        status: "DRAFT",
        createdAt: new Date("2026-01-04T00:00:00.000Z"),
        updatedAt: new Date("2026-01-05T00:00:00.000Z"),
      },
    ],
  };

  it("uses snapshot text when verifiedSnapshot present", () => {
    const dto = buildCasePackageDto({
      caseRecord: {
        id: "case_x",
        title: "스냅샷 제목",
        status: "REVIEW_PENDING",
        summary: "스냅샷 요약 본문",
      },
      interview: {
        completed: true,
        answers: [
          {
            questionKey: "q1",
            questionLabel: "질문",
            answer: "답",
          },
        ],
      },
    });
    dto.packageMeta.packageVersion = "6.2";
    const h = computeCasePackageSnapshotSha256(dto);
    const verified = resolveVerifiedCasePackageSnapshot(dto, h);
    expect(verified).not.toBeNull();

    const body = buildLawyerCasePackageApiPayload({
      share: {
        id: "s1",
        publicCode: "X",
        expiresAt: null,
        allowSummary: true,
        allowInterview: true,
        allowAttachmentList: true,
        allowAttachmentDownload: false,
        allowDocumentDraft: true,
        allowPackagePdf: false,
      },
      owner: { id: "u1", name: "홍길동" },
      verifiedSnapshot: verified,
      liveCase,
    });

    expect(body.package.share.snapshotCaptured).toBe(true);
    expect(body.package.case.title).toBe("스냅샷 제목");
    expect(body.package.case.summary).toContain("스냅샷 요약");
    expect(body.package.interview?.answerCount).toBe(1);
  });

  it("falls back to live case when no snapshot", () => {
    const body = buildLawyerCasePackageApiPayload({
      share: {
        id: "s1",
        publicCode: "X",
        expiresAt: null,
        allowSummary: true,
        allowInterview: true,
        allowAttachmentList: true,
        allowAttachmentDownload: false,
        allowDocumentDraft: true,
        allowPackagePdf: false,
      },
      owner: { id: "u1", name: "홍길동" },
      verifiedSnapshot: null,
      liveCase,
    });

    expect(body.package.share.snapshotCaptured).toBe(false);
    expect(body.package.case.title).toBe("라이브 제목");
    expect(body.package.case.summary).toBe("라이브 설명");
    expect(body.package.interview).toBeNull();
  });
});
