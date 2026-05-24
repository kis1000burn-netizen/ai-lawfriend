import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DATA_GOVERNANCE_RETENTION_CONSTITUTION_MARKER_PHASE19A,
  DATA_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19A,
} from "./data-retention-policy.schema";
import {
  DATA_RETENTION_POLICY_REGISTRY,
  DATA_RETENTION_REQUIRED_PRISMA_MODELS,
  getDataRetentionPolicyEntry,
} from "./data-retention-policy.registry";
import {
  assertDataRetentionRegistryValid,
  validateDataRetentionRegistryAgainstPrisma,
  validateDataRetentionRegistryConstitution,
} from "./data-retention-policy.validator";

const prismaSchema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");

describe("data-retention-policy.registry (Phase 19-A constitution)", () => {
  it("locks purge execution until later phases", () => {
    expect(DATA_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19A).toBe(true);
    expect(DATA_GOVERNANCE_RETENTION_CONSTITUTION_MARKER_PHASE19A).toContain("phase19a");
  });

  it("includes all required anchor models", () => {
    for (const model of DATA_RETENTION_REQUIRED_PRISMA_MODELS) {
      expect(getDataRetentionPolicyEntry(model)).toBeDefined();
    }
  });

  it("passes constitutional validation", () => {
    const result = validateDataRetentionRegistryConstitution();
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.duplicateModels).toEqual([]);
  });

  it("matches prisma schema model names", () => {
    const result = validateDataRetentionRegistryAgainstPrisma(prismaSchema);
    expect(result.ok).toBe(true);
    expect(result.missingPrismaModels).toEqual([]);
  });

  it("assertDataRetentionRegistryValid does not throw", () => {
    expect(() => assertDataRetentionRegistryValid(prismaSchema)).not.toThrow();
  });

  it("keeps legal-sensitive case core non-purgeable", () => {
    const caseEntry = getDataRetentionPolicyEntry("Case")!;
    const extractEntry = getDataRetentionPolicyEntry("LitigationExtractedText")!;
    expect(caseEntry.purgeEligible).toBe(false);
    expect(caseEntry.legalHoldDefault).toBe(true);
    expect(extractEntry.sensitivityTier).toBe("LEGAL_SENSITIVE");
    expect(extractEntry.purgeEligible).toBe(false);
  });

  it("allows operational logs purge-after-retention with days", () => {
    const audit = getDataRetentionPolicyEntry("AuditLog")!;
    const cron = getDataRetentionPolicyEntry("CronJobExecutionLog")!;
    expect(audit.disposition).toBe("PURGE_AFTER_RETENTION");
    expect(audit.defaultRetentionDays).toBeGreaterThan(0);
    expect(cron.purgeEligible).toBe(true);
  });

  it("registry size covers anchor set", () => {
    expect(DATA_RETENTION_POLICY_REGISTRY.length).toBeGreaterThanOrEqual(
      DATA_RETENTION_REQUIRED_PRISMA_MODELS.length,
    );
  });
});
