import { beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError, ValidationError, ConflictError } from "@/lib/errors";
import type { StoredCaseLawyerMatchingRecommendation } from "./case-lawyer-matching.schema";

const repositoryMocks = vi.hoisted(() => {
  const store = new Map<string, StoredCaseLawyerMatchingRecommendation>();

  return {
    store,
    reset: () => store.clear(),
    createCaseLawyerMatchingRecommendation: vi.fn(
      async (input: {
        recommendation: StoredCaseLawyerMatchingRecommendation;
        createdByAdminId: string;
      }) => {
        const active = [...store.values()].find(
          (item) =>
            item.caseId === input.recommendation.caseId &&
            item.status !== "APPROVED" &&
            item.status !== "REJECTED" &&
            item.status !== "EXPIRED",
        );
        if (active) {
          throw new ValidationError("이미 활성 매칭 권고안이 존재합니다.");
        }

        const stored: StoredCaseLawyerMatchingRecommendation = {
          ...input.recommendation,
          createdByAdminId: input.createdByAdminId,
          approvedAssignmentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.set(stored.recommendationId, stored);
        return stored;
      },
    ),
    findCaseLawyerMatchingRecommendationById: vi.fn(async (id: string) => {
      return store.get(id) ?? null;
    }),
    approveCaseLawyerMatchingRecommendationInTransaction: vi.fn(
      async (input: {
        recommendationId: string;
        caseId: string;
        assigneeUserId: string;
        note: string | null;
        adminUserId: string;
      }) => {
        const current = store.get(input.recommendationId);
        if (!current || current.caseId !== input.caseId) {
          return null;
        }

        if (current.status === "APPROVED") {
          if (
            current.approvedByAdminId === input.adminUserId &&
            current.approvedAssignmentId
          ) {
            return {
              recommendation: current,
              assignment: {
                id: current.approvedAssignmentId,
                caseId: input.caseId,
                assigneeUserId: input.assigneeUserId,
                assignedByUserId: input.adminUserId,
                note: input.note,
                isActive: true,
                createdAt: new Date(),
                assignee: {
                  id: input.assigneeUserId,
                  name: "Lawyer",
                  email: "lawyer@test.local",
                  role: "LAWYER",
                },
              },
              idempotent: true,
            };
          }
          throw new ValidationError("이미 승인된 매칭 권고안입니다.");
        }

        if (current.status === "REJECTED") {
          throw new ValidationError("검토가 종료된 매칭 권고안은 승인할 수 없습니다.");
        }

        const assignment = {
          id: "assignment-1",
          caseId: input.caseId,
          assigneeUserId: input.assigneeUserId,
          assignedByUserId: input.adminUserId,
          note: input.note,
          isActive: true,
          createdAt: new Date(),
          assignee: {
            id: input.assigneeUserId,
            name: "Lawyer",
            email: "lawyer@test.local",
            role: "LAWYER" as const,
          },
        };

        const updated: StoredCaseLawyerMatchingRecommendation = {
          ...current,
          status: "APPROVED",
          approvedAssignmentId: assignment.id,
          approvedByAdminId: input.adminUserId,
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.set(current.recommendationId, updated);

        return {
          recommendation: updated,
          assignment,
          idempotent: false,
        };
      },
    ),
    rejectCaseLawyerMatchingRecommendation: vi.fn(),
    writeCaseLawyerMatchingRecommendationAudit: vi.fn(),
  };
});

vi.mock("@/lib/audit-log", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/cases/case.permissions", () => ({
  assertAdminOnly: vi.fn(),
  getCaseAccessContext: vi.fn().mockResolvedValue({
    caseId: "case-joohwan-land-access",
    isAdmin: true,
  }),
}));

vi.mock("./case-lawyer-matching-recommendation.repository", () => repositoryMocks);

import { buildCaseLawyerMatchingRecommendationForCase } from "./case-lawyer-matching-recommendation.builder";
import {
  approveCaseLawyerMatchingRecommendationService,
  generateCaseLawyerMatchingRecommendationService,
  getCaseLawyerMatchingRecommendationForAdminService,
} from "./case-lawyer-matching-recommendation.service";
import type { CaseLawyerMatchingCandidate } from "./case-lawyer-matching-recommendation.policy";

const adminUser = {
  id: "admin-1",
  email: "admin@test.local",
  name: "Admin",
  role: "ADMIN" as const,
  status: "ACTIVE" as const,
};

const lawyerUser = {
  id: "lawyer-1",
  email: "lawyer@test.local",
  name: "Lawyer",
  role: "LAWYER" as const,
  status: "ACTIVE" as const,
};

function candidate(
  lawyerId: string,
  over: Partial<CaseLawyerMatchingCandidate> = {},
): CaseLawyerMatchingCandidate {
  return {
    lawyerId,
    userStatus: "ACTIVE",
    verificationStatus: "APPROVED",
    specialtiesNote: "부동산, 토지, 통행, 지역권",
    activeAssignmentCount: 2,
    ...over,
  };
}

