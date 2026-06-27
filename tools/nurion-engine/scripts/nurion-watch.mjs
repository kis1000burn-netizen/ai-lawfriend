import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './nurion-collector.mjs';
import { parseArgs, ROOT } from './nurion-utils.mjs';

const args = parseArgs(process.argv);
const apply = args.has('--apply');
const config = await loadConfig();
const interval = config.pollIntervalMs ?? 300000;

// 절대 경로로 지정해 CWD에 무관하게 실행
const RUNNER = path.join(ROOT, 'scripts', 'nurion-skill-run.mjs');
let running = false;
let skippedRuns = 0;

function runOnce() {
  if (running) {
    skippedRuns++;
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.warn(`[nurion-watch] ${ts} — previous run still active, skip current tick (skipped=${skippedRuns})`);
    return;
  }

  running = true;
  const child = spawn(
    process.execPath,
    [RUNNER, ...(apply ? ['--apply'] : [])],
    { stdio: 'inherit' }
  );
  child.on('exit', code => {
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(`[nurion-watch] ${ts} — run exited ${code ?? 0}`);
    running = false;
  });
  child.on('error', error => {
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.error(`[nurion-watch] ${ts} — failed to start runner: ${error.message}`);
    running = false;
  });
}

console.log(`[nurion-watch] started: ${Math.round(interval / 1000)}초 간격, mode=${apply ? 'apply' : 'dryRun'}`);
runOnce();
setInterval(runOnce, interval);
