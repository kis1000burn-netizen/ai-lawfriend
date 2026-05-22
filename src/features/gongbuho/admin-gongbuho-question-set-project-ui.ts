import type { GongbuhoPacketStatus } from "@prisma/client";

/** Phase 4-C — ADMIN·SUPER_ADMIN 전용 저장 버튼; STAFF 는 조회·미리보기만 */
export type GongbuhoQuestionSetProjectPanelUiModel = {
  staffReadOnlyBanner: string | null;
  duplicateLinkedSetId: string | null;
  project: {
    showButton: boolean;
    disabled: boolean;
    caption: string;
  };
};

export function deriveGongbuhoQuestionSetProjectPanelUi(opts: Readonly<{
  status: GongbuhoPacketStatus;
  viewerCanProjectQuestionSet: boolean;
  linkedQuestionSetId: string | null;
  previewFlowOk: boolean;
}>): GongbuhoQuestionSetProjectPanelUiModel {
  const viewerCanProjectQuestionSet = opts.viewerCanProjectQuestionSet;

  const staffReadOnlyBanner = viewerCanProjectQuestionSet
    ? null
    : "STAFF는 questionFlow 미리보기까지 열람할 수 있습니다. 질문셋 초안 저장(Project)은 플랫폼 관리자(ADMIN·SUPER_ADMIN)만 수행할 수 있습니다.";

  const duplicateLinkedSetId = opts.linkedQuestionSetId;

  let caption: string;

  if (duplicateLinkedSetId) {
    caption =
      "이 공부호에서 이미 저장한 QuestionSet 초안이 있습니다. 중복 저장은 허용되지 않습니다(409).";
  } else if (opts.status !== "APPROVED") {
    caption =
      "`APPROVED` 패킷만 QuestionSet DRAFT로 저장할 수 있습니다. 먼저 승인하거나 승인된 버전으로 이동하세요.";
  } else if (!opts.previewFlowOk) {
    caption =
      "questionFlow 투영에 실패한 패킷은 저장할 수 없습니다. 패킷 JSON 또는 questionFlow 규격을 수정하세요.";
  } else {
    caption =
      "현재 패킷의 questionFlow를 투영해 Catalog에 질문셋 초안(DRAFT·비활성) 행으로 저장합니다.";
  }

  const projectAllowed =
    viewerCanProjectQuestionSet &&
    opts.status === "APPROVED" &&
    opts.previewFlowOk &&
    !duplicateLinkedSetId;

  return {
    staffReadOnlyBanner,
    duplicateLinkedSetId,
    project: {
      showButton: viewerCanProjectQuestionSet,
      disabled: !projectAllowed,
      caption,
    },
  };
}
