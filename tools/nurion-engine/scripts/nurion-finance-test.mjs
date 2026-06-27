#!/usr/bin/env node
/**
 * nurion-finance-test.mjs
 *
 * Finance & Settlement 스킬 시나리오 테스트 러너.
 * 샘플 데이터 25건에 대해 ledger-reconcile, payout-control 검사를 실행하고
 * 시나리오별 결과를 표시합니다.
 *
 * 사용:
 *   node scripts/nurion-finance-test.mjs
 *   node scripts/nurion-finance-test.mjs --verbose
 *   node scripts/nurion-finance-test.mjs --json
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, '..');
const VERBOSE    = process.argv.includes('--verbose');
const JSON_MODE  = process.argv.includes('--json');

// ─── 색상 헬퍼 ────────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
};
const r = (c, s) => JSON_MODE ? s : `${c}${s}${C.reset}`;

// ─── 공유 컨텍스트 구성 ────────────────────────────────────────────────────────
const config = {
  platformId: 'dosirak-store',
  probes: [],
};

const profile = {
  skillOptions: {
    'finance-settlement/ledger-reconcile': {
      maxUnreconciledWarn: 10,
      vendorProfiles: {
        vendor_001: { commissionRate: 0.12, deliveryFeeRule: 'vendor_borne', holdDays: 7 },
        vendor_002: { commissionRate: 0.10, deliveryFeeRule: 'platform_borne', holdDays: 14 },
      },
    },
    'finance-settlement/payout-control': {},
    'finance-settlement/approval-matrix': {},
  },
};

const sharedContext = {
  config, profile, ROOT,
  isoNow: () => new Date().toISOString(),
  writeJson: async (p, d) => await fs.writeFile(p, JSON.stringify(d, null, 2), 'utf8'),
};

// ─── 스킬 동적 로드 ───────────────────────────────────────────────────────────
async function loadSkillChecks(skillId) {
  const modPath = path.join(ROOT, 'skills', skillId, 'checks.mjs');
  try {
    const mod = await import(pathToFileURL(modPath).href);
    return mod.runChecks;
  } catch (err) {
    if (VERBOSE) console.error(`  [로드 실패] ${skillId}: ${err.message}`);
    return null;
  }
}

// ─── 데이터 로드 ──────────────────────────────────────────────────────────────
async function loadTestSettlements() {
  const file = path.join(ROOT, '_nurion_events', 'settlements', 'dosirak-store-2026-06-20.ndjson');
  const text = await fs.readFile(file, 'utf8');
  return text.split(/\r?\n/).filter(Boolean).map(l => JSON.parse(l));
}

// ─── 시나리오 분류 ────────────────────────────────────────────────────────────
const SCENARIOS = [
  { key: 'S1', label: '정상 정산',              filter: s => s.scenario?.includes('[S1]') },
  { key: 'S2', label: '부분·전액 환불',          filter: s => s.scenario?.includes('[S2]') },
  { key: 'S3', label: '배송비 분담 오류',        filter: s => s.scenario?.includes('[S3]') },
  { key: 'S4', label: '수수료율 변경 미반영',    filter: s => s.scenario?.includes('[S4]') },
  { key: 'S5', label: '중복 지급 (G4)',          filter: s => s.scenario?.includes('[S5]') },
  { key: 'S6', label: '정산 보류',               filter: s => s.scenario?.includes('[S6]') },
  { key: 'S7', label: '음수 마진·환불 급증',     filter: s => s.scenario?.includes('[S7]') },
  { key: 'EX', label: '부가 시나리오',            filter: s => s.scenario?.includes('[부가]') },
];

// ─── 결과 집계 ────────────────────────────────────────────────────────────────
function summarize(signals) {
  const pass  = signals.filter(s => s.status === 'pass').length;
  const fail  = signals.filter(s => s.status === 'fail').length;
  const warn  = signals.filter(s => s.status === 'warn').length;
  const p0    = signals.filter(s => s.id === 'code:p0-boundary').length;
  return { pass, fail, warn, p0, total: signals.length };
}

function gradeFromSignals(signals) {
  if (signals.some(s => s.id === 'code:p0-boundary')) return 'G4';
  const critFails = signals.filter(s => s.status === 'fail' && s.critical).length;
  if (critFails >= 1)  return 'G3';
  const nonCritFails = signals.filter(s => s.status === 'fail' && !s.critical).length;
  if (nonCritFails >= 1) return 'G2';
  if (signals.some(s => s.status === 'warn'))  return 'G1';
  return 'G0';
}

function gradeColor(g) {
  if (g === 'G4') return r(C.red    + C.bold, g);
  if (g === 'G3') return r(C.red,    g);
  if (g === 'G2') return r(C.yellow, g);
  if (g === 'G1') return r(C.cyan,   g);
  return r(C.green, g);
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  const settlements = await loadTestSettlements();

  const ledgerChecks  = await loadSkillChecks('finance-settlement/ledger-reconcile');
  const payoutChecks  = await loadSkillChecks('finance-settlement/payout-control');
  const approvalChecks = await loadSkillChecks('finance-settlement/approval-matrix');

  if (!ledgerChecks || !payoutChecks || !approvalChecks) {
    console.error('스킬 모듈 로드 실패 — 경로를 확인하세요.');
    process.exit(1);
  }

  // 전체 검사 실행
  const ledgerSignals   = await ledgerChecks(sharedContext);
  const payoutSignals   = await payoutChecks(sharedContext);
  const approvalSignals = await approvalChecks(sharedContext);

  const allSignals = [...ledgerSignals, ...payoutSignals, ...approvalSignals];

  if (JSON_MODE) {
    console.log(JSON.stringify({ settlements: settlements.length, signals: allSignals, grade: gradeFromSignals(allSignals) }, null, 2));
    return;
  }

  // ── 헤더 ────────────────────────────────────────────────────────────────────
  console.log('\n' + r(C.bold, '═══════════════════════════════════════════════════════════'));
  console.log(r(C.bold + C.cyan, '  누리온 Finance & Settlement — 시나리오 테스트 결과'));
  console.log(r(C.bold, '═══════════════════════════════════════════════════════════\n'));
  console.log(`  데이터: ${r(C.bold, settlements.length + '건')} (dosirak-store-2026-06-20.ndjson)`);
  console.log(`  스킬: ledger-reconcile · payout-control · approval-matrix\n`);

  // ── 전체 등급 ──────────────────────────────────────────────────────────────
  const grade = gradeFromSignals(allSignals);
  const summary = summarize(allSignals);
  console.log(`  ${'종합 판정'.padEnd(16)} ${gradeColor(grade)}  (P-0: ${summary.p0}, 실패: ${summary.fail}, 경고: ${summary.warn}, 통과: ${summary.pass})`);
  console.log();

  // ── 시나리오별 결과 ────────────────────────────────────────────────────────
  console.log(r(C.bold, '  시나리오별 데이터 분포'));
  console.log('  ' + '─'.repeat(55));
  for (const sc of SCENARIOS) {
    const items = settlements.filter(sc.filter);
    console.log(`  ${r(C.cyan, sc.key.padEnd(4))} ${sc.label.padEnd(22)} ${items.length}건`);
    if (VERBOSE) {
      for (const s of items) {
        const exp = s.expectedVendorPayout != null ? s.expectedVendorPayout.toLocaleString() + '원' : '?';
        const act = s.actualVendorPayout != null   ? s.actualVendorPayout.toLocaleString() + '원'   : 'null';
        const diff = (s.expectedVendorPayout != null && s.actualVendorPayout != null)
          ? Math.abs(s.expectedVendorPayout - s.actualVendorPayout).toLocaleString() + '원'
          : '-';
        console.log(r(C.gray, `       ${s.settlementId} | ${s.status} | 예상:${exp} 실제:${act} 차이:${diff}`));
      }
    }
  }
  console.log();

  // ── 감지된 신호 ─────────────────────────────────────────────────────────────
  console.log(r(C.bold, '  감지된 신호'));
  console.log('  ' + '─'.repeat(55));

  const failures = allSignals.filter(s => s.status === 'fail');
  const warnings = allSignals.filter(s => s.status === 'warn');

  if (failures.length === 0 && warnings.length === 0) {
    console.log(r(C.green, '  ✓ 이상 신호 없음'));
  }

  for (const sig of failures) {
    const icon = sig.id === 'code:p0-boundary' ? '🔴 P-0' : (sig.critical ? '🟠 G3 ' : '🟡 G2 ');
    console.log(`  ${icon}  ${sig.message}`);
    if (sig.settlementId) console.log(r(C.gray, `         → settlementId: ${sig.settlementId}`));
    if (sig.mismatch)     console.log(r(C.gray, `         → 차이: ${sig.mismatch.absDiff.toLocaleString()}원 (${sig.mismatch.sign})`));
  }

  for (const sig of warnings) {
    if (sig.id === 'reconciliation-policy' || sig.id === 'data-available') continue;
    console.log(`  🔵 warn  ${sig.message}`);
  }

  // ── 기대 감지 검증 ───────────────────────────────────────────────────────────
  console.log();
  console.log(r(C.bold, '  기대 감지 항목 검증'));
  console.log('  ' + '─'.repeat(55));

  const checks = [
    { label: '배송비 분담 오류 탐지 (S3)',      expect: sig => sig.financeType === 'finance:payout-mismatch' && sig.settlementId?.includes('009') },
    { label: '수수료율 오류 탐지 (S4)',          expect: sig => sig.financeType === 'finance:payout-mismatch' && (sig.settlementId?.includes('011') || sig.settlementId?.includes('012')) },
    { label: '중복 지급 P-0 감지 (S5)',          expect: sig => sig.id === 'code:p0-boundary' || sig.financeType === 'finance:payout-duplicate' },
    { label: 'paid 이후 금액 수정 감지',          expect: sig => sig.message?.includes('금액 수정 시도') },
    { label: '안분 오차 허용 범위 (1원) 경고',    expect: sig => sig.id?.startsWith('allocation-tolerance') },
    { label: '고액 미승인 감지 (1.5M+)',          expect: sig => sig.message?.includes('고액') || sig.message?.includes('executive') },
    { label: '예외 지급 2인 미충족 감지',          expect: sig => sig.message?.includes('예외') || sig.message?.includes('isException') },
  ];

  let passed = 0;
  for (const chk of checks) {
    const found = allSignals.some(chk.expect);
    const mark  = found ? r(C.green, '✓') : r(C.red, '✗');
    console.log(`  ${mark}  ${chk.label}`);
    if (found) passed++;
  }

  console.log();
  console.log(`  ${r(C.bold, '기대 감지')} ${passed}/${checks.length} 항목 확인됨`);
  console.log('\n' + r(C.bold, '═══════════════════════════════════════════════════════════\n'));

  // 하나라도 기대 감지 실패 시 exit code 1
  if (passed < checks.length) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
