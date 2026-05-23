import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalKnowledgeIntakeDetailPanel } from "@/components/admin/gongbuho/legal-knowledge-intake-detail-panel";
import { deriveLegalKnowledgeAdminCapabilities } from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";
import { getLegalKnowledgeIntake } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { NotFoundError } from "@/lib/errors";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

type Props = {
  params: Promise<{ intakeId: string }>;
};

export default async function AdminLegalKnowledgeIntakeDetailPage({ params }: Props) {
  const sessionUser = await requireStaffOrPlatformAdminPage();
  const caps = deriveLegalKnowledgeAdminCapabilities({ role: sessionUser.role });
  const { intakeId } = await params;

  let row;
  try {
    row = await getLegalKnowledgeIntake(intakeId);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Intake 상세</h1>
          <p className="mt-1 font-mono text-xs text-slate-500">{row.id}</p>
        </div>
        <Link
          href="/admin/gongbuho/legal-knowledge"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          ← Intake 목록
        </Link>
      </div>

      <LegalKnowledgeIntakeDetailPanel
        intake={{
          id: row.id,
          status: row.status,
          signalSource: row.signalSource,
          demandStrength: row.demandStrength,
          querySignature: row.querySignature,
          caseTypeMapping: row.caseTypeMapping,
          intakeCompliance: row.intakeCompliance,
          updatedAt: row.updatedAt.toISOString(),
        }}
        briefs={row.researchBriefs.map((b) => ({
          id: b.id,
          status: b.status,
          targetCaseType: b.targetCaseType,
          demandKeywordSnapshot: b.demandKeywordSnapshot,
          canonicalSourceRefs: b.canonicalSourceRefs,
          updatedAt: b.updatedAt.toISOString(),
        }))}
        viewerCanWrite={caps.canWriteIntakeOrBrief}
        staffReadOnlyBanner={caps.staffReadOnlyBanner}
      />
    </div>
  );
}
