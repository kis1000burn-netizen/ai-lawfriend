import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { deriveGrade } from '../scripts/nurion-engine.mjs';
import { evaluatePolicy } from '../scripts/nurion-policy.mjs';
import { ACTIVE_INCIDENT_FILE } from '../scripts/nurion-utils.mjs';
import { shouldGateSkillAction } from '../core/skill-registry.mjs';

const signal = (id, status = 'pass', critical = false) => ({ id, status, critical, message: id });

async function withActiveIncidentBackup(fn) {
  const original = await fs.readFile(ACTIVE_INCIDENT_FILE, 'utf8').catch(() => null);
  try {
    await fn();
  } finally {
    if (original === null) {
      await fs.unlink(ACTIVE_INCIDENT_FILE).catch(() => {});
    } else {
      await fs.mkdir(path.dirname(ACTIVE_INCIDENT_FILE), { recursive: true });
      await fs.writeFile(ACTIVE_INCIDENT_FILE, original, 'utf8');
    }
  }
}

test('deriveGrade: 모든 신호 정상 → G0', () => {
  const result = deriveGrade([signal('api:health')]);
  assert.equal(result.grade, 'G0');
});

test('deriveGrade: warn 신호 → G1', () => {
  const result = deriveGrade([signal('gas:health', 'warn')]);
  assert.equal(result.grade, 'G1');
});

test('deriveGrade: non-critical fail → G2', () => {
  const result = deriveGrade([signal('asset:logo', 'fail')]);
  assert.equal(result.grade, 'G2');
});

test('deriveGrade: critical fail → G3', () => {
  const result = deriveGrade([signal('api:submissions', 'fail', true)]);
  assert.equal(result.grade, 'G3');
});

test('deriveGrade: P-0 fail → G4', () => {
  const result = deriveGrade([signal('code:p0-boundary', 'fail', true)]);
  assert.equal(result.grade, 'G4');
});

test('deriveGrade: 핵심+정적 복수 실패, 이전 실패, 최근 배포 → G4', () => {
  const previousReport = {
    signals: [signal('api:submissions', 'fail', true)],
  };
  const releaseAt = new Date().toISOString();
  const result = deriveGrade(
    [
      signal('code:static-check', 'fail', true),
      signal('asset:sw-js', 'fail', true),
    ],
    previousReport,
    releaseAt
  );
  assert.equal(result.grade, 'G4');
});

test('shouldGateSkillAction: apply=false면 승인 게이트 미적용', () => {
  const result = shouldGateSkillAction('rollback', {
    apply: false,
    grade: 'G4',
    profile: { autoActionPolicy: { maxGradeForAutoAction: 'G3', requireHumanApproval: ['rollback'] } },
  });
  assert.equal(result.gated, false);
});

test('shouldGateSkillAction: requireHumanApproval 대상 스킬은 apply 모드에서 차단', () => {
  const result = shouldGateSkillAction('rollback', {
    apply: true,
    grade: 'G3',
    profile: { autoActionPolicy: { maxGradeForAutoAction: 'G3', requireHumanApproval: ['rollback'] } },
  });
  assert.equal(result.gated, true);
  assert.match(result.reasons.join(' '), /사람 승인 필요/);
});

test('shouldGateSkillAction: maxGradeForAutoAction 초과 등급은 차단', () => {
  const result = shouldGateSkillAction('ledger-reconcile', {
    apply: true,
    grade: 'G4',
    profile: { autoActionPolicy: { maxGradeForAutoAction: 'G3', requireHumanApproval: [] } },
  });
  assert.equal(result.gated, true);
  assert.match(result.reasons.join(' '), /자동조치 허용 상한/);
});

test('evaluatePolicy: profile maxGradeForAutoAction 초과 시 remote 호출 없이 approval-required', async () => {
  await withActiveIncidentBackup(async () => {
    const originalFetch = globalThis.fetch;
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      throw new Error('fetch should not be called when approval gate blocks policy');
    };

    try {
      process.env.NURION_REMOTE_ACTIONS = '1';
      const report = {
        platformId: `policy-gate-test-${Date.now()}`,
        grade: 'G4',
        signals: [signal('code:p0-boundary', 'fail', true)],
      };
      const config = {
        platformId: report.platformId,
        remoteActions: { enabled: true, actionWebhook: 'https://example.invalid/action' },
      };
      const profile = { autoActionPolicy: { maxGradeForAutoAction: 'G3' } };

      const result = await evaluatePolicy(report, config, { apply: true, profile });
      assert.equal(result.result, 'approval-required');
      assert.equal(called, false);
      assert.ok(result.actions.some(a => a.type === 'approval_required'));
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.NURION_REMOTE_ACTIONS;
    }
  });
});
