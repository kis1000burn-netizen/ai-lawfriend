import { requireRolePage } from "@/lib/auth/guards";
import { getHealthStatus } from "@/lib/health";
import { getReleaseMetaInline } from "@/lib/release-meta";
import { parseProductionEnv } from "@/lib/env-zod";
import { exportPermissionDefinitionsSnapshot } from "@/lib/definitions/permission-definition";
import { exportCaseStatusDefinitionsSnapshot } from "@/lib/definitions/case-status-definition";
import { exportCaseLifecycleDefinitionsSnapshot } from "@/lib/definitions/case-lifecycle-definition";

export default async function AdminSystemPage() {
  await requireRolePage("ADMIN");

  const health = await getHealthStatus();
  const releaseMeta = getReleaseMetaInline();
  const permissionDefinition = exportPermissionDefinitionsSnapshot();
  const caseStatusDefinition = exportCaseStatusDefinitionsSnapshot();
  const caseLifecycleDefinition = exportCaseLifecycleDefinitionsSnapshot();

  let envOk = true;
  let envError: string | null = null;
  try {
    parseProductionEnv();
  } catch (error) {
    envOk = false;
    envError = error instanceof Error ? error.message : "Invalid env";
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-aibeop-text">시스템 점검</h1>
        <p className="mt-1 text-sm text-aibeop-subtle">
          헬스 상태와 배포 메타 정보를 확인합니다. (release-meta API는 별도 인증이 필요합니다.)
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-aibeop-text">Health</h2>
        <div className="grid gap-2 text-sm text-aibeop-subtle">
          <div>
            <span className="font-medium">상태:</span>{" "}
            {health.ok ? "healthy" : "unhealthy"}
          </div>
          <div>
            <span className="font-medium">시각:</span> {health.ts}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-aibeop-text">Release Meta</h2>
        <p className="mb-3 text-xs text-aibeop-subtle">
          서버 인라인 메타입니다. JSON은 `getReleaseMetaInline()` 결과와 동일합니다.
        </p>
        <pre className="overflow-auto rounded-xl bg-slate-50 p-4 text-sm">
          {JSON.stringify(releaseMeta, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-aibeop-text">
          권한정의서 (1차본)
        </h2>
        <p className="mb-3 text-xs text-aibeop-subtle">
          subject / action 기준 역할별 허용 목록입니다.
        </p>
        <pre className="max-h-96 overflow-auto rounded-xl bg-slate-50 p-4 text-xs">
          {JSON.stringify(permissionDefinition, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-aibeop-text">
          상태값 정의서 (1차본)
        </h2>
        <p className="mb-3 text-xs text-aibeop-subtle">
          Prisma `CaseStatus` 기준 라벨·전이·편집 역할입니다.
        </p>
        <pre className="max-h-96 overflow-auto rounded-xl bg-slate-50 p-4 text-xs">
          {JSON.stringify(caseStatusDefinition, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-aibeop-text">
          사건 라이프사이클 정의서 (1차본)
        </h2>
        <p className="mb-3 text-xs text-aibeop-subtle">
          CAS-3xxx 단계와 현재 상태 enum의 대응입니다.
        </p>
        <pre className="max-h-96 overflow-auto rounded-xl bg-slate-50 p-4 text-xs">
          {JSON.stringify(caseLifecycleDefinition, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-aibeop-text">Environment</h2>
        <div className="text-sm text-aibeop-subtle">
          {process.env.NODE_ENV !== "production" && (
            <span className="block pb-2 text-aibeop-subtle">
              개발 모드: production env 스키마 검증은 건너뜁니다.{" "}
            </span>
          )}
          {envOk ? "환경변수 검증 정상" : `환경변수 오류: ${envError}`}
        </div>
      </section>
    </div>
  );
}
