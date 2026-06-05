import { readFileSync } from "node:fs";
import { join } from "node:path";

type CheckResult = "PASS" | "FAIL" | "PENDING" | "BLOCKED";
type LockStatus = CheckResult | "PRODUCTION_DEPLOYED_AND_LOCKED";

type SmokeTestItem = {
  id: string;
  title: string;
  expected: string;
  result: CheckResult;
};

type PredeployLockResults = {
  evidenceId: string;
  status: LockStatus;
  deployDecision: "APPROVED" | "BLOCKED" | "PENDING" | "APPROVED_FOR_PRODUCTION";
  checkedAt: string;
  checkedBy: string;
  deploy: {
    branch: string;
    commitSha: string;
    target: string;
    operator: string;
  };
  databaseBackup: {
    confirmed: boolean;
    method: string;
    reference: string;
    checkedAt: string;
  };
  environment: {
    confirmed: boolean;
    notes: string;
  };
  rollback: {
    confirmed: boolean;
    targetCommit: string;
    notes: string;
  };
  smokeTest: {
    defined: boolean;
    completed: boolean;
    items: SmokeTestItem[];
  };
};

const requiredSmokeIds = [
  "SMOKE-APP-ACCESS",
  "SMOKE-LOGIN",
  "SMOKE-CASE-LIST",
  "SMOKE-CASE-DETAIL",
  "SMOKE-DOCUMENT-GENERATE",
  "SMOKE-BLOCKING-MISSING",
  "SMOKE-WARNING-MISSING",
  "SMOKE-GUARDRAIL-VIOLATION",
  "SMOKE-DOCUMENT-APPROVE",
  "SMOKE-VERIFY-CODE",
  "SMOKE-PDF-PRINT",
  "SMOKE-FORBIDDEN-RAW",
] as const;

