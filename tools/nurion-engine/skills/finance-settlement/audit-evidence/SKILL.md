# audit-evidence 스킬

## 목적
월 마감 시 증빙 패키지(요약·체크리스트·예외 로그)를 자동 생성하고  
미처리 이상 거래·미대사 건을 감지합니다.

## 생성 파일 (`_nurion_events/month-close/YYYY-MM/`)
```
settlement-summary.csv
vendor-payout-register.csv
refund-adjustment-register.csv
tax-invoice-checklist.csv
exception-log.json
approval-audit.ndjson
month-close-report.md
```

## 자동조치
apply 모드에서만 파일 생성. 재무 확정·서명은 운영자 직접 처리.
