import { requireApprovedLawyer } from "@/lib/auth/session";
import { LawyerCasePackageLookupClient } from "@/components/lawyer/case-package/lawyer-case-package-lookup-client";

export default async function LawyerCasePackageLookupPage() {
  await requireApprovedLawyer();
  return <LawyerCasePackageLookupClient />;
}