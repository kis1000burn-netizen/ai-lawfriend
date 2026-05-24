# Scale Monitoring / Capacity Forecast Runbook (Product Phase **30-E**)

**한 줄**: API·DB·storage·AI inference·messaging 축별 utilization·headroom을 가중 집계해 `capacityForecastReady` 게이트를 판정한다.

## Operator checklist

1. `buildScaleMonitoringCapacityForecast` — weighted utilization ≤ threshold · min headroom days ≥ minimum
2. Phase 17 operations monitoring · Phase 18 reliability cross-link 확인
3. `npm run verify:aibeopchin-enterprise-scale-phase30e`

## 검증

```bash
npm run verify:aibeopchin-enterprise-scale-phase30e
```

**버전** **`30-E.1`**
