import { describe, expect, it } from "vitest";

import {
  CASE_LAWYER_MATCHING_FIXTURES,
  CASE_LAWYER_MATCHING_SERVICE_MARKER,
} from "./case-lawyer-matching.registry";
import { buildCaseLawyerMatchingWorkflowForCase } from "./case-lawyer-matching-recommendation.builder";
import {
  buildCaseLawyerMatchingWorkflow,
  listKnownCaseLawyerMatchingFixtureKeys,
  resolveCaseLawyerMatchingProfile,
} from "./case-lawyer-matching.service";

describe("case-lawyer-matching.service", () => {
  it("exposes marker", () => {
    expect(CASE_LAWYER_MATCHING_SERVICE_MARKER).toBe("case-lawyer-matching-workflow-v1");
  });

  it("lists known fixture keys for each registered case profile", () => {
    expect(listKnownCaseLawyerMatchingFixtureKeys()).toEqual([
      "JOOHWAN_LAND_ACCESS",
      "CONSTRUCTION_INJURY_COMPENSATION",
    ]);
  });

  it("resolves the Joohwan land-access fixture by caseId", () => {
    const profile = resolveCaseLawyerMatchingProfile({
      caseId: CASE_LAWYER_MATCHING_FIXTURES.JOOHWAN_LAND_ACCESS.caseId,
    });

    expect(profile.fixtureKey).toBe("JOOHWAN_LAND_ACCESS");
    expect(profile.practiceAreaLabels).toEqual(
      expect.arrayContaining(["부동산·토지", "통행·지역권"]),
    );
    expect(profile.matchingRationale).toContain("통행로");
  });

  it("builds a ready matching workflow for the Joohwan fixture", () => {
    const workflow = buildCaseLawyerMatchingWorkflowForCase({
      caseId: "case-joohwan-land-access",
      candidates: [
        {
          lawyerId: "lawyer-1",
          userStatus: "ACTIVE",
          verificationStatus: "APPROVED",
          specialtiesNote: "부동산, 토지, 통행",
          activeAssignmentCount: 1,
        },
      ],
    });

    expect(workflow.assignmentReady).toBe(true);
    expect(workflow.recommendation?.status).toBe("ASSIGNMENT_READY");
    expect(workflow.recommendation?.requiresHumanApproval).toBe(true);
    expect(workflow.recommendedAssignmentNote).toContain("관리자 검토용 권고");
    expect(JSON.stringify(workflow)).not.toContain("장주환");
    expect(JSON.stringify(workflow)).not.toContain("이양화");
    expect(JSON.stringify(workflow)).not.toContain("이상열");
  });

  it("resolves the construction injury fixture by mappedCaseType", () => {
    const profile = resolveCaseLawyerMatchingProfile({
      caseId: "case-recent-construction-injury-20260618",
      mappedCaseType: "CONSTRUCTION_INJURY_COMPENSATION",
    });

    expect(profile.fixtureKey).toBe("CONSTRUCTION_INJURY_COMPENSATION");
    expect(profile.practiceAreaLabels).toEqual(
      expect.arrayContaining(["산재·손해배상", "원청·하청 책임"]),
    );
  });

  it("builds a ready matching workflow for the construction injury fixture", () => {
    const workflow = buildCaseLawyerMatchingWorkflowForCase({
      caseId: "case-recent-construction-injury-20260618",
      category: "CONSTRUCTION_INJURY_COMPENSATION",
      gongbuhoCode: "LAW-CONSTRUCTION-INJURY-001",
      candidates: [
        {
          lawyerId: "lawyer-2",
          userStatus: "ACTIVE",
          verificationStatus: "APPROVED",
          specialtiesNote: "산재, 산업재해, 손해배상",
          activeAssignmentCount: 0,
        },
      ],
    });

    expect(workflow.assignmentReady).toBe(true);
    expect(workflow.recommendation?.matchedSpecialties).toEqual(
      expect.arrayContaining(["산업재해 및 손해배상 관련 검토"]),
    );
    expect(workflow.recommendedAssignmentNote).toContain("관리자 검토용 권고");
    expect(JSON.stringify(workflow)).not.toContain("9억4000");
    expect(JSON.stringify(workflow)).not.toContain("강서구");
  });

  it("blocks recommendation when the case profile cannot be mapped", () => {
    const profile = resolveCaseLawyerMatchingProfile({
      caseId: "case-unknown-profile",
    });
    const workflow = buildCaseLawyerMatchingWorkflow(profile);

    expect(workflow.assignmentReady).toBe(false);
    expect(workflow.steps.find((step) => step.stepId === "RECOMMEND_LAWYER_MATCH")?.status).toBe(
      "BLOCKED",
    );
    expect(workflow.recommendedAssignmentNote).toBeNull();
  });
});
