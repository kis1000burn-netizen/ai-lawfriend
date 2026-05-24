import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, ValidationError } from "@/lib/errors";

const repositoryMocks = vi.hoisted(() => ({
  createSupplementRequestRepository: vi.fn(),
  listSupplementRequestsRepository: vi.fn(),
  findSupplementRequestByIdRepository: vi.fn(),
  updateSupplementRequestRepository: vi.fn(),
  createSupplementResponseRepository: vi.fn(),
  appendSupplementRequestStatusLogRepository: vi.fn(),
  appendSupplementRequestAuditLogRepository: vi.fn(),
}));

const permissionMocks = vi.hoisted(() => ({
  getCaseAccessContext: vi.fn(),
}));

vi.mock("@/features/supplement-request/supplement-request.repository", () => repositoryMocks);
vi.mock("@/features/cases/case.permissions", () => permissionMocks);

import {
  changeSupplementRequestStatusService,
  createSupplementRequestService,
  createSupplementResponseService,
} from "./supplement-request.service";

const baseUser = {
  id: "cm1aaa1111111111111111111",
  email: "user@example.com",
  name: "테스트 사용자",
  role: "USER" as const,
  status: "ACTIVE" as const,
};

const lawyerUser = {
  id: "cm1law1111111111111111111",
  email: "lawyer@example.com",
  name: "담당 변호사",
  role: "LAWYER" as const,
  status: "ACTIVE" as const,
};

const adminUser = {
  id: "cm1adm1111111111111111111",
  email: "admin@example.com",
  name: "관리자",
  role: "ADMIN" as const,
  status: "ACTIVE" as const,
};

const baseRequest = {
  id: "cm1req1111111111111111111",
  caseId: "cm1case111111111111111111",
  requesterUserId: "cm1law1111111111111111111",
  targetUserId: "cm1aaa1111111111111111111",
  status: "SENT" as const,
  requestType: "MISSING_FACT" as const,
  title: "보완요청 제목",
  description: "보완요청 설명",
  dueAt: null,
  sentAt: null,
  clientViewedAt: null,
  lastRespondedAt: null,
  acceptedAt: null,
  closedAt: null,
  cancelledAt: null,
  expiredAt: null,
  revisionRound: 0,
  isDeleted: false,
  createdAt: new Date("2026-05-03T10:00:00.000Z"),
  updatedAt: new Date("2026-05-03T10:00:00.000Z"),
  requester: {
    id: "cm1law1111111111111111111",
    name: "담당 변호사",
    role: "LAWYER" as const,
  },
  target: {
    id: "cm1aaa1111111111111111111",
    name: "의뢰인",
    role: "USER" as const,
  },
  _count: {
    items: 0,
    responses: 0,
    statusLogs: 0,
    auditLogs: 0,
  },
  items: [],
  responses: [],
  statusLogs: [],
  auditLogs: [],
};

