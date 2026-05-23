import CaseForm from "@/components/cases/case-form";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { getCaseDetailService } from "@/features/cases/case.service";

type EditCasePageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
}

export default async function EditCasePage({ params }: EditCasePageProps) {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);
  const { caseId } = await params;
  const item = await getCaseDetailService(currentUser, caseId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-aibeop-subtle">사건 수정</p>
        <h1 className="text-3xl font-bold text-aibeop-text">{item.title}</h1>
      </div>

      <CaseForm
        mode="edit"
        caseId={item.id}
        initialValues={{
          title: item.title,
          category: item.category ?? "",
          briefSummary: item.description ?? "",
          opponentType: item.opponentName ?? "",
          courtName: item.courtName ?? "",
          incidentDate: toDateInputValue(item.incidentDate),
        }}
      />
    </div>
  );
}
