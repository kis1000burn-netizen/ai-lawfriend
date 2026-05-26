import { ControlTowerBrainConsole } from "@/components/admin/control-tower/control-tower-brain-console";
import { getControlTowerBrainSnapshot } from "@/features/control-tower-brain/control-tower-brain.orchestrator.service";

export const dynamic = "force-dynamic";

export default async function ControlTowerBrainPage() {
  const snapshot = await getControlTowerBrainSnapshot();

  return (
    <ControlTowerBrainConsole
      initialSnapshot={{
        status: snapshot.status,
        issues: snapshot.issues,
        diagnoses: snapshot.diagnoses,
        plans: snapshot.plans,
      }}
    />
  );
}
