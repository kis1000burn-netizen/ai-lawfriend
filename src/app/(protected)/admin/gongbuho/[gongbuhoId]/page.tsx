import { notFound } from "next/navigation";
import {
  summarizeGongbuhoPacketJsonForAdmin,
  truncateGongbuhoPacketJsonPreview,
} from "@/features/gongbuho/admin-gongbuho-ui-model";
import { deriveGongbuhoQuestionFlowPreview } from "@/features/gongbuho/admin-gongbuho-question-flow-preview";
import { GongbuhoPacketDetail } from "@/components/admin/gongbuho/gongbuho-packet-detail";
import { getGongbuhoPacketDetailForAdmin } from "@/features/gongbuho/gongbuho-packet.service";
import { findExistingQuestionSetForGongbuhoIdentity } from "@/features/gongbuho/project-gongbuho-question-set.service";
import { NotFoundError } from "@/lib/errors";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

type Props = {
  params: Promise<{ gongbuhoId: string }>;
};

export default async function AdminGongbuhoPacketDetailPage({ params }: Props) {
  const sessionUser = await requireStaffOrPlatformAdminPage();
  const { gongbuhoId } = await params;

  const viewerIsPlatformAdmin =
    sessionUser.role === "ADMIN" || sessionUser.role === "SUPER_ADMIN";

  const viewerCanMutateLifecycle = viewerIsPlatformAdmin;

  const viewerCanProjectQuestionSet = viewerIsPlatformAdmin;

  let row;
  try {
    row = await getGongbuhoPacketDetailForAdmin(gongbuhoId);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  const counts = summarizeGongbuhoPacketJsonForAdmin(row.packetJson);
  const preview = truncateGongbuhoPacketJsonPreview(row.packetJson);
  const questionFlowPreview = deriveGongbuhoQuestionFlowPreview(row.packetJson);
  const linked = await findExistingQuestionSetForGongbuhoIdentity({
    packetId: row.id,
    code: row.code,
    version: row.version,
  });

  return (
    <GongbuhoPacketDetail
      packet={{
        id: row.id,
        code: row.code,
        version: row.version,
        name: row.name,
        domain: row.domain,
        caseType: row.caseType ?? null,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        createdByUserId: row.createdByUserId ?? null,
        approvedAt: row.approvedAt?.toISOString() ?? null,
        approvedByUserId: row.approvedByUserId ?? null,
      }}
      packetJsonPreview={preview}
      counts={counts}
      viewerCanMutateLifecycle={viewerCanMutateLifecycle}
      questionFlowPreview={questionFlowPreview}
      linkedQuestionSetId={linked?.id ?? null}
      viewerCanProjectQuestionSet={viewerCanProjectQuestionSet}
    />
  );
}
