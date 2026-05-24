import { OperationsMonitoringConsole } from "@/components/admin/operations/operations-monitoring-console";
import { getOperationsMonitoringSnapshot } from "@/features/operations-monitoring/operations-monitoring-snapshot.service";

export const dynamic = "force-dynamic";

export default async function OperationsMonitoringPage() {
  const snapshot = await getOperationsMonitoringSnapshot();

  return <OperationsMonitoringConsole snapshot={snapshot} />;
}
