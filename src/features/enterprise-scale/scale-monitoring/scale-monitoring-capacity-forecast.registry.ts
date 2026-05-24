/**
 * Product Phase 30-E — Scale monitoring / capacity forecast axes SSOT.
 */
import type { ScaleMonitoringCapacityForecastResult } from "./scale-monitoring-capacity-forecast.schema";

export const SCALE_MONITORING_CAPACITY_REGISTRY_MARKER_PHASE30E =
  "phase30e-scale-monitoring-capacity-registry" as const;

export const CAPACITY_FORECAST_MAX_UTILIZATION = 85 as const;
export const CAPACITY_FORECAST_MIN_HEADROOM_DAYS = 30 as const;

type ForecastAxis = Omit<
  ScaleMonitoringCapacityForecastResult["axes"][number],
  "utilizationPercent" | "forecastHeadroomDays"
>;

export const CAPACITY_FORECAST_AXES: ForecastAxis[] = [
  { axisId: "DATABASE_CONNECTIONS", label: "Database connection pool", weight: 20 },
  { axisId: "API_THROUGHPUT", label: "API throughput", weight: 20 },
  { axisId: "MESSAGING_QUEUE", label: "Messaging queue depth", weight: 15 },
  { axisId: "AI_INFERENCE_TPM", label: "AI inference TPM", weight: 20 },
  { axisId: "STORAGE_GROWTH", label: "Attachment storage growth", weight: 15 },
  { axisId: "OPERATIONS_HEADROOM", label: "Ops on-call headroom", weight: 10 },
];