const requiredSmokeIdsProduction = [
  "SMOKE-01-main-page-access",
  "SMOKE-02-login-page-access",
  "SMOKE-03-admin-login",
  "SMOKE-04-client-case-detail",
  "SMOKE-05-client-share-settings",
  "SMOKE-06-lawyer-lookup",
  "SMOKE-07-case-package-detail",
  "SMOKE-08-attachment-list",
  "SMOKE-09-download-policy",
  "SMOKE-10-case-package-pdf",
  "SMOKE-11-admin-share-list",
  "SMOKE-12-admin-share-detail-logs",
  "SMOKE-13-expired-revoked-access-denied",
  "SMOKE-14-lawyer-act-privacy-notice",
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function isCheckResult(value: unknown): value is CheckResult {
  return (
    value === "PASS" ||
    value === "FAIL" ||
    value === "PENDING" ||
    value === "BLOCKED"
  );
}

function isLockStatus(value: unknown): value is LockStatus {
  return isCheckResult(value) || value === "PRODUCTION_DEPLOYED_AND_LOCKED";
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  return typeof value === "string" ? value : "";
}

function readBoolean(record: Record<string, unknown>, key: string): boolean {
  return record[key] === true;
}

function normalizeSmokeItem(value: unknown): SmokeTestItem | null {
  const record = asRecord(value);

  if (
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.expected !== "string" ||
    !isCheckResult(record.result)
  ) {
    return null;
  }

  return {
    id: record.id,
    title: record.title,
    expected: record.expected,
    result: record.result,
  };
}

function normalizeLegacySchema(record: Record<string, unknown>): PredeployLockResults {
  const deploy = asRecord(record.deploy);
  const databaseBackup = asRecord(record.databaseBackup);
  const environment = asRecord(record.environment);
  const rollback = asRecord(record.rollback);
  const smokeTest = asRecord(record.smokeTest);

  if (
    typeof record.evidenceId !== "string" ||
    !isLockStatus(record.status) ||
    (record.deployDecision !== "APPROVED" &&
      record.deployDecision !== "BLOCKED" &&
      record.deployDecision !== "PENDING" &&
      record.deployDecision !== "APPROVED_FOR_PRODUCTION") ||
    typeof record.checkedAt !== "string" ||
    typeof record.checkedBy !== "string" ||
    !Array.isArray(smokeTest.items)
  ) {
    throw new Error("predeploy-lock-results.json 최상위 구조가 올바르지 않습니다.");
  }

  const smokeItems = smokeTest.items.flatMap((item) => {
    const normalized = normalizeSmokeItem(item);

    return normalized ? [normalized] : [];
  });

  if (smokeItems.length !== smokeTest.items.length) {
    throw new Error("Smoke Test 항목 중 형식이 올바르지 않은 항목이 있습니다.");
  }

  return {
    evidenceId: record.evidenceId,
    status: record.status,
    deployDecision: record.deployDecision,
    checkedAt: record.checkedAt,
    checkedBy: record.checkedBy,
    deploy: {
      branch: readString(deploy, "branch"),
      commitSha: readString(deploy, "commitSha"),
      target: readString(deploy, "target"),
      operator: readString(deploy, "operator"),
    },
    databaseBackup: {
      confirmed: readBoolean(databaseBackup, "confirmed"),
      method: readString(databaseBackup, "method"),
      reference: readString(databaseBackup, "reference"),
      checkedAt: readString(databaseBackup, "checkedAt"),
    },
    environment: {
      confirmed: readBoolean(environment, "confirmed"),
      notes: readString(environment, "notes"),
    },
    rollback: {
      confirmed: readBoolean(rollback, "confirmed"),
      targetCommit: readString(rollback, "targetCommit"),
      notes: readString(rollback, "notes"),
    },
    smokeTest: {
      defined: readBoolean(smokeTest, "defined"),
      completed: readBoolean(smokeTest, "completed"),
      items: smokeItems,
    },
  };
}

function normalizeProductionSchema(record: Record<string, unknown>): PredeployLockResults {
  const databaseBackup = asRecord(record.databaseBackup);
  const environmentVariables = asRecord(record.environmentVariables);
  const rollback = asRecord(record.rollback);
  const smokeTestResults = asRecord(record.smokeTestResults);
  const deploymentDetails = asRecord(record.deploymentDetails);

  if (
    typeof record.evidenceId !== "string" ||
    !isLockStatus(record.status) ||
    (record.deployDecision !== "APPROVED" &&
      record.deployDecision !== "BLOCKED" &&
      record.deployDecision !== "PENDING" &&
      record.deployDecision !== "APPROVED_FOR_PRODUCTION") ||
    typeof record.checkedAt !== "string" ||
    typeof record.checkedBy !== "string" ||
    !Array.isArray(smokeTestResults.items)
  ) {
    throw new Error("predeploy-lock-results.json 최상위 구조가 올바르지 않습니다.");
  }

  const smokeItems = smokeTestResults.items.flatMap((item) => {
    const normalized = normalizeSmokeItem(item);

    return normalized ? [normalized] : [];
  });

  if (smokeItems.length !== smokeTestResults.items.length) {
    throw new Error("Smoke Test 항목 중 형식이 올바르지 않은 항목이 있습니다.");
  }

  return {
    evidenceId: record.evidenceId,
    status: record.status,
    deployDecision: record.deployDecision,
    checkedAt: record.checkedAt,
    checkedBy: record.checkedBy,
    deploy: {
      branch: readString(record, "branch"),
      commitSha: readString(record, "commitSha"),
      target: readString(record, "deploymentProvider"),
      operator:
        readString(deploymentDetails, "deployedBy") || readString(record, "checkedBy"),
    },
    databaseBackup: {
      confirmed: readBoolean(databaseBackup, "confirmed"),
      method: readString(databaseBackup, "method"),
      reference: readString(databaseBackup, "reference"),
      checkedAt: readString(databaseBackup, "checkedAt"),
    },
    environment: {
      confirmed: readBoolean(environmentVariables, "confirmed"),
      notes: readString(environmentVariables, "notes"),
    },
    rollback: {
      confirmed: readBoolean(rollback, "confirmed"),
      targetCommit: readString(rollback, "targetCommit"),
      notes: readString(rollback, "notes"),
    },
    smokeTest: {
      defined: Array.isArray(smokeTestResults.items),
      completed: readBoolean(smokeTestResults, "completed"),
      items: smokeItems,
    },
  };
}

function resolveRequiredSmokeIdSet(items: SmokeTestItem[]) {
  const allIds = new Set(items.map((item) => item.id));
  const hasLegacy = requiredSmokeIds.every((id) => allIds.has(id));
  if (hasLegacy) {
    return requiredSmokeIds as readonly string[];
  }

  const hasProduction = requiredSmokeIdsProduction.every((id) => allIds.has(id));
  if (hasProduction) {
    return requiredSmokeIdsProduction as readonly string[];
  }

  return [] as const;
}

function loadPredeployLockResults(): PredeployLockResults {
  const filePath = join(
    process.cwd(),
    "docs/project-governance/predeploy-lock-results.json",
  );

  const raw = readFileSync(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  const record = asRecord(parsed);

  const hasLegacyShape = Array.isArray(asRecord(record.smokeTest).items);
  if (hasLegacyShape) {
    return normalizeLegacySchema(record);
  }

  return normalizeProductionSchema(record);
}

function verifyPredeploy(results: PredeployLockResults): string[] {
  const errors: string[] = [];

  const statusRules: Array<{ valid: boolean; message: string }> = [
    {
      valid:
        results.status === "PASS" ||
        results.status === "PRODUCTION_DEPLOYED_AND_LOCKED",
      message: `status가 허용값(PASS 또는 PRODUCTION_DEPLOYED_AND_LOCKED)이 아닙니다: ${results.status}`,
    },
    {
      valid:
        results.deployDecision === "APPROVED" ||
        results.deployDecision === "APPROVED_FOR_PRODUCTION",
      message: `deployDecision이 허용값(APPROVED 또는 APPROVED_FOR_PRODUCTION)이 아닙니다: ${results.deployDecision}`,
    },
    {
      valid: results.databaseBackup.confirmed,
      message: "DB 백업 확인이 완료되지 않았습니다.",
    },
    {
      valid: results.environment.confirmed,
      message: "환경변수 확인이 완료되지 않았습니다.",
    },
    {
      valid: results.rollback.confirmed,
      message: "롤백 기준 확인이 완료되지 않았습니다.",
    },
    {
      valid: results.smokeTest.defined,
      message: "Smoke Test 기준이 정의되지 않았습니다.",
    },
    {
      valid: results.smokeTest.completed,
      message: "Smoke Test가 완료되지 않았습니다.",
    },
  ];

  for (const rule of statusRules) {
    if (!rule.valid) {
      errors.push(rule.message);
    }
  }

  const requiredStrings: Array<{ value: string; message: string }> = [
    { value: results.deploy.branch, message: "deploy.branch가 비어 있습니다." },
    { value: results.deploy.commitSha, message: "deploy.commitSha가 비어 있습니다." },
    { value: results.deploy.target, message: "deploy.target이 비어 있습니다." },
    { value: results.deploy.operator, message: "deploy.operator가 비어 있습니다." },
    { value: results.databaseBackup.method, message: "DB 백업 method가 비어 있습니다." },
    { value: results.databaseBackup.reference, message: "DB 백업 reference가 비어 있습니다." },
    { value: results.databaseBackup.checkedAt, message: "DB 백업 checkedAt이 비어 있습니다." },
    { value: results.rollback.targetCommit, message: "rollback.targetCommit이 비어 있습니다." },
  ];

  for (const field of requiredStrings) {
    if (!field.value) {
      errors.push(field.message);
    }
  }

  const itemMap = new Map(results.smokeTest.items.map((item) => [item.id, item]));
  const requiredIds = resolveRequiredSmokeIdSet(results.smokeTest.items);

  if (requiredIds.length === 0 && results.smokeTest.items.length > 0) {
    errors.push(
      "Smoke Test 항목 세트가 알려진 smoke ID 집합(legacy/production)과 일치하지 않습니다. 허용된 ID 세트를 확인하세요.",
    );
  }

  for (const requiredId of requiredIds) {
    const item = itemMap.get(requiredId);

    if (!item) {
      errors.push(`필수 Smoke Test 항목 누락: ${requiredId}`);
      continue;
    }

    if (item.result !== "PASS") {
      errors.push(`Smoke Test 미통과: ${requiredId} / ${item.result}`);
    }
  }

  if (requiredIds.length > 0) {
    const requiredIdSet = new Set(requiredIds);
    for (const item of results.smokeTest.items) {
      if (!requiredIdSet.has(item.id)) {
        errors.push(`알 수 없는 Smoke Test 항목 포함: ${item.id}`);
      } else if (item.result !== "PASS") {
        // required 항목 실패는 위 루프에서 이미 보고됨 — 중복 방지
      }
    }
  } else {
    for (const item of results.smokeTest.items) {
      if (item.result !== "PASS") {
        errors.push(`Smoke Test 미통과: ${item.id} / ${item.result}`);
      }
    }
  }

  if (results.smokeTest.items.length === 0) {
    errors.push("Smoke Test 항목이 비어 있습니다.");
  }

  return errors;
}

const results = loadPredeployLockResults();
const errors = verifyPredeploy(results);

console.log("\n================ Predeploy Lock Summary ================\n");
console.log(`Evidence ID: ${results.evidenceId}`);
console.log(`Status: ${results.status}`);
console.log(`Deploy Decision: ${results.deployDecision}`);
console.log(`Checked At: ${results.checkedAt}`);
console.log(`Checked By: ${results.checkedBy}`);
console.log("");
console.log(`Deploy Branch: ${results.deploy.branch || "-"}`);
console.log(`Deploy Commit: ${results.deploy.commitSha || "-"}`);
console.log(`Deploy Target: ${results.deploy.target || "-"}`);
console.log(`Deploy Operator: ${results.deploy.operator || "-"}`);
console.log("");
console.log(`DB Backup Confirmed: ${results.databaseBackup.confirmed}`);
console.log(`DB Backup Method: ${results.databaseBackup.method || "-"}`);
console.log(`DB Backup Reference: ${results.databaseBackup.reference || "-"}`);
console.log("");
console.log(`Environment Confirmed: ${results.environment.confirmed}`);
console.log(`Rollback Confirmed: ${results.rollback.confirmed}`);
console.log(`Smoke Test Completed: ${results.smokeTest.completed}`);
console.log("");

for (const item of results.smokeTest.items) {
  console.log(`[${item.result}] ${item.id} — ${item.title}`);
  console.log(`  expected: ${item.expected}`);
}

console.log("\n========================================================\n");

if (errors.length > 0) {
  console.error("Predeploy lock 검증 실패:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Predeploy lock 전 항목 PASS. 실제 배포 진행 가능 상태입니다.");