describe("case-lawyer-matching-recommendation.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repositoryMocks.reset();
  });

  it("excludes suspended lawyers from recommendation candidates", () => {
    const recommendation = buildCaseLawyerMatchingRecommendationForCase({
      caseId: "case-joohwan-land-access",
      candidates: [
        candidate("lawyer-active"),
        candidate("lawyer-suspended", { userStatus: "SUSPENDED" }),
      ],
    });

    expect(recommendation.excludedLawyers).toEqual(
      expect.arrayContaining([
        { lawyerId: "lawyer-suspended", reason: "INACTIVE" },
      ]),
    );
    expect(recommendation.eligibleLawyerIds).toEqual(["lawyer-active"]);
  });

  it("excludes unverified lawyers from recommendation candidates", () => {
    const recommendation = buildCaseLawyerMatchingRecommendationForCase({
      caseId: "case-joohwan-land-access",
      candidates: [
        candidate("lawyer-approved"),
        candidate("lawyer-pending", { verificationStatus: "PENDING" }),
      ],
    });

    expect(recommendation.excludedLawyers).toEqual(
      expect.arrayContaining([
        { lawyerId: "lawyer-pending", reason: "UNVERIFIED" },
      ]),
    );
  });

  it("marks conflict-flagged lawyers as REVIEW_REQUIRED and excludes them", () => {
    const recommendation = buildCaseLawyerMatchingRecommendationForCase({
      caseId: "case-joohwan-land-access",
      conflictLawyerIds: ["lawyer-conflict"],
      candidates: [
        candidate("lawyer-conflict"),
        candidate("lawyer-clear"),
      ],
    });

    expect(recommendation.status).toBe("REVIEW_REQUIRED");
    expect(recommendation.excludedLawyers).toEqual(
      expect.arrayContaining([
        { lawyerId: "lawyer-conflict", reason: "CONFLICT_RISK" },
      ]),
    );
  });

  it("persists recommendation without creating CaseAssignment", async () => {
    await generateCaseLawyerMatchingRecommendationService(adminUser, {
      caseId: "case-joohwan-land-access",
      candidates: [candidate("lawyer-approved")],
    });

    expect(
      repositoryMocks.createCaseLawyerMatchingRecommendation,
    ).toHaveBeenCalledTimes(1);
    expect(
      repositoryMocks.approveCaseLawyerMatchingRecommendationInTransaction,
    ).not.toHaveBeenCalled();
  });

  it("blocks non-admin users from reading recommendation detail", async () => {
    const { assertAdminOnly } = await import("@/features/cases/case.permissions");
    vi.mocked(assertAdminOnly).mockImplementationOnce(() => {
      throw new ForbiddenError();
    });

    await expect(
      getCaseLawyerMatchingRecommendationForAdminService(
        lawyerUser,
        "case-joohwan-land-access",
        "missing-id",
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("links recommendation approval to assignment creation and audit logs", async () => {
    const generated = await generateCaseLawyerMatchingRecommendationService(adminUser, {
      caseId: "case-joohwan-land-access",
      candidates: [candidate("lawyer-approved")],
    });

    const approved = await approveCaseLawyerMatchingRecommendationService(
      adminUser,
      "case-joohwan-land-access",
      {
        recommendationId: generated.recommendationId,
        assigneeUserId: "lawyer-approved",
        note: "관리자 승인",
      },
    );

    expect(
      repositoryMocks.approveCaseLawyerMatchingRecommendationInTransaction,
    ).toHaveBeenCalledTimes(1);
    expect(approved.assignment.id).toBe("assignment-1");
    expect(approved.recommendation.approvedAssignmentId).toBe("assignment-1");
    expect(approved.recommendation.status).toBe("APPROVED");
    expect(
      repositoryMocks.writeCaseLawyerMatchingRecommendationAudit,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CASE_LAWYER_MATCHING_RECOMMEND_CREATE",
      }),
    );
  });

  it("returns idempotent response for duplicate approval by the same admin", async () => {
    const generated = await generateCaseLawyerMatchingRecommendationService(adminUser, {
      caseId: "case-joohwan-land-access",
      candidates: [candidate("lawyer-approved")],
    });

    await approveCaseLawyerMatchingRecommendationService(
      adminUser,
      "case-joohwan-land-access",
      {
        recommendationId: generated.recommendationId,
        assigneeUserId: "lawyer-approved",
      },
    );

    const duplicate = await approveCaseLawyerMatchingRecommendationService(
      adminUser,
      "case-joohwan-land-access",
      {
        recommendationId: generated.recommendationId,
        assigneeUserId: "lawyer-approved",
      },
    );

    expect(duplicate.idempotent).toBe(true);
    expect(
      repositoryMocks.approveCaseLawyerMatchingRecommendationInTransaction,
    ).toHaveBeenCalledTimes(2);
  });

  it("blocks creating a second active recommendation for the same case", async () => {
    await generateCaseLawyerMatchingRecommendationService(adminUser, {
      caseId: "case-joohwan-land-access",
      candidates: [candidate("lawyer-approved")],
    });

    await expect(
      generateCaseLawyerMatchingRecommendationService(adminUser, {
        caseId: "case-joohwan-land-access",
        candidates: [candidate("lawyer-approved")],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("returns 409 conflict when concurrent approval resolves to a different assignee", async () => {
    const generated = await generateCaseLawyerMatchingRecommendationService(adminUser, {
      caseId: "case-joohwan-land-access",
      candidates: [candidate("lawyer-approved"), candidate("lawyer-alt", { lawyerId: "lawyer-alt" })],
    });

    vi.mocked(
      repositoryMocks.approveCaseLawyerMatchingRecommendationInTransaction,
    ).mockRejectedValueOnce(
      new ConflictError("동시 승인으로 인해 다른 배정 결과가 이미 확정되었습니다.", {
        resolvedAssigneeUserId: "lawyer-approved",
      }),
    );

    await expect(
      approveCaseLawyerMatchingRecommendationService(
        adminUser,
        "case-joohwan-land-access",
        {
          recommendationId: generated.recommendationId,
          assigneeUserId: "lawyer-alt",
        },
      ),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
