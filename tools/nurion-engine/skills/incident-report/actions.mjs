/**
 * incident-report: actions.mjs
 * 허용된 조치: 보고서 파일 저장, 알림
 * 금지: 원인 코드 수정, 보고서 외부 자동 발송
 */
import path from 'node:path';

export async function runActions(skillSignals, context) {
  const { config, profile, signals = [], grade, apply, ROOT, isoNow, writeJson } = context;
  const actions = [];

  const gradeSufficient = skillSignals.find(
    s => s.id.endsWith(':grade-sufficient') && s.status === 'fail'
  );
  const activeIncident  = skillSignals.find(s => s.id.endsWith(':active-incident'));
  const archiveSufficient = skillSignals.find(
    s => s.id.endsWith(':archive-events') && s.status === 'fail'
  );

  // 보고서 생성 조건: 등급 충분 + (활성 인시던트 or 아카이브 충분)
  if (!gradeSufficient) return actions;

  const incidentId = activeIncident?.incidentId ?? `auto-${isoNow().replace(/[:.]/g, '-')}`;
  const openedAt   = activeIncident?.openedAt   ?? isoNow();

  // 장애 원인: fail 신호 기반
  const failSignals = signals.filter(s => s.status === 'fail');
  const cause = failSignals.length > 0
    ? failSignals.map(s => `${s.id}: ${s.message}`).join('; ')
    : `${grade} 등급 진입 (상세 신호 없음)`;

  // 영향 범위: G등급 기반
  const impactMap = {
    G2: '부분 장애 — 일부 기능 영향',
    G3: '핵심 경로 장애 — 접수 차단 활성화 중',
    G4: '전면 장애 또는 P-0 위반 — 즉각 대응 필요',
  };

  const report = {
    schemaVersion: '1.0',
    incidentId,
    platformId: config.platformId,
    grade,
    detectedAt: openedAt,
    resolvedAt: null,
    cause,
    impact: impactMap[grade] ?? '장애 영향 범위 미확정',
    actions: [
      '장애 원인 신호 확인 및 서비스 복구',
      '관련 엔드포인트 재검증',
      '필요 시 rollback 스킬로 이전 버전 복구',
    ],
    prevention: [
      'deploy-preflight 스킬 배포 전 검사 강화',
      '주요 경로 smoke probe 추가',
      'GAS 백업 또는 이중화 검토',
    ],
    generatedAt: isoNow(),
    generatedBy: 'nurion-engine/skill:incident-report',
    disclaimer: '이 보고서는 AI가 자동 생성한 초안입니다. 운영자 검토 후 확정하세요.',
  };

  // 보고서 저장
  const reportPath = path.join(
    ROOT,
    '_nurion_events',
    `incident-report-${incidentId}.json`
  );

  try {
    await writeJson(reportPath, report);
    actions.push({
      type: 'generate_report',
      reportPath,
      incidentId,
      executed: true,
      message: `인시던트 보고서 저장 완료: ${reportPath}`,
    });
  } catch (error) {
    actions.push({
      type: 'generate_report',
      executed: false,
      error: String(error?.message || error),
      message: `보고서 저장 실패: ${error.message}`,
    });
  }

  // 알림
  actions.push({
    type: 'notify',
    message: [
      `[incident-report] 인시던트 보고서 생성`,
      `  incidentId : ${incidentId}`,
      `  등급       : ${grade}`,
      `  원인       : ${cause.slice(0, 120)}${cause.length > 120 ? '...' : ''}`,
      `  파일       : ${reportPath}`,
      ``,
      `⚠️  이 보고서는 AI 초안입니다. 운영자 검토 후 확정하세요.`,
    ].join('\n'),
    executed: true,
  });

  return actions;
}
