import { clearActiveIncident, loadActiveIncident, makeIncidentId, saveActiveIncident } from './nurion-state.mjs';
import { isoNow } from './nurion-utils.mjs';

const GRADE_RANK = Object.freeze({ G0: 0, G1: 1, G2: 2, G3: 3, G4: 4 });

const ACTIONS = {
  G0: [],
  G1: [{ type: 'notify', message: '경미한 이상 감지' }],
  G2: [{ type: 'enable_banner', key: 'GAS_MAINTENANCE_BANNER', value: '1' }, { type: 'notify', message: '부분 장애 감지' }],
  G3: [{ type: 'set_flag', key: 'SUBMISSION_FREEZE', value: '1' }, { type: 'escalate', message: '핵심 경로 장애 — 접수 차단' }],
  G4: [{ type: 'rollback_candidate', message: 'A+B+C 조건 충족 시 마지막 검증 통과 배포로 롤백' }, { type: 'escalate', message: '전면 장애 또는 P-0 위반' }]
};

function shouldGateCorePolicy(report, profile, apply) {
  if (!apply) return { gated: false };
  const maxGrade = profile?.autoActionPolicy?.maxGradeForAutoAction ?? 'G4';
  const gradeBlocked = (GRADE_RANK[report.grade] ?? 0) > (GRADE_RANK[maxGrade] ?? 4);
  if (!gradeBlocked) return { gated: false };
  return {
    gated: true,
    reasons: [`등급 ${report.grade}가 자동조치 허용 상한 ${maxGrade}를 초과`],
  };
}

export async function evaluatePolicy(report, config, { apply = false, profile = null } = {}) {
  if (report.grade === 'G0') { await clearActiveIncident(); return { mode: apply ? 'apply' : 'dryRun', actions: [], result: 'history-only' }; }
  const incidentId = makeIncidentId(report);
  const existing = await loadActiveIncident();
  const now = Date.now();
  if (existing?.incidentId === incidentId && now - Date.parse(existing.lastActionAt) < 30 * 60 * 1000) {
    return { mode: apply ? 'apply' : 'dryRun', incidentId, actions: [{ type: 'cooldown-skip' }], result: 'cooldown-skip' };
  }
  const actions = ACTIONS[report.grade] ?? [];
  const gate = shouldGateCorePolicy(report, profile, apply);
  const remoteEnabled = apply && !gate.gated && config.remoteActions?.enabled && process.env.NURION_REMOTE_ACTIONS === '1';
  const executed = [];
  if (gate.gated) {
    executed.push({
      type: 'approval_required',
      executed: false,
      dryRun: true,
      approvalRequired: true,
      reasons: gate.reasons,
      message: `코어 자동조치 차단 — ${gate.reasons.join(', ')}`,
    });
  }
  for (const action of actions) {
    if (remoteEnabled && config.remoteActions?.actionWebhook && ['set_flag', 'enable_banner'].includes(action.type)) {
      try {
        const res = await fetch(config.remoteActions.actionWebhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: action.type, key: action.key, value: action.value, platformId: report.platformId, incidentId }) });
        executed.push({ ...action, executed: res.ok, httpStatus: res.status });
      } catch (error) { executed.push({ ...action, executed: false, error: String(error?.message || error) }); }
    } else executed.push({ ...action, executed: false, dryRun: true, approvalRequired: gate.gated || undefined });
  }
  await saveActiveIncident({ incidentId, platformId: report.platformId, grade: report.grade, openedAt: existing?.openedAt ?? isoNow(), lastActionAt: isoNow(), actions: executed });
  return {
    mode: apply ? 'apply' : 'dryRun',
    incidentId,
    actions: executed,
    result: gate.gated ? 'approval-required' : (remoteEnabled ? 'executed-or-attempted' : 'dry-run'),
  };
}