describe("supplement-request.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permissionMocks.getCaseAccessContext.mockResolvedValue({
      canReadCase: true,
      canWriteCase: true,
      canDeleteCase: false,
      role: "USER",
      assignmentType: "OWNER",
      assignmentReason: null,
      assignmentId: null,
      case: {
        id: baseRequest.caseId,
        ownerUserId: baseUser.id,
        assignedLawyerId: lawyerUser.id,
        status: "IN_INTERVIEW",
      },
    });
    repositoryMocks.findSupplementRequestByIdRepository.mockResolvedValue({
      ...baseRequest,
    });
    repositoryMocks.createSupplementRequestRepository.mockResolvedValue({
      ...baseRequest,
      title: "정리된 제목",
      description: "정리된 설명",
    });
    repositoryMocks.updateSupplementRequestRepository.mockResolvedValue({
      ...baseRequest,
      status: "CLIENT_RESPONDED",
      lastRespondedAt: new Date("2026-05-03T12:00:00.000Z"),
    });
    repositoryMocks.createSupplementResponseRepository.mockResolvedValue({
      id: "cm1res1111111111111111111",
      requestId: baseRequest.id,
      requestItemId: null,
      responderUserId: baseUser.id,
      responderRole: "USER",
      responseText: "응답 본문",
      responseJson: null,
      submittedAt: new Date("2026-05-03T12:00:00.000Z"),
      revisionRound: 1,
      isAcceptedSnapshot: false,
      createdAt: new Date("2026-05-03T12:00:00.000Z"),
      updatedAt: new Date("2026-05-03T12:00:00.000Z"),
    });
    repositoryMocks.appendSupplementRequestStatusLogRepository.mockResolvedValue(undefined);
    repositoryMocks.appendSupplementRequestAuditLogRepository.mockResolvedValue(undefined);
    repositoryMocks.listSupplementRequestsRepository.mockResolvedValue([]);
  });

  it("creates supplement request with trimmed payload and audit log", async () => {
    const result = await createSupplementRequestService(lawyerUser, baseRequest.caseId, {
      targetUserId: baseRequest.targetUserId,
      requestType: "MISSING_FACT",
      title: "  정리된 제목  ",
      description: "  정리된 설명  ",
      dueAt: "",
      revisionRound: 0,
    });

    expect(repositoryMocks.createSupplementRequestRepository).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "정리된 제목",
        description: "정리된 설명",
      }),
    );
    expect(repositoryMocks.appendSupplementRequestAuditLogRepository).toHaveBeenCalled();
    expect(result.title).toBe("정리된 제목");
  });

  it("rejects create for non-privileged role", async () => {
    await expect(
      createSupplementRequestService(baseUser, baseRequest.caseId, {
        targetUserId: baseRequest.targetUserId,
        requestType: "MISSING_FACT",
        title: "제목",
        description: "설명",
        dueAt: "",
        revisionRound: 0,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects create when writer permission is missing", async () => {
    permissionMocks.getCaseAccessContext.mockResolvedValueOnce({
      canReadCase: true,
      canWriteCase: false,
      canDeleteCase: false,
    });

    await expect(
      createSupplementRequestService(lawyerUser, baseRequest.caseId, {
        targetUserId: baseRequest.targetUserId,
        requestType: "MISSING_FACT",
        title: "제목",
        description: "설명",
        dueAt: "",
        revisionRound: 0,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("blocks invalid status transition", async () => {
    repositoryMocks.findSupplementRequestByIdRepository.mockResolvedValueOnce({
      ...baseRequest,
      status: "DRAFT",
    });

    await expect(
      changeSupplementRequestStatusService(lawyerUser, baseRequest.id, {
        toStatus: "ACCEPTED",
        reasonCode: "",
        reasonMemo: "",
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(repositoryMocks.updateSupplementRequestRepository).not.toHaveBeenCalled();
  });

  it("records response and advances status for target user", async () => {
    const result = await createSupplementResponseService(baseUser, baseRequest.id, {
      requestItemId: "",
      responseText: "응답 본문",
      responseJson: undefined,
      revisionRound: 1,
    });

    expect(repositoryMocks.createSupplementResponseRepository).toHaveBeenCalled();
    expect(repositoryMocks.updateSupplementRequestRepository).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "CLIENT_RESPONDED",
      }),
    );
    expect(repositoryMocks.appendSupplementRequestStatusLogRepository).toHaveBeenCalled();
    expect(result.request.status).toBe("CLIENT_RESPONDED");
  });

  it("rejects response when responder is not target user", async () => {
    await expect(
      createSupplementResponseService(lawyerUser, baseRequest.id, {
        requestItemId: "",
        responseText: "응답 본문",
        responseJson: undefined,
        revisionRound: 1,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects status transition to client status by non-target actor", async () => {
    await expect(
      changeSupplementRequestStatusService(adminUser, baseRequest.id, {
        toStatus: "CLIENT_RESPONDED",
        reasonCode: "",
        reasonMemo: "",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects empty response payload", async () => {
    await expect(
      createSupplementResponseService(baseUser, baseRequest.id, {
        requestItemId: "",
        responseText: "",
        responseJson: undefined,
        revisionRound: 0,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("supplement request status transition and permission guards", () => {
  const anotherClientUser = {
    id: "cm1oth1111111111111111111",
    email: "other@example.com",
    name: "다른 의뢰인",
    role: "USER" as const,
    status: "ACTIVE" as const,
  };

  const validCreateInput = {
    targetUserId: baseRequest.targetUserId,
    requestType: "MISSING_FACT" as const,
    title: "보완 요청 제목",
    description: "보완 요청 설명",
    dueAt: "",
    revisionRound: 0,
  };

  const validResponseInput = {
    requestItemId: "",
    responseText: "응답 본문",
    responseJson: undefined,
    revisionRound: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    permissionMocks.getCaseAccessContext.mockResolvedValue({
      canReadCase: true,
      canWriteCase: true,
      canDeleteCase: false,
      role: "USER",
      assignmentType: "OWNER",
      assignmentReason: null,
      assignmentId: null,
      case: {
        id: baseRequest.caseId,
        ownerUserId: baseUser.id,
        assignedLawyerId: lawyerUser.id,
        status: "IN_INTERVIEW",
      },
    });
    repositoryMocks.findSupplementRequestByIdRepository.mockResolvedValue({
      ...baseRequest,
    });
    repositoryMocks.appendSupplementRequestAuditLogRepository.mockResolvedValue(undefined);
    repositoryMocks.appendSupplementRequestStatusLogRepository.mockResolvedValue(undefined);
    repositoryMocks.updateSupplementRequestRepository.mockResolvedValue({
      ...baseRequest,
      status: "CLIENT_RESPONDED",
    });
    repositoryMocks.createSupplementResponseRepository.mockResolvedValue({
      id: "cm1res9999999999999999999",
      requestId: baseRequest.id,
      requestItemId: null,
      responderUserId: baseUser.id,
      responderRole: "USER",
      responseText: "응답 본문",
      responseJson: null,
      submittedAt: new Date(),
      revisionRound: 1,
      isAcceptedSnapshot: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("blocks SENT to UNDER_REVIEW without client response", async () => {
    await expect(
      changeSupplementRequestStatusService(lawyerUser, baseRequest.id, {
        toStatus: "UNDER_REVIEW",
        reasonCode: "",
        reasonMemo: "",
      }),
    ).rejects.toThrow("허용되지 않은 보완 요청 상태 전이");
  });

  it("blocks CLIENT_RESPONDED to ACCEPTED direct transition", async () => {
    repositoryMocks.findSupplementRequestByIdRepository.mockResolvedValueOnce({
      ...baseRequest,
      status: "CLIENT_RESPONDED",
    });

    await expect(
      changeSupplementRequestStatusService(lawyerUser, baseRequest.id, {
        toStatus: "ACCEPTED",
        reasonCode: "",
        reasonMemo: "",
      }),
    ).rejects.toThrow("허용되지 않은 보완 요청 상태 전이");
  });

  it("blocks USER from creating supplement request", async () => {
    await expect(
      createSupplementRequestService(baseUser, baseRequest.caseId, validCreateInput),
    ).rejects.toThrow("보완 요청은 변호사 또는 관리자만 생성할 수 있습니다.");
  });

  it("allows only target client to create response", async () => {
    repositoryMocks.findSupplementRequestByIdRepository.mockResolvedValueOnce({
      ...baseRequest,
      targetUserId: baseUser.id,
    });

    await expect(
      createSupplementResponseService(anotherClientUser, baseRequest.id, validResponseInput),
    ).rejects.toThrow("보완 요청 대상 의뢰인만 응답할 수 있습니다.");
  });

  it("keeps lawyer review on status route, not response route", async () => {
    await expect(
      createSupplementResponseService(lawyerUser, baseRequest.id, validResponseInput),
    ).rejects.toThrow("보완 요청 대상 의뢰인만 응답할 수 있습니다.");
  });

  it("blocks terminal status transition", async () => {
    repositoryMocks.findSupplementRequestByIdRepository.mockResolvedValueOnce({
      ...baseRequest,
      status: "CLOSED",
    });

    await expect(
      changeSupplementRequestStatusService(lawyerUser, baseRequest.id, {
        toStatus: "SENT",
        reasonCode: "",
        reasonMemo: "",
      }),
    ).rejects.toThrow("종료된 보완 요청은 상태를 변경할 수 없습니다");
  });
});
