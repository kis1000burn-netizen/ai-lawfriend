import type { GongbuhoPacketStatus } from "@prisma/client";

/** 플랫폼 관리자 전용 버튼·안내 카피(SSOT Phase 4-B UX). STAFF 에는 패널이 비활성 안내만 표시된다. */
export type GongbuhoPacketLifecycleUi = {
  staffReadOnlyBanner: string | null;
  approve: {
    showButton: boolean;
    disabled: boolean;
    caption: string;
    /** 이미 최종 상태로 승인 API를 부를 필요가 없음 */
    isInformationalApproved: boolean;
  };
  archive: {
    showButton: boolean;
    disabled: boolean;
    caption: string;
    isAlreadyArchived: boolean;
  };
};

export function deriveGongbuhoPacketLifecycleUi(input: {
  status: GongbuhoPacketStatus;
  viewerCanMutateLifecycle: boolean;
}): GongbuhoPacketLifecycleUi {
  const { status, viewerCanMutateLifecycle } = input;

  if (!viewerCanMutateLifecycle) {
    return {
      staffReadOnlyBanner:
        "승인·보관 처리는 플랫폼 관리자(ADMIN / SUPER_ADMIN)만 수행할 수 있습니다. 조회 및 Preview(API)만 가능합니다.",
      approve: {
        showButton: false,
        disabled: true,
        caption: "",
        isInformationalApproved: status === "APPROVED",
      },
      archive: {
        showButton: false,
        disabled: true,
        caption: "",
        isAlreadyArchived: status === "ARCHIVED",
      },
    };
  }

  const canApprove = status === "DRAFT" || status === "REVIEW";

  let approveCaption = "";
  if (status === "APPROVED") {
    approveCaption = "이미 승인된 패킷입니다. 상태 변경 없이 새 사건 적용 후보로 사용 가능합니다.";
  } else if (status === "ARCHIVED") {
    approveCaption =
      "ARCHIVED(보관) 상태에서는 승인할 수 없습니다. 필요 시 패킷 새 버전을 등록해야 합니다.";
  } else {
    approveCaption = "DRAFT 또는 REVIEW 상태에서만 승인(API) 가능합니다.";
  }

  let archiveCaption = "";
  if (status === "ARCHIVED") {
    archiveCaption = "이미 보관 처리되었습니다. 목록에서는 계속 확인할 수 있습니다.";
  } else {
    archiveCaption =
      "보관 처리 시 신규 사건 적용 후보에서는 제외됩니다(기존 Trace·연계 데이터는 유지 정책).";
  }

  return {
    staffReadOnlyBanner: null,
    approve: {
      showButton: true,
      disabled: !canApprove,
      caption: approveCaption,
      isInformationalApproved: status === "APPROVED",
    },
    archive: {
      showButton: true,
      disabled: status === "ARCHIVED",
      caption: archiveCaption,
      isAlreadyArchived: status === "ARCHIVED",
    },
  };
}
