/**
 * finance-settlement/audit-evidence: checks.mjs
 * 월 마감 증빙 패키지 완성도를 확인하고 필요한 파일을 생성합니다.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { loadSettlements } from '../_lib.mjs';

const REQUIRED_CLOSE_FILES = [
  'settlement-summary.csv',
  'vendor-payout-register.csv',
  'refund-adjustment-register.csv',
  'tax-invoice-checklist.csv',
  'exception-log.json',
  'approval-audit.ndjson',
  'month-close-report.md',
];

export async function runChecks(context) {
  const { config, profile, ROOT } = context;
  const opts = profile?.skillOptions?.['finance-settlement/audit-evidence'] ?? {};
  const results = [];

  const targetMonth = opts.targetMonth ?? new Date().toISOString().slice(0, 7);
  const closeDir = path.join(ROOT, '_nurion_events', 'month-close', targetMonth);

  // 월 마감 디렉토리 + 파일 존재 확인
  let existingFiles = [];
  try {
    existingFiles = await fs.readdir(closeDir);
  } catch { /* 아직 생성 안 됨 */ }

  const missingFiles = REQUIRED_CLOSE_FILES.filter(f => !existingFiles.includes(f));

  if (missingFiles.length === REQUIRED_CLOSE_FILES.length) {
    results.push({ id: 'month-close-dir', status: 'warn', critical: false, message: `월 마감 증빙 없음 — ${targetMonth} (npm run nurion:apply 시 생성)` });
  } else if (missingFiles.length > 0) {
    results.push({ id: 'month-close-incomplete', status: 'warn', critical: false, message: `월 마감 증빙 미완성 — 누락: ${missingFiles.join(', ')}` });
  } else {
    results.push({ id: 'month-close-complete', status: 'pass', critical: false, message: `월 마감 증빙 완비 — ${targetMonth} (${REQUIRED_CLOSE_FILES.length}개 파일)` });
  }

  // 미처리 이상 거래 확인
  const settlements = await loadSettlements(ROOT, config.platformId, { limit: 300 });
  const exceptions = settlements.filter(s =>
    ['disputed', 'chargeback_pending', 'failed'].includes(s.status)
  );
  if (exceptions.length > 0) {
    results.push({ id: 'open-exceptions', status: 'warn', critical: false, message: `미처리 이상 거래 ${exceptions.length}건 — 월 마감 전 처리 필요 (disputed/chargeback/failed)` });
  }

  // 미승인 정산 건 확인
  const unreconciled = settlements.filter(s => !['reconciled','closed'].includes(s.status));
  if (unreconciled.length > 0) {
    results.push({ id: 'unreconciled', status: 'warn', critical: false, message: `미대사 정산 ${unreconciled.length}건 — 월 마감 전 대사 완료 권고` });
  }

  return results;
}
