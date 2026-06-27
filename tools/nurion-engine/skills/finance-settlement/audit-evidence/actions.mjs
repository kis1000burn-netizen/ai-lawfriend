/**
 * finance-settlement/audit-evidence: actions.mjs  (v2)
 *
 * 강화 내역:
 *   - approval-audit.ndjson에 해시체인 링크 추가
 *   - 각 감사 이벤트가 이전 이벤트 해시를 포함 → 사후 변조 탐지 가능
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  loadSettlements,
  buildHashChainEntry,
  loadLastAuditHash,
  GENESIS_HASH,
} from '../_lib.mjs';

export async function runActions(skillSignals, context) {
  const { config, profile, apply, ROOT, isoNow, writeJson } = context;
  const opts = profile?.skillOptions?.['finance-settlement/audit-evidence'] ?? {};
  const actions = [];

  if (!apply) {
    actions.push({ type: 'notify', message: '[audit-evidence] dry-run — apply 모드에서 월 마감 증빙 패키지를 생성합니다.', executed: false, dryRun: true });
    return actions;
  }

  const targetMonth = opts.targetMonth ?? new Date().toISOString().slice(0, 7);
  const closeDir    = path.join(ROOT, '_nurion_events', 'month-close', targetMonth);
  await fs.mkdir(closeDir, { recursive: true });

  const settlements = await loadSettlements(ROOT, config.platformId, { limit: 1000 });
  const now         = isoNow();

  // ── 월 마감 요약 계산 ──────────────────────────────────────────────────────
  const totalRevenue  = settlements.reduce((sum, s) => sum + (s.orderAmount ?? 0), 0);
  const totalRefunds  = settlements
    .filter(s => ['refund_pending','disputed'].includes(s.status))
    .reduce((sum, s) => sum + (s.orderAmount ?? 0), 0);
  const totalPayout   = settlements.reduce((sum, s) => sum + (s.expectedVendorPayout ?? 0), 0);
  const exceptions    = settlements.filter(s => ['disputed','chargeback_pending','failed'].includes(s.status));
  const pendingApproval = settlements.filter(s => s.status === 'payment_waiting' && !s.approvedBy);
  const unreconciled  = settlements.filter(s => !['reconciled','closed'].includes(s.status));

  // ── 보고서 생성 ────────────────────────────────────────────────────────────
  const report = [
    `# 누리온 월 마감 보고서 — ${targetMonth}`,
    `생성일시: ${now}`,
    `플랫폼: ${config.platformId}`,
    '',
    `## 요약`,
    `| 항목 | 금액 / 건수 |`,
    `|------|------------|`,
    `| 총 정산 건수   | ${settlements.length}건 |`,
    `| 총 매출        | ${totalRevenue.toLocaleString()}원 |`,
    `| 취소·환불      | ${totalRefunds.toLocaleString()}원 |`,
    `| 업체 지급 예정 | ${totalPayout.toLocaleString()}원 |`,
    `| 이상 거래      | ${exceptions.length}건 |`,
    `| 승인 대기      | ${pendingApproval.length}건 |`,
    `| 미대사         | ${unreconciled.length}건 |`,
    '',
    `## 체크리스트`,
    `- [ ] 전체 정산 대사 완료`,
    `- [ ] 세금계산서 발급·수신 확인`,
    `- [ ] 이상 거래 처리 완료`,
    `- [ ] 업체 지급 승인 완료`,
    `- [ ] 재무팀 검토 및 서명`,
    '',
    `⚠️ 이 보고서는 누리온 엔진이 생성한 초안입니다. 재무팀 검토 후 확정하세요.`,
  ].join('\n');

  const reportPath = path.join(closeDir, 'month-close-report.md');
  try {
    await fs.writeFile(reportPath, report, 'utf8');
    actions.push({ type: 'generate_report', reportPath, executed: true, message: `월 마감 보고서 생성: month-close-report.md` });
  } catch (err) {
    actions.push({ type: 'generate_report', executed: false, error: String(err.message) });
  }

  // ── exception-log.json ────────────────────────────────────────────────────
  const exceptionPath = path.join(closeDir, 'exception-log.json');
  try {
    await fs.writeFile(exceptionPath, JSON.stringify({ generatedAt: now, exceptions }, null, 2), 'utf8');
    actions.push({ type: 'generate_evidence', file: 'exception-log.json', executed: true });
  } catch (err) {
    actions.push({ type: 'generate_evidence', file: 'exception-log.json', executed: false, error: String(err.message) });
  }

  // ── approval-audit.ndjson (해시체인 포함) ──────────────────────────────────
  const auditLogPath = path.join(closeDir, 'approval-audit.ndjson');
  try {
    const lastHash = await loadLastAuditHash(auditLogPath);

    const closeEvent = {
      eventId:     `evt_${targetMonth.replace('-','')}_close_${Date.now()}`,
      type:        'MONTH_CLOSE_GENERATED',
      targetMonth,
      platformId:  config.platformId,
      summary: {
        totalSettlements: settlements.length,
        totalRevenue,
        totalPayout,
        exceptionCount:  exceptions.length,
        unreconciledCount: unreconciled.length,
      },
    };

    const chainEntry = buildHashChainEntry(lastHash ?? GENESIS_HASH, closeEvent, 'nurion-engine');

    const auditRecord = {
      ...closeEvent,
      ...chainEntry,
    };

    await fs.appendFile(auditLogPath, JSON.stringify(auditRecord) + '\n', 'utf8');
    actions.push({
      type: 'generate_evidence',
      file: 'approval-audit.ndjson',
      executed: true,
      message: `해시체인 감사 로그 추가 — currentHash: ${chainEntry.currentHash.slice(0, 16)}...`,
    });
  } catch (err) {
    actions.push({ type: 'generate_evidence', file: 'approval-audit.ndjson', executed: false, error: String(err.message) });
  }

  actions.push({ type: 'notify', message: `[audit-evidence] 월 마감 증빙 패키지 생성 완료 — ${targetMonth}`, executed: true });

  return actions;
}
