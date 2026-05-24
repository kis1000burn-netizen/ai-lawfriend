/**
 * Product Phase 30-E — Scale monitoring / capacity forecast policy SSOT.
 */
import {
  CAPACITY_FORECAST_AXES,
  CAPACITY_FORECAST_MAX_UTILIZATION,
  CAPACITY_FORECAST_MIN_HEADROOM_DAYS,
} from "./scale-monitoring-capacity-forecast.registry";
import type { ScaleMonitoringCapacityForecastResult } from "./scale-monitoring-capacity-forecast.schema";
import { SCALE_MONITORING_CAPACITY_VERSION } from "./scale-monitoring-capacity-forecast.schema";

export const SCALE_MONITORING_CAPACITY_POLICY_MARKER_PHASE30E =
  "phase30e-scale-monitoring-capacity-policy" as const;

export function assembleScaleMonitoringCapacityForecast(input: {
  axisUtilization: Record<string, number>;
  headroomDaysByAxis?: Record<string, number>;
  generatedAt?: string;
}): ScaleMonitoringCapacityForecastResult {
  const axes = CAPACITY_FORECAST_AXES.map((axis) => ({
    ...axis,
    utilizationPercent: input.axisUtilization[axis.axisId] ?? 0,
    forecastHeadroomDays: input.headroomDaysByAxis?.[axis.axisId] ?? CAPACITY_FORECAST_MIN_HEADROOM_DAYS,
  }));

  const totalWeight = axes.reduce((sum, axis) => sum + axis.weight, 0);
  const weightedUtilization =
    totalWeight === 0
      ? 0
      : Math.round(
          axes.reduce((sum, axis) => sum + axis.utilizationPercent * axis.weight, 0) / totalWeight,
        );

  const minHeadroomDays = Math.min(...axes.map((axis) => axis.forecastHeadroomDays));

  return {
    version: SCALE_MONITORING_CAPACITY_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    axes,
    weightedUtilization,
    minHeadroomDays,
    capacityForecastReady:
      weightedUtilization <= CAPACITY_FORECAST_MAX_UTILIZATION &&
      minHeadroomDays >= CAPACITY_FORECAST_MIN_HEADROOM_DAYS,
  };
}
