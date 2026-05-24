/**
 * Product Phase 30-E — Scale monitoring / capacity forecast schema (Zod SSOT).
 */
import { z } from "zod";

export const SCALE_MONITORING_CAPACITY_SCHEMA_MARKER_PHASE30E =
  "phase30e-scale-monitoring-capacity-schema" as const;

export const SCALE_MONITORING_CAPACITY_VERSION = "30-E.1" as const;

export const CAPACITY_FORECAST_AXIS_IDS = [
  "DATABASE_CONNECTIONS",
  "API_THROUGHPUT",
  "MESSAGING_QUEUE",
  "AI_INFERENCE_TPM",
  "STORAGE_GROWTH",
  "OPERATIONS_HEADROOM",
] as const;

export const capacityForecastAxisSchema = z.object({
  axisId: z.enum(CAPACITY_FORECAST_AXIS_IDS),
  label: z.string().min(1),
  weight: z.number().min(0).max(100),
  utilizationPercent: z.number().min(0).max(100),
  forecastHeadroomDays: z.number().min(0),
});

export const scaleMonitoringCapacityForecastResultSchema = z.object({
  version: z.literal(SCALE_MONITORING_CAPACITY_VERSION),
  generatedAt: z.string().datetime(),
  axes: z.array(capacityForecastAxisSchema).min(1),
  weightedUtilization: z.number().min(0).max(100),
  minHeadroomDays: z.number().min(0),
  capacityForecastReady: z.boolean(),
});

export type CapacityForecastAxisId = (typeof CAPACITY_FORECAST_AXIS_IDS)[number];
export type ScaleMonitoringCapacityForecastResult = z.infer<
  typeof scaleMonitoringCapacityForecastResultSchema
>;
