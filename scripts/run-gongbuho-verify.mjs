/**
 * Gongbuho 회귀용 Vitest 묶음(Phase 4-E〜F) + 동일 패키지의 정적 검사(`npm run verify:gongbuho` 선행 게이트).
 * Windows 셸에서 `cases/[caseId]/gongbuho` 경로 특수 문자 이스케이프 이슈를 피하기 위해 Node로 인자만 전달.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";

const cwd = resolve(process.cwd());
const vitestPath = resolve(cwd, "node_modules", "vitest", "vitest.mjs");

const targets = [
  resolve(cwd, "src/features/gongbuho"),
  resolve(cwd, "src/lib/gongbuho/legal-knowledge-pipeline-gates.test.ts"),
  resolve(cwd, "src/lib/validators/gongbuho-sample-library.test.ts"),
  resolve(cwd, "src/app/api/admin/gongbuho"),
  resolve(cwd, "src/app/api/cases/[caseId]/gongbuho"),
];

const r = spawnSync(process.execPath, [vitestPath, "run", ...targets], {
  cwd,
  stdio: "inherit",
});

process.exit(r.status ?? 1);
