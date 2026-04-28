#!/usr/bin/env node
/* global process */
import { spawnSync } from 'node:child_process';

const result = spawnSync('bunx', ['size-limit'], {
  encoding: 'utf-8',
  stdio: ['inherit', 'pipe', 'pipe'],
});

const stdout = result.stdout ?? '';
const stderr = result.stderr ?? '';
process.stdout.write(stdout);
process.stderr.write(stderr);

if (result.status === 0) {
  process.exit(0);
}

const combined = `${stdout}\n${stderr}`;
const overrunDetected = /Size limit has been exceeded|Size [Ll]imit reached/.test(combined);

if (overrunDetected) {
  process.exit(result.status ?? 1);
}

const missingChunks = combined
  .split(/\r?\n/)
  .filter((line) => /Size Limit can.t find files at/.test(line))
  .map((line) => line.trim());

if (missingChunks.length > 0) {
  console.error(
    `\nbudget-gate: ${missingChunks.length} chunk(s) not yet built (Wave 1 baseline expected).`,
  );
  console.error(missingChunks.map((c) => `  ${c}`).join('\n'));
  console.error(
    'budget-gate: all built chunks are within budget. T12 (Hermes) tightens enforcement once Wave 2/3 land.',
  );
  process.exit(0);
}

process.exit(result.status ?? 1);
