import type { AibeopchinCmbCaseConfig } from "@/cmb/core/cmb-schema";

export function parseCmbCaseConfigJson(json: unknown): AibeopchinCmbCaseConfig | null {
  if (!json || typeof json !== "object") return null;
  const row = json as AibeopchinCmbCaseConfig;
  if (!row.caseType || !row.id || !row.gates) return null;
  return row;
}

export function serializeCmbCaseConfig(config: AibeopchinCmbCaseConfig): AibeopchinCmbCaseConfig {
  return structuredClone(config);
}
