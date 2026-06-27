import fs from "node:fs";
import path from "node:path";
import { repoFileExists, writeJson, getEngineRoot } from "./paths.mjs";
import { loadPlatformExpansionRegistry } from "./registry.mjs";

const REQUIRED_CONTRACT_FIELDS = [
  "platformId",
  "requiredRoles",
  "requiredStatusValues",
  "coreUserFlows",
  "riskAreas",
  "requiredApiResponseShapes",
  "requiredE2eTests",
  "predeployBlockRules",
];

function loadContract(platformId) {
  const contractPath = path.join(
    getEngineRoot(),
    "platform-expansion/contracts",
    `${platformId}.json`,
  );
  if (!fs.existsSync(contractPath)) {
    return { platformId, exists: false, contractPath, missingFields: REQUIRED_CONTRACT_FIELDS };
  }

  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const missingFields = REQUIRED_CONTRACT_FIELDS.filter((field) => !(field in contract));
  const missingE2e = (contract.requiredE2eTests ?? []).filter((spec) => !repoFileExists(spec));

  return {
    platformId,
    exists: true,
    contractPath: `tools/diagnostic-engine/platform-expansion/contracts/${platformId}.json`,
    contract,
    missingFields,
    missingE2e,
    ok: missingFields.length === 0,
    contractReady: missingFields.length === 0 && missingE2e.length === 0,
  };
}

export function evaluatePlatformContracts() {
  const registry = loadPlatformExpansionRegistry();
  const contracts = registry.platforms.map((platform) => {
    const loaded = loadContract(platform.platformId);
    const isTemplate = platform.status === "TEMPLATE";
    return {
      platformId: platform.platformId,
      platformName: platform.platformName,
      status: platform.status,
      profileExists: repoFileExists(platform.nurionProfilePath),
      contractExists: loaded.exists,
      contractReady: loaded.contractReady ?? false,
      missingFields: loaded.missingFields ?? [],
      missingE2e: loaded.missingE2e ?? [],
      notes: loaded.contract?.notes ?? [],
      ok: isTemplate ? true : loaded.exists && loaded.missingFields.length === 0,
      skipped: isTemplate,
    };
  });

  const primary = contracts.find((item) => item.platformId === registry.primaryProjectId);
  const expansionPlatforms = contracts.filter(
    (item) => item.platformId !== registry.primaryProjectId && !item.skipped,
  );

  const result = {
    stepId: "platform-contract-gate",
    evaluatedAt: new Date().toISOString(),
    primaryProjectId: registry.primaryProjectId,
    policy: {
      profileOnlyExpansionBlocked: true,
      primaryMustHaveRunnableE2e: true,
      expansionMayHavePendingE2e: true,
    },
    contracts,
    ok:
      Boolean(primary?.ok) &&
      Boolean(primary?.contractReady) &&
      expansionPlatforms.every((item) => item.ok),
    blockers: [
      ...(primary?.ok ? [] : ["PRIMARY_PLATFORM_CONTRACT_MISSING"]),
      ...(primary?.contractReady ? [] : ["PRIMARY_PLATFORM_E2E_NOT_READY"]),
      ...expansionPlatforms
        .filter((item) => !item.ok)
        .map((item) => `EXPANSION_CONTRACT_MISSING:${item.platformId}`),
    ],
  };

  writeJson("_runtime/platform-contract-gate.json", result);
  return result;
}
