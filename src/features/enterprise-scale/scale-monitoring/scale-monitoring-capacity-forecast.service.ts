/**
 * Product Phase 30-E — Scale monitoring / capacity forecast service.
 */
import { assembleScaleMonitoringCapacityForecast } from "./scale-monitoring-capacity-forecast.policy";
import { CAPACITY_FORECAST_AXES } from "./scale-monitoring-capacity-forecast.registry";
import type { ScaleMonitoringCapacityForecastResult } from "./scale-monitoring-capacity-forecast.schema";

export const SCALE_MONITORING_CAPACITY_SERVICE_MARKER_PHASE30E =
  "phase30e-scale-monitoring-capacity-service" as const;

export function buildScaleMonitoringCapacityForecast(input?: {
  axisUtilization?: Record<string, number>;
  headroomDaysByAxis?: Record<string, number>;
}): ScaleMonitoringCapacityForecastResult {
  const axisUtilization: Record<string, number> = {};

  for (const axis of CAPACITY_FORECAST_AXES) {
    axisUtilization[axis.axisId] = input?.axisUtilization?.[axis.axisId] ?? 55;
  }

  return assembleScaleMonitoringCapacityForecast({
    axisUtilization,
    headroomDaysByAxis: input?.headroomDaysByAxis,
  });
}
